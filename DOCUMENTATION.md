# FitPass — How The Website Works

This walks through the actual request/response life cycle for the parts of the app
that matter most: auth, browsing, and the booking/pass flow. It assumes you've read
the README for setup and the API table.

---

## 1. High-level architecture

```
┌─────────────────┐        HTTPS/JSON         ┌──────────────────┐
│   React SPA      │ ───────────────────────▶ │   Flask API       │
│  (client/, :5173) │ ◀─────────────────────── │  (server/, :5000) │
└─────────────────┘        JWT in header       └──────────────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │  SQLite / SQL  │
                                                 │  (via SQLAlchemy)│
                                                 └──────────────┘
```

- The SPA and API are two completely separate processes. In dev, Vite serves the
  React app on `:5173` and Flask serves the API on `:5000`; CORS is explicitly opened
  between them in `main.py`.
- There's no server-side rendering and no shared session — the API is stateless.
  Every authenticated request carries its own JWT; the server never stores "who's
  logged in" anywhere.

---

## 2. Backend request lifecycle

Every route follows the same shape, and it's worth internalizing because it explains
where to look when something breaks:

```
Blueprint route (blueprints/*.py)
   │  parses request.get_json()
   ▼
Marshmallow schema.load() (schemas/*.py)
   │  validates + coerces input; raises ValidationError → caught, returns 400/422
   ▼
Controller.method() (controllers/*.py)
   │  the only layer allowed to touch db.session directly
   ▼
Marshmallow schema.dump() (schemas/*.py)
   │  serializes SQLAlchemy model(s) back to plain dict/JSON
   ▼
jsonify(...) response
```

Blueprints are intentionally thin — they don't contain business logic, just
"validate → delegate → serialize." If you're debugging a 500, the bug is almost
always in the matching `controllers/*.py` file, or in a controller/blueprint method
name mismatch (see README's Known Issues).

**App startup**, in `main.py::create_app()`:
1. Load `.env` via `python-dotenv`.
2. Read config from environment (`SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URI`,
   `CORS_ORIGINS`) with safe fallbacks for local dev.
3. Initialize extensions (`db`, `jwt`, `migrate`, `ma`) against the `app` instance.
4. Open CORS for the configured frontend origins, with `supports_credentials=True`.
5. Register all five blueprints under their URL prefixes (`/auth`, `/studios`,
   `/classes`, `/passes`, `/bookings`).
6. Register global error handlers for 404, 500, and Marshmallow's `ValidationError`
   so every error response is JSON, not an HTML stack trace.
7. Expose `/healthcheck` for uptime monitoring.

---

## 3. Authentication — register, login, and staying logged in

### Register (`POST /auth/register`)

```
Register.jsx (form) → AppContext.register() → api.register() → POST /auth/register
```

1. The SPA form collects `full_name`, `email`, `password`, optional `phone`, and a
   `role` picked from three buttons (Athlete/Trainer/Admin → `client`/`trainer`/`admin`).
2. `AppContext.register()` trims/lowercases the email and forwards a clean payload
   (including `role`) to `api.register()`.
3. On the server, `UserRegistrationSchema` validates the shape: valid email, password
   length 8–100, full name length 2–100, role in `{client, trainer, admin}`.
4. `UserController.register_user()`:
   - Checks `email_taken()` first — duplicate emails are rejected with 400 before
     any write happens.
   - Creates the `User` row with the submitted role (defaulting to `"client"` if
     omitted).
   - Hashes the password with `werkzeug.security.generate_password_hash` and stores
     only the hash — the plaintext password is never persisted.
   - **If `role == "trainer"`**, also creates a linked `Trainer` row (`user_id` FK) in
     the same transaction, so a trainer account always has a profile to attach
     classes/bio to later.
5. A JWT is minted with `create_access_token(identity=user.id, additional_claims={"role": user.role})`
   — the role travels inside the token itself, so later requests don't need a DB
   lookup just to check permissions.
6. Response: `201`, the access token, and the serialized user (password hash
   excluded by the schema's `exclude` config).
7. The SPA stores the token in `localStorage` under `fitpass_token` and sets `user`
   in context — the person is now logged in immediately after registering.

### Login (`POST /auth/login`)

Same shape, minus account creation: `UserController.authenticate_user()` looks the
user up by email and calls `user.check_password()`, which uses
`werkzeug.security.check_password_hash` to compare against the stored hash. Wrong
credentials → `401`; correct → same JWT-issuing path as registration.

### Staying logged in across page loads

`AppContext.jsx` runs a `checkAuth()` effect on mount:
1. Read `fitpass_token` from `localStorage`. No token → not logged in, done.
2. If a token exists, call `GET /auth/me` (a `@jwt_required()` route). Flask-JWT-Extended
   validates the token's signature/expiry automatically; if valid, the route decodes
   the user id from the token and re-fetches the `User` row.
3. Success → `user` state is populated and the SPA renders as logged in. Failure
   (expired/invalid token) → the stale token is cleared from `localStorage` and the
   person is treated as logged out.

This means the JWT is the *only* source of truth for "am I logged in" — there's no
server-side session to invalidate. Logging out (`AppContext.logout()`) is purely a
client-side action: it deletes the token and clears `user` state. The token itself
remains technically valid until it expires; there's no server-side blocklist.

### Role-gated pages

`App.jsx` wraps route groups in `<ProtectedRoute allowedRoles={[...]} />`
(`components/ProtectedRoute.jsx`):
- No `user` in context → redirect to `/login`.
- `user` exists but `user.role` isn't in `allowedRoles` → redirect to `/`.
- Otherwise → render the nested route via `<Outlet />`.

This is a **client-side convenience gate only** — it hides UI a person shouldn't see,
but it is not a security boundary. The real enforcement lives on the server:
`blueprints/decorators.py::admin_required` reads the `role` claim straight out of the
verified JWT (`get_jwt().get('role')`) and returns `403` if it isn't `"admin"`. Any
route that actually needs to be protected must use a server-side decorator like this
one — a hidden button in the React app doesn't stop someone from calling the API
directly with curl/Postman.

---

## 4. Browsing studios & classes (public, no auth)

```
GET /studios/            → list studios, optional ?location= substring filter
GET /studios/<id>        → one studio
GET /studios/<id>/schedule → that studio's upcoming classes (start_time >= now)
GET /classes/            → search classes by studio_id / category_id / trainer_id / q
GET /classes/categories  → list of class categories (for filter UI)
GET /classes/<id>        → one class
```

None of these require a JWT — they're the public catalog a visitor browses before
signing up. `ClassController.search_classes()` always filters to classes starting in
the future by default, and layers on any filters present in the query string.

Creating a class (`POST /classes/`) is the one write in this group, and it's gated
by `@admin_required` — only admins can add classes to the catalog in the current
implementation (there's no trainer-facing "propose a class" flow yet).

---

## 5. Passes & bookings — the credit system

This is the actual business model: a user buys a **pass** (a bucket of credits with
an expiry date), then spends one credit per **booking**.

**Pass plans** are hardcoded in `PassController.PASS_PLANS` — not a database table —
which keeps pricing changes to a one-line edit in code rather than a migration:

| Plan key | Name | Credits | Price | Valid for |
|---|---|---|---|---|
| `drop-in` | Single Class Drop-In | 1 | $25.00 | 30 days |
| `10-pack` | 10-Class Flex Pass | 10 | $180.00 | 90 days |
| `monthly` | Monthly Unlimited | 99 | $150.00 | 30 days |

**Purchasing** (`POST /passes/purchase`) creates a `Pass` row with
`remaining_credits = credits` and `expires_at = now + duration_days`.

**Booking a class** is meant to work like this (per `BookingController.create_booking`):
1. Find the user's soonest-expiring pass that still has `remaining_credits > 0` and
   hasn't expired (`PassController.get_active_pass`).
2. No such pass → refuse with "please purchase a pass first."
3. Otherwise, decrement `remaining_credits` by 1 and create the `Booking` row in the
   same transaction — so a credit is never "spent" without a corresponding booking,
   or vice versa.

**Cancelling** (`BookingController.cancel_booking`) refunds the credit to the user's
current pass **only if the class hasn't started yet** — cancelling after the class
began doesn't return the credit. The booking row itself is deleted either way.

> **Currently broken:** the `passes` and `bookings` blueprints call these controller
> methods with different names/argument shapes than what's actually defined (see
> README → Known Issues). The design above is what the code is *trying* to do; until
> the mismatch is fixed, `POST /passes/purchase`, `GET /passes/my-passes/`,
> `POST /bookings`, and `POST /bookings/<id>/cancel` will 500 in their current state.

---

## 6. Frontend state management, in one picture

```
main.jsx
 └─ <AppProvider>                         ← global auth/toast state (see note below)
     └─ <App>
         └─ <AppProvider>                 ← ⚠ mounted again, shadows the outer one
             └─ <Routes>
                 └─ <MainLayout>           ← Navbar + Footer + <Outlet/> + Toast
                     └─ <PageComponent>    ← reads state via useApp()
```

There's no Redux/Zustand here — `AppContext` (React Context + `useState`) is the
single source of truth for: the logged-in `user`, the active `myPass`, toast
messages, mobile menu state, and the classes-page search/filter state. Every page
reads what it needs via the `useApp()` hook rather than prop-drilling.

All network calls funnel through `lib/api.js`'s single `request()` helper, which:
- Prefixes every call with `VITE_API_URL`.
- Attaches `Authorization: Bearer <token>` automatically whenever a token exists in
  `localStorage` — individual page components never touch headers directly.
- Normalizes errors: on a non-2xx response, it throws an `Error` whose message is
  either the Marshmallow validation messages (stringified) or the API's `error`
  field, so every page's `catch` block can just read `err.message`.

---

## 7. Data lifecycle example: someone signs up as a trainer

Walking one request all the way through, end to end, ties the whole picture together:

1. **Browser:** person fills the Register form, taps "TRAINER" (sets `form.role = "trainer"`), submits.
2. **`Register.jsx`:** calls `useApp().register(form)`.
3. **`AppContext.register()`:** builds `{ full_name, email, password, role: "trainer" }`, calls `api.register(...)`.
4. **`lib/api.js`:** `POST http://127.0.0.1:5000/auth/register` with that JSON body.
5. **`blueprints/auth.py::register()`:** parses JSON, runs it through `register_schema.load()` — role is validated against `{client, trainer, admin}`, passes.
6. **`UserController.email_taken()`:** confirms the email isn't already registered.
7. **`UserController.register_user()`:** creates the `User` row with `role="trainer"`, hashes the password, `flush()`es to get the new `user.id`, then creates a `Trainer(user_id=user.id)` row, commits both in one transaction.
8. **Back in the blueprint:** a JWT is minted with `role: "trainer"` baked into the claims; response is `201` with the token + serialized user.
9. **`AppContext.register()`:** stores the token in `localStorage`, sets `user` in context, shows a "Account created" toast.
10. **`Register.jsx`:** navigates to `/classes`.
11. **`ProtectedRoute`** for `/classes` checks `allowedRoles={["trainer", "admin"]}` — the new trainer's role matches, so the route renders instead of redirecting.

Every layer in this repo — schema, controller, model, context, API client,
route guard — touches this one signup in some way, which is why a bug in any single
layer (as several were, prior to the recent fixes) breaks the whole flow.

### NEW FEATURES ADDED TO MY WEBSITE
<!-- 1. Nutrition features -->
<!-- 2.Geographical location of the studios  -->


<!-- NUTRITION ENDPOINTS -> NEW FEATURES -->
GET  /nutrition/profile              # current targets
PUT  /nutrition/profile              # update goal/targets
GET  /nutrition/foods/search?q=      # search cached + external food DB
POST /nutrition/logs                 # log an eaten item
GET  /nutrition/logs?date=           # a day's entries
GET  /nutrition/summary?range=week   # aggregated calories/macros vs. target, streaks
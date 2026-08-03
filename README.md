# FitPass

A multi-studio fitness class booking and guest-pass platform. Members buy a credit
pass, browse classes across partner studios, and book a spot; trainers run classes;
admins manage the studio/class catalog.

Monolithic Flask API + a separate React SPA. Backend and frontend live in the same
repo but ship and run independently.

```
fitpass-monolithic/
├── server/     Flask + SQLAlchemy REST API
└── client/     React 19 + Vite + Tailwind SPA
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Python 3.12, Flask 3, Flask-SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Flask-Marshmallow, Flask-CORS |
| Database | SQLite by default (`DATABASE_URI` env var to swap in Postgres/MySQL for prod) |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide icons |
| Auth | JWT access tokens (`flask-jwt-extended`), password hashing via `werkzeug.security` |

---

## Project structure

### `server/`
```
server/
├── main.py                 # App factory, extension init, blueprint registration
├── extensions.py           # Shared db / jwt / cors / migrate / ma instances
├── models/                 # SQLAlchemy models (one file per table)
├── schemas/                # Marshmallow schemas (validation + serialization)
├── controllers/            # Business logic, called by blueprints
├── blueprints/              # Route definitions (thin — delegate to controllers)
│   └── decorators.py        # @admin_required role guard
├── migrations/              # Flask-Migrate/Alembic migration history
└── seed.py                  # Populates demo data (users, studios, classes, passes)
```

**Request flow:** `blueprint route → schema.load() (validate) → Controller.method() (business logic + db) → schema.dump() (serialize) → jsonify`

### `client/`
```
client/src/
├── main.jsx                 # React root, wraps App in BrowserRouter + AppProvider
├── App.jsx                  # Route table + role-gated routes
├── context/AppContext.jsx   # Global auth state (user, login/register/logout, toasts)
├── lib/api.js                # Single fetch wrapper — every backend call goes through here
├── layouts/MainLayout.jsx    # Navbar + Footer + page outlet shell
├── components/               # Reusable UI pieces (cards, navbar, protected route guard, etc.)
└── pages/                    # One component per route
```

---

## Getting started

### Backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # see Environment variables below
flask --app main db upgrade        # apply migrations
python seed.py                     # optional: load demo data
flask --app main run               # http://127.0.0.1:5000
```

### Frontend

```bash
cd client
npm install
npm run dev                        # http://localhost:5173
```

The client talks to the API at `VITE_API_URL` (defaults to `http://127.0.0.1:5000`
if unset — see `client/src/lib/api.js`).

---

## Environment variables (`server/.env`)

| Variable | Purpose | Default if unset |
|---|---|---|
| `SECRET_KEY` | Flask session/signing secret | `fallback-secret` (change in prod) |
| `JWT_SECRET_KEY` | Signs JWT access tokens | `fallback-jwt-secret` (change in prod) |
| `DATABASE_URI` | SQLAlchemy connection string | `sqlite:///fitpass.db` |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins (must be the full Vercel URL, not `https://vercel.app`) | `http://localhost:5173,http://127.0.0.1:5173,https://fitpass-monolithic-t8u7.vercel.app` |

`client/.env` (optional):

| Variable | Purpose | Default if unset |
|---|---|---|
| `VITE_API_URL` | Base URL the SPA sends requests to | `http://127.0.0.1:5000` |

### Render deployment

Create a Render Postgres database and set the backend service's `DATABASE_URI`
to its **internal connection URL**. This repository includes `psycopg`, the
PostgreSQL driver required by SQLAlchemy; `main.py` automatically converts
Render's `postgresql://...` URL to the required Psycopg 3 dialect.

Set the backend service's Root Directory to `server` and Start Command to:

```bash
flask --app main db upgrade && gunicorn main:app
```

The migration command is idempotent, so it creates or upgrades the schema on
each deploy before Gunicorn starts. Do not rely on the default SQLite database
on Render: its filesystem is ephemeral and data can disappear after a restart.

---

## Core data model

| Model | Table | Key relationships |
|---|---|---|
| `User` | `users` | 1–1 → `Trainer` (if role is trainer), 1–many → `Pass`, `Booking` |
| `Trainer` | `trainers` | belongs to `User`, 1–many → `FitnessClass` |
| `Studio` | `studios` | 1–many → `FitnessClass` |
| `ClassCategory` | `class_categories` | 1–many → `FitnessClass` |
| `FitnessClass` | `fitness_classes` | belongs to `Studio`, `Trainer`, `ClassCategory`; 1–many → `Booking` |
| `Pass` | `passes` | belongs to `User`; tracks `remaining_credits` + `expires_at` |
| `Booking` | `bookings` | belongs to `User` + `FitnessClass` |

Roles live directly on `User.role`: `"client"` (default) · `"trainer"` · `"admin"`.
There is no separate `Role` table — it's a plain string column, checked via a
`role` claim embedded in the JWT (see `blueprints/decorators.py::admin_required`).

---

## API surface (prefix shown per blueprint)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | — | Create account, returns JWT |
| POST | `/auth/login` | — | Authenticate, returns JWT |
| GET | `/auth/me` | JWT | Current user profile |
| GET | `/studios/` | — | List studios (optional `?location=`) |
| GET | `/studios/<id>` | — | Studio detail |
| GET | `/studios/<id>/schedule` | — | Upcoming classes at a studio |
| GET | `/classes/` | — | Search/filter classes |
| GET | `/classes/categories` | — | List class categories |
| GET | `/classes/<id>` | — | Class detail |
| POST | `/classes/` | JWT + admin | Create a class |
| GET | `/passes/plans` | — | List purchasable pass plans |
| GET | `/passes/my-passes/` | JWT | Current user's passes |
| POST | `/passes/purchase` | JWT | Buy a pass |
| GET | `/bookings/` | JWT | Current user's bookings |
| POST | `/bookings` | JWT | Book a class (spends a credit) |
| POST | `/bookings/<id>/cancel` | JWT | Cancel + refund credit if class hasn't started |
| GET | `/healthcheck` | — | Liveness check |

---

## Known issues / open items

These were found during a debugging pass and are worth tracking as follow-up tickets
— they don't block register/login/browsing, but will 500 if exercised:

- **No `/trainers` endpoint exists yet.** `TrainerController` only has read helpers and
  isn't wired to a blueprint — there's no way to fetch or manage trainer profiles over
  the API yet.
- **`AppProvider` is mounted twice** (once in `main.jsx`, once inside `App.jsx`),
  so the auth-check (`/auth/me`) fires twice on page load. Harmless but wasteful —
  worth collapsing to a single provider.
- **Public self-registration always creates a `client` account.** This is intentional:
  trainer and admin accounts must be provisioned through trusted back-office workflows.

## Recently fixed (see git history / debug report)

- App previously failed to boot entirely (`bcrypt` misuse in `models/user.py`, a stray
  `tkinter` import in `user_controller.py`).
- Registration now deliberately ignores any submitted role and creates a `"client"`
  account, preventing public signups from granting privileged access.

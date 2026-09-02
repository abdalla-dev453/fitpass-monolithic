# FitPass — fix/scaffold summary

Everything below was verified by actually running the app (fresh `flask db
upgrade`, a Flask test client hitting the real endpoints, and `vite build`
on the client) — not just read through. Commands used are in the "How to
verify" section at the bottom so you can rerun them yourself.

## 1. Bugs that were silently broken (found by running the code, not just reading it)

These weren't in the original doc — I found them by actually executing the
migration chain and the discovery/nutrition code paths.

- **Fresh installs couldn't migrate at all.** `0f1e7d5b3a2c_add_image_url_to_fitness_classes.py`
  tried to `ADD COLUMN image_url`, but `f42c2481b4d6_initial_migration.py`
  already creates that column in the initial `CREATE TABLE`. Any brand-new
  environment (CI, a new dev's machine, a fresh deploy) crashed on
  `flask db upgrade` with `duplicate column name: image_url` before a
  single table finished migrating. Fixed by guarding the `ADD COLUMN` on
  whether the column already exists.
- **`discovery.py` couldn't import.** It imported from `server.controllers...`
  / `server.schemas...` — a prefix no other blueprint in the codebase uses
  (compare `blueprints/passes.py`, which imports `controllers.pass_controller`).
  This is why it was never registered in `main.py`: registering it would
  have crashed the whole app on boot.
- **`discovered_schema` and `PlacesClient`** were referenced in
  `discovery.py` / `discovery_controller.py` but never defined or imported
  anywhere in the repo — guaranteed `NameError`s even after fixing the
  import path above.
- **`Studio` had no `latitude`/`longitude` columns**, so
  `Studio.query_within_radius()` (called but never implemented) was
  structurally impossible to write.
- **Nutrition had models but nothing else.** `FoodItem`, `FoodLog`,
  `NutritionProfile` existed as files but there was no blueprint,
  controller, or schema, and `FoodLog.food_item_id` pointed at a
  `food_items` table that didn't exist yet (`FoodItem` had no
  `__tablename__`, so SQLAlchemy defaulted it to `food_item`, singular —
  a silent mismatch that breaks table creation).
- **`PassPlan` was dead code.** The model existed; `PassController` still
  used a hardcoded dict, so a price change meant a code deploy.
- **Booking capacity check had a real race condition.** Count-then-insert
  ran as two separate steps with no locking — two concurrent requests for
  the last spot could both read "9/10 taken" and both succeed, overbooking
  the class.

## 2. What's fixed and wired up now

**Discovery (`/discovery/nearby`)**
- `Studio` has real `latitude`/`longitude` columns.
- `Studio.query_within_radius()` does a bounding-box prefilter in SQL then
  an exact haversine distance check in Python — works on SQLite (dev) and
  Postgres (prod) without a PostGIS dependency.
- `PlacesClient` (new: `services/places_client.py`) wraps Google Places
  Nearby Search, fails soft (returns `[]`) if `GOOGLE_PLACES_API_KEY` isn't
  set, so local dev/CI never need real credentials.
- Results are cached per ~1km grid cell for 36h (`DiscoveredGymCache`
  model) so ten users in the same neighborhood share one billed API call.
- Internal (bookable) and external (unclaimed, "request this gym") results
  are merged and deduped by `place_id`.
- Blueprint now registered in `main.py`.

**Nutrition (`/nutrition/*`)**
- `NutritionProfile`, `FoodItem`, `FoodLog` fixed (table names, FK match,
  relationships added).
- `FoodDataClient` (new: `services/food_data_client.py`) pulls from USDA
  FoodData Central (free `DEMO_KEY` fallback, override with `USDA_API_KEY`)
  and caches results into `FoodItem` on first lookup — repeat searches
  never re-hit the external API.
- Full blueprint: `GET/PUT /nutrition/profile`, `GET /nutrition/foods/search`,
  `POST/GET /nutrition/logs`, `GET /nutrition/summary`, `GET /nutrition/plan`.
- Analysis/improvements/planning implemented in the three tiers from the
  original plan: pure SQL aggregation → rule-based nudges → a deterministic
  constraint pass for a starter meal plan (no ML, numbers stay trustworthy).

**Passes**
- `PassController` now reads from the `pass_plans` table instead of a
  hardcoded dict, with a safe one-time seed (`ensure_default_plans()`) so a
  fresh environment still boots with working plans.

**Bookings**
- Capacity check now locks the class row (`with_for_update()`) so
  concurrent requests serialize instead of racing.
- A full class now adds the requester to a waitlist (`WaitlistEntry`)
  instead of just rejecting them; cancelling a booking promotes the
  longest-waiting person automatically.
- `POST /passes/purchase` and `POST /bookings/` both accept an
  `Idempotency-Key` header — a retried request with the same key replays
  the original response instead of double-charging or double-booking.

**Classes**
- `GET /classes` now accepts optional `page`/`per_page` (returns
  `{items, page, per_page, total, has_more}`); omit both and you get the
  old plain-list response, so this is non-breaking.

**Client**
- `client/src/lib/api.js`: wired `getNearbyGyms`, nutrition endpoints,
  idempotency keys on purchase/booking, and pagination params on
  `getClasses`.
- Two new scaffold pages — `pages/NearbyGyms.jsx`, `pages/Nutrition.jsx` —
  routed at `/nearby-gyms` (public) and `/nutrition` (authenticated). Both
  are functional against the real API but deliberately kept simple; adopt
  the brutalist card/section styling from `Studios.jsx` when you're happy
  with the flow.

## 3. Verified (not just written)

- `flask db upgrade` from a completely empty DB runs the full chain
  cleanly: `initial → image_url fix → nutrition/discovery columns → new
  pass_plans/nutrition/waitlist/idempotency tables`.
- Registered a user, hit `/discovery/nearby` (found an in-radius studio,
  correctly excluded an out-of-radius one, 400s on missing params).
- Hit `/nutrition/profile` GET/PUT and `/nutrition/foods/search`.
- Booked a 1-capacity class with user A, confirmed user B gets waitlisted
  (not a bare error), cancelled A's booking, confirmed the waitlist entry
  got `notified_at` set.
- Sent the same `Idempotency-Key` twice on a booking request, confirmed
  the second call replayed the exact first response instead of creating a
  second booking.
- `npm install && vite build` on the client succeeds with the new pages
  and routes.

## 4. What's still open (out of scope for this pass, flagged not silently dropped)

- **Real payments.** `purchase_plan` still just inserts a `Pass` row —
  Stripe Checkout + webhook (`payment_intent.succeeded`) is still the
  right shape per the original doc, just not implemented here.
- **JWT refresh / revocation.** Tokens are still long-lived in
  `localStorage` with no refresh flow or blocklist. This is a real
  architecture change (httpOnly refresh cookie + `jti` blocklist table) —
  worth doing before real payment data is attached to accounts, but sizable
  enough that it deserves its own pass rather than being bolted on here.
- **Trainer public profile / "propose a class" flow.** `GET /trainers` is
  still admin-only (`@admin_required`); trainers still have nothing to do
  after signup besides what an admin creates for them.
- **Manual location search on the Nearby Gyms page** needs a geocoding
  step (typed city/address → lat/lng) — the input is there but not wired,
  since that's a separate integration from nearby-search itself.
- **`react-query`/TanStack Query adoption** on the frontend — the roadmap
  item about replacing manual `fetch` + `useState` wasn't touched.

## How to verify

```bash
cd server
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URI="sqlite:///fitpass.db"
export FLASK_APP=main.py
flask db upgrade          # applies the full migration chain, including the new one
python -c "from main import app; from controllers.pass_controller import PassController; \
  app.app_context().push(); PassController.ensure_default_plans()"
flask run                 # http://127.0.0.1:5000

cd ../client
npm install
npm run dev
```
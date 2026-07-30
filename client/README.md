
# FitPass Frontend

React (JSX) + Tailwind CSS, dark/cyber minimalist design system. Now a real
multi-page app via `react-router-dom` instead of a single scrolling landing
page, wired live to your Flask backend.

## Structure

```
src/
├── pages/                # One file per route
│   ├── Home.jsx           # Hero, features, live class/pricing previews, testimonials
│   ├── Classes.jsx        # Full schedule: search + category filter + studio filter
│   ├── Studios.jsx        # Partner studio directory
│   ├── Pricing.jsx        # All plans + FAQ accordion
│   ├── About.jsx          # Origin story, timeline, values
│   └── NotFound.jsx       # 404
├── layouts/
│   └── MainLayout.jsx      # Navbar + <Outlet/> + Footer + Toast, shared by every page
├── components/             # Shared, reusable UI — no page-specific logic
│   ├── Navbar.jsx, Footer.jsx, Toast.jsx, ScrollToTop.jsx
│   ├── SectionHeading.jsx  # eyebrow + title + description pattern
│   ├── ClassCard.jsx, PricingCard.jsx, StudioCard.jsx, Faq.jsx
│   └── HeroSection.jsx, Features.jsx, Testimonials.jsx, CtaBanner.jsx (Home-only sections)
├── context/
│   └── AppContext.jsx      # filters, mobile menu, mocked pass purchase, toast
├── lib/
│   └── api.js               # fetch wrapper for the Flask API
├── App.jsx                  # route table
├── main.jsx                 # entry point, wraps App in BrowserRouter
└── index.css                 # Tailwind + design-system utilities (see below)
```

## What's new since the single-page version

- **Real routes**, not anchor links: `/`, `/classes`, `/studios`, `/pricing`,
  `/about`, plus a catch-all 404. Navbar/Footer links and active states use
  `react-router-dom`.
- **Studios page** (new) — pulls `GET /studios`, links each card to
  `/classes?studio_id=<id>` which `Classes.jsx` reads via `useSearchParams`
  to pre-filter the schedule.
- **Classes page** is now a full browser: text search, category pills, and
  an optional studio filter chip you can clear — all hitting
  `GET /classes` with query params.
- **Pricing page** adds an FAQ accordion (`components/Faq.jsx`) beneath the
  three tiers.
- **About page** (new) — origin story with a real three-point timeline
  (2024 → 2026), and a values grid.
- **Shared cards extracted**: `ClassCard` and `PricingCard` now live once in
  `components/` and are reused on both `Home` (previews) and their full
  pages, instead of being duplicated.
- **`index.css` grew a small design-system layer** — `.glass`, `.glass-hover`,
  `.btn-primary` / `.btn-secondary`, `.text-gradient`, `.eyebrow`, and a
  `.skeleton` shimmer loader — so every page reaches for the same handful of
  classes instead of repeating long utility strings. Also added: a themed
  scrollbar, visible keyboard-focus rings, a subtle grain texture utility for
  hero/section backgrounds, and `prefers-reduced-motion` handling.

## Setup

```bash
npm install
cp .env.example .env       # point VITE_API_URL at your Flask backend
npm run dev                 # http://localhost:5173
```

Start the FitPass backend alongside it (`python main.py` in `backend/`) so
Classes, Studios, and Pricing populate with live data. If the API is
unreachable, Classes/Studios show a clear retry state and Pricing falls back
to static values that mirror the backend's plan catalog — nothing renders
blank or broken.
# TrendPulse MVP — Walkthrough

## What Was Built

The full TrendPulse MVP was implemented in a single pass across both the **Next.js 16 frontend** and the **FastAPI Python engine**, covering all 4 phases from the project spec.

---

## Architecture

```
trend-pulse/
├── app/                          # Next.js 16 App Router
│   ├── globals.css               # Design system (brand palette, animations, glass utilities)
│   ├── layout.tsx                # Root layout (Inter font, dark mode, SEO metadata)
│   ├── page.tsx                  # Landing page (hero, how-it-works, features)
│   ├── (auth)/actions.ts         # Server Actions: login, signup, Google OAuth, logout
│   ├── login/page.tsx            # Login page (Google + email/password)
│   ├── signup/page.tsx           # Signup page (Google + email/password)
│   ├── auth/callback/route.ts    # OAuth callback route handler
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard shell (sidebar nav, auth guard)
│   │   ├── logout-button.tsx     # Client component for sign-out
│   │   ├── page.tsx              # Overview stats (keywords, matches, last match)
│   │   ├── keywords/
│   │   │   ├── actions.ts        # createKeyword, deleteKeyword (with dual tier enforcement)
│   │   │   ├── page.tsx          # Keyword list with free-tier limit UI
│   │   │   ├── delete-button.tsx # Confirmation-gated delete button
│   │   │   └── new/page.tsx      # New keyword form
│   │   └── matches/
│   │       └── page.tsx          # Match history with Reddit links
│   └── ui/                       # Shared components
│       ├── logo.tsx, button.tsx, input.tsx, card.tsx, nav-link.tsx
├── lib/supabase/                 # Supabase client infrastructure
│   ├── client.ts                 # Browser client
│   ├── server.ts                 # Server client (cookie-based)
│   └── middleware.ts             # Session refresh + auth guard
├── middleware.ts                 # Next.js middleware entry point
├── supabase/migrations/
│   └── 001_initial_schema.sql    # Full schema, RLS, triggers
└── engine/                       # FastAPI Python service
    ├── main.py                   # 5-step pipeline endpoint
    ├── config.py                 # Pydantic Settings (env-var driven)
    ├── services/
    │   ├── db.py                 # Supabase read/write
    │   ├── reddit.py             # Reddit OAuth2 + post ingestion
    │   ├── dedup.py              # Upstash Redis 24h dedup
    │   ├── sieve.py              # Regex engine with weighted scoring
    │   └── alerts.py             # Discord webhook dispatcher
    ├── Dockerfile
    ├── render.yaml
    └── requirements.txt
```

---

## Key Design Decisions

### Free-Tier Enforcement (Dual Layer)
- **Database trigger** (`enforce_keyword_limit_trigger`): Hard constraint that raises `FREE_TIER_LIMIT` exception on insert. Cannot be bypassed.
- **App-layer check** (`createKeyword` Server Action): Pre-checks count before attempting insert, provides user-friendly error immediately. The Keywords page also disables the "Add Keyword" button and shows a banner when at limit.

### Auth
- **Google OAuth** + **email/password** via Supabase Auth.
- Auto-profile creation trigger fires on `auth.users` insert.
- Middleware refreshes sessions on every request and guards `/dashboard/*`.

### Design
- Premium dark theme with violet/cyan gradient palette.
- Glassmorphism cards (`glass` utility class) with backdrop blur.
- Micro-animations (fade-in, slide-up, pulse-glow) for visual polish.
- Inter font for modern SaaS typography.

---

## Build Validation

```
✓ npm run build — Compiled successfully

Routes:
  ○ /                        (Static)
  ○ /login                   (Static)
  ○ /signup                  (Static)
  ƒ /auth/callback           (Dynamic)
  ƒ /dashboard               (Dynamic)
  ƒ /dashboard/keywords      (Dynamic)
  ƒ /dashboard/keywords/new  (Dynamic)
  ƒ /dashboard/matches       (Dynamic)
```

---

## Operator Steps Required (Outside This Repo)

### 1. Supabase Project
- Create a project at [supabase.com](https://supabase.com)
- Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
- Enable **Google** auth provider (Authentication → Providers → Google) with OAuth credentials from Google Cloud Console
- Copy project URL and anon key into `.env.local`

### 2. Upstash Redis
- Create a Redis database at [upstash.com](https://upstash.com)
- Copy the REST URL and token for the engine env vars

### 3. Reddit API
- Register an app at [reddit.com/prefs/apps](https://reddit.com/prefs/apps) (type: "script")
- Copy client ID and secret for the engine env vars

### 4. Engine Deployment
- Deploy `engine/` to Render (use `render.yaml` blueprint) or Railway
- Set all env vars listed in `engine/config.py`

### 5. Cron Job
- Register at [cron-job.org](https://cron-job.org)
- Create a POST job targeting `https://<engine-host>/api/v1/cron-check`
- Set header `X-Cron-Secret: <your-secret>`
- Schedule: every 5 minutes

### 6. Frontend Deployment
- Connect the repo to Vercel
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars

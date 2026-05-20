# TrendPulse MVP — Implementation Plan

TrendPulse is an Open-Core Modular Monolith for automated Reddit lead detection. This plan covers **Phase 1** of the MVP: the **Storage Layer & Dashboard Setup** (Next.js frontend + Supabase backend), plus the **Phase 2–4 FastAPI engine** as a separate Python service.

The repo already has a fresh Next.js 16 (React 19, Tailwind CSS v4) scaffold. This plan builds the full MVP on top of it.

## User Review Required

> [!IMPORTANT]
> **Supabase Project**: You will need to create a Supabase project at [supabase.com](https://supabase.com) and provide the following environment variables before the app can be run against a real database:
> - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anonymous/public key
>
> These go in a `.env.local` file (gitignored).

> [!IMPORTANT]
> **FastAPI Engine (Phase 2–4)** is a separate Python service deployed on Render/Railway. This plan builds the full engine code inside a `engine/` directory in the same repo. You will need to:
> 1. Provision an **Upstash Redis** instance and set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` on the engine host.
> 2. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on the engine host (the service role key, NOT the anon key).
> 3. Set `CRON_SECRET` — a shared secret for authenticating cron requests.
> 4. Set `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` — Reddit API credentials from [reddit.com/prefs/apps](https://reddit.com/prefs/apps).
> 5. Optionally set `KEYWORD_REGEX_WEIGHTS` and `HIGH_INTENT_PHRASES` for the regex engine sieve (the "moat" env vars).
> 6. Register a cron job at [cron-job.org](https://cron-job.org) to POST to `https://<engine-host>/api/v1/cron-check` every 5 minutes with header `X-Cron-Secret: <CRON_SECRET>`.

> [!WARNING]
> **Tailwind CSS**: The existing scaffold uses Tailwind CSS v4 (already installed). The plan uses Tailwind utilities throughout, consistent with the existing setup.

## Open Questions

> [!NOTE]
> **Auth Provider** ✅ — Google OAuth + email/password. Supabase Google provider must be enabled in the Supabase dashboard (Authentication → Providers → Google) with OAuth credentials from Google Cloud Console.

> [!NOTE]
> **Free Tier Limit** ✅ — Enforced in **both** places: the DB blocks inserts via a trigger (hard constraint), and the UI shows an explicit error message and disables the "Add Keyword" button when at the limit. No silent failures.

---

## Proposed Changes

### 1. Supabase Client Library & Auth Infrastructure

Install the Supabase JS SDK. Create a shared Supabase client helper, auth context, and middleware for session management.

#### [NEW] [.env.local.example](file:///Users/zacharygamble/projects/trend-pulse/.env.local.example)
Template file with all required env vars for documentation.

#### [MODIFY] [package.json](file:///Users/zacharygamble/projects/trend-pulse/package.json)
Add `@supabase/supabase-js` and `@supabase/ssr` dependencies.

#### [NEW] [lib/supabase/client.ts](file:///Users/zacharygamble/projects/trend-pulse/lib/supabase/client.ts)
Browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`.

#### [NEW] [lib/supabase/server.ts](file:///Users/zacharygamble/projects/trend-pulse/lib/supabase/server.ts)
Server-side Supabase client using `createServerClient` from `@supabase/ssr` with cookie handling via `next/headers`.

#### [NEW] [lib/supabase/middleware.ts](file:///Users/zacharygamble/projects/trend-pulse/lib/supabase/middleware.ts)
Middleware helper to refresh auth tokens on every request.

#### [NEW] [middleware.ts](file:///Users/zacharygamble/projects/trend-pulse/middleware.ts)
Next.js middleware that calls the Supabase middleware helper, protects `/dashboard/*` routes by redirecting unauthenticated users to `/login`.

---

### 2. Database Schema & RLS Policies

SQL migration files to be run in the Supabase SQL Editor (or via Supabase CLI migrations).

#### [NEW] [supabase/migrations/001_initial_schema.sql](file:///Users/zacharygamble/projects/trend-pulse/supabase/migrations/001_initial_schema.sql)
Creates the three tables (`profiles`, `keywords`, `matches`) exactly as specified, plus:
- RLS policies so users can only SELECT/INSERT/UPDATE/DELETE their own rows.
- A trigger on `profiles` that auto-creates a profile row when a new auth user signs up.
- A trigger/check on `keywords` that prevents free-tier users from inserting more than 1 keyword row.
- The performance indexes from the spec.

---

### 3. Design System & Global Styles

#### [MODIFY] [app/globals.css](file:///Users/zacharygamble/projects/trend-pulse/app/globals.css)
Extend the existing Tailwind setup with:
- Custom `@theme` tokens for the brand palette (deep indigo/violet primary, dark backgrounds, accent gradients).
- Custom keyframe animations for micro-interactions (fade-in, slide-up, pulse-glow).
- Smooth scrollbar styling, selection color, focus ring utilities.

#### [MODIFY] [app/layout.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/layout.tsx)
- Update metadata (title: "TrendPulse", description).
- Use the Inter font from `next/font/google` instead of Geist for a more modern SaaS feel.
- Wrap children in dark mode by default (`className="dark"` on `<html>`).

---

### 4. Landing Page (Public)

#### [MODIFY] [app/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/page.tsx)
Replace the default Next.js boilerplate with a premium, dark-themed landing page:
- **Hero section**: Gradient headline, animated pulse ring, CTA buttons ("Get Started" → `/signup`, "View Source" → GitHub).
- **How It Works**: 3-step visual with icons (Configure → Detect → Alert).
- **Features grid**: Cards with glassmorphism effect for key capabilities.
- **Footer**: Minimal with links.

---

### 5. Auth Pages

#### [NEW] [app/login/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/login/page.tsx)
Login page with email/password form. Server Action that calls `supabase.auth.signInWithPassword()`, redirects to `/dashboard` on success.

#### [NEW] [app/signup/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/signup/page.tsx)
Sign-up page with email/password form. Server Action that calls `supabase.auth.signUp()`, shows confirmation message.

#### [NEW] [app/auth/callback/route.ts](file:///Users/zacharygamble/projects/trend-pulse/app/auth/callback/route.ts)
Route handler for Supabase auth callback (email confirmation, OAuth redirects).

#### [NEW] [app/(auth)/actions.ts](file:///Users/zacharygamble/projects/trend-pulse/app/(auth)/actions.ts)
Shared server actions for `login`, `signup`, `logout`.

---

### 6. Dashboard Layout & Pages

#### [NEW] [app/dashboard/layout.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/layout.tsx)
Dashboard shell layout with:
- Sidebar navigation (Keywords, Matches, Settings).
- Top bar with user email and logout button.
- Glassmorphism sidebar styling with smooth transitions.

#### [NEW] [app/dashboard/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/page.tsx)
Dashboard overview page — shows stats cards (total keywords, total matches, last match time) fetched from Supabase via Server Component.

#### [NEW] [app/dashboard/keywords/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/keywords/page.tsx)
Keywords management page:
- Lists all keywords for the current user in a styled table/card layout.
- "Add Keyword" button (disabled if free-tier limit reached).
- Delete keyword action.

#### [NEW] [app/dashboard/keywords/new/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/keywords/new/page.tsx)
New keyword form:
- Fields: phrase, target subreddits (comma-separated → array), Discord webhook URL.
- Server Action to insert into `keywords` table.
- Validates free-tier limit before insert.

#### [NEW] [app/dashboard/keywords/actions.ts](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/keywords/actions.ts)
Server Actions: `createKeyword`, `deleteKeyword`.

#### [NEW] [app/dashboard/matches/page.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/matches/page.tsx)
Matches history page:
- Lists all matches across all user keywords, sorted by `matched_at` descending.
- Each match shows: keyword phrase, post title (linked to Reddit), matched time.
- Paginated or infinite scroll.

#### [NEW] [app/dashboard/matches/actions.ts](file:///Users/zacharygamble/projects/trend-pulse/app/dashboard/matches/actions.ts)
Server Action: `getMatches` (with pagination).

---

### 7. Shared UI Components

#### [NEW] [app/ui/button.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/ui/button.tsx)
Reusable Button component with variants (primary gradient, secondary outline, danger).

#### [NEW] [app/ui/input.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/ui/input.tsx)
Styled input component with label, error state, dark theme.

#### [NEW] [app/ui/card.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/ui/card.tsx)
Glassmorphism card component for dashboard stats and keyword cards.

#### [NEW] [app/ui/nav-link.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/ui/nav-link.tsx)
Client component sidebar nav link with active state detection via `usePathname`.

#### [NEW] [app/ui/logo.tsx](file:///Users/zacharygamble/projects/trend-pulse/app/ui/logo.tsx)
TrendPulse logo/wordmark component (SVG-based, no external assets).

---

### 8. FastAPI Automation Engine (Phase 2–4)

#### [NEW] [engine/requirements.txt](file:///Users/zacharygamble/projects/trend-pulse/engine/requirements.txt)
Python dependencies: `fastapi`, `uvicorn`, `httpx`, `upstash-redis`, `supabase` (Python client).

#### [NEW] [engine/main.py](file:///Users/zacharygamble/projects/trend-pulse/engine/main.py)
FastAPI app with:
- `POST /api/v1/cron-check` endpoint protected by `X-Cron-Secret` header validation.
- The 5-step pipeline: pull keywords → ingest Reddit → dedup via Redis → regex sieve → persist & alert.

#### [NEW] [engine/config.py](file:///Users/zacharygamble/projects/trend-pulse/engine/config.py)
Pydantic Settings class reading all env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `KEYWORD_REGEX_WEIGHTS`, `HIGH_INTENT_PHRASES`).

#### [NEW] [engine/services/reddit.py](file:///Users/zacharygamble/projects/trend-pulse/engine/services/reddit.py)
Reddit API client — authenticates via OAuth2 client credentials flow, fetches latest 25 posts from target subreddits using `/r/{subreddit}/new.json`.

#### [NEW] [engine/services/dedup.py](file:///Users/zacharygamble/projects/trend-pulse/engine/services/dedup.py)
Upstash Redis deduplication service — `SETEX post_id 86400 1` pattern for 24-hour rolling cache. Checks before processing, sets after match.

#### [NEW] [engine/services/sieve.py](file:///Users/zacharygamble/projects/trend-pulse/engine/services/sieve.py)
Regex engine sieve — loads pattern weights and high-intent phrases from env vars. Scores each post against keyword phrases. Returns match/no-match.

#### [NEW] [engine/services/alerts.py](file:///Users/zacharygamble/projects/trend-pulse/engine/services/alerts.py)
Discord webhook dispatcher — sends structured embed JSON to the user's configured webhook URL.

#### [NEW] [engine/services/db.py](file:///Users/zacharygamble/projects/trend-pulse/engine/services/db.py)
Supabase Python client wrapper — reads active keywords, writes match records.

#### [NEW] [engine/Dockerfile](file:///Users/zacharygamble/projects/trend-pulse/engine/Dockerfile)
Minimal Python container for Render/Railway deployment.

#### [NEW] [engine/render.yaml](file:///Users/zacharygamble/projects/trend-pulse/engine/render.yaml)
Render blueprint for one-click deployment.

---

## Verification Plan

### Automated Tests
1. `npm run build` — Ensure the Next.js app compiles without errors.
2. `npm run dev` — Launch dev server and verify:
   - Landing page renders at `/`.
   - `/login` and `/signup` pages render correctly.
   - `/dashboard` redirects to `/login` when unauthenticated.
3. `cd engine && pip install -r requirements.txt && python -m pytest` — (Future: unit tests for sieve and dedup logic).

### Manual Verification
1. **Supabase Setup**: After creating a Supabase project, run the migration SQL. Verify tables and RLS policies exist in the Supabase dashboard.
2. **Auth Flow**: Sign up with email, confirm via email link, log in, verify session persists.
3. **Keyword CRUD**: Create a keyword, verify it appears in the list. Delete it, verify removal.
4. **Free-Tier Limit**: Attempt to add a second keyword on a free-tier account — verify the UI blocks it and the DB rejects it.
5. **Engine Smoke Test**: Deploy the engine, trigger the cron endpoint manually with curl, verify matches appear in the matches table and Discord webhook fires.

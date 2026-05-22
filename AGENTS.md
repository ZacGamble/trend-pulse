<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architectural Context (TrendPulse)

- **Reddit Integration**: We explicitly DO NOT use the Reddit OAuth2 API (Reddit no longer issues 3rd-party developer keys). Additionally, due to aggressive cloud-provider IP blocking (403 Forbidden) on Reddit's `.json` endpoints, **we exclusively use the RSS feeds (`.rss`) paired with `feedparser`**. The RSS backend subsystem has significantly weaker security walls against cloud IPs.
- **Backend Architecture**: The backend (`/engine`) is a stateless FastAPI Python application running as a cron-triggered webhook. It parses RSS entries, sanitizes HTML, and uses regex matching against user keywords.
- **Deduplication**: Handled entirely via serverless Upstash Redis (24-hour TTL) to keep the engine container purely stateless and prevent duplicate Discord alerts for the same `post_id`.
- **Database**: Supabase PostgreSQL. All configuration (keywords, target subreddits, discord webhooks) is pulled dynamically from the `keywords` table on every run using a `service_role` key.
- **Stripe Billing / Hybrid Tier Mapping**: We use Stripe Checkout and Customer Portal in test-mode. The Supabase `profiles.tier` column ('free' or 'premium') is the absolute source of truth. Stripe webhooks (`/api/billing/webhook`) use the Service Role key to dynamically flip the `tier` upon `checkout.session.completed` and `customer.subscription.deleted`.
- **Railway Deployment Quirks**: When deploying the Python engine to Railway via Dockerfile, do NOT use `EXPOSE 8000`. Uvicorn must bind to `0.0.0.0` (IPv4) and the user must explicitly set `PORT=8000` in their Railway variables to prevent the edge proxy from returning 502 Bad Gateway.

# Current Project State
- **Frontend (Next.js)**: 
  - Responsive Dashboard with mobile hamburger navigation (`<MobileNav>`).
  - Consolidated Matches & Keyword management pages.
  - Stripe integration complete (Checkout, Portal, Webhook). "Upgrade to Premium" buttons appear when users hit their free-tier limits, dynamically changing to "Manage Subscription" for premium users.
- **Backend (Python Engine)**: 
  - Fully migrated from `curl_cffi` JSON scraping to `feedparser` RSS scraping to bypass 403 blocks.
  - Successfully pulling posts, sanitizing HTML, and logging matches.

# TODOs to Achieve MVP (Minimum Viable Product)
- [ ] **Production Stripe Testing**: Execute end-to-end checkout and portal webhook testing on the live Vercel deployment URL using Stripe test keys.
- [ ] **Landing Page**: Build a high-converting `/` marketing landing page explaining the value proposition of TrendPulse before routing to `/login`.
- [ ] **Discord Webhook Formatting**: Ensure the Discord webhook payload sent by the Python engine looks professional (rich embeds with post title, author, subreddit, matching keyword, and direct URL).
- [ ] **Global Error Handling**: Ensure frontend forms (`/dashboard/keywords/new`, etc.) have proper toast notifications or error states if Supabase mutations fail.
- [ ] **Launch Preparation**: Switch Stripe keys to Live mode, test the live product catalog, and push to production!

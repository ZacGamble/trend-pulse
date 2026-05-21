<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architectural Context (TrendPulse)

- **Reddit Integration**: We explicitly DO NOT use the Reddit OAuth2 API (Reddit no longer issues 3rd-party developer keys). All Reddit scraping must use the public JSON endpoints (e.g., `reddit.com/r/{subreddit}/new.json`) with a custom `User-Agent`. 429 Too Many Requests are expected and handled gracefully by skipping the cycle.
- **Backend Architecture**: The backend (`/engine`) is a stateless FastAPI Python application running as a cron-triggered webhook, rather than a continuous long-polling process.
- **Deduplication**: Handled entirely via serverless Upstash Redis (24-hour TTL) to keep the engine container purely stateless.
- **Database**: Supabase PostgreSQL. All configuration (keywords, target subreddits, discord webhooks) is pulled dynamically from the `keywords` table on every run using a `service_role` key.
- **Railway Deployment Quirks**: When deploying the Python engine to Railway via Dockerfile, do NOT use `EXPOSE 8000`. Uvicorn must bind to `0.0.0.0` (IPv4) and the user must explicitly set `PORT=8000` in their Railway variables to prevent the edge proxy from returning 502 Bad Gateway.

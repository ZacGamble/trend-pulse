# TrendPulse Engine — Railway Deployment Guide

This guide walks you through deploying the TrendPulse FastAPI engine to [Railway](https://railway.com) from scratch.

---

## Prerequisites

Before starting, make sure you have:

- [ ] A Railway account ([sign up here](https://railway.com))
- [ ] Your GitHub repo pushed with the `engine/` directory
- [ ] The following values ready (from earlier setup steps):

| Value | Where to find it |
| :--- | :--- |
| Supabase URL | Supabase Dashboard → Project Settings → API |
| Supabase Service Role Key | Supabase Dashboard → Project Settings → API (reveal `service_role`) |
| Upstash Redis REST URL | Upstash Console → Your Redis database |
| Upstash Redis REST Token | Upstash Console → Your Redis database |

---

## Step 1 — Create a New Project

1. Go to [railway.com/dashboard](https://railway.com/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account (if not already connected)
5. Select the **trend-pulse** repository

---

## Step 2 — Configure the Service

Railway will auto-detect the repo, but it will try to build from the root. Since the engine lives in the `engine/` subdirectory, you need to tell Railway where to look.

### Set the Root Directory

1. Click on the newly created service in the Railway dashboard
2. Go to **Settings** (gear icon)
3. Under **Source** → **Root Directory**, set it to:
   ```
   engine
   ```
4. Railway will now use `engine/Dockerfile` to build the service

### Verify the Build Configuration

Railway should auto-detect the Dockerfile. Confirm these settings under **Settings** → **Build**:

| Setting | Value |
| :--- | :--- |
| Builder | Dockerfile |
| Dockerfile Path | `Dockerfile` (relative to root directory) |
| Watch Paths | Leave empty (deploys on every push) |

> **Note:** Since you set the Root Directory to `engine`, the Dockerfile path is just `Dockerfile` — not `engine/Dockerfile`.

---

## Step 3 — Set Environment Variables

1. Click on your service in the Railway dashboard
2. Go to the **Variables** tab
3. Click **"New Variable"** for each of the following:

### Required Variables

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | The **service role** key (NOT the anon key) |
| `UPSTASH_REDIS_REST_URL` | `https://xxxxx.upstash.io` | From the Upstash Redis console |
| `UPSTASH_REDIS_REST_TOKEN` | `AXxxxxxxxxxxxx` | From the Upstash Redis console |
| `CRON_SECRET` | Any strong random string | Used to authenticate cron requests (see Step 5) |
| `PORT` | `8000` | Railway injects this — must match the Dockerfile's `EXPOSE` |

> **Tip:** To generate a secure `CRON_SECRET`, run this in your terminal:
> ```bash
> openssl rand -hex 32
> ```

### Optional Variables

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `REDDIT_USER_AGENT` | `TrendPulse/1.0 (automated lead detector)` | Default is fine — only change if Reddit blocks the default |
| `KEYWORD_REGEX_WEIGHTS` | `'{"looking for": 3, "need a tool": 5}'` | JSON string of keyword weights (proprietary business logic) |
| `HIGH_INTENT_PHRASES` | `'["ready to pay", "budget", "pricing"]'` | JSON array of high-intent phrases (proprietary business logic) |

---

## Step 4 — Configure Networking

Railway needs to know which port your service listens on.

1. Go to **Settings** → **Networking**
2. Under **Public Networking**, click **"Generate Domain"** to get a public URL (e.g., `trendpulse-engine-production.up.railway.app`)
3. Ensure the port is set to **8000** (matching the Dockerfile's `EXPOSE 8000` and uvicorn's `--port 8000`)

Save the generated domain — you'll need it for the cron job in Step 5.

---

## Step 5 — Deploy

1. Railway should auto-deploy when you push to GitHub
2. If it doesn't, go to your service and click **"Deploy"** manually
3. Watch the build logs to verify a successful deployment

### Verify the Deployment

Once deployed, test the health endpoint:

```bash
curl https://<your-railway-domain>/health
```

You should see:

```json
{"status": "ok", "service": "trendpulse-engine"}
```

---

## Step 6 — Set Up the Cron Job

The engine doesn't run continuously — it's triggered by an external cron service every 5 minutes.

### Using cron-job.org (Free)

1. Sign up at [cron-job.org](https://cron-job.org)
2. Click **"Create cronjob"**
3. Fill in the following:

| Field | Value |
| :--- | :--- |
| **Title** | `TrendPulse Pipeline` |
| **URL** | `https://<your-railway-domain>/api/v1/cron-check` |
| **Schedule** | Every **5 minutes** |
| **Request Method** | `POST` |
| **Request Headers** | Add a header: `X-Cron-Secret` = `<your CRON_SECRET value>` |

4. Under **Advanced** → **Request Timeout**, set to **30 seconds**
5. Save and enable the cron job

### Verify the Cron Job

You can manually trigger a test by running:

```bash
curl -X POST \
  https://<your-railway-domain>/api/v1/cron-check \
  -H "X-Cron-Secret: <your CRON_SECRET value>"
```

Expected response (when no keywords are configured yet):

```json
{"processed": 0, "matches": 0}
```

---

## Step 7 — Monitor

### Viewing Logs

1. Click on your service in the Railway dashboard
2. Go to the **Logs** tab (or **Deployments** → click a deployment → **View Logs**)
3. You should see log output like:

```
INFO:     trendpulse | Pipeline triggered — starting processing cycle
INFO:     trendpulse | Loaded 3 active keyword(s)
INFO:     trendpulse | Ingested 25 posts from r/SaaS
INFO:     trendpulse | Cycle complete — processed 50 posts, 2 new matches
```

### Railway Observability

Railway provides built-in metrics under **Metrics** tab:
- **CPU usage** — should spike briefly every 5 min, then idle
- **Memory usage** — should stay well under 512 MB
- **Network** — outbound traffic to Reddit, Supabase, Upstash, Discord

---

## Troubleshooting

### Build fails

| Symptom | Fix |
| :--- | :--- |
| `Dockerfile not found` | Verify **Root Directory** is set to `engine` in Settings → Source |
| `pip install` fails | Check `requirements.txt` has valid package versions |
| Python version error | The Dockerfile uses `python:3.12-slim` — ensure no local-only deps |

### Runtime errors

| Symptom | Fix |
| :--- | :--- |
| `422 Unprocessable Entity` on `/api/v1/cron-check` | The `X-Cron-Secret` header is missing — add it to your cron job |
| `401 Invalid cron secret` | The `X-Cron-Secret` header value doesn't match the `CRON_SECRET` env var |
| `ValidationError` on startup | A required env var is missing — check all 5 required variables are set |
| Empty response `{"processed": 0}` | No keywords configured in the dashboard yet, or target subreddits returned no posts |
| Reddit returns `429` | Rate limited — the engine handles this gracefully and retries next cycle |
| Reddit returns `403` | Reddit may be blocking the user agent — try customizing `REDDIT_USER_AGENT` |

### Sleep / Cold Starts

Railway's free tier may sleep your service after inactivity. When the cron job hits a sleeping service:
- The first request may take 5–15 seconds to cold-start
- This is normal — set your cron-job.org timeout to **30 seconds** to account for it
- Subsequent requests within the same wake window are fast

---

## Cost

Railway's **Trial plan** gives you **$5 of free credits** with a one-time grant. After that:

| Resource | Estimated Usage | Estimated Cost |
| :--- | :--- | :--- |
| Compute | ~5 sec every 5 min ≈ 43 min/month | ~$0.10/month |
| Memory | ~128 MB peak | Included |
| Network | Minimal outbound | Included |

For a cron-based service that runs for seconds at a time, Railway is extremely cheap — typically under **$1/month** after the trial ends.

> **Tip:** Railway's **Hobby plan** ($5/month) removes the trial credit limit and gives you more generous compute allowances. Highly recommended if you plan to run this long-term.

# TrendPulse 🎯

> **Zero-configuration lead generation. Turn Reddit conversations into high-intent sales leads, instantly.**

TrendPulse is an automated, stateless engine that monitors Reddit for high-intent keywords in your target niches, filtering out noise and delivering qualified leads directly to your Discord via webhooks.

## 🚀 The Problem it Solves
Finding customers on Reddit is incredibly manual and time-consuming. You either spend hours searching subreddits every day, or you miss out on potential customers asking for exactly what you build. TrendPulse automates this entirely. Set your keywords once, and let the engine do the prospecting.

## ✨ Features
- **Stateless Cron Engine**: Runs entirely on a 5-minute schedule, costing practically nothing to host.
- **Smart Deduplication**: Upstash Redis integration ensures you are never notified about the same post twice.
- **Discord Integration**: Rich embeds sent straight to your community or private channels.
- **Public JSON Scraping**: Bypasses the restrictive Reddit API by utilizing public JSON feeds with polite rate-limit handling.
- **Next.js Dashboard**: A beautiful, modern dashboard to manage your keyword trackers (coming soon/in-progress).

## 🏗 Architecture
TrendPulse is split into two halves:
1. **The Engine (`/engine`)**: A Python/FastAPI backend triggered via an external cron scheduler. It pulls active configurations from Supabase, ingests Reddit posts, filters them through a regex sieve, and fires webhooks.
2. **The Dashboard (`/`)**: A Next.js 15 frontend where users can log in (via Supabase Auth) to configure their keywords and view historical matches.

**Tech Stack**: 
- **Frontend**: Next.js (App Router), TailwindCSS, Supabase Auth
- **Backend**: Python 3.12, FastAPI, httpx
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis (Serverless)

## 🏁 Quick Start

### 1. Engine Setup (Local)
Ensure you have Python 3.12 installed.
```bash
cd engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables
Create an `.env` file in the `engine` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
CRON_SECRET=your_secure_random_string
```

### 3. Run the Engine
The engine is designed to be pinged on a schedule (e.g. by cron-job.org). To test it locally:
```bash
uvicorn main:app --reload
```
Then trigger the pipeline manually:
```bash
curl -X POST http://localhost:8000/api/v1/cron-check \
  -H "x-cron-secret: your_secure_random_string"
```

## ☁️ Deployment (Railway)
When deploying the engine to Railway, you **must** explicitly define `PORT=8000` in the Railway Variables tab. Railway's edge proxy will return a `502 Bad Gateway` if the internal port mappings don't explicitly align with the container.

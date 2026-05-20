# Technical Architecture and MVP Roadmap: TrendPulse

## 1. System Design Philosophy

TrendPulse is designed under the **Open-Core Modular Monolith** framework. To balance the dual objectives of building a public portfolio for backend/automation roles and launching an independent SaaS business, the codebase separates the user interface from the stateful automation engine while maintaining a single repository.

* **The Repository is the Resume:** The entire codebase is public. It showcases production-ready backend design, database design, caching strategies, and third-party API integration.
* **The Environment is the Moat:** Proprietary business configurations—such as specialized regex weights, high-intent buyer phrases, anti-bot parameters, and marketing targets—are entirely abstracted from the source code. They are injected at runtime via system environment variables. If the repository is cloned, the engine remains an empty shell.
* **The Growth Flywheel:** The MVP's primary operational focus is self-consumption. The system serves as its own lead acquisition channel by scanning for user pain points across indie-focused platforms.
* **The Zero-Cost Footprint:** The processing pipeline uses a stateless design. It processes heavy data streams entirely within ephemeral memory bounds, ensuring it scales within the free tiers of Vercel, Render/Railway, Upstash, and Supabase without generating cloud bills.

---

## 2. System Architecture Layout

```
[ FRONTEND LAYER ]
Next.js 15 UI (Vercel Free Tier)
   └── Manages Authentication, Keywords, and Webhook Rules
   └── Communicates via Supabase client with Row-Level Security (RLS)

[ STORAGE LAYER ]
Supabase Postgres (Free Tier: 500MB)
   └── Stores relational user schemas, keyword limits, and matched leads
Upstash Redis (Free Tier: 10k requests/day)
   └── Tracks 24-hour rolling Reddit Post ID deduplication cache

[ COMPUTE LAYER ]
FastAPI Automation Engine (Render / Railway Free Tier)
   └── Stateless processing pipeline
   └── Ingests live data streams entirely into volatile memory (RAM)
   └── Evaluates criteria, saves confirmed records, and dispatches alerts

```

---

## 3. Database Schema Blueprint

```sql
-- Profiles Table (Linked directly to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Keywords Table (User-defined monitoring configurations)
CREATE TABLE public.keywords (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    phrase TEXT NOT NULL,
    target_subreddits TEXT[] NOT NULL,
    discord_webhook_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Matches Table (The permanent ledger of confirmed leads)
CREATE TABLE public.matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    keyword_id BIGINT NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL,
    title TEXT NOT NULL,
    permalink TEXT NOT NULL,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance and uniqueness constraints
CREATE UNIQUE INDEX idx_unique_keyword_post ON public.matches (keyword_id, post_id);
CREATE INDEX idx_keywords_user_id ON public.keywords (user_id);

```

---

## 4. Technical Execution Sequence

```
[ cron-job.org ] ──(Every 5 Mins via HTTP POST)──► [ FastAPI /api/v1/cron-check ]
                                                           │
                                             (Validates Security Token)
                                                           │
                                                           ▼
                                            [ Step 1: Pull Active Keywords ]
                                            Reads query requirements from DB
                                                           │
                                                           ▼
                                            [ Step 2: Ingest Live Firehose ]
                                            Streams latest 25 posts into RAM
                                                           │
                                                           ▼
                                            [ Step 3: Deduplication Filter ]
                                            Skips if Post ID is found in Redis
                                                           │
                                                           ▼
                                            [ Step 4: Regex Engine Sieve ]
                                            Matches text via abstracted rules
                                                           │
                                             ┌─────────────┴─────────────┐
                                        (Match)                     (No Match)
                                             │                           │
                                             ▼                           ▼
                                [ Step 5: Persist & Alert ]       [ Drop from RAM ]
                                Saves to DB & triggers Webhook     Consumes 0 bytes

```

---

## 5. MVP Implementation Roadmap

### Phase 1: Storage Layer & Dashboard Setup (Days 1–7)

* Provision Supabase project, enable Postgres database, and configure basic schema tables.
* Apply Row-Level Security (RLS) rules to ensure users can only view or mutate their own tracking configurations.
* Initialize Next.js application framework on Vercel; build user login, tracking table interface, and target destination forms.

### Phase 2: Memory Ingestion & Deduplication (Days 8–15)

* Construct Python FastAPI application structure on Render/Railway.
* Implement secure custom validation middleware requiring specific header keys for endpoint access.
* Connect the Python execution script to Upstash Redis. Build the deduplication check using a 24-hour rolling expiry time-to-live (`SETEX post_id 86400 1`).
* Establish connection channels to read streaming endpoints from target platforms directly into local memory arrays.

### Phase 3: Sieve Processing & Tier Gates (Days 16–22)

* Build the regular expression parsing mechanism inside the FastAPI runner to compare runtime string elements against criteria array datasets.
* Inject the default growth keywords using environment variable configuration vectors on the hosting provider's dashboard.
* Write database trigger validations to prevent free-tier users from adding more than one keyword tracker configuration.
* Build the alert dispatch module to structure output parameters into clean target JSON webhooks.

### Phase 4: Integration, Orchestration & Launch (Days 23–28)

* Register automated triggers on `cron-job.org` to target the processing script endpoint on a strict 5-minute recurring loop.
* Deploy tracking directives aimed at discovering early leads for the product itself.
* Launch the public frontend page, link the source code visibility directly to the profile interface, and begin processing active live opportunities.
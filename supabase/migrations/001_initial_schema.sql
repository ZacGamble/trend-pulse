-- ============================================================
-- TrendPulse — Initial Schema Migration
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- 1. Profiles Table (linked directly to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Keywords Table (user-defined monitoring configurations)
CREATE TABLE public.keywords (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    phrase TEXT NOT NULL,
    target_subreddits TEXT[] NOT NULL,
    discord_webhook_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Matches Table (the permanent ledger of confirmed leads)
CREATE TABLE public.matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    keyword_id BIGINT NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL,
    title TEXT NOT NULL,
    permalink TEXT NOT NULL,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE UNIQUE INDEX idx_unique_keyword_post ON public.matches (keyword_id, post_id);
CREATE INDEX idx_keywords_user_id ON public.keywords (user_id);

-- ============================================================
-- Auto-create profile on signup (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Free-tier keyword limit enforcement (trigger)
-- Prevents free-tier users from inserting more than 1 keyword.
-- Raises an explicit error — no silent failures.
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_keyword_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_tier TEXT;
    keyword_count INT;
BEGIN
    SELECT tier INTO user_tier FROM public.profiles WHERE id = NEW.user_id;

    IF user_tier = 'free' THEN
        SELECT COUNT(*) INTO keyword_count
        FROM public.keywords
        WHERE user_id = NEW.user_id;

        IF keyword_count >= 1 THEN
            RAISE EXCEPTION 'FREE_TIER_LIMIT: Free-tier accounts are limited to 1 keyword tracker. Upgrade to premium for unlimited trackers.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_keyword_limit_trigger
    BEFORE INSERT ON public.keywords
    FOR EACH ROW EXECUTE FUNCTION public.enforce_keyword_limit();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Keywords: users can only CRUD their own keywords
CREATE POLICY "Users can view own keywords"
    ON public.keywords FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keywords"
    ON public.keywords FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keywords"
    ON public.keywords FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keywords"
    ON public.keywords FOR DELETE
    USING (auth.uid() = user_id);

-- Matches: users can view matches for their own keywords
CREATE POLICY "Users can view own matches"
    ON public.matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.keywords
            WHERE public.keywords.id = public.matches.keyword_id
            AND public.keywords.user_id = auth.uid()
        )
    );

-- Matches are inserted by the engine via service role key (bypasses RLS).
-- No INSERT policy needed for regular users.

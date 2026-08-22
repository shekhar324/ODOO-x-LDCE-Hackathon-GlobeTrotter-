-- ============================================================
-- GlobeTrotter — Database Migration & Schema Cache Reload
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create profiles table (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    country TEXT,
    preferred_language TEXT DEFAULT 'en',
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users edit own profile" ON public.profiles;
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid()));

-- 2. Create calendar_events table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    event_type TEXT NOT NULL DEFAULT 'personal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_events_user_idx ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON public.calendar_events(event_date);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calendar events" ON public.calendar_events;
CREATE POLICY "Users can view own calendar events"
    ON public.calendar_events FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own calendar events" ON public.calendar_events;
CREATE POLICY "Users can create own calendar events"
    ON public.calendar_events FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own calendar events" ON public.calendar_events;
CREATE POLICY "Users can update own calendar events"
    ON public.calendar_events FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own calendar events" ON public.calendar_events;
CREATE POLICY "Users can delete own calendar events"
    ON public.calendar_events FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- 3. Create or Update community_posts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT,
    story TEXT,
    how_it_went TEXT,
    recommendations TEXT,
    dos TEXT,
    donts TEXT,
    tips TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts
    ADD COLUMN IF NOT EXISTS destination TEXT,
    ADD COLUMN IF NOT EXISTS story TEXT,
    ADD COLUMN IF NOT EXISTS how_it_went TEXT,
    ADD COLUMN IF NOT EXISTS recommendations TEXT,
    ADD COLUMN IF NOT EXISTS dos TEXT,
    ADD COLUMN IF NOT EXISTS donts TEXT,
    ADD COLUMN IF NOT EXISTS tips TEXT,
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure trip_id is nullable
ALTER TABLE public.community_posts ALTER COLUMN trip_id DROP NOT NULL;

-- Enable RLS on community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public community posts view" ON public.community_posts;
CREATE POLICY "Public community posts view" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create posts" ON public.community_posts;
CREATE POLICY "Authenticated users create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authors update posts" ON public.community_posts;
CREATE POLICY "Authors update posts" ON public.community_posts FOR UPDATE TO authenticated USING (author_id = (SELECT auth.uid())) WITH CHECK (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authors delete posts" ON public.community_posts;
CREATE POLICY "Authors delete posts" ON public.community_posts FOR DELETE TO authenticated USING (author_id = (SELECT auth.uid()));

-- 4. Reload Supabase / PostgREST Schema Cache
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Done! Verify by checking the tables in the Supabase Table Editor.
-- ============================================================

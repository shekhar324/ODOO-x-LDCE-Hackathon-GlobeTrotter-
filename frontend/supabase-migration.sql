-- ============================================================
-- GlobeTrotter — Complete Master Database Schema & Initial Seed
-- Copy & Run this entire script in your Supabase SQL Editor
-- Dashboard URL: https://supabase.com/dashboard/project/wqrrxmzjybkrstofvytn/sql/new
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users edit own profile" ON public.profiles;
CREATE POLICY "Users edit own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));

-- Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
        new.raw_user_meta_data ->> 'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Trigger to clean up profiles, trips, posts, calendar events & storage when a user is deleted from auth.users
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Delete storage objects owned by deleted user
    DELETE FROM storage.objects 
    WHERE owner = old.id 
       OR (storage.foldername(name))[1] = old.id::text;

    -- Delete user profile (cascades to trips, trip_stops, trip_activities, calendar_events, community_posts)
    DELETE FROM public.profiles WHERE id = old.id;

    RETURN old;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_user_delete();


-- 2. Create cities table & Seed Data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code CHAR(2),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    image_url TEXT,
    cost_index SMALLINT CHECK (cost_index BETWEEN 1 AND 5),
    popularity_score NUMERIC(5,2) DEFAULT 90.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public cities view" ON public.cities;
CREATE POLICY "Public cities view" ON public.cities FOR SELECT USING (true);

-- Seed initial popular cities if empty
INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Kyoto', 'Japan', 'JP', 'Historical capital known for classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop', 4, 98.5
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Kyoto');

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Paris', 'France', 'FR', 'Global center for art, fashion, gastronomy and culture with landmark architecture.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop', 4, 97.0
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Paris');

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Bali', 'Indonesia', 'ID', 'Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop', 2, 95.0
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Bali');

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'New York', 'United States', 'US', 'Iconic metropolis featuring global finance, culture, theater, and culinary world landmarks.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop', 5, 96.5
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'New York');


-- 3. Create activities table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    city_id BIGINT REFERENCES public.cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'sightseeing',
    duration_minutes INTEGER DEFAULT 120,
    estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    image_url TEXT,
    rating NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public activities view" ON public.activities;
CREATE POLICY "Public activities view" ON public.activities FOR SELECT USING (true);


-- 4. Create trips table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    start_date DATE,
    end_date DATE,
    budget NUMERIC(12,2),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    visibility TEXT NOT NULL DEFAULT 'private',
    status TEXT NOT NULL DEFAULT 'planned',
    share_slug TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own or public trips" ON public.trips;
CREATE POLICY "Users can view own or public trips" ON public.trips FOR SELECT USING (visibility = 'public' OR owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own trips" ON public.trips;
CREATE POLICY "Users can create own trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE TO authenticated USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));


-- 5. Create trip_stops table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    city_id BIGINT REFERENCES public.cities(id),
    stop_order INTEGER NOT NULL DEFAULT 1,
    arrival_date DATE,
    departure_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public trip stops view" ON public.trip_stops;
CREATE POLICY "Public trip stops view" ON public.trip_stops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Trip owners manage stops" ON public.trip_stops;
CREATE POLICY "Trip owners manage stops" ON public.trip_stops FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_stops.trip_id AND owner_id = (SELECT auth.uid()))
);


-- 6. Create trip_activities table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_stop_id UUID NOT NULL REFERENCES public.trip_stops(id) ON DELETE CASCADE,
    activity_id BIGINT REFERENCES public.activities(id) ON DELETE SET NULL,
    custom_title TEXT,
    custom_description TEXT,
    activity_date DATE,
    start_time TIME,
    end_time TIME,
    position INTEGER NOT NULL DEFAULT 0,
    estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public trip activities view" ON public.trip_activities;
CREATE POLICY "Public trip activities view" ON public.trip_activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Trip owners manage activities" ON public.trip_activities;
CREATE POLICY "Trip owners manage activities" ON public.trip_activities FOR ALL TO authenticated USING (true);


-- 7. Create calendar_events table
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

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calendar events" ON public.calendar_events;
CREATE POLICY "Users can view own calendar events" ON public.calendar_events FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own calendar events" ON public.calendar_events;
CREATE POLICY "Users can create own calendar events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own calendar events" ON public.calendar_events;
CREATE POLICY "Users can update own calendar events" ON public.calendar_events FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own calendar events" ON public.calendar_events;
CREATE POLICY "Users can delete own calendar events" ON public.calendar_events FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));


-- 8. Create community_posts table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
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

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public community posts view" ON public.community_posts;
CREATE POLICY "Public community posts view" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create posts" ON public.community_posts;
CREATE POLICY "Authenticated users create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authors update posts" ON public.community_posts;
CREATE POLICY "Authors update posts" ON public.community_posts FOR UPDATE TO authenticated USING (author_id = (SELECT auth.uid())) WITH CHECK (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authors delete posts" ON public.community_posts;
CREATE POLICY "Authors delete posts" ON public.community_posts FOR DELETE TO authenticated USING (author_id = (SELECT auth.uid()));


-- 9. Create Supabase Storage bucket for community cover images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-covers', 'community-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
CREATE POLICY "Authenticated users can upload covers"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'community-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public can view community covers" ON storage.objects;
CREATE POLICY "Public can view community covers"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-covers');

DROP POLICY IF EXISTS "Users can delete own covers" ON storage.objects;
CREATE POLICY "Users can delete own covers"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'community-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 10. Comprehensive Seed Data (Cities, Activities & Community Posts)
-- ============================================================

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Santorini', 'Greece', 'GR', 'Cycladic island famous for whitewashed cliffside villages, breathtaking sunsets over the caldera, and volcanic beaches.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop', 4, 97.80
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Santorini');

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Amalfi Coast', 'Italy', 'IT', 'Dramatic Italian coastline featuring cliffside pastel villages, fragrant lemon groves, and sapphire Tyrrhenian waters.', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop', 5, 96.20
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Amalfi Coast');

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Tokyo', 'Japan', 'JP', 'Futuristic capital blending neon-lit skyscrapers, historic Shinto shrines, Michelin-star dining, and pop culture districts.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop', 4, 99.20
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Tokyo');

INSERT INTO public.cities (name, country, country_code, description, image_url, cost_index, popularity_score)
SELECT 'Swiss Alps', 'Switzerland', 'CH', 'Majestic alpine peak wonderland offering world-class skiing, mountain cogwheel railways, and pristine mirror lakes.', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop', 5, 98.00
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'Swiss Alps');

-- Seed Activities
INSERT INTO public.activities (city_id, name, description, category, duration_minutes, estimated_cost, currency, image_url, rating)
SELECT id, 'Arashiyama Bamboo Grove Walk', 'Early morning walk through the iconic bamboo tunnel at dawn.', 'nature', 90, 0.00, 'USD', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', 4.9
FROM public.cities WHERE name = 'Kyoto' LIMIT 1;

INSERT INTO public.activities (city_id, name, description, category, duration_minutes, estimated_cost, currency, image_url, rating)
SELECT id, 'Fushimi Inari Shrine Trek', 'Hike up Mount Inari under thousands of vibrant vermilion torii gates.', 'culture', 150, 0.00, 'USD', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', 4.9
FROM public.cities WHERE name = 'Kyoto' LIMIT 1;

INSERT INTO public.activities (city_id, name, description, category, duration_minutes, estimated_cost, currency, image_url, rating)
SELECT id, 'Louvre Museum Masterpiece Tour', 'Guided discovery of the Mona Lisa, Venus de Milo, and French royal jewels.', 'art', 180, 25.00, 'EUR', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', 4.8
FROM public.cities WHERE name = 'Paris' LIMIT 1;

INSERT INTO public.activities (city_id, name, description, category, duration_minutes, estimated_cost, currency, image_url, rating)
SELECT id, 'Uluwatu Sunset Kecak Fire Dance', 'Clifftop traditional dance performance as the sun sets over the ocean.', 'culture', 120, 15.00, 'USD', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', 4.9
FROM public.cities WHERE name = 'Bali' LIMIT 1;

-- 11. Reload Supabase / PostgREST Schema Cache
-- ============================================================
NOTIFY pgrst, 'reload schema';


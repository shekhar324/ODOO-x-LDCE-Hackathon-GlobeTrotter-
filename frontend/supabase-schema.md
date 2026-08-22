For **GlobeTrotter**, I’d make the Supabase design more serious than a basic `users / trips / activities` setup. The core should be relational, normalized enough to avoid duplication, and protected by RLS from day one. Supabase itself recommends RLS for exposed tables and explicitly supports connecting your own profile tables to `auth.users`. ([Supabase][1])

## Recommended architecture

```text
Supabase
│
├── Auth
│   └── auth.users
│
├── public
│   ├── profiles
│   ├── cities
│   ├── activities
│   ├── trips
│   ├── trip_stops
│   ├── trip_activities
│   ├── trip_expenses
│   ├── trip_members
│   ├── saved_destinations
│   ├── community_posts
│   ├── community_likes
│   └── community_comments
│
├── storage
│   ├── avatars
│   └── trip-media
│
└── functions
    ├── calculate_trip_budget()
    ├── get_trip_summary()
    └── get_public_trip()
```

The important design decision is that **`auth.users` remains the authentication source**, while your application-specific information goes into `public.profiles`. Supabase's Auth schema is intentionally separate and can be connected to your own tables with foreign keys/triggers. ([Supabase][2])

---

# 1. `profiles`

```sql
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    username text unique,
    full_name text,
    avatar_url text,

    bio text,
    country text,
    preferred_language text default 'en',

    is_public boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

This gives you:

```text
auth.users
      │
      │ 1:1
      ▼
profiles
```

Don't duplicate email/password here. Authentication belongs in Supabase Auth.

---

# 2. `cities`

Cities should be independent entities.

```sql
create table public.cities (
    id bigint generated always as identity primary key,

    name text not null,
    country text not null,
    country_code char(2),

    latitude double precision,
    longitude double precision,

    description text,
    image_url text,

    cost_index smallint check (cost_index between 1 and 5),
    popularity_score numeric(5,2),

    created_at timestamptz not null default now()
);

create index cities_name_idx
on public.cities using gin (to_tsvector('simple', name));

create index cities_country_idx
on public.cities(country_code);
```

This makes city search much better than putting city strings directly into trips.

---

# 3. `activities`

```sql
create table public.activities (
    id bigint generated always as identity primary key,

    city_id bigint not null
        references public.cities(id)
        on delete cascade,

    name text not null,
    description text,

    category text not null,
    duration_minutes integer,

    estimated_cost numeric(12,2) not null default 0,
    currency char(3) not null default 'INR',

    image_url text,

    rating numeric(2,1)
        check (rating between 0 and 5),

    created_at timestamptz not null default now()
);

create index activities_city_idx
on public.activities(city_id);

create index activities_category_idx
on public.activities(category);
```

Example:

```text
Tokyo
 ├── Senso-ji
 ├── Shibuya Sky
 ├── Tsukiji Food Tour
 └── Tokyo Disneyland
```

---

# 4. `trips`

This is the user's primary object.

```sql
create type public.trip_visibility as enum (
    'private',
    'friends',
    'public'
);

create type public.trip_status as enum (
    'draft',
    'planned',
    'ongoing',
    'completed',
    'cancelled'
);

create table public.trips (
    id uuid primary key default gen_random_uuid(),

    owner_id uuid not null
        references public.profiles(id)
        on delete cascade,

    title text not null,
    description text,

    cover_image_url text,

    start_date date,
    end_date date,

    budget numeric(12,2),
    currency char(3) not null default 'INR',

    visibility public.trip_visibility not null default 'private',
    status public.trip_status not null default 'draft',

    share_slug text unique,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (
        end_date is null
        or start_date is null
        or end_date >= start_date
    )
);

create index trips_owner_idx
on public.trips(owner_id);

create index trips_dates_idx
on public.trips(start_date, end_date);

create unique index trips_share_slug_idx
on public.trips(share_slug)
where share_slug is not null;
```

---

# 5. `trip_stops`

This is the most important relational table.

A trip can contain:

```text
Trip
 ├── Tokyo
 ├── Kyoto
 └── Osaka
```

Each is a `trip_stop`.

```sql
create table public.trip_stops (
    id uuid primary key default gen_random_uuid(),

    trip_id uuid not null
        references public.trips(id)
        on delete cascade,

    city_id bigint not null
        references public.cities(id),

    stop_order integer not null,

    arrival_date date,
    departure_date date,

    notes text,

    created_at timestamptz not null default now(),

    unique (trip_id, stop_order),

    check (
        departure_date is null
        or arrival_date is null
        or departure_date >= arrival_date
    )
);

create index trip_stops_trip_idx
on public.trip_stops(trip_id);

create index trip_stops_city_idx
on public.trip_stops(city_id);
```

Now you can reorder cities simply by changing `stop_order`.

---

# 6. `trip_activities`

Don't duplicate activity data inside `trip_stops`.

Instead:

```text
trip_stops
     │
     └── trip_activities
             │
             └── activities
```

```sql
create table public.trip_activities (
    id uuid primary key default gen_random_uuid(),

    trip_stop_id uuid not null
        references public.trip_stops(id)
        on delete cascade,

    activity_id bigint
        references public.activities(id)
        on delete set null,

    custom_title text,
    custom_description text,

    activity_date date,
    start_time time,
    end_time time,

    position integer not null default 0,

    estimated_cost numeric(12,2) not null default 0,
    currency char(3) not null default 'INR',

    notes text,

    created_at timestamptz not null default now()
);

create index trip_activities_stop_idx
on public.trip_activities(trip_stop_id);

create index trip_activities_date_idx
on public.trip_activities(activity_date);
```

The `custom_*` fields are intentional.

They allow a user to modify:

```text
"Shibuya Sky"
```

into:

```text
"Sunset at Shibuya Sky"
```

without modifying the global activity record.

---

# 7. `trip_expenses`

Don't derive everything from activities.

Users need actual expenses too.

```sql
create type public.expense_category as enum (
    'transport',
    'accommodation',
    'activity',
    'food',
    'shopping',
    'miscellaneous'
);

create table public.trip_expenses (
    id uuid primary key default gen_random_uuid(),

    trip_id uuid not null
        references public.trips(id)
        on delete cascade,

    category public.expense_category not null,

    title text not null,
    amount numeric(12,2) not null
        check (amount >= 0),

    currency char(3) not null default 'INR',

    expense_date date,

    notes text,

    created_at timestamptz not null default now()
);

create index trip_expenses_trip_idx
on public.trip_expenses(trip_id);

create index trip_expenses_category_idx
on public.trip_expenses(category);
```

Now your budget screen can calculate:

```text
Transport       ₹18,000
Stay            ₹27,000
Activities      ₹10,500
Food             ₹9,000
Misc             ₹4,000
────────────────────────
Total           ₹68,500
```

---

# 8. `trip_members`

This is important because your product says:

> share plans publicly or with friends

Don't make collaboration dependent on owner IDs alone.

```sql
create type public.trip_member_role as enum (
    'viewer',
    'editor',
    'owner'
);

create table public.trip_members (
    trip_id uuid not null
        references public.trips(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    role public.trip_member_role not null default 'viewer',

    joined_at timestamptz not null default now(),

    primary key (trip_id, user_id)
);

create index trip_members_user_idx
on public.trip_members(user_id);
```

Now:

```text
Trip
 ├── Owner
 ├── Editor
 └── Viewer
```

This makes your system ready for collaborative planning.

---

# 9. `saved_destinations`

For the profile feature:

```sql
create table public.saved_destinations (
    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    city_id bigint not null
        references public.cities(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    primary key (user_id, city_id)
);
```

Simple and clean.

---

# 10. Community

You don't need a giant social-media schema.

Start with:

```sql
create table public.community_posts (
    id uuid primary key default gen_random_uuid(),

    trip_id uuid not null
        references public.trips(id)
        on delete cascade,

    author_id uuid not null
        references public.profiles(id)
        on delete cascade,

    title text not null,
    description text,

    created_at timestamptz not null default now()
);
```

Likes:

```sql
create table public.community_likes (
    post_id uuid not null
        references public.community_posts(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    primary key (post_id, user_id)
);
```

Comments:

```sql
create table public.community_comments (
    id uuid primary key default gen_random_uuid(),

    post_id uuid not null
        references public.community_posts(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    content text not null,

    created_at timestamptz not null default now()
);
```

---

# 11. RLS — absolutely do this

This is where your implementation goes from "Supabase prototype" to something respectable.

Supabase specifically recommends enabling RLS on exposed tables. Policies then determine which rows authenticated users can access. ([Supabase][3])

Enable it:

```sql
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.trip_activities enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.trip_members enable row level security;
alter table public.saved_destinations enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_likes enable row level security;
alter table public.community_comments enable row level security;
```

---

# 12. Trip ownership policy

For example:

```sql
create policy "Users can view their trips"
on public.trips
for select
to authenticated
using (
    owner_id = (select auth.uid())
);

create policy "Users can create their trips"
on public.trips
for insert
to authenticated
with check (
    owner_id = (select auth.uid())
);

create policy "Users can update their trips"
on public.trips
for update
to authenticated
using (
    owner_id = (select auth.uid())
)
with check (
    owner_id = (select auth.uid())
);

create policy "Users can delete their trips"
on public.trips
for delete
to authenticated
using (
    owner_id = (select auth.uid())
);
```

That's the core pattern Supabase documents for user-owned rows. ([Supabase][3])

---

# 13. But collaborative trips need better RLS

Eventually, you don't want:

```sql
owner_id = auth.uid()
```

everywhere.

Create a helper:

```sql
create or replace function public.is_trip_member(
    target_trip_id uuid
)
returns boolean
language sql
stable
security invoker
as $$
    select exists (
        select 1
        from public.trip_members tm
        where tm.trip_id = target_trip_id
          and tm.user_id = (select auth.uid())
    );
$$;
```

Then:

```sql
create policy "Trip members can view stops"
on public.trip_stops
for select
to authenticated
using (
    public.is_trip_member(trip_id)
);
```

Now your security model becomes:

```text
Owner
  ↓
Editor
  ↓
Viewer
```

rather than repeating complicated ownership conditions everywhere.

---

# 14. Public trips

This is critical for your **Share Trip** feature.

A public trip should be visible without authentication.

```sql
create policy "Public trips are viewable"
on public.trips
for select
to anon, authenticated
using (
    visibility = 'public'
    or owner_id = (select auth.uid())
);
```

But don't accidentally make private trip stops public.

The corresponding child tables should check the parent trip's visibility.

Example:

```sql
create policy "Public trip stops are viewable"
on public.trip_stops
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.trips t
        where t.id = trip_stops.trip_id
          and (
              t.visibility = 'public'
              or t.owner_id = (select auth.uid())
              or public.is_trip_member(t.id)
          )
    )
);
```

That's much safer.

---

# 15. Storage

I'd create:

```text
avatars
trip-media
```

Supabase Storage is also protected through RLS policies on `storage.objects`; by default uploads aren't allowed until appropriate policies exist. ([Supabase][4])

For example:

```text
avatars/
    USER_ID/
        avatar.jpg

trip-media/
    TRIP_ID/
        cover.jpg
        tokyo-1.jpg
        kyoto-2.jpg
```

That structure makes ownership checks easy.

---

# 16. Trigger to create profile automatically

This is very useful with Supabase Auth.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        full_name
    )
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name'
    );

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
```

Supabase supports connecting Auth users to your own application tables using triggers and foreign keys. ([Supabase][1])

---

# 17. Budget should preferably be calculated, not permanently stored

Don't store:

```text
total_cost = 68500
```

and constantly manually update it.

Instead calculate it from expenses.

You can create:

```sql
create or replace function public.get_trip_total(
    target_trip_id uuid
)
returns numeric
language sql
stable
as $$
    select coalesce(sum(amount), 0)
    from public.trip_expenses
    where trip_id = target_trip_id;
$$;
```

Supabase/Postgres supports database functions for data-intensive operations, which can also be exposed through its APIs. ([Supabase][5])

Then:

```text
Budget
₹75,000

Spent
₹68,500

Remaining
₹6,500
```

is always derived from actual records.

---

# 18. Useful derived view

I'd also create a trip summary view:

```sql
create view public.trip_summary
with (security_invoker = true)
as
select
    t.id,
    t.title,
    t.owner_id,
    t.start_date,
    t.end_date,
    t.budget,

    count(distinct ts.city_id) as city_count,

    coalesce(sum(te.amount), 0) as spent_amount

from public.trips t

left join public.trip_stops ts
    on ts.trip_id = t.id

left join public.trip_expenses te
    on te.trip_id = t.id

group by
    t.id;
```

Using `security_invoker` is important when you want the view to obey the underlying RLS policies; Supabase documents this specifically for PostgreSQL 15+. ([Supabase][3])

---

# 19. Final relationship structure

The whole system then looks like this:

```text
                    auth.users
                        │
                        │ 1:1
                        ▼
                    profiles
                        │
             ┌──────────┼───────────┐
             │          │           │
             ▼          ▼           ▼
           trips     saved_dest.  community
             │
     ┌───────┼──────────────┐
     │       │              │
     ▼       ▼              ▼
trip_stops  expenses    trip_members
     │
     │
     ▼
trip_activities
     │
     ▼
activities
     │
     ▼
cities
```

This is a very good fit for the requirements you were given because it demonstrates actual relational modeling rather than putting everything into one giant JSON column.

## What I'd actually implement today

For your deadline, I'd keep the production schema above but initially populate only:

```text
profiles
cities
activities
trips
trip_stops
trip_activities
trip_expenses
trip_members
community_posts
community_likes
```

Then add comments, recommendations, saved destinations, notifications, etc. only after the core trip workflow is working.

One particularly important point: **do not disable RLS just because it is a hackathon.** Supabase's browser-based access model is designed to work with RLS, and exposed tables should have it enabled. ([Supabase][3])

For GlobeTrotter, this schema gives you a clean path from:

**sign up → create trip → add cities → add activities → build itinerary → calculate budget → share itinerary → community**

without painting yourself into a corner later.

[1]: https://supabase.com/docs/guides/auth?utm_source=chatgpt.com "Auth | Supabase Docs"
[2]: https://supabase.com/docs/guides/auth/architecture?utm_source=chatgpt.com "Auth architecture | Supabase Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[4]: https://supabase.com/docs/guides/storage/security/access-control?utm_source=chatgpt.com "Storage Access Control | Supabase Docs"
[5]: https://supabase.com/docs/guides/database/functions?utm_source=chatgpt.com "Database Functions | Supabase Docs"

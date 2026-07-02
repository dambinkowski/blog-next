-- Blog app schema — run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Step 2: tables + relationships. RLS policies come in Step 4.

-- profiles: extends auth.users with public, app-specific data.
-- profiles.id is the SAME value as auth.users.id (linked by the foreign key below).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- posts: one row per blog post, owned by a profile.
-- author_id is the column RLS will check for "is this the logged-in user's post?"
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Turn ON Row Level Security now. With RLS enabled and NO policies yet,
-- the default is DENY ALL — the safe state until we add policies in Step 4.
-- A public-schema table with RLS OFF is reachable by anyone holding the publishable key.
alter table public.profiles enable row level security;
alter table public.posts   enable row level security;


-- ============================================================
-- Step 4: Row Level Security policies
-- Tables already exist from Step 2, so run ONLY this section now.
-- Each policy is preceded by "drop policy if exists" so this section
-- is safe to re-run on its own.
--
-- auth.uid() = the logged-in user's id, taken from their session token.
--   For a logged-out visitor it is null.
-- We wrap it as (select auth.uid()) so Postgres evaluates it once per
-- query instead of once per row (Supabase's recommended performance pattern).
-- ============================================================

-- PROFILES ---------------------------------------------------

-- Anyone (even logged-out visitors) can read profiles — author names are public.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

-- A logged-in user may create ONLY their own profile row (id must equal their user id).
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- A logged-in user may update ONLY their own profile.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- POSTS ------------------------------------------------------

-- Anyone can read all posts (simple public blog, no drafts).
drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone"
  on public.posts
  for select
  using (true);

-- A logged-in user may create a post ONLY as themselves (author_id must be their id).
drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts"
  on public.posts
  for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

-- A logged-in user may update ONLY their own posts.
drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts
  for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

-- A logged-in user may delete ONLY their own posts.
drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
  on public.posts
  for delete
  to authenticated
  using ((select auth.uid()) = author_id);


-- ============================================================
-- Step 5: Auto-create a profile when a new auth user signs up.
-- Run this section after Step 4.
--
-- Why a trigger? With email confirmation ON, signUp does NOT create a
-- session, so the server has no auth.uid() and RLS would block inserting
-- the profile. This trigger runs as the table owner (SECURITY DEFINER),
-- so it can insert the profile regardless of session state.
--
-- The username arrives via signUp({ options: { data: { username } } }),
-- which Supabase stores in auth.users.raw_user_meta_data.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''   -- hardening: SECURITY DEFINER fns must pin search_path
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

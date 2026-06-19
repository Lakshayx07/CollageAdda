-- Expected columns for CollegeAdda's current Mongo-auth user IDs.
-- Run this in the Supabase SQL Editor, then adjust RLS policies for your deployment.

create table if not exists public.profiles (
  user_id text primary key,
  full_name text,
  avatar_url text,
  university text,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  user_id text not null,
  caption text not null default '',
  image_url text,
  media_type text,
  university text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists user_id text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists university text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.posts add column if not exists user_id text;
alter table public.posts add column if not exists caption text not null default '';
alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists media_type text;
alter table public.posts add column if not exists university text;
alter table public.posts add column if not exists created_at timestamptz not null default now();

create unique index if not exists profiles_user_id_key on public.profiles (user_id);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- CollegeAdda currently authenticates through its Express/MongoDB API rather
-- than Supabase Auth, so browser writes arrive with the anon role.
drop policy if exists "CollegeAdda profile upserts" on public.profiles;
create policy "CollegeAdda profile upserts"
on public.profiles for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "CollegeAdda post upserts" on public.posts;
create policy "CollegeAdda post upserts"
on public.posts for all
to anon, authenticated
using (true)
with check (true);

-- Public buckets still require INSERT policies for browser uploads.
drop policy if exists "Public avatar uploads" on storage.objects;
create policy "Public avatar uploads"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'avatars');

drop policy if exists "Public post image uploads" on storage.objects;
create policy "Public post image uploads"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'posts');

drop policy if exists "Public avatar cleanup" on storage.objects;
create policy "Public avatar cleanup"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "Public post image cleanup" on storage.objects;
create policy "Public post image cleanup"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'posts');

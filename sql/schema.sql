-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Creates the two tables the 말씀기록장 app uses. Table names are prefixed
-- with church_ so they don't collide with the other projects that share
-- this Supabase instance.
--
-- Requires: Authentication -> Providers -> Google enabled (with a Google
-- Cloud OAuth client registered; see README.md).

create table if not exists church_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 12),
  created_at timestamptz not null default now()
);

alter table church_profiles enable row level security;

create policy "authenticated can read profiles"
  on church_profiles for select
  to authenticated
  using (true);

create policy "owner can create own profile"
  on church_profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Nicknames are set once and never changed.
-- (no update/delete policies)


create table if not exists church_reading_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references church_profiles(id) on delete cascade,
  day smallint not null check (day between 1 and 28),
  kind text not null check (kind in ('check', 'uncheck')),
  created_at timestamptz not null default now()
);

alter table church_reading_events enable row level security;

create policy "authenticated can read events"
  on church_reading_events for select
  to authenticated
  using (true);

create policy "owner can insert own events"
  on church_reading_events for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Records are never edited or deleted: a history entry is proof of what
-- happened, not an editable draft.
-- (no update/delete policies)

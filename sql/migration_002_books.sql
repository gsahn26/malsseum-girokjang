-- Run this once in your Supabase project's SQL Editor, AFTER schema.sql.
-- Adds support for choosing any of the 66 Bible books (not just Genesis).

-- Which book each person is currently reading. One row per user; switching
-- books overwrites this, but past church_reading_events keep their own
-- book_id so history for a previous book is never lost.
create table if not exists church_book_selections (
  user_id uuid primary key references church_profiles(id) on delete cascade,
  book_id text not null,
  selected_at timestamptz not null default now()
);

alter table church_book_selections enable row level security;

create policy "authenticated can read book selections"
  on church_book_selections for select
  to authenticated
  using (true);

create policy "owner can set own book selection"
  on church_book_selections for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "owner can update own book selection"
  on church_book_selections for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reading events now need to say which book a day number belongs to
-- (day 1 of Genesis and day 1 of Psalms are different ranges).
alter table church_reading_events
  add column if not exists book_id text not null default 'genesis';

alter table church_reading_events
  alter column book_id drop default;

-- The old schema only allowed day 1..28 (Genesis's plan length). Psalms
-- (150 chapters, ~75 days at 2 chapters/day) needs a wider range.
alter table church_reading_events
  drop constraint if exists church_reading_events_day_check;

alter table church_reading_events
  add constraint church_reading_events_day_check check (day between 1 and 100);

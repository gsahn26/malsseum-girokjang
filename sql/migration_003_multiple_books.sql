-- Run this once in your Supabase project's SQL Editor, AFTER migration_002_books.sql.
-- Lets a person read several books at the same time, instead of exactly one.

-- Drop the old "one row per user" primary key and use (user_id, book_id)
-- instead, so a user can have several active book selections.
alter table church_book_selections drop constraint church_book_selections_pkey;
alter table church_book_selections add primary key (user_id, book_id);

-- Selecting a book the user already has selected should be a no-op, not an
-- error, so the API can "add if missing" with a plain insert.
drop policy if exists "owner can update own book selection" on church_book_selections;

create policy "owner can delete own book selection"
  on church_book_selections for delete
  to authenticated
  using (auth.uid() = user_id);

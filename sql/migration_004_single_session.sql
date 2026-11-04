-- Run this once in your Supabase project's SQL Editor, AFTER migration_003.
-- Lets the app detect when the same account logs in on another device/tab,
-- so it can sign the older session out automatically.

alter table church_profiles add column if not exists session_token uuid;

-- Nicknames still can't be changed (no column-level RLS exists, but the app
-- only ever writes session_token through this policy), so we add update
-- access scoped to the owner's own row.
create policy "owner can update own session token"
  on church_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Make sure row changes on this table are broadcast over Realtime, so an
-- open tab notices when another device overwrites its session_token.
do $$
begin
  alter publication supabase_realtime add table church_profiles;
exception when duplicate_object then
  null;
end $$;

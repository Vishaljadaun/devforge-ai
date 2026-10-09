-- DevForge AI v0.1: per-user private learning data.
-- Run in the Supabase SQL Editor. Requires Supabase Auth.
-- user_id is ALWAYS derived from the signed-in Supabase user.
create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_workspaces_updated_at_idx on public.user_workspaces(updated_at desc);
alter table public.user_workspaces enable row level security;

-- Do not expose learner records to anonymous clients.
revoke all on table public.user_workspaces from anon, authenticated;
grant select, insert, update, delete on table public.user_workspaces to authenticated;

drop policy if exists "workspace_read_own" on public.user_workspaces;
create policy "workspace_read_own" on public.user_workspaces
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "workspace_insert_own" on public.user_workspaces;
create policy "workspace_insert_own" on public.user_workspaces
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "workspace_update_own" on public.user_workspaces;
create policy "workspace_update_own" on public.user_workspaces
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "workspace_delete_own" on public.user_workspaces;
create policy "workspace_delete_own" on public.user_workspaces
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Suggested production enhancement: per-row progress, journal, and reviews
-- with dedicated validation instead of a single JSON document.

-- DevForge AI v0.2 Content Studio (run AFTER supabase/schema.sql).
-- Only trusted operators can publish lessons/projects.
-- Do not create content_admins entries from browser clients.

create table if not exists public.content_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.content_admins enable row level security;
revoke all on public.content_admins from anon, authenticated;
grant select on public.content_admins to authenticated;

drop policy if exists "content_admins_read_self" on public.content_admins;
create policy "content_admins_read_self" on public.content_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- One content row per stable lesson or project ID. Published rows are public.
create table if not exists public.learning_content (
  id text primary key,
  kind text not null check (kind in ('lesson','project')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint learning_content_id_matches_kind check (
    (kind = 'lesson' and id ~ '^lesson:[a-z0-9_-]+:[0-9]+$') or
    (kind = 'project' and id ~ '^project:[a-z0-9-]+$')
  )
);

create index if not exists learning_content_visible_idx
  on public.learning_content(kind,published);
alter table public.learning_content enable row level security;
revoke all on public.learning_content from anon, authenticated;
grant select on public.learning_content to anon, authenticated;
grant insert, update, delete on public.learning_content to authenticated;

drop policy if exists "learning_content_read" on public.learning_content;
create policy "learning_content_read" on public.learning_content
 for select to anon, authenticated
 using (
   published or (
     select exists(
       select 1 from public.content_admins
       where user_id = (select auth.uid())
     )
   )
 );

drop policy if exists "learning_content_insert_admin" on public.learning_content;
create policy "learning_content_insert_admin" on public.learning_content
 for insert to authenticated
 with check (exists (
   select 1 from public.content_admins
   where user_id = (select auth.uid())
 ));

drop policy if exists "learning_content_update_admin" on public.learning_content;
create policy "learning_content_update_admin" on public.learning_content
 for update to authenticated
 using (exists (
   select 1 from public.content_admins
   where user_id = (select auth.uid())
 ))
 with check (exists (
   select 1 from public.content_admins
   where user_id = (select auth.uid())
 ));

drop policy if exists "learning_content_delete_admin" on public.learning_content;
create policy "learning_content_delete_admin" on public.learning_content
 for delete to authenticated
 using (exists (
   select 1 from public.content_admins
   where user_id = (select auth.uid())
 ));

-- AFTER signing in once, find your UUID in Supabase -> Authentication -> Users,
-- then run the following in the SQL Editor, substituting your own UUID:
-- insert into public.content_admins (user_id)
-- values ('YOUR-AUTH-USER-UUID') on conflict do nothing;

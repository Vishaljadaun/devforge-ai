-- DevForge AI v0.5: real learner actions (not logins and not workspace-save events).
-- Run in Supabase SQL Editor after schema.sql and content_studio.sql.
-- Only event types and reference IDs are stored; no notes, answers, or learner code.
create table if not exists public.learner_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  event_type text not null check(event_type in (
    'topic_completed','project_step_completed','quiz_completed','practice_submitted','journal_saved','flashcard_reviewed'
  )),
  event_ref text check(event_ref is null or event_ref ~ '^[a-z0-9:_-]{1,80}$'),
  created_at timestamptz not null default now()
);
create index if not exists learner_activity_user_time_idx on public.learner_activity(user_id,created_at desc);
create index if not exists learner_activity_time_idx on public.learner_activity(created_at desc);
alter table public.learner_activity enable row level security;
revoke all on table public.learner_activity from public, anon, authenticated;
grant insert on table public.learner_activity to authenticated;
-- Prevent forging another user's identity, even with a custom user_id in the browser request.
drop policy if exists learner_activity_insert_self on public.learner_activity;
create policy learner_activity_insert_self on public.learner_activity
  for insert to authenticated with check(user_id=(select auth.uid()));
-- Intentionally no SELECT policies or grants. Admins receive only aggregate metrics through RPC.

create or replace function public.admin_learning_engagement()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.content_admins ca where ca.user_id=(select auth.uid())
  ) then
    raise exception 'Admin access required' using errcode='42501';
  end if;

  select jsonb_build_object(
    'active_learners_7d',count(distinct user_id),
    'learning_actions_7d',count(*),
    'topics_completed_7d',count(*) filter(where event_type='topic_completed'),
    'practice_attempts_7d',count(*) filter(where event_type='practice_submitted'),
    'project_steps_7d',count(*) filter(where event_type='project_step_completed'),
    'quizzes_taken_7d',count(*) filter(where event_type='quiz_completed'),
    'journal_saves_7d',count(*) filter(where event_type='journal_saved'),
    'flashcard_reviews_7d',count(*) filter(where event_type='flashcard_reviewed')
  ) into result from public.learner_activity
  where created_at >= now() - interval '7 days';
  return coalesce(result,'{}'::jsonb);
end;
$$;
revoke all on function public.admin_learning_engagement() from public;
revoke all on function public.admin_learning_engagement() from anon;
revoke all on function public.admin_learning_engagement() from authenticated;
grant execute on function public.admin_learning_engagement() to authenticated;
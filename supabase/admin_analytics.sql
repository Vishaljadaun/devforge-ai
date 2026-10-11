-- DevForge AI v0.3: aggregate admin analytics.
-- Requires schema.sql and content_studio.sql to have been applied first.
-- Return ONLY aggregate numbers; do not return auth.users email or individual workspace payloads.
-- A browser user cannot grant themselves admin: membership is managed by privileged SQL.

create or replace function public.admin_platform_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  registered_total bigint := 0;
  registered_last_7_days bigint := 0;
  recently_updated_workspaces bigint := 0;
  topics_marked_completed bigint := 0;
  project_checklists_started bigint := 0;
  signup_series jsonb := '[]'::jsonb;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.content_admins ca where ca.user_id = (select auth.uid())
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select count(*), count(*) filter (where created_at >= now() - interval '7 days')
    into registered_total, registered_last_7_days
    from auth.users;

  select count(*) into recently_updated_workspaces
    from public.user_workspaces
    where updated_at >= now() - interval '7 days';

  select coalesce(sum(jsonb_array_length(payload->'doneTopics')),0)
    into topics_marked_completed
    from public.user_workspaces
    where jsonb_typeof(payload->'doneTopics') = 'array';

  select count(*) into project_checklists_started
    from public.user_workspaces uw
    cross join lateral jsonb_each(
      case when jsonb_typeof(uw.payload->'doneSteps') = 'object'
        then uw.payload->'doneSteps' else '{}'::jsonb end
    ) as project(key, steps)
    where jsonb_typeof(project.steps) = 'array'
      and jsonb_array_length(project.steps) > 0;

  select coalesce(jsonb_agg(jsonb_build_object('day', days.day::date, 'users', coalesce(counts.n,0)) order by days.day), '[]'::jsonb)
    into signup_series
    from generate_series(current_date - interval '6 days', current_date, interval '1 day') as days(day)
    left join lateral (
      select count(*) n from auth.users u
      where u.created_at >= days.day and u.created_at < days.day + interval '1 day'
    ) counts on true;

  return jsonb_build_object(
    'registered_total', registered_total,
    'registered_last_7_days', registered_last_7_days,
    'recently_updated_workspaces', recently_updated_workspaces,
    'topics_marked_completed', topics_marked_completed,
    'project_checklists_started', project_checklists_started,
    'signup_series', signup_series
  );
end;
$$;

-- Critical: functions have PUBLIC EXECUTE by default unless explicitly revoked.
revoke all on function public.admin_platform_stats() from public;
revoke all on function public.admin_platform_stats() from anon;
revoke all on function public.admin_platform_stats() from authenticated;
grant execute on function public.admin_platform_stats() to authenticated;
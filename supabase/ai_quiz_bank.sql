-- DevForge AI v0.7: AI quiz cache, server-only grading, hard generation quotas.
-- Run in Supabase SQL Editor AFTER schema.sql/content_studio.sql.
-- No browser table access: only Cloudflare Worker secret key may read/write these rows.
create extension if not exists pgcrypto;

create table if not exists public.ai_quiz_bank (
 id uuid primary key default gen_random_uuid(),
 topic_id text not null check (topic_id ~ '^[a-z0-9-]+:[0-9]{1,3}$'),
 difficulty text not null check (difficulty in ('easy','medium','hard')),
 questions jsonb not null check (jsonb_typeof(questions)='array' and jsonb_array_length(questions) between 3 and 10),
 source text not null check (source in ('ollama','cloudflare','curated')),
 status text not null default 'draft' check(status in ('draft','approved')),
 created_at timestamptz not null default now()
);
create index if not exists ai_quiz_bank_lookup_idx on public.ai_quiz_bank(topic_id,difficulty,status,created_at desc);

create table if not exists public.ai_quiz_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 topic_id text not null,
 difficulty text not null,
 questions jsonb not null,
 source text not null,
 reviewed boolean not null default false,
 created_at timestamptz not null default now(),
 submitted_at timestamptz
);
create index if not exists ai_quiz_sessions_user_idx on public.ai_quiz_sessions(user_id,created_at desc);

create table if not exists public.ai_quiz_attempts (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null unique references public.ai_quiz_sessions(id) on delete cascade,
 topic_id text not null,
 difficulty text not null,
 score integer not null check(score between 0 and 10),
 total integer not null check(total between 1 and 10),
 passed boolean not null,
 reviewed boolean not null,
 created_at timestamptz not null default now()
);
create index if not exists ai_quiz_attempts_user_time_idx on public.ai_quiz_attempts(user_id,created_at desc);

create table if not exists public.ai_quiz_generation_quota (
 quota_day date not null,
 scope text not null,
 used integer not null default 0 check(used>=0),
 primary key (quota_day,scope)
);

alter table public.ai_quiz_bank enable row level security;
alter table public.ai_quiz_sessions enable row level security;
alter table public.ai_quiz_attempts enable row level security;
alter table public.ai_quiz_generation_quota enable row level security;
revoke all on public.ai_quiz_bank,public.ai_quiz_sessions,public.ai_quiz_attempts,public.ai_quiz_generation_quota from public,anon,authenticated;
-- Server-only access via Supabase secret key (bypasses RLS). No public policies intentionally.

create or replace function public.claim_ai_quiz_generation(p_user_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare
 v_day date := (now() at time zone 'UTC')::date;
 v_global integer;
 v_personal integer;
begin
 -- Lock every claimant across all Worker instances; prevents concurrent quota bypass.
 perform pg_advisory_xact_lock(7821091119);
 select coalesce(used,0) into v_global from public.ai_quiz_generation_quota
 where quota_day=v_day and scope='global';
 select coalesce(used,0) into v_personal from public.ai_quiz_generation_quota
 where quota_day=v_day and scope='user:'||p_user_id::text;
 if coalesce(v_global,0)>=8 or coalesce(v_personal,0)>=2 then return false; end if;
 insert into public.ai_quiz_generation_quota(quota_day,scope,used)
 values(v_day,'global',1)
 on conflict(quota_day,scope) do update set used=public.ai_quiz_generation_quota.used+1;
 insert into public.ai_quiz_generation_quota(quota_day,scope,used)
 values(v_day,'user:'||p_user_id::text,1)
 on conflict(quota_day,scope) do update set used=public.ai_quiz_generation_quota.used+1;
 return true;
end;
$$;
-- IMPORTANT: only the Worker with the server secret can invoke quota claims.
revoke all on function public.claim_ai_quiz_generation(uuid) from public,anon,authenticated;
grant execute on function public.claim_ai_quiz_generation(uuid) to service_role;

comment on table public.ai_quiz_bank is 'Quiz answer keys: private. Only curated/admin-reviewed sets should count toward verified completion.';
comment on table public.ai_quiz_attempts is 'Server-graded practice scores. AI drafts are unreviewed and not official lesson-completion evidence.';

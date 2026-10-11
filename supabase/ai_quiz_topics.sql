create table if not exists public.ai_quiz_topics(
 topic_id text primary key,
 title text not null,
 module_id text not null
);
alter table public.ai_quiz_topics enable row level security;
revoke all on table public.ai_quiz_topics from public,anon,authenticated;
-- Server-only canonical topic catalogue; seed with:
-- node scripts/export-quiz-topics.mjs > supabase/quiz_topics_seed.sql
-- Then run generated SQL in Supabase SQL Editor.

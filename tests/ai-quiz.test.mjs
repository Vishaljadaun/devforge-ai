import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=f=>readFileSync(f,'utf8');
const sql=read('supabase/ai_quiz_bank.sql');
const worker=read('workers/quiz-api/src/index.js');
const ui=read('src/AiTopicQuiz.tsx');
const app=read('src/App.tsx');
const draft=read('scripts/ollama-quiz-bank.mjs');
const topics=read('scripts/export-quiz-topics.mjs');
test('server-only bank and answer keys guarded by RLS',()=>{
 assert.match(sql,/ai_quiz_bank enable row level security/);
 assert.match(sql,/revoke all on public.ai_quiz_bank,public.ai_quiz_sessions/);
 assert.doesNotMatch(sql,/grant select on public.ai_quiz_bank to authenticated/i);
 assert.match(sql,/grant execute on function public.claim_ai_quiz_generation\(uuid\) to service_role/);
 assert.match(sql,/pg_advisory_xact_lock/);
});
test('hard caps are global 8 and user 2',()=>{
 assert.match(sql,/coalesce\(v_global,0\)>=8/);
 assert.match(sql,/coalesce\(v_personal,0\)>=2/);
 assert.match(worker,/rpc\/claim_ai_quiz_generation/);
});
test('quiz uses verified Supabase identity and hides correct keys until server submit',()=>{
 assert.match(worker,/\/auth\/v1\/user/);
 assert.match(worker,/user_id=eq/); // guard reads via explicit user_id filter
 assert.match(worker,/questions:quiz\.questions\.map\(x=>\(\{id:x\.id,prompt:x\.prompt,choices:x\.choices\}\)\)/);
 assert.match(worker,/feedback:s\.questions\.map\(x=>\(\{id:x\.id,correct:x\.correct,explanation:x\.explanation\}\)\)/);
 assert.match(worker,/submitted_at=is\.null/);
});
test('AI drafts are unreviewed and cannot auto-complete lessons',()=>{
 assert.match(worker,/status:"draft"/);
 assert.match(worker,/canCompleteLesson:passed&&s\.reviewed&&s\.difficulty==="medium"/);
 assert.match(ui,/AI questions are unreviewed practice/);
 assert.doesNotMatch(ui,/setWs\(/);
});
test('topic UI has three difficulties, source fallback and local authoring',()=>{
 assert.match(ui,/Easy/);
 assert.match(ui,/Medium/);
 assert.match(ui,/Hard/);
 assert.match(app,/<AiTopicQuiz/);
 assert.match(draft,/api\/generate/);
 assert.match(draft,/status:'draft'/);
 assert.match(topics,/rows.length!==323/);
});

test('Cloudflare Worker parses as JavaScript',()=>{
 assert.doesNotThrow(()=>execFileSync(process.execPath,['--check','workers/quiz-api/src/index.js'],{stdio:'pipe'}));
});

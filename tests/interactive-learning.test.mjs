import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(f,'utf8');
const practice=read('src/data/practice.ts');
const lab=read('src/TopicPractice.tsx');
const app=read('src/App.tsx');
const sql=read('supabase/learning_activity.sql');
const metrics=read('src/AdminEngagement.tsx');
const insights=read('src/AdminInsights.tsx');

test('first four Python topics have genuine guided practice labs',()=>{
  for(const topicId of ['python:0','python:1','python:2','python:3']){
    assert.match(practice,new RegExp(`['"]${topicId}['"]:\\s*\\{`));
  }
  assert.equal((practice.match(/correct:\d,explanation:/g)||[]).length,12);
  assert.equal((practice.match(/id:'p\dq\d'/g)||[]).length,12);
  assert.match(practice,/verify:/);
  assert.match(practice,/task:/);
  assert.match(practice,/generator/i);
});

test('quiz explains every answer and requires all questions answered',()=>{
  assert.match(lab,/lab\.questions\.every\(q=>Number\.isInteger\(answers\[q\.id\]\)\)/);
  assert.match(lab,/disabled=\{!allAnswered\}/);
  assert.match(lab,/question\.explanation/);
  assert.match(lab,/onSubmit\(score,lab\.questions\.length\)/);
  assert.match(lab,/previous\.bestScore/);
  assert.match(lab,/Code runs in your local Python environment/);
});

test('topic practice results persist via existing user workspace and import/export path',()=>{
  assert.match(app,/topicPracticeResults:Record<string,PracticeResult>/);
  assert.match(app,/const topicPracticeResults=d\.topicPracticeResults/);
  assert.match(app,/doneTopics:reconcileCompletedTopics\(recordedTopics,topicPracticeResults\)/);
  assert.match(app,/topicPracticeResults:\{\.\.\.w\.topicPracticeResults/);
  assert.match(app,/<TopicPractice key=\{activeTopic\}/);
  assert.match(app,/Math\.max\(prior\?\.bestScore\?\?0,score\)/);
  assert.match(app,/trackActivity\('practice_submitted',id\)/);
});

test('activity RLS rejects identities other than auth.uid and never opens public read access',()=>{
  assert.match(sql,/enable row level security/i);
  assert.match(sql,/with check\(user_id=\(select auth\.uid\(\)\)\)/);
  assert.match(sql,/revoke all on table public\.learner_activity from public, anon, authenticated/i);
  assert.match(sql,/grant insert on table public\.learner_activity to authenticated/i);
  assert.doesNotMatch(sql,/grant select on table public\.learner_activity/i);
  assert.match(sql,/on delete cascade/i);
  assert.match(sql,/event_type in \(/i);
});

test('admin engagement aggregate RPC checks admin before querying activity',()=>{
  const check=sql.indexOf('Admin access required');
  const query=sql.search(/from\s+public\.learner_activity\s+where\b/i);
  assert.ok(check>0&&query>check);
  assert.match(sql,/security definer set search_path = ''/i);
  assert.match(sql,/revoke all on function public\.admin_learning_engagement\(\) from public/i);
  assert.match(sql,/grant execute on function public\.admin_learning_engagement\(\) to authenticated/i);
  assert.match(metrics,/\.rpc\('admin_learning_engagement'\)/);
  assert.match(insights,/<AdminEngagement client=\{client\}\/>/);
});

test('only meaningful learner actions trigger activity inserts, not cloud sync or login',()=>{
  const start=app.indexOf('const trackActivity=');
  const end=app.indexOf('const markTopic=',start);
  assert.ok(start>=0 && end>start);
  assert.match(app.slice(start,end),/\.from\('learner_activity'\)\.insert/);
  for(const event of ['topic_completed','project_step_completed','quiz_completed','practice_submitted','journal_saved','flashcard_reviewed'])
    assert.ok((app.match(new RegExp(`trackActivity\\('${event}'`,'g'))||[]).length>0,event);
  const sync=app.slice(app.indexOf('const syncUser='),app.indexOf('const refreshContent='));
  assert.doesNotMatch(sync,/trackActivity\(/);
});
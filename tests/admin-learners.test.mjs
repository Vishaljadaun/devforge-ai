import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('supabase/admin_learners.sql','utf8');
const insights=readFileSync('src/AdminInsights.tsx','utf8');
const ui=readFileSync('src/AdminLearners.tsx','utf8');
const app=readFileSync('src/App.tsx','utf8');

test('admin-only learner directory checks current authenticated membership',()=>{
  assert.match(sql,/security definer/i);
  assert.match(sql,/set search_path = ''/i);
  assert.match(sql,/public\.content_admins ca where ca\.user_id = \(select auth\.uid\(\)\)/);
  assert.ok(sql.indexOf("raise exception 'Admin access required'") < sql.indexOf('from auth.users u'));
  assert.match(sql,/revoke all on function public\.admin_learner_directory\(text, integer, integer\) from public/i);
  assert.match(sql,/revoke all on function public\.admin_learner_directory\(text, integer, integer\) from anon/i);
  assert.match(sql,/grant execute on function public\.admin_learner_directory\(text, integer, integer\) to authenticated/i);
});

test('directory lists only summary fields, never journals or workspace JSON',()=>{
  assert.match(sql,/from auth\.users u\s+left join public\.user_workspaces uw/);
  assert.match(sql,/uw\.payload->'doneTopics'/);
  const resultObject=sql.slice(sql.indexOf("jsonb_agg(jsonb_build_object("),sql.indexOf('order by d.sort_sign_in'));
  for(const key of ['email','user_id','progress_percent','completed_topics','last_sign_in_at','last_progress_save_at'])
    assert.ok(resultObject.includes(`'${key}'`),`${key} must be present`);
  assert.doesNotMatch(resultObject,/journal|note|reviews|payload|quizHistory/i);
});

test('topic progress uses deduplicated, canonical 323 topic IDs and clamps counts',()=>{
  assert.match(sql,/count\(distinct topic\.value\)/);
  assert.match(sql,/topic\.value = any\(v_valid_topics\)/);
  assert.match(sql,/least\(323,/);
  const topicList=sql.split('v_valid_topics constant text[] := array[')[1].split('];')[0];
  const ids=Array.from(topicList.matchAll(/'([a-z0-9_-]+:\d+)'/g),m=>m[1]);
  assert.equal(ids.length,323);
  assert.equal(new Set(ids).size,323);
});

test('React directory is mounted only under the admin-gated analytics route',()=>{
  assert.match(app,/view==='analytics'&&isAdmin&&supabase&&<Suspense[\s\S]*?<AdminInsights/);
  assert.match(insights,/import AdminLearners from '\.\/AdminLearners'/);
  assert.match(insights,/<AdminLearners client=\{client\}\/>/);
  assert.match(ui,/\.rpc\('admin_learner_directory'/);
  assert.doesNotMatch(ui,/\.from\('auth\.users'\)|\.from\('user_workspaces'\)|service_role/);
});

test('admin can search, paginate and view both last sign-in and last saved progress',()=>{
  assert.match(sql,/p_search text default ''/);
  assert.match(sql,/p_page_size integer default 20/);
  assert.match(sql,/least\(coalesce\(p_page_size, 20\), 50\)/);
  assert.match(ui,/p_search:query\.slice\(0,120\),p_page:page,p_page_size:PAGE_SIZE/);
  assert.match(ui,/Last sign-in/);
  assert.match(ui,/Last progress save/);
  assert.match(ui,/recent sign-in does not mean currently online/i);
});

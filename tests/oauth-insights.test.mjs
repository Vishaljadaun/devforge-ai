import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync('src/App.tsx','utf8');
const sql=readFileSync('supabase/admin_analytics.sql','utf8');
const insight=readFileSync('src/AdminInsights.tsx','utf8');
test('OAuth is initiated with Google or GitHub by Supabase',()=>{
  assert.match(app,/signInWithOAuth\(\{provider,options:\{redirectTo:window.location.origin\}\}\)/);
  assert.match(app,/signInWithProvider\('google'\)/);
  assert.match(app,/signInWithProvider\('github'\)/);
});
test('admin-only navigation guards are present',()=>{
  assert.match(app,/isAdmin&&<button[^>]*>.*Admin Analytics/);
  assert.match(app,/view==='analytics'&&isAdmin&&supabase&&<Suspense[\s\S]*?<AdminInsights/);
});
test('analytics RPC checks admin membership and restricts execute permission',()=>{
  assert.match(sql,/security definer/i);
  assert.match(sql,/set search_path = ''/i);
  assert.match(sql,/public\.content_admins ca where ca\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(sql,/revoke all on function public\.admin_platform_stats\(\) from public/i);
  assert.match(sql,/revoke all on function public\.admin_platform_stats\(\) from anon/i);
  assert.match(sql,/grant execute on function public\.admin_platform_stats\(\) to authenticated/i);
});
test('analytics client reads only aggregated RPC response',()=>{
  assert.match(insight,/\.rpc\('admin_platform_stats'\)/);
  assert.doesNotMatch(insight,/\.from\('user_workspaces'\)/);
  assert.doesNotMatch(insight,/\.from\('auth\.users'\)/);
});
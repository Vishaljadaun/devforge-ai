import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const curriculum=read('../src/data/curriculum.ts');
const projects=read('../src/data/projects.ts');
const lessons=read('../src/data/lessons.ts');
const revision=read('../src/data/revision.ts');
test('curriculum includes core AI engineering subjects',()=>{
 for(const title of ['Python for AI','Classical Machine Learning','Neural Networks with PyTorch','Retrieval-Augmented Generation','AI Agents and Workflows','MCP and Integrations','AI Quality and Evaluations','AI Security, Privacy and Safety','LLMOps and Model Serving','AI System Design'])assert.ok(curriculum.includes(title),`Missing ${title}`);
});
test('all modules have a lab, resources and topics',()=>{
 const blocks=[...curriculum.matchAll(/\{id:'([^']+)',phase:'([^']+)',title:'([^']+)'/g)];
 assert.equal(blocks.length,25);
 const ids=new Set(blocks.map(x=>x[1]));assert.equal(ids.size,25);
 assert.equal((curriculum.match(/,lab:'/g)||[]).length,25);
 assert.equal((curriculum.match(/,resources:\[/g)||[]).length,25);
});
test('14 distinct projects with milestones',()=>{
 const items=[...projects.matchAll(/\{id:'([^']+)',title:'([^']+)'/g)];assert.equal(items.length,14);assert.equal(new Set(items.map(x=>x[1])).size,14);
 assert.equal((projects.match(/milestones:\[/g)||[]).length,14);
});
test('written lessons and quiz content exist',()=>{
 assert.equal((lessons.match(/: *\{title:/g)||[]).length,8);
 assert.equal((revision.match(/\{id:'q\d+'/g)||[]).length,12);
});
test('Supabase RLS cannot be bypassed by other signed-in users',()=>{
 const sql=read('../supabase/schema.sql');
 assert.match(sql,/enable row level security/i);
 assert.match(sql,/revoke all on table public.user_workspaces from anon, authenticated/i);
 for(const op of ['select','insert','update','delete'])assert.match(sql,new RegExp(`for ${op} to authenticated`));
 assert.match(sql,/auth\.uid\(\)\) = user_id/);
});

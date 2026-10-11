// After human review, output SQL for Supabase SQL Editor:
// node scripts/approved-quiz-sql.mjs quiz-drafts/python-0-medium.json --reviewed > approved.sql
// Do NOT use without manually verifying every question and explanation.
import {readFileSync} from 'node:fs';
const path=process.argv[2],flag=process.argv[3];
if(!path||flag!=='--reviewed')throw Error('Manual review required: <file> --reviewed');
const q=JSON.parse(readFileSync(path,'utf8'));
if(!/^[a-z0-9-]+:[0-9]{1,3}$/.test(q.topic_id||'')||!['easy','medium','hard'].includes(q.difficulty)||!['ollama','cloudflare','curated'].includes(q.source)||!Array.isArray(q.questions)||q.questions.length!==5)throw Error('Invalid draft');
const ids=new Set(q.questions.map(x=>x.id));
if(ids.size!==5||q.questions.some(x=>!x||typeof x.prompt!=='string'||!Array.isArray(x.choices)||x.choices.length!==4||!Number.isInteger(x.correct)||x.correct<0||x.correct>3||typeof x.explanation!=='string'))throw Error('Invalid questions');
const esc=x=>"'"+String(x).replaceAll("'","''")+"'";
console.log('-- Privileged Supabase SQL Editor only. Approve ONLY after human review.');
console.log('insert into public.ai_quiz_bank(topic_id,difficulty,source,status,questions) values ('+[esc(q.topic_id),esc(q.difficulty),esc(q.source),"'approved' ",esc(JSON.stringify(q.questions))+"::jsonb"].join(',')+');');

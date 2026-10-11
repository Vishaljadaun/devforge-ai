// Usage: node scripts/ollama-quiz-bank.mjs --topic python:0 --level medium
// Requires local Ollama running on 127.0.0.1:11434. Outputs a draft SQL file.
// Local generation incurs no paid inference API charges. NEVER auto-approve.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const args=process.argv.slice(2);
const value=k=>args[args.indexOf(k)+1];
const topic=value('--topic'),difficulty=value('--level');
if(!/^[a-z0-9-]+:[0-9]{1,3}$/.test(topic||'')||!['easy','medium','hard'].includes(difficulty))throw Error('Specify --topic module:index --level easy|medium|hard');
const lines=readFileSync('src/data/curriculum.ts','utf8').split('\n');
const [moduleId,indexString]=topic.split(':');
const line=lines.find(x=>x.startsWith("{id:'"+moduleId+"'"));
if(!line)throw Error('Unknown module');
const names=[...line.match(/topics:\[(.*?)\],lab:/)[1].matchAll(/'((?:\\.|[^'\\])*)'(?:,|$)/g)].map(x=>x[1]);
const title=names[Number(indexString)];if(!title)throw Error('Unknown curriculum topic');
const response=await fetch('http://127.0.0.1:11434/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:process.env.OLLAMA_MODEL||'qwen2.5:7b',stream:false,format:'json',prompt:'Produce exactly 5 factually correct multiple-choice '+difficulty+' quiz questions about '+title+'. JSON object: questions array of {id,prompt,choices (4 different strings),correct (0-3),explanation}. No markdown.'})});
if(!response.ok)throw Error('Ollama unavailable');
const output=JSON.parse((await response.json()).response).questions;
if(!Array.isArray(output)||output.length!==5||output.some(q=>!q.id||!q.prompt||!Array.isArray(q.choices)||q.choices.length!==4||!Number.isInteger(q.correct)||q.correct<0||q.correct>3||!q.explanation))throw Error('Invalid generated content');
mkdirSync('quiz-drafts',{recursive:true});
const path='quiz-drafts/'+topic.replace(':','-')+'-'+difficulty+'.json';
writeFileSync(path,JSON.stringify({topic_id:topic,difficulty,source:'ollama',status:'draft',questions:output},null,2)+'\n');
console.log('Draft only: '+path+' (review every answer before database import/approval).');

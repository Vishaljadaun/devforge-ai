// Local-only Ollama draft generation: node scripts/ollama-bulk.mjs --module python --level all --max 10
// Generates draft JSON files; human review is required before approval/import.
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const argv=process.argv.slice(2);
function opt(k,def){const i=argv.indexOf(k);return i===-1?def:argv[i+1];}
const moduleId=opt('--module','python'),level=opt('--level','all'),max=Number(opt('--max','10'));
if(!/^[a-z0-9-]+$/.test(moduleId)||!['all','easy','medium','hard'].includes(level)||!Number.isInteger(max)||max<1||max>50)throw Error('Invalid args. Use --module python --level all --max 10 (max <=50)');
const source=readFileSync('src/data/curriculum.ts','utf8');
const line=source.split('\n').find(x=>x.startsWith("{id:'"+moduleId+"'"));
if(!line)throw Error('Unknown curriculum module: '+moduleId);
const topics=[...line.match(/topics:\[(.*?)\],lab:/)[1].matchAll(/'((?:\\.|[^'\\])*)'(?:,|$)/g)];
const levels=level==='all'?['easy','medium','hard']:[level];
let completed=0,failed=0;
for(let i=0;i<topics.length&&completed+failed<max;i++){
 for(const difficulty of levels){
  if(completed+failed>=max)break;
  const result=spawnSync(process.execPath,['scripts/ollama-quiz-bank.mjs','--topic',moduleId+':'+i,'--level',difficulty],{stdio:'inherit'});
  if(result.status===0)completed++;else failed++;
 }
}
console.log('Drafts generated: '+completed+'; failed: '+failed+'. Check quiz-drafts/ and review each answer before importing.');

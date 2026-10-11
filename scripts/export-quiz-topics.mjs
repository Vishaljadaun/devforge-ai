// Run: node scripts/export-quiz-topics.mjs > supabase/quiz_topics_seed.sql
// Reads canonical curriculum source; no fabricated topic records.
import {readFileSync} from 'node:fs';
const text=readFileSync('src/data/curriculum.ts','utf8');
const rows=[];
for(const line of text.split('\n')){
 if(!line.startsWith("{id:'"))continue;
 const id=line.match(/^\{id:'([^']+)'/)?.[1];
 const topicString=line.match(/topics:\[(.*?)\],lab:/)?.[1];
 if(!id||!topicString)throw Error('Unrecognized curriculum module');
 const topics=[...topicString.matchAll(/'((?:\\.|[^'\\])*)'(?:,|$)/g)].map(x=>x[1].replace(/\\'/g,"'"));
 topics.forEach((title,i)=>rows.push([id+':'+i,title,id]));
}
if(rows.length!==323)throw Error('Expected 323 canonical topics; got '+rows.length);
console.log('-- Generated from DevForge AI curriculum.ts');
console.log('insert into public.ai_quiz_topics(topic_id,title,module_id) values');
console.log(rows.map(([id,title,module],i)=>'('+[id,title,module].map(x=>"'"+x.replaceAll("'","''")+"'").join(',')+')'+(i===rows.length-1?'':',')).join('\n'));
console.log('on conflict(topic_id) do update set title=excluded.title,module_id=excluded.module_id;');

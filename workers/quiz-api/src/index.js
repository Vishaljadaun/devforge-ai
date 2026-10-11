
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const h=e=>({apikey:e.SUPABASE_SERVICE_ROLE_KEY,Authorization:"Bearer "+e.SUPABASE_SERVICE_ROLE_KEY,"content-type":"application/json",Prefer:"return=representation"});
async function db(e,path,method="GET",body){const r=await fetch(e.SUPABASE_URL+"/rest/v1/"+path,{method,headers:h(e),body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw Error("DB unavailable");return r.json();}
async function who(e,a){if(!a?.startsWith("Bearer "))return null;const r=await fetch(e.SUPABASE_URL+"/auth/v1/user",{headers:{Authorization:a,apikey:e.SUPABASE_PUBLISHABLE_KEY}});if(!r.ok)return null;return (await r.json()).id;}
const valid=q=>Array.isArray(q)&&q.length===5&&new Set(q.map(x=>x.id)).size===5&&q.every(x=>x&&typeof x.id==="string"&&typeof x.prompt==="string"&&x.prompt.length>=15&&Array.isArray(x.choices)&&x.choices.length===4&&x.choices.every(s=>typeof s==="string")&&new Set(x.choices).size===4&&Number.isInteger(x.correct)&&x.correct>=0&&x.correct<4&&typeof x.explanation==="string"&&x.explanation.length>10);
async function generate(e,title,level){
 const result=await e.AI.run("@cf/meta/llama-3.1-8b-instruct",{messages:[{role:"system",content:"Generate accurate technical quiz questions. JSON only."},{role:"user",content:"Create exactly 5 distinct "+level+" level multiple-choice questions about "+title+". Return JSON object with questions array. Each question: id q1 through q5, prompt, choices (4 strings), correct (zero-based answer index), explanation. No markdown."}],max_tokens:1800,temperature:0.4});
 let raw=String(result.response||"").trim();const fence=String.fromCharCode(96).repeat(3);if(raw.startsWith(fence))raw=raw.slice(3).replace(/^json\s*/i,"").replace(new RegExp("\\s*"+fence+"$"),"").trim();
 const items=JSON.parse(raw).questions;if(!valid(items))throw Error("Invalid AI content");return items;
}
const add=(e,t,data)=>db(e,t,"POST",data);
const q=(e,t,p)=>db(e,t+"?"+p);
export default {async fetch(req,e){
 const origin=req.headers.get("Origin");
 const cors={"Access-Control-Allow-Origin":e.ALLOWED_ORIGIN,"Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};
 const reply=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{...cors,"content-type":"application/json","cache-control":"no-store"}});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(origin!==e.ALLOWED_ORIGIN)return reply({error:"Origin denied"},403);
 if(req.method!=="POST")return reply({error:"Method denied"},405);
 if(!e.AI||!e.SUPABASE_SERVICE_ROLE_KEY||!e.SUPABASE_PUBLISHABLE_KEY||!e.SUPABASE_URL)return reply({error:"Not configured"},503);
 const user=await who(e,req.headers.get("authorization"));if(!user)return reply({error:"Sign in required"},401);
 let b;try{let raw=await req.text();if(raw.length>10000)throw Error();b=JSON.parse(raw);}catch{return reply({error:"Invalid body"},400);}
 const path=new URL(req.url).pathname;
 try{
 if(path==="/quiz/start"){
  const {topicId,difficulty}=b;
  if(typeof topicId!=="string"||!(/^[a-z0-9-]+:[0-9]{1,3}$/).test(topicId)||!["easy","medium","hard"].includes(difficulty))return reply({error:"Invalid topic"},400);
  const [topic]=await q(e,"ai_quiz_topics","topic_id=eq."+encodeURIComponent(topicId)+"&limit=1");
  if(!topic)return reply({error:"Unknown topic"},404);
  const filter="topic_id=eq."+encodeURIComponent(topicId)+"&difficulty=eq."+difficulty+"&order=created_at.desc&limit=1";
  let existing=await q(e,"ai_quiz_bank",filter+"&status=eq.approved");if(!existing.length)existing=await q(e,"ai_quiz_bank",filter+"&status=eq.draft");
  let quiz=existing[0];
  if(!quiz){
   const allowed=await add(e,"rpc/claim_ai_quiz_generation",{p_user_id:user});
   if(allowed!==true)return reply({error:"Free AI quota reached. No cached quiz yet.",code:"QUOTA"},429);
   let questions;try{questions=await generate(e,topic.title,difficulty);}catch{return reply({error:"AI unavailable. Please try later.",code:"AI_UNAVAILABLE"},503);}
   [quiz]=await add(e,"ai_quiz_bank",{topic_id:topicId,difficulty,questions,source:"cloudflare",status:"draft"});
  }
  if(!valid(quiz.questions))return reply({error:"Quiz needs review"},503);
  const [s]=await add(e,"ai_quiz_sessions",{user_id:user,topic_id:topicId,difficulty,questions:quiz.questions,source:quiz.source,reviewed:quiz.status==="approved"});
  return new Response(JSON.stringify({sessionId:s.id,topicId,difficulty,reviewed:s.reviewed,questions:quiz.questions.map(x=>({id:x.id,prompt:x.prompt,choices:x.choices}))}),{headers:{...cors,"content-type":"application/json"}});
 }
 if(path==="/quiz/submit"){
  const {sessionId,answers}=b;if(typeof sessionId!=="string"||!(/^[0-9a-f-]{36}$/i).test(sessionId)||!answers||typeof answers!=="object")return reply({error:"Invalid submission"},400);
  const [s]=await q(e,"ai_quiz_sessions","id=eq."+sessionId+"&user_id=eq."+user+"&limit=1");
  if(!s)return reply({error:"Session unavailable"},404);
  if(s.submitted_at)return reply({error:"Already submitted"},409);
  if(Date.now()-Date.parse(s.created_at)>3600000)return reply({error:"Session expired"},410);
  if(!valid(s.questions)||Object.keys(answers).length!==5||!s.questions.every(x=>Number.isInteger(answers[x.id])&&answers[x.id]>=0&&answers[x.id]<4))return reply({error:"Answer all questions"},400);
  const score=s.questions.filter(x=>answers[x.id]===x.correct).length;
  const updated=await db(e,"ai_quiz_sessions?id=eq."+sessionId+"&user_id=eq."+user+"&submitted_at=is.null","PATCH",{submitted_at:new Date().toISOString()});
  if(!updated.length)return reply({error:"Already submitted"},409);
  const passed=score>=4;
  await add(e,"ai_quiz_attempts",{user_id:user,session_id:sessionId,topic_id:s.topic_id,difficulty:s.difficulty,score,total:5,passed,reviewed:s.reviewed});
  return new Response(JSON.stringify({score,total:5,passed,reviewed:s.reviewed,canCompleteLesson:passed&&s.reviewed&&s.difficulty==="medium",feedback:s.questions.map(x=>({id:x.id,correct:x.correct,explanation:x.explanation}))}),{headers:{...cors,"content-type":"application/json"}});
 }
 return reply({error:"Not found"},404);
 }catch{return reply({error:"Quiz service unavailable"},503);}
}};

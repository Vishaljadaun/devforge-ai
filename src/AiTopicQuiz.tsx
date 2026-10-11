import {useEffect,useState} from 'react';
import type {SupabaseClient,User} from '@supabase/supabase-js';
import {BrainCircuit,RefreshCw,ShieldCheck} from 'lucide-react';
import './ai-topic-quiz.css';
type Difficulty='easy'|'medium'|'hard';
type Question={id:string;prompt:string;choices:string[]};
type Quiz={sessionId:string;topicId:string;difficulty:Difficulty;reviewed:boolean;questions:Question[]};
type Grade={score:number;total:number;passed:boolean;reviewed:boolean;canCompleteLesson:boolean;feedback:{id:string;correct:number;explanation:string}[]};
export default function AiTopicQuiz({topicId,client,user}:{topicId:string;client:SupabaseClient|null;user:User|null}){
 const [level,setLevel]=useState<Difficulty>('easy');
 const [quiz,setQuiz]=useState<Quiz|null>(null);
 const [grade,setGrade]=useState<Grade|null>(null);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const endpoint=(import.meta.env.VITE_QUIZ_API_URL as string|undefined)?.replace(/\/$/,'');
 useEffect(()=>{setQuiz(null);setGrade(null);setAnswers({});setError('')},[topicId,level]);
 async function send(route:string,body:unknown){
  if(!endpoint||!client)throw Error('AI quiz service is not configured yet. Curated practice remains available.');
  const {data:{session}}=await client.auth.getSession();
  if(!session?.access_token)throw Error('Sign in to generate and save AI quiz attempts.');
  const response=await fetch(endpoint+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify(body)});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||'Quiz service unavailable');
  return result;
 }
 async function start(){
  setLoading(true);setError('');setQuiz(null);setGrade(null);setAnswers({});
  try{const x=await send('/quiz/start',{topicId,difficulty:level});
    if(!x||!Array.isArray(x.questions)||x.questions.length!==5)throw Error('Unexpected quiz format');
    setQuiz(x as Quiz);
  }catch(e){setError(e instanceof Error?e.message:'Could not load quiz')}
  finally{setLoading(false)}
 }
 async function submit(){
  if(!quiz||Object.keys(answers).length!==quiz.questions.length)return;
  setLoading(true);setError('');
  try{setGrade(await send('/quiz/submit',{sessionId:quiz.sessionId,answers}) as Grade)}
  catch(e){setError(e instanceof Error?e.message:'Could not submit quiz')}
  finally{setLoading(false)}
 }
 return <section className="ai-quiz" aria-label="AI topic quiz">
  <div className="ai-quiz-head"><div><span className="overline">DEVFORGE AI · AI-POWERED LEARNING</span><h3><BrainCircuit size={19}/> AI Quiz Generator</h3>
    <p>Get five questions tailored to this topic. Generate, practise, and review explanations without a paid API subscription.</p>
   </div><ShieldCheck size={23}/></div>
  <div className="ai-quiz-levels" role="group" aria-label="Quiz difficulty">
   {(['easy','medium','hard'] as Difficulty[]).map(item=><button key={item} type="button" className={level===item?'selected':''} aria-pressed={level===item} onClick={()=>setLevel(item)} disabled={loading}>{item==='easy'?'Easy':item==='medium'?'Medium':'Hard'}</button>)}
  </div>
  <p className="ai-quiz-disclaimer">{quiz?.reviewed?'Reviewed quiz':'AI questions are unreviewed practice. They do not automatically complete the lesson.'} The existing curated quiz still controls v0.6 lesson completion.</p>
  {!user&&<p className="ai-quiz-note">Sign in with Google or GitHub to use AI quizzes.</p>}
  {!endpoint&&<p className="ai-quiz-note">AI quiz service is not deployed yet. Your existing practice quiz above still works.</p>}
  <button className="btn btn-outline" type="button" disabled={loading||!user||!endpoint} onClick={()=>void start()}><RefreshCw size={15}/>{loading?'Working…':quiz?'Get another quiz':'Generate / Load quiz'}</button>
  {error&&<p role="alert" className="ai-quiz-error">{error}</p>}
  {quiz&&<div className="ai-quiz-questions">{quiz.questions.map((q,n)=><fieldset key={q.id} className="ai-quiz-question">
    <legend>{n+1}. {q.prompt}</legend>
    {q.choices.map((choice,i)=><label key={i} className={grade&&grade.feedback.find(x=>x.id===q.id)?.correct===i?'correct':''}>
     <input type="radio" name={'ai-'+quiz.sessionId+'-'+q.id} disabled={!!grade||loading} checked={answers[q.id]===i} onChange={()=>setAnswers(prev=>({...prev,[q.id]:i}))}/>{choice}
    </label>)}
    {grade&&<p className="ai-quiz-explanation">{grade.feedback.find(x=>x.id===q.id)?.explanation}</p>}
   </fieldset>)}
   {grade?<p role="status" className="ai-quiz-score">{grade.passed?'Passed':'Keep practising'} · {grade.score}/{grade.total} ({Math.round(grade.score/grade.total*100)}%) · {grade.reviewed?'Reviewed set':'Unreviewed AI draft'}</p>
    :<button className="btn btn-primary" type="button" disabled={loading||Object.keys(answers).length!==quiz.questions.length} onClick={()=>void submit()}>Check answers</button>}
  </div>}
 </section>;
}
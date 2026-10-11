import {useCallback,useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {Activity,BookOpenCheck,ClipboardCheck,FolderKanban,RefreshCw,Users} from 'lucide-react';
import './admin-engagement.css';

type Engagement={active_learners_7d:number;learning_actions_7d:number;topics_completed_7d:number;practice_attempts_7d:number;project_steps_7d:number;quizzes_taken_7d:number;journal_saves_7d:number;flashcard_reviews_7d:number};
const fields:(keyof Engagement)[]=['active_learners_7d','learning_actions_7d','topics_completed_7d','practice_attempts_7d','project_steps_7d','quizzes_taken_7d','journal_saves_7d','flashcard_reviews_7d'];
function valid(data:unknown):data is Engagement{
  return typeof data==='object' && data!==null && fields.every(k=>Number.isFinite((data as Record<string,unknown>)[k]) && Number((data as Record<string,number>)[k])>=0);
}
export default function AdminEngagement({client}:{client:SupabaseClient}){
  const [data,setData]=useState<Engagement|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    const {data:response,error:rpcError}=await client.rpc('admin_learning_engagement');
    if(rpcError){setError('Engagement tracking is not ready. Run supabase/learning_activity.sql in Supabase SQL Editor. '+rpcError.message);setData(null)}
    else if(valid(response))setData(response);
    else{setData(null);setError('Unexpected engagement response from Supabase.');}
    setLoading(false);
  },[client]);
  useEffect(()=>{void load()},[load]);
  const metrics=[
    {label:'Learners with real activity',value:data?.active_learners_7d??0,icon:Users},
    {label:'Learning actions',value:data?.learning_actions_7d??0,icon:Activity},
    {label:'Topic completions',value:data?.topics_completed_7d??0,icon:BookOpenCheck},
    {label:'Practice attempts',value:data?.practice_attempts_7d??0,icon:ClipboardCheck},
    {label:'Project milestones',value:data?.project_steps_7d??0,icon:FolderKanban}
  ];
  return <section className="panel engagement-panel" aria-label="Learning engagement statistics">
    <header className="engagement-header"><div><span className="overline">MEANINGFUL LEARNING EVENTS</span><h2>Learning engagement · last 7 days</h2><p>Counts topic completions, quiz/practice submissions, project steps and journal saves. A login or background sync alone is not counted as learning activity.</p></div><button className="btn btn-outline" disabled={loading} onClick={()=>void load()}><RefreshCw size={15}/> Refresh</button></header>
    {loading&&<p role="status">Loading learning engagement…</p>}
    {error&&<p role="alert" className="engagement-error">{error}</p>}
    {data&&!loading&&<><div className="engagement-grid">{metrics.map(({label,value,icon:Icon})=><div className="engagement-tile" key={label}><Icon size={19}/><strong>{value.toLocaleString()}</strong><span>{label}</span></div>)}</div><p className="engagement-footnote">Also recorded: {data.quizzes_taken_7d} revision quiz submissions, {data.journal_saves_7d} journal saves, and {data.flashcard_reviews_7d} flashcard reviews. These metrics track interaction events, not time spent or mastery. New events begin only after the v0.5 release and database migration.</p></>}
  </section>;
}
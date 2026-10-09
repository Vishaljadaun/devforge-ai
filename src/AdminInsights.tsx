import {useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {Activity,BookOpenCheck,ChartNoAxesColumn,FolderKanban,RefreshCw,ShieldCheck,Users} from 'lucide-react';
import './admin-insights.css';

type Signups={day:string;users:number};
type Stats={
  registered_total:number;
  registered_last_7_days:number;
  recently_updated_workspaces:number;
  topics_marked_completed:number;
  project_checklists_started:number;
  signup_series:Signups[];
};
const format=(value:number)=>new Intl.NumberFormat().format(value);
const validStats=(value:unknown):value is Stats=>{
  if(!value||typeof value!=='object')return false;
  const d=value as Record<string,unknown>;
  return ['registered_total','registered_last_7_days','recently_updated_workspaces','topics_marked_completed','project_checklists_started']
    .every(k=>typeof d[k]==='number' && Number.isFinite(d[k])) &&
    Array.isArray(d.signup_series) && d.signup_series.every((s:unknown)=>{
      const x=s as Signups;
      return x && typeof x.day==='string' && typeof x.users==='number';
    });
};

export default function AdminInsights({client}:{client:SupabaseClient}){
  const [stats,setStats]=useState<Stats|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=async()=>{
    setLoading(true);setError('');
    const {data,error:rpcError}=await client.rpc('admin_platform_stats');
    if(rpcError){setError('Could not load analytics. Verify that admin_analytics.sql has been run and this account is an authorized administrator. '+rpcError.message);setStats(null)}
    else if(validStats(data))setStats(data);
    else{setStats(null);setError('Unexpected analytics response. Please check the database function.');}
    setLoading(false);
  };
  useEffect(()=>{void load()},[client]);
  const max=Math.max(1,...(stats?.signup_series||[]).map(s=>s.users));
  return <section className="insights">
    <div className="page-intro insights-header"><div><span className="overline">DEVFORGE AI · PLATFORM HEALTH</span><h1>Admin Analytics</h1><p>Measure learning-platform growth while keeping private learner notes and activity records inaccessible to other users.</p></div><button className="btn btn-outline" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/> Refresh</button></div>
    {loading&&<div className="panel insights-message" role="status">Loading platform statistics…</div>}
    {error&&<div className="panel insights-message" role="alert">{error}</div>}
    {stats&&!loading&&<>
      <div className="insights-stats">
        <Metric icon={Users} value={stats.registered_total} label="Registered accounts" note="Unique Supabase users"/>
        <Metric icon={ChartNoAxesColumn} value={stats.registered_last_7_days} label="New registrations (7d)" note="Accounts created during the last 7 days"/>
        <Metric icon={Activity} value={stats.recently_updated_workspaces} label="Recently updated (7d)" note="Workspaces with a recent save, not confirmed active sessions"/>
        <Metric icon={BookOpenCheck} value={stats.topics_marked_completed} label="Topics marked complete" note="Self-reported completions across learners"/>
        <Metric icon={FolderKanban} value={stats.project_checklists_started} label="Project checklists started" note="Projects with at least one completed step"/>
      </div>
      <div className="panel insights-chart"><h2>New learner registrations</h2><p className="insights-description">Daily signups, last 7 calendar days. These are counts, not simulated values.</p>
        <div className="insights-bars" role="img" aria-label="Registrations by day over the past week">
          {stats.signup_series.map(s=><div className="insights-bar-group" key={s.day}>
            <strong>{format(s.users)}</strong><div className="insights-track"><div className="insights-bar" style={{height:`${Math.max(5,100*s.users/max)}%`}}/></div><small>{new Date(`${s.day}T00:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small>
          </div>)}
        </div>
      </div>
      <div className="panel insights-privacy"><ShieldCheck size={22}/><div><h3>Privacy by design</h3><p>These statistics are aggregated inside PostgreSQL by an admin-checked function. The dashboard cannot browse other users' journals, notes, or progress records. The 7-day workspace number reflects writes, not a precise daily-active-user measurement.</p></div></div>
    </>}
  </section>;
}

type IconType=typeof Users;
function Metric({icon:Icon,value,label,note}:{icon:IconType;value:number;label:string;note:string}){
  return <div className="panel insights-metric"><Icon size={20}/><strong>{format(value)}</strong><span>{label}</span><small>{note}</small></div>;
}
import {useCallback,useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {ChevronLeft,ChevronRight,Search,Users} from 'lucide-react';
import './admin-learners.css';

type Learner={
  user_id:string;
  email:string|null;
  registered_at:string;
  last_sign_in_at:string|null;
  last_progress_save_at:string|null;
  completed_topics:number;
  progress_percent:number;
  is_admin:boolean;
};
type Directory={learners:Learner[];total:number;page:number;page_size:number;total_topics:number};
const PAGE_SIZE=20;
const isNumber=(v:unknown)=>typeof v==='number' && Number.isFinite(v);
function isDirectory(value:unknown):value is Directory{
  if(!value||typeof value!=='object')return false;
  const d=value as Record<string,unknown>;
  return isNumber(d.total)&&isNumber(d.page)&&isNumber(d.page_size)&&isNumber(d.total_topics)&&
    Array.isArray(d.learners)&&d.learners.every((item:unknown)=>{
      if(!item||typeof item!=='object')return false;
      const u=item as Record<string,unknown>;
      return typeof u.user_id==='string'&&(typeof u.email==='string'||u.email===null)&&
        typeof u.registered_at==='string'&&
        (typeof u.last_sign_in_at==='string'||u.last_sign_in_at===null)&&
        (typeof u.last_progress_save_at==='string'||u.last_progress_save_at===null)&&
        isNumber(u.completed_topics)&&isNumber(u.progress_percent)&&typeof u.is_admin==='boolean';
    });
}
const dateLabel=(iso:string|null)=>{
  if(!iso)return 'Never';
  const d=new Date(iso);
  return Number.isNaN(d.getTime())?'Unknown':d.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
};
const signedInLast7Days=(iso:string|null)=>!!iso && !Number.isNaN(new Date(iso).getTime()) &&
  new Date(iso).getTime()>=Date.now()-7*24*60*60*1000;

export default function AdminLearners({client}:{client:SupabaseClient}){
  const [search,setSearch]=useState('');
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(1);
  const [reload,setReload]=useState(0);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [directory,setDirectory]=useState<Directory|null>(null);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{setPage(1);setQuery(search.trim())},350);
    return()=>window.clearTimeout(timer);
  },[search]);
  const refresh=useCallback(()=>setReload(n=>n+1),[]);
  useEffect(()=>{
    let alive=true;
    const fetchDirectory=async()=>{
      setLoading(true);setError('');
      try{
        const {data,error:rpcError}=await client.rpc('admin_learner_directory',{
          p_search:query.slice(0,120),p_page:page,p_page_size:PAGE_SIZE
        });
        if(!alive)return;
        if(rpcError){setError('Unable to load learner directory. Run supabase/admin_learners.sql in the SQL Editor and verify your admin access. '+rpcError.message);setDirectory(null)}
        else if(isDirectory(data))setDirectory(data);
        else{setError('Unexpected learner directory response.');setDirectory(null)}
      }catch{
        if(alive){setError('Could not reach Supabase. Please retry.');setDirectory(null)}
      }finally{if(alive)setLoading(false)}
    };
    void fetchDirectory();
    return()=>{alive=false};
  },[client,query,page,reload]);
  const count=directory?.total??0;
  const totalPages=Math.max(1,Math.ceil(count/PAGE_SIZE));
  return <section className="panel learner-directory" aria-labelledby="learner-directory-heading">
    <div className="learner-directory-head">
      <div><div className="learner-directory-heading"><Users size={21}/><h2 id="learner-directory-heading">Registered learners</h2></div>
        <p>Admin-only directory. Completion counts are self-reported topic checklists; recent sign-in does not mean currently online.</p></div>
      <button className="btn btn-outline" type="button" onClick={refresh} disabled={loading}>Refresh list</button>
    </div>
    <label className="learner-search"><Search size={17}/>
      <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search registered email…" aria-label="Search registered users by email" maxLength={120}/>
    </label>
    {loading&&<p className="learner-state" role="status">Loading registered learners…</p>}
    {error&&<p className="learner-state learner-error" role="alert">{error}</p>}
    {!loading&&directory&&<>
      <p className="learner-results" aria-live="polite">{count.toLocaleString()} matching account{count===1?'':'s'} · {directory.total_topics} tracked curriculum topics</p>
      {directory.learners.length===0?<p className="learner-state">No registered accounts match your search.</p>:<div className="learner-table-wrap">
        <table className="learner-table"><thead><tr>
          <th scope="col">Email / role</th><th scope="col">Progress</th><th scope="col">Topics</th>
          <th scope="col">Last sign-in</th><th scope="col">Last progress save</th><th scope="col">Registered</th>
        </tr></thead><tbody>{directory.learners.map(u=><tr key={u.user_id}>
          <td><div className="learner-email">{u.email||'No email on account'}</div><span className="learner-role">{u.is_admin?'Admin':'Learner'}</span></td>
          <td><div className="learner-progress"><strong>{Math.max(0,Math.min(100,u.progress_percent))}%</strong><div className="learner-progress-track" role="progressbar" aria-valuenow={Math.max(0,Math.min(100,u.progress_percent))} aria-valuemin={0} aria-valuemax={100} aria-label={`Curriculum progress for ${u.email||'user'}`}><div style={{width:`${Math.max(0,Math.min(100,u.progress_percent))}%`}}/></div></div></td>
          <td className="learner-nowrap">{u.completed_topics}/{directory.total_topics}</td>
          <td><div className="learner-nowrap">{dateLabel(u.last_sign_in_at)}</div><span className={`learner-activity ${signedInLast7Days(u.last_sign_in_at)?'recent':''}`}>{signedInLast7Days(u.last_sign_in_at)?'Signed in within 7d':'No sign-in within 7d'}</span></td>
          <td className="learner-nowrap">{u.last_progress_save_at?dateLabel(u.last_progress_save_at):'No saved workspace'}</td>
          <td className="learner-nowrap">{dateLabel(u.registered_at)}</td>
        </tr>)}</tbody></table>
      </div>}
      <div className="learner-pagination"><span>Page {directory.page} of {totalPages}</span>
        <div><button type="button" className="btn btn-outline" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}><ChevronLeft size={16}/> Previous</button>
          <button type="button" className="btn btn-outline" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next <ChevronRight size={16}/></button></div>
      </div>
    </>}
    <p className="learner-privacy-note">For account support only. Emails and individual progress are visible to authorized admins, never to regular learners. No private learning notes are retrieved.</p>
  </section>;
}

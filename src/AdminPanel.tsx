import {useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {allTopics,modules} from './data/curriculum';
import type {Lesson} from './data/lessons';
import type {Project} from './data/projects';
import './admin.css';

type Kind='lesson'|'project';
type Row={id:string;kind:Kind;payload:Record<string,unknown>;published:boolean;updated_at:string};
type Props={client:SupabaseClient;onSaved:()=>void};
const splitLines=(value:string)=>value.split('\n').map(s=>s.trim()).filter(Boolean);
const splitCsv=(value:string)=>value.split(',').map(s=>s.trim()).filter(Boolean);
const starter={topic:'python:0',slug:'',title:'',intro:'',keyPoints:'',example:'',task:'',review:'',tagline:'',category:'AI Engineering',difficulty:'Beginner',duration:'2 weeks',stack:'Python, FastAPI',skills:'python',build:'',milestones:'',deliverable:''};
type Form=typeof starter;
const topicIds=new Set(allTopics.map(t=>t.id));
const moduleIds=new Set(modules.map(m=>m.id));
const slugify=(v:string)=>v.toLowerCase().trim().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
function fromRow(row:Row):Form{
  const p=row.payload;
  const arr=(k:string)=>Array.isArray(p[k])?(p[k] as string[]).join('\n'):'';
  return {...starter,topic:row.kind==='lesson'?row.id.slice(7):starter.topic,slug:row.kind==='project'?row.id.slice(8):'',
    title:String(p.title||''),intro:String(p.intro||''),keyPoints:arr('keyPoints'),example:String(p.example||''),task:String(p.task||''),review:String(p.review||''),
    tagline:String(p.tagline||''),category:String(p.category||''),difficulty:String(p.difficulty||'Beginner'),
    duration:String(p.duration||''),stack:Array.isArray(p.stack)?(p.stack as string[]).join(', '):'',
    skills:Array.isArray(p.skills)?(p.skills as string[]).join(', '):'',
    build:String(p.build||''),milestones:arr('milestones'),deliverable:String(p.deliverable||'')};
}
export default function AdminPanel({client,onSaved}:Props){
  const [rows,setRows]=useState<Row[]>([]);
  const [kind,setKind]=useState<Kind>('lesson');
  const [form,setForm]=useState<Form>({...starter});
  const [editing,setEditing]=useState<string|null>(null);
  const [published,setPublished]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true);
  const update=(key:keyof Form,value:string)=>setForm(f=>({...f,[key]:value}));
  const load=async()=>{
    const {data,error}=await client.from('learning_content').select('id,kind,payload,published,updated_at').order('updated_at',{ascending:false});
    setLoading(false);
    if(error){setMessage('Cannot load content. Run the v0.2 SQL migration and check your admin access.');return;}
    setRows((data||[]) as Row[]);
  };
  useEffect(()=>{void load()},[client]);
  const fresh=(type:Kind)=>{setKind(type);setForm({...starter});setPublished(false);setEditing(null);setMessage('')};
  const edit=(row:Row)=>{setKind(row.kind);setForm(fromRow(row));setPublished(row.published);setEditing(row.id);setMessage('')};
  const save=async()=>{
    setMessage('');
    const title=form.title.trim();
    if(!title){setMessage('Enter a title.');return;}
    let id:string;let payload:Lesson|Project;
    if(kind==='lesson'){
      if(!topicIds.has(form.topic)){setMessage('Choose an existing curriculum topic.');return;}
      if(!form.intro.trim()||!form.task.trim()||!form.review.trim()||!splitLines(form.keyPoints).length){setMessage('Complete the explanation, key points, exercise and revision question.');return;}
      id='lesson:'+form.topic;
      payload={title,intro:form.intro.trim(),keyPoints:splitLines(form.keyPoints),example:form.example,task:form.task.trim(),review:form.review.trim()};
    }else{
      const slug=slugify(form.slug);
      if(!slug||!form.tagline.trim()||!form.build.trim()||!form.deliverable.trim()||!splitLines(form.milestones).length){setMessage('Add a project ID, description, build plan, milestones and outcome.');return;}
      if(!splitCsv(form.skills).every(s=>moduleIds.has(s))){setMessage('Skill IDs must match curriculum module IDs.');return;}
      id='project:'+slug;
      payload={id:slug,title,tagline:form.tagline.trim(),difficulty:form.difficulty as Project['difficulty'],category:form.category||'AI Engineering',icon:'rocket',
        duration:form.duration||'2 weeks',stack:splitCsv(form.stack),skills:splitCsv(form.skills),build:form.build.trim(),milestones:splitLines(form.milestones),deliverable:form.deliverable.trim()};
    }
    if(editing && editing!==id){setMessage('Content IDs cannot be changed after creation.');return;}
    setBusy(true);
    const {error}=await client.from('learning_content').upsert({id,kind,payload,published,updated_at:new Date().toISOString()},{onConflict:'id'});
    setBusy(false);
    if(error){setMessage('Save failed: '+error.message);return;}
    setMessage(published?'Published successfully.':'Draft saved; only admins can view it.');
    setEditing(id);await load();onSaved();
  };
  return <section className="studio">
    <div className="page-intro"><div><span className="overline">DEVFORGE AI · CONTENT MANAGEMENT</span><h1>Content Studio</h1><p>Create guided lessons and real-world AI projects. Drafts stay private until you publish them.</p></div></div>
    <div className="studio-layout">
      <div className="panel studio-list">
        <h2>Content library</h2><p className="studio-help">Manage existing lessons and projects. The built-in curriculum remains available to everyone.</p>
        <div className="studio-actions"><button className="btn btn-primary" onClick={()=>fresh('lesson')}>+ New lesson</button><button className="btn btn-outline" onClick={()=>fresh('project')}>+ New project</button></div>
        {loading?<p>Loading...</p>:rows.length===0?<p className="studio-help">No cloud content yet. Create your first lesson!</p>:
        rows.map(row=><button key={row.id} className={'studio-row '+(editing===row.id?'selected':'')} onClick={()=>edit(row)}>
          <strong>{String(row.payload.title||row.id)}</strong><span>{row.kind==='lesson'?'Lesson':'Project'} · {row.published?'Published':'Draft'}</span></button>)}
      </div>
      <form className="panel studio-editor" onSubmit={e=>{e.preventDefault();void save()}}>
        <div className="studio-editor-head"><h2>{editing?'Edit '+kind:'Create '+kind}</h2><label className="studio-switch"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/> Publish publicly</label></div>
        {kind==='lesson'?<label>Curriculum topic<select disabled={!!editing} value={form.topic} onChange={e=>update('topic',e.target.value)}>{modules.map(m=><optgroup key={m.id} label={m.title}>{m.topics.map((t,i)=><option key={i} value={m.id+':'+i}>{t}</option>)}</optgroup>)}</select></label>:
          <><label>Project slug (permanent ID)<input disabled={!!editing} value={form.slug} onChange={e=>update('slug',e.target.value)} placeholder="e.g. ai-invoice-reader" maxLength={72}/></label><label>One-line tagline<input value={form.tagline} onChange={e=>update('tagline',e.target.value)} maxLength={180}/></label>
          <div className="studio-two"><label>Difficulty<select value={form.difficulty} onChange={e=>update('difficulty',e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label>Duration<input value={form.duration} onChange={e=>update('duration',e.target.value)}/></label></div>
          <label>Category<input value={form.category} onChange={e=>update('category',e.target.value)}/></label><label>Technology stack (comma separated)<input value={form.stack} onChange={e=>update('stack',e.target.value)}/></label>
          <label>Module IDs (comma separated)<input value={form.skills} onChange={e=>update('skills',e.target.value)} placeholder="python, rag, agents"/></label></>}
        <label>Title<input required value={form.title} onChange={e=>update('title',e.target.value)} maxLength={160}/></label>
        {kind==='lesson'?<><label>Concept explanation<textarea rows={4} value={form.intro} onChange={e=>update('intro',e.target.value)}/></label>
          <label>Key ideas (one per line)<textarea rows={5} value={form.keyPoints} onChange={e=>update('keyPoints',e.target.value)}/></label>
          <label>Code example<textarea className="studio-code" rows={8} value={form.example} onChange={e=>update('example',e.target.value)}/></label>
          <label>Hands-on assignment<textarea rows={4} value={form.task} onChange={e=>update('task',e.target.value)}/></label>
          <label>Revision question<textarea rows={3} value={form.review} onChange={e=>update('review',e.target.value)}/></label></>:
          <><label>What learners will build<textarea rows={4} value={form.build} onChange={e=>update('build',e.target.value)}/></label>
            <label>Project milestones (one per line)<textarea rows={6} value={form.milestones} onChange={e=>update('milestones',e.target.value)}/></label>
            <label>Expected deliverable<textarea rows={3} value={form.deliverable} onChange={e=>update('deliverable',e.target.value)}/></label></>}
        <p className="studio-help">Saving a draft does not expose it to learners. Publishing makes this content available to visitors without a login.</p>
        {message&&<div className="studio-feedback" role="status">{message}</div>}
        <button disabled={busy} className="btn btn-primary" type="submit">{busy?'Saving...':published?'Save & publish':'Save draft'}</button>
      </form>
    </div>
  </section>;
}

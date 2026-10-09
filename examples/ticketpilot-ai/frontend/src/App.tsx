import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, BookOpen,
  Bot, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, Copy, ExternalLink, FileText, Filter, Globe2, Inbox, LayoutDashboard,
  LoaderCircle, Mail, Menu, MessageCircle, Plus, RefreshCw,
  Search, Settings2, ShieldCheck, Sparkles, Ticket as TicketIcon, WandSparkles, X,
  Zap,
} from 'lucide-react'
import { api, type Channel, type Draft, type Health, type Knowledge, type Metrics, type Priority, type Status, type Ticket, type TicketCreate } from './api'

type Page = 'overview' | 'inbox' | 'knowledge' | 'analytics' | 'settings'
const nav: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'overview', label: 'Overview', icon: LayoutDashboard },
  { page: 'inbox', label: 'Ticket inbox', icon: Inbox },
  { page: 'knowledge', label: 'Knowledge base', icon: BookOpen },
  { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'settings', label: 'Settings', icon: Settings2 },
]
const statusColors: Record<Status, string> = { open: 'blue', pending: 'amber', resolved: 'green' }
const priorityColors: Record<Priority, string> = { low: 'gray', medium: 'blue', high: 'amber', urgent: 'red' }
const initialForm: TicketCreate = { customer: '', email: '', subject: '', message: '', channel: 'email' }

function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') }
function relativeDate(date: string) {
  const delta = Math.max(0, Date.now() - new Date(date).getTime())
  if (delta < 60_000) return 'Just now'
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
function greet() { const hour = new Date().getHours(); return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening' }
function LabelPill({ children, color = 'gray' }: { children: ReactNode; color?: string }) { return <span className={`pill pill-${color}`}>{children}</span> }
function getChannelIcon(channel: Channel) { return channel === 'email' ? Mail : channel === 'chat' ? MessageCircle : Globe2 }

function App() {
  const [page, setPage] = useState<Page>('overview')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [health, setHealth] = useState<Health | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<TicketCreate>(initialForm)
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [editedReply, setEditedReply] = useState('')
  const [lastSource, setLastSource] = useState<Draft['source']>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [t, m, k, h] = await Promise.all([api.tickets(), api.metrics(), api.knowledge(), api.health()])
      setTickets(t); setMetrics(m); setKnowledge(k); setHealth(h)
      setSelectedId(id => id && t.some(x => x.id === id) ? id : t[0]?.id || null)
      setError(null)
    } catch (err) { setError((err as Error).message) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  const selected = tickets.find(t => t.id === selectedId) || null
  useEffect(() => { setEditedReply(selected?.ai_reply || ''); setLastSource(null) }, [selectedId, selected?.ai_reply])
  const filtered = useMemo(() => tickets.filter(t => {
    const matches = `${t.id} ${t.customer} ${t.subject} ${t.message}`.toLowerCase().includes(search.toLowerCase().trim())
    return matches && (statusFilter === 'all' || t.status === statusFilter)
  }), [tickets, search, statusFilter])
  const visibleTickets = page === 'overview' ? filtered.slice(0, 5) : filtered

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(null), 3000) }
  function navigate(next: Page) { setPage(next); setMobileNav(false); setSearch(''); setStatusFilter('all') }
  async function updateStatus(status: Status) {
    if (!selected) return
    setBusy('status'); setError(null)
    try {
      const updated = await api.status(selected.id, status)
      setTickets(items => items.map(t => t.id === updated.id ? updated : t))
      setMetrics(await api.metrics())
      notify(`Ticket marked ${status}`)
    } catch (err) { setError((err as Error).message) }
    finally { setBusy(null) }
  }
  async function generate() {
    if (!selected) return
    setBusy('draft'); setError(null)
    try {
      const result = await api.draft(selected.id)
      setTickets(items => items.map(t => t.id === selected.id ? { ...t, ai_reply: result.reply, ai_provider: result.provider, category: result.category, priority: result.priority } : t))
      setEditedReply(result.reply); setLastSource(result.source)
      setMetrics(await api.metrics())
      notify(result.provider === 'demo' ? 'Rule-based sample draft ready' : 'AI draft ready for your review')
    } catch (err) { setError((err as Error).message) }
    finally { setBusy(null) }
  }
  async function createTicket(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy('create'); setError(null)
    try {
      const newTicket = await api.create(form)
      setTickets(items => [newTicket, ...items]); setSelectedId(newTicket.id); setEditedReply('')
      setMetrics(await api.metrics()); setForm(initialForm); setShowCreate(false); navigate('inbox')
      notify('Ticket created successfully')
    } catch (err) { setError((err as Error).message) }
    finally { setBusy(null) }
  }
  async function copyDraft() {
    if (!editedReply) return
    try { await navigator.clipboard.writeText(editedReply); notify('Draft copied to clipboard') }
    catch { setError('Clipboard access is unavailable. Please select and copy the reply manually.') }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Zap size={22} fill="currentColor" /></div>
          <div><div className="brand-name">ticketpilot<span>.ai</span></div><div className="brand-subtitle">SMART SUPPORT PLATFORM</div></div>
          <button className="mobile-x" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-select" onClick={() => navigate('settings')}>
          <div className="workspace-icon">P</div><div className="workspace-meta"><strong>Personal workspace</strong><small>Free development plan</small></div><ChevronDown size={14}/>
        </button>
        <div className="nav-section-label">MAIN MENU</div>
        <nav className="nav-list" aria-label="Main navigation">
          {nav.map(item => {
            const Icon = item.icon
            return <button key={item.page} className={`nav-link ${page === item.page ? 'active' : ''}`} onClick={() => navigate(item.page)}>
              <Icon size={19} strokeWidth={1.85} /><span>{item.label}</span>{item.page === 'inbox' && metrics && metrics.open > 0 ? <span className="nav-count">{metrics.open}</span> : null}
            </button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-insight">
            <span className="insight-icon"><Sparkles size={17}/></span>
            <strong>Build smarter support</strong>
            <p>Learn AI while building a product your customers could actually use.</p>
            <button onClick={() => navigate('knowledge')}>Explore knowledge base <ArrowRight size={14}/></button>
          </div>
          <a className="sidebar-help" href="https://fastapi.tiangolo.com/" target="_blank" rel="noreferrer"><CircleHelp size={18}/> Developer documentation <ExternalLink size={13}/></a>
          <div className="sidebar-profile"><div className="avatar avatar-profile">DEV</div><div><strong>Developer</strong><small>Project administrator</small></div><span className="online-indicator" title="Local development workspace"/></div>
        </div>
      </aside>
      {mobileNav && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21}/></button>
            <span className="breadcrumb-root">Workspace</span><ChevronRight size={14}/><span className="breadcrumb-current">{nav.find(item => item.page === page)?.label}</span>
          </div>
          <div className="topbar-actions">
            <span className={`connection-pill ${health ? '' : 'connection-off'}`}><span/> {health ? 'API connected' : 'API offline'}</span>
            <button className="icon-button" onClick={() => void load()} title="Refresh data" aria-label="Refresh data"><RefreshCw size={18} className={loading ? 'spin' : ''}/></button>
            <div className="topbar-avatar">D</div>
          </div>
        </header>

        <div className="page-wrap">
          {error && <div className="error-banner" role="alert"><CircleHelp size={18}/><span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss error"><X size={17}/></button></div>}

          {page === 'overview' && <>
            <div className="heading-row">
              <div><div className="eyebrow">YOUR SUPPORT WORKSPACE</div><h1>{greet()}, Developer <span className="wave">✳</span></h1><p className="heading-subtitle">Here's what's happening with your customer conversations today.</p></div>
              <button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={18}/> New ticket</button>
            </div>
            <div className="intro-banner">
              <div className="intro-banner-text"><span className="banner-label"><Sparkles size={14}/> BUILT FOR SMARTER SUPPORT</span><h2>Great support starts<br/>with a little AI magic.</h2><p>Turn customer questions into thoughtful replies in seconds — with you always in control.</p><button onClick={() => { navigate('inbox'); setSelectedId(tickets[0]?.id || null) }}>Try AI assistant <ArrowRight size={16}/></button></div>
              <div className="banner-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-message art-message-back"><div className="art-dots"><i/><i/><i/></div></div><div className="art-message art-message-front"><Sparkles size={29}/><span>AI assistant</span><div className="art-lines"><i/><i/><i/></div></div><div className="art-spark art-spark-a">✳</div><div className="art-spark art-spark-b">✦</div></div>
            </div>
            <div className="section-topline"><h3>At a glance</h3><span>Live overview</span></div>
            <MetricsCards metrics={metrics}/>
            <div className="work-grid">
              <section className="panel tickets-panel">
                <div className="panel-header"><div><h3>Recent tickets</h3><p>Stay on top of every conversation</p></div><button className="text-link" onClick={() => navigate('inbox')}>View all <ArrowRight size={15}/></button></div>
                <TicketList tickets={visibleTickets} selectedId={selectedId} onSelect={id => { setSelectedId(id); navigate('inbox') }} loading={loading} compact />
              </section>
              <div className="right-stack">
                <section className="panel ai-info-card"><div className="ai-info-mark"><Bot size={22}/></div><h3>Your AI copilot is ready</h3><p>{health?.ai_mode === 'groq' ? 'Groq is connected. Open a ticket to generate an AI-powered draft.' : 'Preview the workflow with rule-based drafts, or connect Groq to unlock real AI responses.'}</p><div className="ai-info-badge"><span className="status-dot"/> {health?.ai_mode === 'groq' ? 'Groq connected' : 'Rule-based demo mode'}</div><button className="button button-light" onClick={() => navigate('inbox')}>Open copilot <ArrowRight size={15}/></button></section>
                <section className="panel learning-card"><div className="learning-heading"><div className="learning-icon"><BookOpen size={17}/></div><h3>What you're learning</h3></div><div className="learning-list"><span><Check size={14}/> REST APIs and TypeScript</span><span><Check size={14}/> Ticket persistence with SQLite</span><span><Check size={14}/> LLM integration and prompts</span></div><a href="https://fastapi.tiangolo.com/tutorial/" target="_blank" rel="noreferrer">FastAPI tutorial <ExternalLink size={13}/></a></section>
              </div>
            </div>
          </>}

          {page === 'inbox' && <>
            <div className="heading-row"><div><div className="eyebrow">CUSTOMER CONVERSATIONS</div><h1>Ticket inbox</h1><p className="heading-subtitle">Review, organize and draft better responses, faster.</p></div><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={18}/> New ticket</button></div>
            <div className="inbox-layout">
              <section className="panel inbox-list-panel">
                <div className="inbox-list-head"><div><h3>All conversations</h3><span>{filtered.length} ticket{filtered.length === 1 ? '' : 's'}</span></div><Filter size={18}/></div>
                <div className="list-controls"><div className="search-box"><Search size={17}/><input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search tickets"/></div><div className="filter-chips">{(['all','open','pending','resolved'] as const).map(f => <button key={f} className={statusFilter===f?'active':''} onClick={() => setStatusFilter(f)}>{f[0].toUpperCase()+f.slice(1)}</button>)}</div></div>
                <TicketList tickets={visibleTickets} selectedId={selectedId} onSelect={setSelectedId} loading={loading}/>
              </section>
              <section className="panel detail-panel">
                {selected ? <>
                  <div className="detail-top"><span className="ticket-id">{selected.id}</span><LabelPill color={statusColors[selected.status]}>{selected.status}</LabelPill></div>
                  <h2 className="detail-title">{selected.subject}</h2>
                  <div className="detail-customer"><div className="avatar avatar-blue">{initials(selected.customer)}</div><div><strong>{selected.customer}</strong><small>{selected.email}</small></div><span className="detail-time">{relativeDate(selected.created_at)}</span></div>
                  <div className="detail-message"><div className="detail-message-label"><Mail size={15}/> Customer message</div><p>{selected.message}</p></div>
                  <div className="detail-tags"><span>Category: <b>{selected.category}</b></span><span>Priority: <LabelPill color={priorityColors[selected.priority]}>{selected.priority}</LabelPill></span></div>
                  <div className="draft-area"><div className="draft-heading"><div><span className="draft-icon"><Sparkles size={17}/></span><h3>AI reply assistant</h3></div><LabelPill color={health?.ai_mode==='groq'?'green':'amber'}>{health?.ai_mode==='groq'?'LIVE AI':'DEMO'}</LabelPill></div><p className="draft-description">Generate a reply based on available support policies. Always review before sending.</p><button className="button button-generate" onClick={() => void generate()} disabled={busy!==null}>{busy==='draft'?<LoaderCircle size={18} className="spin"/>:<WandSparkles size={18}/>} {busy==='draft'?'Generating draft...':selected.ai_reply?'Regenerate draft':'Generate reply draft'} <ArrowRight size={17}/></button>
                    {selected.ai_reply && <div className="generated-draft"><div className="generated-top"><span><CheckCircle2 size={16}/> {selected.ai_provider==='groq'?'AI-generated draft':'Rule-based sample'}</span><button onClick={() => void copyDraft()}><Copy size={15}/> Copy</button></div><textarea aria-label="Edit suggested reply" value={editedReply} onChange={e => setEditedReply(e.target.value)} rows={10}/>{lastSource && <div className="draft-source"><BookOpen size={14}/> Suggested source: {lastSource.title}</div>}<div className="draft-notice"><ShieldCheck size={15}/> This is an editable draft. No message has been sent.</div></div>}
                  </div>
                  <div className="detail-actions"><span>Update status</span><div>{(['open','pending','resolved'] as Status[]).map(s => <button key={s} className={`status-action ${selected.status===s?'current':''}`} disabled={busy!==null} onClick={() => void updateStatus(s)}>{s==='resolved' && <Check size={14}/>} {s[0].toUpperCase()+s.slice(1)}</button>)}</div></div>
                </> : <div className="detail-empty"><Inbox size={34}/><h3>Select a ticket</h3><p>Choose a conversation to inspect and generate a reply draft.</p></div>}
              </section>
            </div>
          </>}

          {page === 'knowledge' && <>
            <div className="heading-row"><div><div className="eyebrow">VERIFIED BUSINESS INFORMATION</div><h1>Knowledge base</h1><p className="heading-subtitle">Approved support guidance used to inform reply drafts.</p></div><LabelPill color="blue">{knowledge.length} articles</LabelPill></div>
            <div className="info-strip"><BookOpen size={20}/><div><strong>Your first step toward RAG</strong><p>This starter searches a small local knowledge base using keyword overlap — not embeddings or vector search. We'll build real RAG next.</p></div></div>
            <div className="knowledge-grid">{knowledge.map(article => <button className={`panel knowledge-item ${expandedArticle===article.id?'expanded':''}`} key={article.id} onClick={() => setExpandedArticle(expandedArticle===article.id?null:article.id)}><div className="knowledge-icon"><FileText size={22}/></div><span className="knowledge-id">{article.id}</span><h3>{article.title}</h3><div className="knowledge-meta"><LabelPill color="gray">{article.category}</LabelPill><ChevronRight size={17}/></div>{expandedArticle===article.id && <p className="knowledge-copy">{article.content}</p>}</button>)}</div>
          </>}

          {page === 'analytics' && <>
            <div className="heading-row"><div><div className="eyebrow">YOUR WORKSPACE NUMBERS</div><h1>Analytics</h1><p className="heading-subtitle">Real calculations from the tickets in your local database.</p></div><button className="button button-secondary" onClick={() => void load()}><RefreshCw size={17}/> Refresh</button></div>
            <MetricsCards metrics={metrics}/>
            <div className="analytics-grid"><section className="panel analytics-panel"><h3>Tickets by category</h3><p>How your support volume is distributed</p><Breakdown tickets={tickets} field="category"/></section><section className="panel analytics-panel"><h3>Tickets by channel</h3><p>Where customer requests come from</p><Breakdown tickets={tickets} field="channel"/></section></div>
            <div className="info-strip"><Activity size={20}/><div><strong>Keep your analytics trustworthy</strong><p>Ticket counts and groupings are derived from actual records. SLA tracking, response times and historical trends will be added only after those events are stored.</p></div></div>
          </>}

          {page === 'settings' && <>
            <div className="heading-row"><div><div className="eyebrow">DEVELOPMENT WORKSPACE</div><h1>Project settings</h1><p className="heading-subtitle">Your current environment and configuration checklist.</p></div></div>
            <div className="settings-grid"><section className="panel settings-panel"><div className="setting-title"><div className="setting-icon"><Zap size={20}/></div><div><h3>AI provider</h3><p>Configure server-side model access</p></div></div><div className="settings-value"><span>Current mode</span><LabelPill color={health?.ai_mode==='groq'?'green':'amber'}>{health?.ai_mode==='groq'?'Groq LLM':'Rule-based demo'}</LabelPill></div><p>To enable actual LLM generation, add <code>GROQ_API_KEY</code> in <code>backend/.env</code> and restart the API. Never place API keys in frontend environment variables.</p><a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">Groq API key dashboard <ExternalLink size={14}/></a></section><section className="panel settings-panel"><div className="setting-title"><div className="setting-icon"><ShieldCheck size={20}/></div><div><h3>API & storage</h3><p>Current development configuration</p></div></div><div className="settings-value"><span>Backend status</span><LabelPill color={health?'green':'red'}>{health?'Connected':'Unavailable'}</LabelPill></div><div className="settings-value"><span>Database</span><strong>SQLite (local)</strong></div><div className="settings-value"><span>Authentication</span><strong>Not yet implemented</strong></div><p>This is a development starter with sample data, not a public multi-user SaaS. We'll add authentication, access control and PostgreSQL later.</p></section></div>
          </>}
        </div>
      </main>

      {showCreate && <div className="modal-backdrop" onMouseDown={e => { if(e.target===e.currentTarget) setShowCreate(false) }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-heading"><div><span className="eyebrow">NEW CONVERSATION</span><h2 id="create-title">Create a support ticket</h2><p>Add a realistic customer request to test your AI assistant.</p></div><button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close dialog"><X size={20}/></button></div><form onSubmit={e => void createTicket(e)}><div className="form-row"><label>Customer name<input required minLength={2} maxLength={80} value={form.customer} onChange={e => setForm({...form, customer:e.target.value})} placeholder="Alex Morgan"/></label><label>Email address<input type="email" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="alex@example.com"/></label></div><label>Subject<input required minLength={3} maxLength={150} value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} placeholder="I can't access my dashboard"/></label><label>Customer message<textarea required minLength={10} maxLength={4000} rows={5} value={form.message} onChange={e => setForm({...form, message:e.target.value})} placeholder="Please describe the issue in a few sentences..."/></label><label>Channel<select value={form.channel} onChange={e => setForm({...form,channel:e.target.value as Channel})}><option value="email">Email</option><option value="chat">Chat</option><option value="web">Web form</option></select></label><div className="modal-footer"><button type="button" className="button button-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="button button-primary" disabled={busy==='create'} type="submit">{busy==='create'?<LoaderCircle className="spin" size={16}/>:<Plus size={16}/>} Create ticket</button></div></form></div></div>}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  )
}

function MetricsCards({ metrics }: { metrics: Metrics | null }) {
  const items = [
    { title: 'Total tickets', value: metrics?.total ?? '—', icon: TicketIcon, tag: 'All time', style: 'purple' },
    { title: 'Open tickets', value: metrics?.open ?? '—', icon: Clock3, tag: 'Needs attention', style: 'blue' },
    { title: 'Resolved', value: metrics?.resolved ?? '—', icon: CheckCheck, tag: 'Successfully closed', style: 'green' },
    { title: 'Drafts created', value: metrics?.drafts ?? '—', icon: Sparkles, tag: 'AI-assisted replies', style: 'orange' },
  ]
  return <div className="metrics-grid">{items.map(item => { const Icon=item.icon; return <div key={item.title} className="metric-card"><div className="metric-top"><span>{item.title}</span><div className={`metric-icon metric-${item.style}`}><Icon size={20}/></div></div><div className="metric-value">{item.value}</div><div className="metric-bottom"><span className={`metric-accent metric-${item.style}`}><ArrowUpRight size={13}/></span>{item.tag}</div></div> })}</div>
}

function TicketList({ tickets, selectedId, onSelect, loading, compact = false }: { tickets: Ticket[]; selectedId: string|null; onSelect: (id: string)=>void; loading:boolean; compact?:boolean }) {
  if (loading && !tickets.length) return <div className="empty-list"><LoaderCircle size={25} className="spin"/><p>Loading conversations...</p></div>
  if (!tickets.length) return <div className="empty-list"><Inbox size={28}/><p>No tickets found. Try a different filter or create one.</p></div>
  return <div className={`ticket-list ${compact?'ticket-list-compact':''}`}>{tickets.map((t, i) => { const Icon = getChannelIcon(t.channel); return <button key={t.id} className={`ticket-row ${selectedId===t.id&&!compact?'ticket-row-selected':''}`} onClick={() => onSelect(t.id)}><span className={`avatar avatar-color-${i%5}`}>{initials(t.customer)}</span><div className="ticket-row-content"><div className="ticket-row-top"><strong>{t.customer}</strong><span>{relativeDate(t.created_at)}</span></div><div className="ticket-subject">{t.subject}</div><div className="ticket-row-meta"><span><Icon size={13}/>{t.channel}</span><LabelPill color={statusColors[t.status]}>{t.status}</LabelPill>{t.priority==='urgent'&&<LabelPill color="red">urgent</LabelPill>}</div></div><ChevronRight size={17} className="ticket-chevron"/></button> })}</div>
}

function Breakdown({ tickets, field }: { tickets: Ticket[]; field: 'category' | 'channel' }) {
  const data = Object.entries(tickets.reduce<Record<string,number>>((acc,t) => { const key=t[field]; acc[key]=(acc[key]||0)+1; return acc }, {})).sort((a,b)=>b[1]-a[1])
  const max = Math.max(1, ...data.map(([,n])=>n))
  if (!data.length) return <div className="empty-list"><p>No data yet.</p></div>
  return <div className="breakdown-list">{data.map(([name,count],i) => <div key={name} className="breakdown-row"><div className="breakdown-label"><span>{name}</span><strong>{count}</strong></div><div className="breakdown-track"><div className={`breakdown-fill breakdown-${i%4}`} style={{width:`${count/max*100}%`}}/></div></div>)}</div>
}
export default App

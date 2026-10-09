// All network calls go through one module. VITE_API_URL is optional for deployment.
// IMPORTANT: Never put GROQ_API_KEY in Vite environment variables.
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export type Status = 'open' | 'pending' | 'resolved'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Channel = 'email' | 'chat' | 'web'
export type Ticket = {
  id: string
  customer: string
  email: string
  subject: string
  message: string
  category: string
  priority: Priority
  status: Status
  channel: Channel
  created_at: string
  updated_at: string
  ai_reply: string | null
  ai_provider: 'groq' | 'demo' | null
}
export type Metrics = {
  total: number
  open: number
  pending: number
  resolved: number
  urgent: number
  drafts: number
}
export type Knowledge = { id: string; title: string; category: string; content: string }
export type Draft = {
  reply: string
  category: string
  priority: Priority
  provider: 'groq' | 'demo'
  source: { id: string; title: string } | null
}
export type TicketCreate = {
  customer: string
  email: string
  subject: string
  message: string
  channel: Channel
}
export type Health = { status: string; ai_mode: 'groq' | 'demo'; version: string }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Cannot reach the backend. Start FastAPI on port 8000 and refresh.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const detail = data?.detail
    throw new Error(typeof detail === 'string' ? detail : `Request failed (HTTP ${response.status}).`)
  }
  return response.json() as Promise<T>
}

export const api = {
  health: () => request<Health>('/api/health'),
  tickets: () => request<Ticket[]>('/api/tickets'),
  metrics: () => request<Metrics>('/api/metrics'),
  knowledge: () => request<Knowledge[]>('/api/knowledge'),
  create: (body: TicketCreate) => request<Ticket>('/api/tickets', { method: 'POST', body: JSON.stringify(body) }),
  status: (id: string, status: Status) =>
    request<Ticket>(`/api/tickets/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  draft: (id: string) => request<Draft>(`/api/tickets/${encodeURIComponent(id)}/draft`, { method: 'POST' }),
}

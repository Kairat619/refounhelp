// Base URL of the FastAPI backend. Empty = same origin (Vite proxy in dev, nginx in Docker).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function clientId() {
  let id = localStorage.getItem('rh_client_id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)
    localStorage.setItem('rh_client_id', id)
  }
  return id
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const d = data.detail
    const msg = Array.isArray(d) ? d.map((e) => e.msg).join('; ') : d || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}

export const api = {
  plans: () => request('/plans'),
  issues: () => request('/issues'),
  merchants: (q = '', category = '') =>
    request(`/merchants?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`),
  merchant: (id) => request(`/merchants/${id}`),
  check: (body) => request('/check', { method: 'POST', body }),
  me: () => request('/me'),
  setPlus: (active) => request('/me/plus', { method: 'POST', body: { active } }),
  createCase: (body) => request('/cases', { method: 'POST', body }),
  cases: () => request('/cases'),
  case: (id) => request(`/cases/${id}`),
  advance: (id) => request(`/cases/${id}/advance`, { method: 'POST' }),
  financeDefaults: () => request('/finance/defaults'),
  projection: (p) => request(`/finance/projection?${new URLSearchParams(p)}`),
}

export const kzt = (n) =>
  n == null ? '—' : `${Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ')} ₸`

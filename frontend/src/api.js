// Base URL of the FastAPI backend. Empty = same origin (Vite proxy in dev, nginx in Docker).
// Tolerates common mistakes: missing "https://", trailing slash, or a trailing "/api".
function normaliseBase(raw) {
  let url = (raw || '').trim().replace(/\/+$/, '').replace(/\/api$/, '')
  if (url && !/^https?:\/\//i.test(url)) {
    url = `${/^(localhost|127\.0\.0\.1)(:|$)/.test(url) ? 'http' : 'https'}://${url}`
  }
  return url
}
const BASE = normaliseBase(import.meta.env.VITE_API_URL)

function clientId() {
  let id = localStorage.getItem('rh_client_id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)
    localStorage.setItem('rh_client_id', id)
  }
  return id
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId() },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(`Cannot reach the RefundHelp API at ${BASE || window.location.origin}. Check that the backend is running and CORS allows this site.`)
  }
  // If the API URL is wrong (e.g. VITE_API_URL not set on Vercel), the request
  // hits the SPA and returns index.html instead of JSON — fail loudly.
  if (!(res.headers.get('content-type') || '').includes('application/json')) {
    throw new Error(
      BASE
        ? `The API at ${BASE} did not return JSON (status ${res.status}). Check the VITE_API_URL value.`
        : 'API not configured: set VITE_API_URL to the backend URL in Vercel and redeploy.',
    )
  }
  const data = await res.json()
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

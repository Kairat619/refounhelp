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

import { getLang } from './i18n.jsx'
import en from './locales/en.js'
import ru from './locales/ru.js'
import kk from './locales/kk.js'

const MSG = { en, ru, kk }
const msg = (key, vars = {}) =>
  MSG[getLang()].common[key].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')

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
      headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId(), 'Accept-Language': getLang() },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(msg('apiUnreachable', { base: BASE || window.location.origin }))
  }
  // If the API URL is wrong (e.g. VITE_API_URL not set on Vercel), the request
  // hits the SPA and returns index.html instead of JSON — fail loudly.
  if (!(res.headers.get('content-type') || '').includes('application/json')) {
    throw new Error(
      BASE ? msg('apiNotJson', { base: BASE, status: res.status }) : msg('apiNotConfigured'),
    )
  }
  const data = await res.json()
  if (!res.ok) {
    const d = data.detail
    const text = Array.isArray(d) ? d.map((e) => e.msg).join('; ') : d || msg('requestFailed', { status: res.status })
    throw new Error(text)
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

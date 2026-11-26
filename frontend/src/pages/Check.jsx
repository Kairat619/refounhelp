import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CalendarClock, CheckCircle2, Handshake, Lightbulb, Sparkles } from 'lucide-react'
import { api, kzt } from '../api'
import { CopyButton, ErrorBox, PageHeader } from '../components/ui'

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)

export default function Check() {
  const [params] = useSearchParams()
  const [merchants, setMerchants] = useState([])
  const [issues, setIssues] = useState([])
  const [form, setForm] = useState({
    merchant_id: params.get('merchant') || '',
    issue_type: 'wrong_item',
    purchase_date: daysAgo(10),
    amount: 45000,
    order_id: '',
    details: '',
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.merchants().then((d) => {
      setMerchants(d.items)
      setForm((f) => ({ ...f, merchant_id: f.merchant_id || d.items[0]?.id }))
    }).catch(setError)
    api.issues().then(setIssues).catch(setError)
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await api.check({ ...form, amount: Number(form.amount) })
      setResult(r)
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (err) { setError(err) } finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader eyebrow="Step 1 · Free" title="Check my refund">
        Tell us what happened. We compare your purchase date with the company's rules, tell you your deadline and write the refund message for you.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <div>
            <label className="label">Store or service</label>
            <select className="input" value={form.merchant_id} onChange={set('merchant_id')}>
              {merchants.map((m) => <option key={m.id} value={m.id}>{m.logo} {m.name} · {m.category}</option>)}
            </select>
          </div>
          <div>
            <label className="label">What went wrong?</label>
            <select className="input" value={form.issue_type} onChange={set('issue_type')}>
              {issues.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Purchase date</label>
              <input type="date" className="input" max={today()} value={form.purchase_date} onChange={set('purchase_date')} required />
            </div>
            <div>
              <label className="label">Amount (₸)</label>
              <input type="number" min="1" className="input" value={form.amount} onChange={set('amount')} required />
            </div>
          </div>
          <div>
            <label className="label">Order number <span className="font-normal text-slate-400">(optional)</span></label>
            <input className="input" placeholder="e.g. 48213977" value={form.order_id} onChange={set('order_id')} />
          </div>
          <div>
            <label className="label">Details <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea rows={3} className="input" placeholder="A blue case arrived instead of black…" value={form.details} onChange={set('details')} />
          </div>
          <ErrorBox error={error} />
          <button className="btn-primary w-full" disabled={loading || !form.merchant_id}>{loading ? 'Checking…' : 'Check my refund'}</button>
        </form>

        <div id="result">
          {!result ? (
            <div className="card grid h-full min-h-72 place-items-center p-10 text-center text-slate-500">
              <div>
                <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
                <p className="mt-3 font-medium text-slate-700">Your result will appear here</p>
                <p className="mt-1 text-sm">Deadline, recommendation and a ready message in English and Russian.</p>
              </div>
            </div>
          ) : <Result r={result} form={form} />}
        </div>
      </div>
    </>
  )
}

function Result({ r, form }) {
  const [lang, setLang] = useState('en')
  const ok = r.within_deadline
  return (
    <div className="space-y-6">
      <div className={`card border-l-4 p-6 ${ok ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
        <div className="flex items-start gap-3">
          {ok ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />}
          <div>
            <p className="text-lg font-semibold text-ink">
              {ok ? `You are on time — ${r.days_left} day${r.days_left === 1 ? '' : 's'} left` : `Deadline passed ${-r.days_left} days ago`}
            </p>
            <p className="mt-1 text-sm text-slate-600">{r.message}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <CalendarClock className="h-4 w-4" /> {r.window_days}-day {r.rule_basis} · deadline {new Date(r.deadline).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Your refund message</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-300 p-0.5 text-sm">
              {[['en', 'English'], ['ru', 'Русский']].map(([k, l]) => (
                <button key={k} onClick={() => setLang(k)} className={`rounded-lg px-3 py-1 font-medium ${lang === k ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{l}</button>
              ))}
            </div>
            <CopyButton text={r.letters[lang]} />
          </div>
        </div>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-700">{r.letters[lang]}</pre>
        <p className="mt-3 text-sm text-slate-500">Send it via: <span className="text-slate-700">{r.merchant.contact}</span> · usual refund time {r.merchant.refund_time}</p>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {r.merchant.tips.map((t) => <li key={t} className="flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{t}</li>)}
        </ul>
      </div>

      <Escalate r={r} form={form} />
    </div>
  )
}

function Escalate({ r, form }) {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [authorised, setAuthorised] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const s = r.specialist

  if (!s.available) {
    return (
      <div className="card p-6">
        <p className="font-semibold text-ink">Specialist help is for orders above {kzt(s.min_order)}</p>
        <p className="mt-1 text-sm text-slate-600">For smaller amounts the free message above is the fastest route — and it keeps the service affordable for everyone.</p>
      </div>
    )
  }

  async function go(e) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const c = await api.createCase({ ...form, amount: Number(form.amount), customer_name: name, authorised })
      nav(`/cases/${c.id}`)
    } catch (err) { setError(err); setBusy(false) }
  }

  return (
    <form onSubmit={go} className="card overflow-hidden">
      <div className="bg-brand-900 p-6 text-white">
        <div className="flex items-center gap-2"><Handshake className="h-5 w-5" /><p className="font-semibold">Company not cooperating? Hand it to a specialist</p></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-brand-100">Case type</p><p className="font-semibold capitalize">{s.complexity}</p></div>
          <div><p className="text-xs text-brand-100">Success fee</p><p className="font-semibold">{s.covered_by_plus ? 'Covered by Plus' : `${Math.round(s.fee_rate * 100)}%`}</p></div>
          <div><p className="text-xs text-brand-100">You pay if we win</p><p className="font-semibold">{kzt(s.estimated_fee)}</p></div>
        </div>
        <p className="mt-3 text-xs text-brand-100">If the refund is not approved, you pay nothing.</p>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="label">Your name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-600" checked={authorised} onChange={(e) => setAuthorised(e.target.checked)} />
          I authorise RefundHelp to contact {r.merchant.name} on my behalf about this order, and I accept the success-fee terms shown above.
        </label>
        <ErrorBox error={error} />
        <button className="btn-primary" disabled={busy || !authorised || !name}>{busy ? 'Creating case…' : 'Escalate to a Refund Specialist'}</button>
      </div>
    </form>
  )
}

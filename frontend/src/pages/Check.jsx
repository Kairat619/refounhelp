import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CalendarClock, CheckCircle2, Handshake, Lightbulb, Sparkles } from 'lucide-react'
import { api, kzt } from '../api'
import { LANGUAGES, useI18n } from '../i18n.jsx'
import { CopyButton, ErrorBox, PageHeader } from '../components/ui'

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)

export default function Check() {
  const { t, lang } = useI18n()
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
  const checkedForm = useRef(null)

  useEffect(() => {
    api.merchants().then((d) => {
      const items = d?.items ?? []
      setMerchants(items)
      setForm((f) => ({ ...f, merchant_id: f.merchant_id || items[0]?.id || '' }))
    }).catch(setError)
    api.issues().then(setIssues).catch(setError)
    // Re-run the last check so the result follows the selected language.
    if (checkedForm.current) runCheck(checkedForm.current)
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function runCheck(f) {
    setLoading(true); setError(null)
    try {
      const r = await api.check({ ...f, amount: Number(f.amount) })
      checkedForm.current = f
      setResult(r)
      return true
    } catch (err) { setError(err); return false } finally { setLoading(false) }
  }

  async function submit(e) {
    e.preventDefault()
    if (await runCheck(form)) {
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  const opt = <span className="font-normal text-slate-400">{t('check.optional')}</span>

  return (
    <>
      <PageHeader eyebrow={t('check.eyebrow')} title={t('check.title')}>{t('check.sub')}</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <div>
            <label className="label">{t('check.store')}</label>
            <select className="input" value={form.merchant_id} onChange={set('merchant_id')}>
              {merchants.map((m) => <option key={m.id} value={m.id}>{m.logo} {m.name} · {m.category_label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('check.issue')}</label>
            <select className="input" value={form.issue_type} onChange={set('issue_type')}>
              {issues.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('check.date')}</label>
              <input type="date" className="input" max={today()} value={form.purchase_date} onChange={set('purchase_date')} required />
            </div>
            <div>
              <label className="label">{t('check.amount')}</label>
              <input type="number" min="1" className="input" value={form.amount} onChange={set('amount')} required />
            </div>
          </div>
          <div>
            <label className="label">{t('check.order')} {opt}</label>
            <input className="input" placeholder={t('check.orderPh')} value={form.order_id} onChange={set('order_id')} />
          </div>
          <div>
            <label className="label">{t('check.details')} {opt}</label>
            <textarea rows={3} className="input" placeholder={t('check.detailsPh')} value={form.details} onChange={set('details')} />
          </div>
          <ErrorBox error={error} />
          <button className="btn-primary w-full" disabled={loading || !form.merchant_id}>{loading ? t('check.checking') : t('check.submit')}</button>
        </form>

        <div id="result">
          {!result ? (
            <div className="card grid h-full min-h-72 place-items-center p-10 text-center text-slate-500">
              <div>
                <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
                <p className="mt-3 font-medium text-slate-700">{t('check.emptyTitle')}</p>
                <p className="mt-1 text-sm">{t('check.emptySub')}</p>
              </div>
            </div>
          ) : <Result r={result} form={checkedForm.current || form} />}
        </div>
      </div>
    </>
  )
}

function Result({ r, form }) {
  const { t, lang, locale } = useI18n()
  const [letterLang, setLetterLang] = useState(lang)
  useEffect(() => setLetterLang(lang), [lang])
  const ok = r.within_deadline
  return (
    <div className="space-y-6">
      <div className={`card border-l-4 p-6 ${ok ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
        <div className="flex items-start gap-3">
          {ok ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />}
          <div>
            <p className="text-lg font-semibold text-ink">
              {ok ? t('check.onTime', { n: r.days_left }) : t('check.late', { n: -r.days_left })}
            </p>
            <p className="mt-1 text-sm text-slate-600">{r.message}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <CalendarClock className="h-4 w-4 shrink-0" />
              {t('check.ruleLine', { basis: r.rule_basis, days: r.window_days, date: new Date(r.deadline).toLocaleDateString(locale) })}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">{t('check.letterTitle')}</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-300 p-0.5 text-sm">
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setLetterLang(l.code)} className={`rounded-lg px-3 py-1 font-medium ${letterLang === l.code ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>{l.name}</button>
              ))}
            </div>
            <CopyButton text={r.letters[letterLang]} />
          </div>
        </div>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-700">{r.letters[letterLang]}</pre>
        <p className="mt-3 text-sm text-slate-500">{t('check.sendVia')} <span className="text-slate-700">{r.merchant.contact}</span> · {t('check.usualTime')} {r.merchant.refund_time}</p>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {r.merchant.tips.map((tip) => <li key={tip} className="flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{tip}</li>)}
        </ul>
      </div>

      <Escalate r={r} form={form} />
    </div>
  )
}

function Escalate({ r, form }) {
  const { t } = useI18n()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [authorised, setAuthorised] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const s = r.specialist

  if (!s.available) {
    return (
      <div className="card p-6">
        <p className="font-semibold text-ink">{t('check.minTitle', { min: kzt(s.min_order) })}</p>
        <p className="mt-1 text-sm text-slate-600">{t('check.minSub')}</p>
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
        <div className="flex items-center gap-2"><Handshake className="h-5 w-5 shrink-0" /><p className="font-semibold">{t('check.escTitle')}</p></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-brand-100">{t('check.caseType')}</p><p className="font-semibold">{t(`check.complexity.${s.complexity}`)}</p></div>
          <div><p className="text-xs text-brand-100">{t('check.fee')}</p><p className="font-semibold">{s.covered_by_plus ? t('check.coveredPlus') : `${Math.round(s.fee_rate * 100)}%`}</p></div>
          <div><p className="text-xs text-brand-100">{t('check.youPay')}</p><p className="font-semibold">{kzt(s.estimated_fee)}</p></div>
        </div>
        <p className="mt-3 text-xs text-brand-100">{t('check.ifNot')}</p>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="label">{t('check.name')}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-600" checked={authorised} onChange={(e) => setAuthorised(e.target.checked)} />
          {t('check.authorise', { name: r.merchant.name })}
        </label>
        <ErrorBox error={error} />
        <button className="btn-primary" disabled={busy || !authorised || !name}>{busy ? t('check.creating') : t('check.escalate')}</button>
      </div>
    </form>
  )
}

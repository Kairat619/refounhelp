import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FastForward, ShieldCheck } from 'lucide-react'
import { api, kzt } from '../api'
import { useI18n } from '../i18n.jsx'
import { ErrorBox, Spinner, StatusChip } from '../components/ui'

export default function CaseDetail() {
  const { t, lang, locale } = useI18n()
  const { id } = useParams()
  const [c, setC] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setError(null); api.case(id).then(setC).catch(setError) }, [id, lang])

  async function advance() {
    setBusy(true); setError(null)
    try { setC(await api.advance(id)) } catch (e) { setError(e) } finally { setBusy(false) }
  }

  if (error && !c) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} /></div>
  if (!c) return <Spinner />
  const closed = Boolean(c.outcome)
  const pending = t('caseDetail.pending').slice(c.timeline.length)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> {t('caseDetail.back')}</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{c.merchant_logo}</span>
          <div>
            <h1 className="text-2xl font-bold text-ink">{c.id}</h1>
            <p className="text-sm text-slate-500">{c.merchant_name} · {c.issue_label}</p>
          </div>
        </div>
        <StatusChip status={c.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          [t('caseDetail.claimed'), kzt(c.amount)],
          [t('caseDetail.fee'), c.fee_waived ? t('caseDetail.plusZero') : `${Math.round(c.fee_rate * 100)}% (${t(`check.complexity.${c.complexity}`).toLowerCase()})`],
          [t('caseDetail.refunded'), closed ? kzt(c.refunded_amount) : '—'],
          [t('caseDetail.feeCharged'), closed ? kzt(c.fee_charged) : t('caseDetail.onlyIfWin')],
        ].map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 font-semibold text-ink">{v}</p></div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <h2 className="font-semibold text-ink">{t('caseDetail.timeline')}</h2>
          <ol className="mt-5 space-y-5 border-l-2 border-slate-200 pl-6">
            {c.timeline.map((e, i) => {
              const color = e.status === 'resolved' ? 'bg-emerald-500' : e.status === 'closed' ? 'bg-rose-500' : 'bg-brand-600'
              return (
                <li key={i} className="relative">
                  <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${color}`} />
                  <p className="font-medium text-ink">{e.title}</p>
                  <p className="text-sm text-slate-600">{e.text}</p>
                  <p className="text-xs text-slate-400">{new Date(e.at).toLocaleString(locale)}</p>
                </li>
              )
            })}
            {!closed && pending.map((p) => (
              <li key={p} className="relative opacity-50">
                <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="font-medium text-slate-500">{p}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="card border-dashed border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-800">{t('caseDetail.demoTitle')}</p>
            <p className="mt-1 text-xs text-amber-700">{t('caseDetail.demoText')}</p>
            <button onClick={advance} disabled={busy || closed} className="btn mt-3 w-full bg-amber-500 text-white hover:bg-amber-600">
              <FastForward className="h-4 w-4" /> {closed ? t('caseDetail.closed') : busy ? t('caseDetail.working') : t('caseDetail.next')}
            </button>
            <div className="mt-2"><ErrorBox error={error} /></div>
          </div>
          <div className="card p-5 text-sm text-slate-600">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <p className="mt-2">{t('caseDetail.mask')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

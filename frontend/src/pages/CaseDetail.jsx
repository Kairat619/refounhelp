import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FastForward, ShieldCheck } from 'lucide-react'
import { api, kzt } from '../api'
import { ErrorBox, Spinner, StatusChip } from '../components/ui'

const ALL_STEPS = ['Case submitted', 'Authorisation signed', 'Company contacted', 'Negotiating', 'Result']

export default function CaseDetail() {
  const { id } = useParams()
  const [c, setC] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.case(id).then(setC).catch(setError) }, [id])

  async function advance() {
    setBusy(true); setError(null)
    try { setC(await api.advance(id)) } catch (e) { setError(e) } finally { setBusy(false) }
  }

  if (error && !c) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} /></div>
  if (!c) return <Spinner />
  const closed = Boolean(c.outcome)
  const pending = ALL_STEPS.slice(c.timeline.length)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> My cases</Link>
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
          ['Claimed', kzt(c.amount)],
          ['Success fee', c.fee_waived ? 'Plus – 0%' : `${Math.round(c.fee_rate * 100)}% (${c.complexity})`],
          ['Refunded', closed ? kzt(c.refunded_amount) : '—'],
          ['Fee charged', closed ? kzt(c.fee_charged) : 'Only if we win'],
        ].map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 font-semibold text-ink">{v}</p></div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <h2 className="font-semibold text-ink">Case timeline</h2>
          <ol className="mt-5 space-y-5 border-l-2 border-slate-200 pl-6">
            {c.timeline.map((t, i) => {
              const color = t.status === 'resolved' ? 'bg-emerald-500' : t.status === 'closed' ? 'bg-rose-500' : 'bg-brand-600'
              return (
                <li key={i} className="relative">
                  <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${color}`} />
                  <p className="font-medium text-ink">{t.title}</p>
                  <p className="text-sm text-slate-600">{t.text}</p>
                  <p className="text-xs text-slate-400">{new Date(t.at).toLocaleString('en-GB')}</p>
                </li>
              )
            })}
            {!closed && pending.map((t) => (
              <li key={t} className="relative opacity-50">
                <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="font-medium text-slate-500">{t}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="card border-dashed border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-800">Demo control</p>
            <p className="mt-1 text-xs text-amber-700">Simulates the specialist's work. The final step succeeds about 80% of the time, matching the target success rate in the business model.</p>
            <button onClick={advance} disabled={busy || closed} className="btn mt-3 w-full bg-amber-500 text-white hover:bg-amber-600">
              <FastForward className="h-4 w-4" /> {closed ? 'Case closed' : busy ? 'Working…' : 'Next step'}
            </button>
            <div className="mt-2"><ErrorBox error={error} /></div>
          </div>
          <div className="card p-5 text-sm text-slate-600">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <p className="mt-2">Card numbers on uploaded receipts are masked automatically before any specialist sees them.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

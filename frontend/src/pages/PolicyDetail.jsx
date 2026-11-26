import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lightbulb, MessageSquare } from 'lucide-react'
import { api } from '../api'
import { Difficulty, ErrorBox, Spinner } from '../components/ui'

export default function PolicyDetail() {
  const { id } = useParams()
  const [m, setM] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => { api.merchant(id).then(setM).catch(setError) }, [id])

  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} /></div>
  if (!m) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/policies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> All policies</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{m.logo}</span>
          <div>
            <h1 className="text-3xl font-bold text-ink">{m.name}</h1>
            <p className="text-slate-500">{m.category}</p>
          </div>
        </div>
        <Difficulty level={m.difficulty} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ['Standard return', `${m.return_days} days`],
          ['Defect / wrong item', `${m.defect_days} days`],
          ['Buyer protection', `${m.protection_days} days`],
          ['Refund time', m.refund_time],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="mt-1 font-semibold text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-ink">Rules in plain language</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {m.conditions.map((c) => <li key={c} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{c}</li>)}
          </ul>
          <p className="mt-5 text-sm text-slate-500"><span className="font-medium text-slate-700">Refund method:</span> {m.refund_method}</p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-ink">Specialist tips</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {m.tips.map((t) => <li key={t} className="flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{t}</li>)}
          </ul>
          <p className="mt-5 flex gap-2 text-sm text-slate-500"><MessageSquare className="h-4 w-4 shrink-0" /> {m.contact}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-50 p-6 md:flex-row md:items-center">
        <div>
          <p className="font-semibold text-ink">Have a problem with {m.name}?</p>
          <p className="text-sm text-slate-600">Check your deadline and get a ready refund message.</p>
        </div>
        <Link to={`/check?merchant=${m.id}`} className="btn-primary">Check my refund</Link>
      </div>
    </div>
  )
}

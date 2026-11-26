import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Inbox } from 'lucide-react'
import { api, kzt } from '../api'
import { ErrorBox, PageHeader, Spinner, StatusChip } from '../components/ui'

export default function Cases() {
  const [cases, setCases] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => { api.cases().then(setCases).catch(setError) }, [])

  const recovered = cases?.reduce((s, c) => s + c.refunded_amount, 0) || 0
  const fees = cases?.reduce((s, c) => s + c.fee_charged, 0) || 0

  return (
    <>
      <PageHeader eyebrow="Specialist Service" title="My cases">Follow every escalated case step by step.</PageHeader>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorBox error={error} />
        {!cases && !error && <Spinner />}
        {cases && cases.length === 0 && (
          <div className="card p-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-medium text-slate-700">No cases yet</p>
            <p className="mt-1 text-sm text-slate-500">Check a refund first, then escalate it if the company does not cooperate.</p>
            <Link to="/check" className="btn-primary mt-5">Check my refund</Link>
          </div>
        )}
        {cases && cases.length > 0 && (
          <>
            <div className="mb-6 grid grid-cols-3 gap-4">
              {[['Cases', cases.length], ['Recovered', kzt(recovered)], ['Fees paid', kzt(fees)]].map(([k, v]) => (
                <div key={k} className="card p-4"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-xl font-bold text-ink">{v}</p></div>
              ))}
            </div>
            <div className="space-y-3">
              {cases.map((c) => (
                <Link key={c.id} to={`/cases/${c.id}`} className="card flex items-center gap-4 p-4 transition hover:border-brand-500">
                  <span className="text-3xl">{c.merchant_logo}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{c.id}</p><StatusChip status={c.status} />
                    </div>
                    <p className="truncate text-sm text-slate-500">{c.merchant_name} · {c.issue_label}</p>
                  </div>
                  <p className="hidden font-semibold text-ink sm:block">{kzt(c.amount)}</p>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { api } from '../api'
import { ErrorBox, PageHeader, Spinner } from '../components/ui'

export default function Pricing() {
  const [plans, setPlans] = useState(null)
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.plans().then((d) => setPlans(d.plans)).catch(setError)
    api.me().then(setMe).catch(setError)
  }, [])

  async function togglePlus() {
    try { setMe(await api.setPlus(!me.plus)) } catch (e) { setError(e) }
  }

  return (
    <>
      <PageHeader eyebrow="Pricing" title="Pay only when you get your money back">
        Start free. Bring in a specialist when a company refuses. Subscribe if you shop online often.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ErrorBox error={error} />
        {!plans ? <Spinner /> : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const isPlus = p.id === 'plus'
              return (
                <div key={p.id} className={`card relative flex flex-col p-6 ${p.highlight ? 'border-2 border-brand-600 shadow-lg' : ''}`}>
                  {p.highlight && <span className="chip absolute -top-3 left-6 bg-brand-600 text-white">Most used</span>}
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="mt-3 text-2xl font-bold text-ink">{p.price}</p>
                  {p.note && <p className="mt-1 text-sm text-slate-500">{p.note}</p>}
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                    {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{f}</li>)}
                  </ul>
                  {isPlus ? (
                    <div className="mt-6">
                      <button onClick={togglePlus} disabled={!me} className={me?.plus ? 'btn-ghost w-full' : 'btn-primary w-full'}>
                        {me?.plus ? 'Cancel Plus (demo)' : 'Activate Plus (demo)'}
                      </button>
                      {me?.plus && <p className="mt-2 text-center text-xs text-emerald-700">Plus active · {me.plus_cases_used}/{me.plus_cases_limit} fee-free cases used this month</p>}
                      <p className="mt-2 text-center text-xs text-slate-400">No payment is taken in this demo.</p>
                    </div>
                  ) : (
                    <Link to="/check" className={`${p.highlight ? 'btn-primary' : 'btn-ghost'} mt-6 w-full`}>
                      {p.id === 'free' ? 'Start for free' : 'Check my case'}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="card mt-10 p-6">
          <h2 className="font-semibold text-ink">How the success fee is set</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
            <p><span className="font-semibold text-ink">15% — standard case.</span> A clear rule was broken and you are inside the deadline.</p>
            <p><span className="font-semibold text-ink">20% — complex case.</span> The company often refuses, the deadline has passed, or a card chargeback is needed.</p>
            <p><span className="font-semibold text-ink">0% — no refund.</span> If the company refuses after all escalation steps, you pay nothing.</p>
          </div>
        </div>
      </div>
    </>
  )
}

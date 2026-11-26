import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { api } from '../api'
import { Difficulty, ErrorBox, PageHeader, Spinner } from '../components/ui'

export default function Policies() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      api.merchants(q, category).then(setData).catch(setError)
    }, 200)
    return () => clearTimeout(t)
  }, [q, category])

  return (
    <>
      <PageHeader eyebrow="Free Self-Service" title="Return policy database">
        Clear rules for stores, airlines, hotels and subscriptions — return windows, conditions and how to contact them.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search a store or service…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {['', ...(data?.categories || [])].map((c) => (
              <button
                key={c || 'all'}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${category === c ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                {c || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6"><ErrorBox error={error} /></div>
        {!data && !error && <Spinner />}
        {data && (
          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((m) => (
              <Link key={m.id} to={`/policies/${m.id}`} className="card group p-5 transition hover:border-brand-500 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.logo}</span>
                    <div>
                      <p className="font-semibold text-ink">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.category}</p>
                    </div>
                  </div>
                  <Difficulty level={m.difficulty} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">Standard return</dt>
                    <dd className="font-semibold text-ink">{m.return_days} days</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">Defects / wrong item</dt>
                    <dd className="font-semibold text-ink">{m.defect_days} days</dd>
                  </div>
                </dl>
                <p className="mt-4 flex items-center text-sm font-medium text-brand-700">
                  View rules <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
            {data.items.length === 0 && <p className="text-slate-500">No results. Try another name.</p>}
          </div>
        )}
      </div>
    </>
  )
}

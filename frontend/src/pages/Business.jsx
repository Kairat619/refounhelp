import { useEffect, useState } from 'react'
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { RotateCcw } from 'lucide-react'
import { api, kzt } from '../api'
import { ErrorBox, PageHeader, Spinner } from '../components/ui'

const SLIDERS = [
  ['cases', 'Successful paid cases / month', 0, 1500, 10, (v) => v],
  ['avg_refund', 'Average refund', 10000, 100000, 1000, kzt],
  ['fee_rate', 'Average success fee', 0.15, 0.2, 0.005, (v) => `${(v * 100).toFixed(1)}%`],
  ['subscribers', 'Plus subscribers', 0, 2000, 10, (v) => v],
  ['variable_cost', 'Variable cost per case', 0, 8000, 100, kzt],
  ['fixed_costs', 'Fixed costs / month', 1000000, 8000000, 100000, kzt],
]

const short = (n) => `${(n / 1e6).toFixed(1)}M`

export default function Business() {
  const [defaults, setDefaults] = useState(null)
  const [p, setP] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.financeDefaults().then((d) => {
      setDefaults(d)
      setP({ cases: d.cases, avg_refund: d.avg_refund, fee_rate: d.fee_rate, subscribers: d.subscribers,
        plus_price: d.plus_price, variable_cost: d.variable_cost, fixed_costs: d.fixed_costs })
    }).catch(setError)
  }, [])

  useEffect(() => {
    if (!p) return
    const t = setTimeout(() => api.projection(p).then(setData).catch(setError), 150)
    return () => clearTimeout(t)
  }, [p])

  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} /></div>
  if (!p || !data) return <Spinner />
  const c = data.current
  const positive = c.operating_result >= 0

  return (
    <>
      <PageHeader eyebrow="For investors & reviewers" title="Business model dashboard">
        A live version of the financial analysis from the RefundHelp report. Defaults are the report's planning assumptions — move the sliders to test them.
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Monthly revenue" value={kzt(c.total_revenue)} sub={`${kzt(c.fee_revenue)} fees + ${kzt(c.subscription_revenue)} Plus`} />
          <Kpi label="Operating result (before tax)" value={kzt(c.operating_result)} tone={positive ? 'good' : 'bad'} sub={positive ? 'Profit' : 'Loss'} />
          <Kpi label="Break-even volume" value={c.break_even_cases != null ? `${c.break_even_cases} cases` : 'Not reachable'} sub={c.break_even_per_day != null ? `≈ ${c.break_even_per_day} successful cases per day` : 'Fee per case is below its cost'} />
          <Kpi label="Payback of 20M ₸ investment" value={c.payback_months ? `${c.payback_months} months` : '—'} sub={c.payback_months ? `≈ ${(c.payback_months / 12).toFixed(1)} years` : 'Needs a monthly profit'} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Controls */}
          <div className="card h-fit space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">Assumptions</h2>
              <button
                className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                onClick={() => setP({ cases: defaults.cases, avg_refund: defaults.avg_refund, fee_rate: defaults.fee_rate, subscribers: defaults.subscribers, plus_price: defaults.plus_price, variable_cost: defaults.variable_cost, fixed_costs: defaults.fixed_costs })}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Report defaults
              </button>
            </div>
            {SLIDERS.map(([k, label, min, max, step, fmt]) => (
              <div key={k}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-ink">{fmt(p[k])}</span>
                </div>
                <input type="range" className="mt-2 w-full accent-brand-600" min={min} max={max} step={step} value={p[k]}
                  onChange={(e) => setP({ ...p, [k]: Number(e.target.value) })} />
              </div>
            ))}
            <p className="text-xs text-slate-400">Plus price fixed at {kzt(p.plus_price)} / month.</p>
          </div>

          {/* Chart */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink">Monthly operating result vs. case volume</h2>
            <p className="text-sm text-slate-500">The line crosses zero at the break-even point.</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="cases" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tickFormatter={short} tick={{ fontSize: 12 }} stroke="#94a3b8" width={48} />
                  <Tooltip formatter={(v) => [kzt(v), 'Operating result']} labelFormatter={(l) => `${l} cases / month`} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  {c.break_even_cases != null && <ReferenceLine x={Math.round(c.break_even_cases / 50) * 50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'break-even', fill: '#b45309', fontSize: 12, position: 'top' }} />}
                  <ReferenceLine x={Math.round(p.cases / 50) * 50} stroke="#0f172a" strokeDasharray="2 2" />
                  <Area type="monotone" dataKey="result" stroke="#0d9488" strokeWidth={2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Scenario table */}
          <div className="card overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="font-semibold text-ink">Scenario table (report section 8.3)</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr><th className="px-6 py-2 font-medium">KZT / month</th>{data.scenarios.map((s) => <th key={s.cases} className="px-3 py-2 text-right font-medium">{s.cases} cases</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Success-fee revenue', 'fee_revenue'],
                  ['Subscription revenue', 'subscription_revenue'],
                  ['Total revenue', 'total_revenue', true],
                  ['Variable case costs', 'variable_costs', false, true],
                  ['Fixed operating costs', 'fixed_costs', false, true],
                  ['Operating result', 'operating_result', true],
                ].map(([label, key, bold, neg]) => (
                  <tr key={key} className={bold ? 'font-semibold text-ink' : 'text-slate-600'}>
                    <td className="px-6 py-2">{label}</td>
                    {data.scenarios.map((s) => {
                      const v = neg ? -s[key] : s[key]
                      return <td key={s.cases} className={`px-3 py-2 text-right tabular-nums ${key === 'operating_result' ? (v < 0 ? 'text-rose-600' : 'text-emerald-600') : ''}`}>{Math.round(v).toLocaleString('en-US')}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unit economics + funnel */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink">Unit economics & operations</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Mini label="Fee per case" value={kzt(c.fee_per_case)} />
              <Mini label="Variable cost" value={kzt(p.variable_cost)} />
              <Mini label="Contribution" value={kzt(c.contribution_per_case)} />
            </div>
            <h3 className="mt-6 text-sm font-semibold text-ink">Customer funnel needed</h3>
            <p className="text-xs text-slate-500">70% self-serve · 80% specialist success rate</p>
            <div className="mt-3 space-y-2">
              {[
                ['Active users with a problem', c.funnel.active_users, 100],
                ['Escalated to specialists (30%)', c.funnel.escalated_cases, 30],
                ['Successful paid cases (80%)', c.funnel.successful_cases, 24],
              ].map(([label, v, w]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold tabular-nums text-ink">{v.toLocaleString('en-US')}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${w}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Specialist workload at 35 min/case: <span className="font-semibold text-ink">{c.specialist_hours} h/month</span> ≈ {c.specialist_fte} full-time specialists.
              Max. customer acquisition cost: <span className="font-semibold text-ink">{kzt(defaults.targets.max_cac)}</span>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Kpi({ label, value, sub, tone }) {
  const color = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-rose-600' : 'text-ink'
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-ink">{value}</p>
    </div>
  )
}

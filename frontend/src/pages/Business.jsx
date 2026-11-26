import { useEffect, useState } from 'react'
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { RotateCcw } from 'lucide-react'
import { api, kzt } from '../api'
import { useI18n } from '../i18n.jsx'
import { ErrorBox, PageHeader, Spinner } from '../components/ui'

const SLIDERS = [
  ['cases', 0, 1500, 10, (v) => v],
  ['avg_refund', 10000, 100000, 1000, kzt],
  ['fee_rate', 0.15, 0.2, 0.005, (v) => `${(v * 100).toFixed(1)}%`],
  ['subscribers', 0, 2000, 10, (v) => v],
  ['variable_cost', 0, 8000, 100, kzt],
  ['fixed_costs', 1000000, 8000000, 100000, kzt],
]

const short = (n) => `${(n / 1e6).toFixed(1)}M`

export default function Business() {
  const { t, lang } = useI18n()
  const num = (v) => Math.round(v).toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU').replace(/[\u00a0\u202f]/g, ' ')
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
    const timer = setTimeout(() => api.projection(p).then(setData).catch(setError), 150)
    return () => clearTimeout(timer)
  }, [p])

  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} /></div>
  if (!p || !data) return <Spinner />
  const c = data.current
  const positive = c.operating_result >= 0

  return (
    <>
      <PageHeader eyebrow={t('business.eyebrow')} title={t('business.title')}>{t('business.sub')}</PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label={t('business.revenue')} value={kzt(c.total_revenue)} sub={t('business.revenueSub', { fees: kzt(c.fee_revenue), plus: kzt(c.subscription_revenue) })} />
          <Kpi label={t('business.result')} value={kzt(c.operating_result)} tone={positive ? 'good' : 'bad'} sub={positive ? t('business.profit') : t('business.loss')} />
          <Kpi label={t('business.breakEven')} value={c.break_even_cases != null ? t('business.nCases', { n: c.break_even_cases }) : t('business.notReachable')} sub={c.break_even_per_day != null ? t('business.perDay', { n: c.break_even_per_day }) : t('business.belowCost')} />
          <Kpi label={t('business.payback')} value={c.payback_months ? t('business.months', { n: c.payback_months }) : '—'} sub={c.payback_months ? t('business.years', { n: (c.payback_months / 12).toFixed(1) }) : t('business.needsProfit')} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Controls */}
          <div className="card h-fit space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">{t('business.assumptions')}</h2>
              <button
                className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                onClick={() => setP({ cases: defaults.cases, avg_refund: defaults.avg_refund, fee_rate: defaults.fee_rate, subscribers: defaults.subscribers, plus_price: defaults.plus_price, variable_cost: defaults.variable_cost, fixed_costs: defaults.fixed_costs })}
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t('business.reset')}
              </button>
            </div>
            {SLIDERS.map(([k, min, max, step, fmt]) => (
              <div key={k}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t(`business.sliders.${k}`)}</span>
                  <span className="font-semibold text-ink">{fmt(p[k])}</span>
                </div>
                <input type="range" className="mt-2 w-full accent-brand-600" min={min} max={max} step={step} value={p[k]}
                  onChange={(e) => setP({ ...p, [k]: Number(e.target.value) })} />
              </div>
            ))}
            <p className="text-xs text-slate-400">{t('business.plusFixed', { p: kzt(p.plus_price) })}</p>
          </div>

          {/* Chart */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink">{t('business.chartTitle')}</h2>
            <p className="text-sm text-slate-500">{t('business.chartSub')}</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.curve} margin={{ top: 24, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="cases" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tickFormatter={short} tick={{ fontSize: 12 }} stroke="#94a3b8" width={48} />
                  <Tooltip formatter={(v) => [kzt(v), t('business.tooltip')]} labelFormatter={(l) => t('business.tooltipCases', { n: l })} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  {c.break_even_cases != null && <ReferenceLine x={Math.round(c.break_even_cases / 50) * 50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: t('business.breakEvenLabel'), fill: '#b45309', fontSize: 12, position: 'top' }} />}
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
              <h2 className="font-semibold text-ink">{t('business.scenarioTitle')}</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr><th className="px-6 py-2 font-medium">{t('business.perMonth')}</th>{data.scenarios.map((s) => <th key={s.cases} className="px-3 py-2 text-right font-medium">{t('business.nCases', { n: s.cases })}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['fee_revenue'],
                  ['subscription_revenue'],
                  ['total_revenue', true],
                  ['variable_costs', false, true],
                  ['fixed_costs', false, true],
                  ['operating_result', true],
                ].map(([key, bold, neg]) => (
                  <tr key={key} className={bold ? 'font-semibold text-ink' : 'text-slate-600'}>
                    <td className="px-6 py-2">{t(`business.rows.${key}`)}</td>
                    {data.scenarios.map((s) => {
                      const v = neg ? -s[key] : s[key]
                      return <td key={s.cases} className={`px-3 py-2 text-right tabular-nums ${key === 'operating_result' ? (v < 0 ? 'text-rose-600' : 'text-emerald-600') : ''}`}>{num(v)}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unit economics + funnel */}
          <div className="card p-6">
            <h2 className="font-semibold text-ink">{t('business.unitTitle')}</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Mini label={t('business.feePerCase')} value={kzt(c.fee_per_case)} />
              <Mini label={t('business.variableCost')} value={kzt(p.variable_cost)} />
              <Mini label={t('business.contribution')} value={kzt(c.contribution_per_case)} />
            </div>
            <h3 className="mt-6 text-sm font-semibold text-ink">{t('business.funnelTitle')}</h3>
            <p className="text-xs text-slate-500">{t('business.funnelSub')}</p>
            <div className="mt-3 space-y-2">
              {[
                [c.funnel.active_users, 100],
                [c.funnel.escalated_cases, 30],
                [c.funnel.successful_cases, 24],
              ].map(([v, w], i) => [t('business.funnel')[i], v, w]).map(([label, v, w]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold tabular-nums text-ink">{num(v)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${w}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              {t('business.workload')} <span className="font-semibold text-ink">{t('business.workloadValue', { h: c.specialist_hours })}</span> {t('business.fte', { n: c.specialist_fte })}{' '}
              {t('business.maxCac')} <span className="font-semibold text-ink">{kzt(defaults.targets.max_cac)}</span>.
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

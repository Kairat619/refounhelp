import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { api } from '../api'
import { useI18n } from '../i18n.jsx'
import { ErrorBox, PageHeader, Spinner } from '../components/ui'

export default function Pricing() {
  const { t, lang } = useI18n()
  const [plans, setPlans] = useState(null)
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)
    api.plans().then((d) => setPlans(d.plans)).catch(setError)
    api.me().then(setMe).catch(setError)
  }, [lang])

  async function togglePlus() {
    try { setMe(await api.setPlus(!me.plus)) } catch (e) { setError(e) }
  }

  return (
    <>
      <PageHeader eyebrow={t('pricing.eyebrow')} title={t('pricing.title')}>{t('pricing.sub')}</PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ErrorBox error={error} />
        {!plans ? <Spinner /> : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const isPlus = p.id === 'plus'
              return (
                <div key={p.id} className={`card relative flex flex-col p-6 ${p.highlight ? 'border-2 border-brand-600 shadow-lg' : ''}`}>
                  {p.highlight && <span className="chip absolute -top-3 left-6 bg-brand-600 text-white">{t('pricing.mostUsed')}</span>}
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="mt-3 text-2xl font-bold text-ink">{p.price}</p>
                  {p.note && <p className="mt-1 text-sm text-slate-500">{p.note}</p>}
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                    {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{f}</li>)}
                  </ul>
                  {isPlus ? (
                    <div className="mt-6">
                      <button onClick={togglePlus} disabled={!me} className={me?.plus ? 'btn-ghost w-full' : 'btn-primary w-full'}>
                        {me?.plus ? t('pricing.cancel') : t('pricing.activate')}
                      </button>
                      {me?.plus && <p className="mt-2 text-center text-xs text-emerald-700">{t('pricing.active', { used: me.plus_cases_used, limit: me.plus_cases_limit })}</p>}
                      <p className="mt-2 text-center text-xs text-slate-400">{t('pricing.noPayment')}</p>
                    </div>
                  ) : (
                    <Link to="/check" className={`${p.highlight ? 'btn-primary' : 'btn-ghost'} mt-6 w-full`}>
                      {p.id === 'free' ? t('pricing.startFree') : t('pricing.checkCase')}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="card mt-10 p-6">
          <h2 className="font-semibold text-ink">{t('pricing.feeTitle')}</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
            {['fee15', 'fee20', 'fee0'].map((k) => {
              const [bold, text] = t(`pricing.${k}`)
              return <p key={k}><span className="font-semibold text-ink">{bold}</span> {text}</p>
            })}
          </div>
        </div>
      </div>
    </>
  )
}

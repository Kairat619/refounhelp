import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Clock, FileText, Handshake, Search, ShieldCheck, Wallet,
} from 'lucide-react'
import { useI18n } from '../i18n.jsx'

const PROBLEM_ICONS = ['📦', '🔁', '✈️', '🚚']
const STEP_ICONS = [Search, FileText, Handshake, Wallet]
const VALUE_ICONS = [Clock, ShieldCheck, BadgeCheck, Wallet]

export default function Home() {
  const { t } = useI18n()
  const problems = t('home.problems')
  const steps = t('home.steps')
  const values = t('home.values')
  const demoSteps = t('home.demoCase.steps')

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="chip bg-brand-100 text-brand-700">{t('home.badge')}</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
              {t('home.h1a')}<br /><span className="text-brand-600">{t('home.h1b')}</span> {t('home.h1c')}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">{t('home.lead')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/check" className="btn-primary px-6 py-3 text-base">{t('home.ctaCheck')} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/policies" className="btn-ghost px-6 py-3 text-base">{t('home.ctaBrowse')}</Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">{t('home.small')}</p>
          </div>

          <div className="card relative p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">RH-1024</p>
              <span className="chip bg-emerald-100 text-emerald-700">{t('home.demoCase.refunded')}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">📦 {t('home.demoCase.sub')}</p>
            <ol className="mt-5 space-y-4 border-l-2 border-brand-100 pl-5 text-sm">
              {demoSteps.map(([text, day], i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[27px] top-0.5 h-3 w-3 rounded-full ${i === 3 ? 'bg-emerald-500' : 'bg-brand-500'}`} />
                  <p className="font-medium text-slate-700">{text}</p>
                  <p className="text-xs text-slate-400">{day}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{t('home.demoCase.note')}</p>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">{t('home.problemsTitle')}</h2>
        <p className="mt-2 text-slate-600">{t('home.problemsSub')}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(([title, text], i) => (
            <div key={i} className="card p-5">
              <div className="text-3xl">{PROBLEM_ICONS[i]}</div>
              <p className="mt-3 font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">{t('home.howTitle')}</h2>
          <p className="mt-2 text-slate-600">{t('home.howSub')}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map(([title, text], i) => {
              const Icon = STEP_ICONS[i]
              return (
                <div key={i}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold text-slate-400">{t('home.step', { n: i + 1 })}</span>
                  </div>
                  <p className="mt-4 font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">{t('home.whyTitle')}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(([title, text], i) => {
            const Icon = VALUE_ICONS[i]
            return (
              <div key={i} className="card p-5">
                <Icon className="h-6 w-6 text-brand-600" />
                <p className="mt-3 font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-900 p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">{t('home.ctaTitle')}</h2>
            <p className="mt-2 text-brand-100">{t('home.ctaSub')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/check" className="btn bg-white px-6 py-3 text-brand-900 hover:bg-brand-50">{t('home.ctaStart')}</Link>
            <Link to="/business" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">{t('home.ctaModel')}</Link>
          </div>
        </div>
      </section>
    </>
  )
}

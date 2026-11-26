import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Clock, FileText, Handshake, Search, ShieldCheck, Wallet,
} from 'lucide-react'

const PROBLEMS = [
  ['📦', 'Wrong or damaged item', 'The seller says "final sale" or stops replying.'],
  ['🔁', 'Unwanted subscription', 'A free trial quietly turned into a monthly charge.'],
  ['✈️', 'Cancelled booking', 'The airline offers a voucher instead of your money.'],
  ['🚚', 'Order never arrived', 'Support keeps saying "please wait a few more days".'],
]

const STEPS = [
  [Search, 'Look up the rules', 'Find the store, airline or subscription and see its real return rules in plain language.'],
  [FileText, 'Send a ready message', 'Get a refund request in English or Russian that cites the exact rule and your deadline.'],
  [Handshake, 'Hand it to a specialist', 'If the company ignores or refuses you, a Refund Specialist takes over and negotiates for you.'],
  [Wallet, 'Get your money back', 'You pay a 15–20% fee only after the refund arrives. No Refund, No Fee.'],
]

const VALUES = [
  [Clock, 'Convenience', 'All policies in one place, across every platform.'],
  [ShieldCheck, 'Reliability', 'Guidance based on platform rules and Kazakhstan consumer law. Card numbers are masked automatically.'],
  [BadgeCheck, 'Speed', 'Templates and specialists save you hours of support chats.'],
  [Wallet, 'Affordability', 'Free self-service. Specialist help is paid only on success.'],
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="chip bg-brand-100 text-brand-700">No Refund, No Fee</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
              Buying takes seconds.<br /><span className="text-brand-600">Getting your money back</span> shouldn't take weeks.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              RefundHelp combines a free database of return rules with human Refund Specialists who fight difficult cases for you —
              online purchases, travel bookings and subscriptions in Kazakhstan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/check" className="btn-primary px-6 py-3 text-base">Check my refund <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/policies" className="btn-ghost px-6 py-3 text-base">Browse policies</Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">Free to start · Kazakh & Russian support · Pay only if you win</p>
          </div>

          <div className="card relative p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">Case RH-1024</p>
              <span className="chip bg-emerald-100 text-emerald-700">Refunded</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">📦 Nomad Shop · wrong colour phone case</p>
            <ol className="mt-5 space-y-4 border-l-2 border-brand-100 pl-5 text-sm">
              {[
                ['Seller refused: "accessories are final sale"', 'Day 1'],
                ['Specialist cited the defect / wrong item rule', 'Day 2'],
                ['Marketplace arbitration opened', 'Day 4'],
                ['45 000 ₸ returned to card · fee 9 000 ₸', 'Day 9'],
              ].map(([t, d], i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[27px] top-0.5 h-3 w-3 rounded-full ${i === 3 ? 'bg-emerald-500' : 'bg-brand-500'}`} />
                  <p className="font-medium text-slate-700">{t}</p>
                  <p className="text-xs text-slate-400">{d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Illustrative example case.</p>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">Sound familiar?</h2>
        <p className="mt-2 text-slate-600">Many people give up on smaller refunds because the process is designed to be tiring.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map(([icon, title, text]) => (
            <div key={title} className="card p-5">
              <div className="text-3xl">{icon}</div>
              <p className="mt-3 font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">How RefundHelp works</h2>
          <p className="mt-2 text-slate-600">About 70% of cases are solved for free in the first two steps. Specialists handle the rest.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {STEPS.map(([Icon, title, text], i) => (
              <div key={title}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm font-semibold text-slate-400">Step {i + 1}</span>
                </div>
                <p className="mt-4 font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">Why RefundHelp</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([Icon, title, text]) => (
            <div key={title} className="card p-5">
              <Icon className="h-6 w-6 text-brand-600" />
              <p className="mt-3 font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-900 p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Your money is waiting.</h2>
            <p className="mt-2 text-brand-100">Check your deadline and get a ready refund message in under a minute.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/check" className="btn bg-white px-6 py-3 text-brand-900 hover:bg-brand-50">Start for free</Link>
            <Link to="/business" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">See the business model</Link>
          </div>
        </div>
      </section>
    </>
  )
}

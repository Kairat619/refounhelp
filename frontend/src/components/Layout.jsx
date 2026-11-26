import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV = [
  ['/policies', 'Policy database'],
  ['/check', 'Check my refund'],
  ['/cases', 'My cases'],
  ['/pricing', 'Pricing'],
  ['/business', 'Business model'],
]

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-ink">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-11" /></svg>
      </span>
      <span className="text-lg">Refund<span className="text-brand-600">Help</span></span>
    </Link>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  const link = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-ink'}`

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-ink px-4 py-1.5 text-center text-xs text-slate-300">
        Demo app for a student business-model project · all merchants and policies are fictional
      </div>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(([to, label]) => <NavLink key={to} to={to} className={link}>{label}</NavLink>)}
          </nav>
          <Link to="/check" className="btn-primary hidden md:inline-flex">Get my money back</Link>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden">
            {NAV.map(([to, label]) => <NavLink key={to} to={to} className={link}>{label}</NavLink>)}
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-slate-500 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3">Helping people in Kazakhstan recover money from online purchases, bookings and subscriptions. No Refund, No Fee.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Product</p>
            <ul className="mt-2 space-y-1">
              {NAV.map(([to, label]) => <li key={to}><Link className="hover:text-ink" to={to}>{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-700">About this demo</p>
            <p className="mt-2">Built to showcase the RefundHelp business model by Kanatova Alina, Saken Midina, Kayrat Zhansaya and Amirmohammad Shadkam. Data resets when the server restarts. Not legal advice.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher, useI18n } from '../i18n.jsx'

const NAV = [
  ['/policies', 'policies'],
  ['/check', 'check'],
  ['/cases', 'cases'],
  ['/pricing', 'pricing'],
  ['/business', 'business'],
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
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  const link = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-ink'}`

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-ink px-4 py-1.5 text-center text-xs text-slate-300">{t('common.banner')}</div>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <Logo />
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map(([to, key]) => <NavLink key={to} to={to} className={link}>{t(`common.nav.${key}`)}</NavLink>)}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/check" className="btn-primary hidden whitespace-nowrap xl:inline-flex">{t('common.cta')}</Link>
            <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label={t('common.menu')}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 lg:hidden">
            {NAV.map(([to, key]) => <NavLink key={to} to={to} className={link}>{t(`common.nav.${key}`)}</NavLink>)}
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-slate-500 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3">{t('common.footer.tagline')}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">{t('common.footer.product')}</p>
            <ul className="mt-2 space-y-1">
              {NAV.map(([to, key]) => <li key={to}><Link className="hover:text-ink" to={to}>{t(`common.nav.${key}`)}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-700">{t('common.footer.aboutTitle')}</p>
            <p className="mt-2">{t('common.footer.about')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

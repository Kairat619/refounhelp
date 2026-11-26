import { useState } from 'react'
import { Check, Copy, LoaderCircle } from 'lucide-react'
import { useI18n } from '../i18n.jsx'

export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {eyebrow && <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-slate-600">{children}</div>}
      </div>
    </div>
  )
}

export function Spinner({ label }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <LoaderCircle className="h-5 w-5 animate-spin" /> {label || t('common.loading')}
    </div>
  )
}

export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{String(error.message || error)}</div>
}

const DIFF = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
}
export function Difficulty({ level }) {
  const { t } = useI18n()
  const key = DIFF[level] ? level : 'medium'
  return <span className={`chip ${DIFF[key]}`}>{t(`common.difficulty.${key}`)}</span>
}

export function CopyButton({ text }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  return (
    <button
      className="btn-ghost py-1.5"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {done ? t('common.copied') : t('common.copy')}
    </button>
  )
}

const STATUS = {
  submitted: 'bg-slate-100 text-slate-700',
  authorised: 'bg-sky-100 text-sky-700',
  contacted: 'bg-indigo-100 text-indigo-700',
  negotiating: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-rose-100 text-rose-700',
}
export function StatusChip({ status }) {
  const { t } = useI18n()
  const key = STATUS[status] ? status : 'submitted'
  return <span className={`chip ${STATUS[key]}`}>{t(`common.status.${key}`)}</span>
}

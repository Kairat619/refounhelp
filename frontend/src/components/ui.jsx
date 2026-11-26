import { useState } from 'react'
import { Check, Copy, LoaderCircle } from 'lucide-react'

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

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <LoaderCircle className="h-5 w-5 animate-spin" /> {label}
    </div>
  )
}

export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{String(error.message || error)}</div>
}

const DIFF = {
  easy: ['Easy', 'bg-emerald-100 text-emerald-700'],
  medium: ['Medium', 'bg-amber-100 text-amber-700'],
  hard: ['Often refuses', 'bg-rose-100 text-rose-700'],
}
export function Difficulty({ level }) {
  const [label, cls] = DIFF[level] || DIFF.medium
  return <span className={`chip ${cls}`}>{label}</span>
}

export function CopyButton({ text }) {
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
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {done ? 'Copied' : 'Copy'}
    </button>
  )
}

const STATUS = {
  submitted: ['Submitted', 'bg-slate-100 text-slate-700'],
  authorised: ['Authorised', 'bg-sky-100 text-sky-700'],
  contacted: ['Company contacted', 'bg-indigo-100 text-indigo-700'],
  negotiating: ['Negotiating', 'bg-amber-100 text-amber-700'],
  resolved: ['Refunded', 'bg-emerald-100 text-emerald-700'],
  closed: ['Closed – no fee', 'bg-rose-100 text-rose-700'],
}
export function StatusChip({ status }) {
  const [label, cls] = STATUS[status] || STATUS.submitted
  return <span className={`chip ${cls}`}>{label}</span>
}

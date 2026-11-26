import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <p className="mt-4 text-lg text-slate-600">This page could not be found.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  )
}

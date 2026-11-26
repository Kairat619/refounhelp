import { Link } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <p className="mt-4 text-lg text-slate-600">{t('common.notFound')}</p>
      <Link to="/" className="btn-primary mt-6">{t('common.backHome')}</Link>
    </div>
  )
}

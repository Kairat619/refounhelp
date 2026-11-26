import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en.js'
import ru from './locales/ru.js'
import kk from './locales/kk.js'

// Language codes: "kk" is the ISO code for Kazakh; the switcher shows it as "KZ".
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', locale: 'en-GB' },
  { code: 'ru', label: 'RU', name: 'Русский', locale: 'ru-RU' },
  { code: 'kk', label: 'KZ', name: 'Қазақша', locale: 'kk-KZ' },
]
const DICTS = { en, ru, kk }
const STORAGE_KEY = 'rh_lang'

export function getLang() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && DICTS[saved]) return saved
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return nav === 'kk' || nav === 'kz' ? 'kk' : nav === 'ru' ? 'ru' : 'en'
}

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict)
}

function interpolate(value, vars) {
  if (typeof value !== 'string' || !vars) return value
  return value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = DICTS[lang].meta.title
  }, [lang])

  const value = useMemo(() => {
    const t = (key, vars) => {
      const v = lookup(DICTS[lang], key) ?? lookup(en, key)
      return v === undefined ? key : interpolate(v, vars)
    }
    const setLang = (code) => {
      localStorage.setItem(STORAGE_KEY, code)
      setLangState(code)
    }
    const locale = LANGUAGES.find((l) => l.code === lang).locale
    return { lang, setLang, t, locale }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('common.language')} className={`flex rounded-xl border border-slate-300 bg-white p-0.5 text-xs font-semibold ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.name}
          aria-pressed={lang === l.code}
          className={`rounded-lg px-2.5 py-1 transition ${lang === l.code ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-ink'}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

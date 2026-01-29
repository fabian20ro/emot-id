import { createContext, useState, useEffect, useContext, type ReactNode } from 'react'
import roStrings from '../i18n/ro.json'
import enStrings from '../i18n/en.json'

type Language = 'ro' | 'en'

type Strings = typeof roStrings

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Strings
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const strings: Record<Language, Strings> = {
  ro: roStrings,
  en: enStrings,
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('emot-id-language')
        if (saved === 'ro' || saved === 'en') return saved
      } catch {
        // localStorage may be unavailable in private browsing
      }
      // Detect browser language
      const browserLang = navigator.language
      if (browserLang.startsWith('ro')) return 'ro'
    }
    return 'en'
  })

  useEffect(() => {
    try {
      localStorage.setItem('emot-id-language', language)
    } catch {
      // localStorage may be unavailable in private browsing
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: strings[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

'use client'

import { useTheme } from '@/components/contexts/theme-context'
import { useLanguage, Language } from '@/components/contexts/language-context'
import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [languageStatus, setLanguageStatus] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ]

  return (
    <div className="flex items-center justify-end gap-3 p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-slate-700" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </button>

      {/* Language Selector */}
      <div className="relative group">
        <button onClick={() => setLanguageStatus((pre: boolean) => !pre)} className="p-2.5 rounded-full bg-white dark:bg-slate-700 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-slate-600 text-sm font-medium">
          {language.toUpperCase()}
        </button>
          <div className="group-hover:flex absolute right-0 mt-2 flex-col bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
          {languageStatus && languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors ${language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                  : 'text-slate-700 dark:text-slate-200'
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useTheme } from '@/components/contexts/theme-context'
import { useLanguage, Language } from '@/components/contexts/language-context'
import { Moon, Sun, Search, Bot, SendHorizontal } from "lucide-react";
import { useState } from 'react'
import { useSpeechToText } from '@/hooks/useSpeechToText'

export function Header() {
  const [languageStatus, setLanguageStatus] = useState(false)
  const [query, setQuery] = useState('')
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const {
    transcript,
    toggleListening,
    isListening,
  } = useSpeechToText({
    lang: 'en-IN',

    onResult(text: string) {
      setQuery(text)
    },
  })

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ]

  return (
    <div className="flex items-center justify-end gap-4 p-4">

      {/* Search */}

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search products..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
        />
        <SendHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

      </div>

      <div className="flex items-center gap-3">

        {/* Akash AI */}

        <button
          onClick={toggleListening}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-white shadow-lg hover:scale-105 transition"
        >
          <Bot className="h-5 w-5" />
          <span className="hidden sm:block font-medium">
            Akash AI
          </span>
        </button>

        {/* Theme */}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </button>

        {/* Language */}

        <div className="relative">
          <button
            onClick={() => setLanguageStatus((prev) => !prev)}
            className="rounded-full border border-gray-300 bg-white dark:bg-slate-700 px-3 py-2 font-medium shadow"
          >
            {language.toUpperCase()}
          </button>

          {languageStatus && (
            <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setLanguageStatus(false)
                  }}
                  className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${language === lang.code
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                    : ""
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

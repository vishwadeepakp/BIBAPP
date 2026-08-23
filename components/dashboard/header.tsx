'use client'

import { useTheme } from '@/components/contexts/theme-context'
import { useLanguage, Language } from '@/components/contexts/language-context'
import { Moon, Sun, Search, Bot, SendHorizontal } from "lucide-react";
import { useEffect, useState } from 'react'
import { useSpeechToText } from '@/hooks/useSpeechToText'
import { useSendText } from '@/hooks/useAi'
import { useRouter } from 'next/navigation'
import InventoryModal from '@/components/dashboard/InventoryModal'


export function Header() {
  const route = useRouter();

  const [languageStatus, setLanguageStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inventoryData, setInventoryData] = useState([])

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

  const sendText = useSendText()

  useEffect(() => {
    if (!isListening && query.trim() !== '') {
      sendText.mutate({ query: transcript, language });
    }
  }, [isListening])

  useEffect(() => {
    const data = sendText?.data?.data
    const action_type = data?.action_type
    console.log("sendText.data", data, action_type)

    if (data && sendText?.data) {
      if (action_type == "ADD_PRODUCT") {
        const jsonData = { items: JSON.stringify(data?.product_details) }
        const queryParams = new URLSearchParams(jsonData);
        route.push(`/dashboard/inventory?${queryParams}`)
      } else if (action_type == "SEARCH_PRODUCT") {
        setIsModalOpen(true);
        setInventoryData(data.data)
      } else if (action_type == "VIEW_INVENTORY") {
        route.push(`/dashboard/inventory/`)
      }
    }
  }, [sendText.data])

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ]

  return (
    <div className="flex items-center justify-end gap-4 p-4">

      {/* Search */}

      {/* <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search products..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
        />
        <SendHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

      </div> */}

      <div className="flex items-center gap-3">

        {/* Akash AI */}

        <button
          onClick={toggleListening}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 active:scale-95 dark:border dark:border-slate-800 dark:bg-slate-900/90 dark:bg-none dark:shadow-2xl dark:hover:border-cyan-500/50 dark:hover:shadow-cyan-500/25"
        >
          {/* Dark Mode Background Backlight Glow */}
          <div className="absolute -inset-0.5 hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-0 blur-md transition-all duration-500 group-hover:opacity-100 dark:block dark:opacity-40" />

          {/* Button Content */}
          <div className="relative flex items-center gap-2.5">
            <div className="relative">
              <Bot className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 dark:text-cyan-400" />

              {/* Live Active Pulse Dot */}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-200 opacity-75 dark:bg-cyan-400"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white dark:bg-cyan-400"></span>
              </span>
            </div>

            {/* Text Label */}
            <span className="hidden font-bold tracking-wide sm:block">
              <span className="text-white dark:bg-gradient-to-r dark:from-cyan-400 dark:to-purple-400 dark:bg-clip-text dark:text-transparent">
                Akash AI
              </span>
            </span>
          </div>

          {/* Shimmer Light Effect on Hover */}
          <span className="absolute inset-0 -translate-x-full rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
        </button>

        {/* Theme */}

        <button
          onClick={toggleTheme}
          className="cursor-pointer p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
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
            className="cursor-pointer rounded-full border border-gray-300 bg-white dark:bg-slate-700 px-3 py-2 font-medium shadow"
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
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={inventoryData}
      />

    </div>
  )
}

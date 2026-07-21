'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'

import { useAuth } from '@/components/contexts/auth-context'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? 'ml-64' : 'ml-0'
        } lg:ml-64`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="lg:hidden mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1">
            <Header />
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/contexts/language-context'
import { useAuth } from '@/components/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { BarChart3, Package, Receipt, LogOut } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    {
      href: '/dashboard',
      label: t('dashboard.analytics'),
      icon: BarChart3,
      isActive: pathname === '/dashboard',
    },
    {
      href: '/dashboard/inventory',
      label: t('dashboard.inventory'),
      icon: Package,
      isActive: pathname === '/dashboard/inventory',
    },
    {
      href: '/dashboard/sales',
      label: t('dashboard.sales'),
      icon: Receipt,
      isActive: pathname === '/dashboard/sales',
    },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen fixed left-0 top-0">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">MSME</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Inventory Manager</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('dashboard.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-40 flex items-center px-4">
        <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">MSME</h2>
      </div>
    </>
  )
}

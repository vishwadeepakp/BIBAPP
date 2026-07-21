'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, BarChart3, Package, Receipt, LogOut } from 'lucide-react'

import { useLanguage } from '@/components/contexts/language-context'
import { useAuth } from '@/components/contexts/auth-context'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-blue-600">MSME</h2>
            <p className="text-xs text-slate-500">
              Inventory Manager
            </p>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  item.isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            {t('dashboard.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
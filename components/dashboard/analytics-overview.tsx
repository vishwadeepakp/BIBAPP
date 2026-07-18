'use client'

import { useLanguage } from '@/components/contexts/language-context'
import { TrendingUp, Package, AlertCircle } from 'lucide-react'

interface AnalyticsCard {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'orange'
}

export function AnalyticsOverview() {
  const { t } = useLanguage()

  const cards: AnalyticsCard[] = [
    {
      icon: TrendingUp,
      title: t('analytics.totalSales'),
      value: '₹50,000',
      subtitle: 'This month',
      color: 'blue',
    },
    {
      icon: Package,
      title: t('analytics.stock'),
      value: '2,500',
      subtitle: 'units available',
      color: 'green',
    },
    {
      icon: AlertCircle,
      title: t('analytics.lowStock'),
      value: '12',
      subtitle: 'items need reorder',
      color: 'orange',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('dashboard.analytics')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Overview of your business metrics
        </p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {[
            { activity: 'Product order placed', time: '2 hours ago' },
            { activity: 'Stock update completed', time: '5 hours ago' },
            { activity: 'Payment received', time: 'Yesterday' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
              <p className="text-slate-700 dark:text-slate-300">{item.activity}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

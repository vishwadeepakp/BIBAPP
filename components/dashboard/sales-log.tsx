'use client'
import { useLanguage } from '@/components/contexts/language-context'
import { SalesTable } from '@/components/dashboard/sales-table'

export function SalesLog() {
  const { t } = useLanguage()


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.sales')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            View all transactions and payment status
          </p>
        </div>

      </div>

      {/* Independent SalesTable */}
      <SalesTable />
    </div>
  )
}
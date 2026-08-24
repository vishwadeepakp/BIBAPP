'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/contexts/language-context'
import { useGetSalesAnalytics } from '@/hooks/useUserApi'
import { Calendar, RefreshCw } from 'lucide-react'

// Default past 30 days calculation
const getDefaultDates = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)

  return {
    defaultStart: start.toISOString().split('T')[0],
    defaultEnd: end.toISOString().split('T')[0],
  }
}

export function SalesLog() {
  const { t } = useLanguage()

  // Default set to Last 30 Days (1 Month)
  const { defaultStart, defaultEnd } = getDefaultDates()
  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)

  // 🔴 Purana useQuery & fetchSalesSummary hata kar bas ye 1 line call karni hai:
  const { data, isLoading, isError, error, refetch } = useGetSalesAnalytics({
    startDate,
    endDate,
  })

  const handleReset = () => {
    setStartDate(defaultStart)
    setEndDate(defaultEnd)
  }

  // Error State
  if (isError) {
    return (
      <div className="space-y-6">

        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 flex items-center justify-between shadow-sm">
          <p className="text-sm font-medium">Failed to load summary: {(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // API response keys check kar lijiye (totalAmount / paidAmount ya aapke backend me jo naam ho)
  const totalAmount = data?.totalAmount ?? 0
  const paidAmount = data?.paidAmount ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* Date Filter Bar */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 pl-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 mr-1">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">Range</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
            <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          {(startDate !== defaultStart || endDate !== defaultEnd) && (
            <button
              onClick={handleReset}
              title="Reset to last 30 days"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            {isLoading ? (
              <span className="inline-block w-28 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              '₹' + totalAmount.toLocaleString()
            )}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Selected period transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Amount Received</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
            {isLoading ? (
              <span className="inline-block w-28 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              '₹' + paidAmount.toLocaleString()
            )}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Paid transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending / Credit</p>
          <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2 tracking-tight">
            {isLoading ? (
              <span className="inline-block w-28 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              '₹' + (totalAmount-paidAmount).toLocaleString()
            )}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Unpaid & credit transactions</p>
        </div>
      </div>
    </div>
  )
}
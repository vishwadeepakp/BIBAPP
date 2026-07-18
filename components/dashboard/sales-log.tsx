'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/contexts/language-context'

interface SalesTransaction {
  id: string
  orderId: string
  date: string
  amount: number
  status: 'paid' | 'pending'
}

const SAMPLE_SALES: SalesTransaction[] = [
  { id: '1', orderId: 'ORD-2024-001', date: 'Jan 15, 2024', amount: 5000, status: 'paid' },
  { id: '2', orderId: 'ORD-2024-002', date: 'Jan 14, 2024', amount: 3500, status: 'paid' },
  { id: '3', orderId: 'ORD-2024-003', date: 'Jan 13, 2024', amount: 7200, status: 'pending' },
  { id: '4', orderId: 'ORD-2024-004', date: 'Jan 12, 2024', amount: 4800, status: 'paid' },
  { id: '5', orderId: 'ORD-2024-005', date: 'Jan 11, 2024', amount: 6100, status: 'pending' },
  { id: '6', orderId: 'ORD-2024-006', date: 'Jan 10, 2024', amount: 5400, status: 'paid' },
  { id: '7', orderId: 'ORD-2024-007', date: 'Jan 9, 2024', amount: 8900, status: 'paid' },
  { id: '8', orderId: 'ORD-2024-008', date: 'Jan 8, 2024', amount: 4200, status: 'pending' },
]

export function SalesLog() {
  const { t } = useLanguage()
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const itemsPerPage = 5

  const sortedSales = [...SAMPLE_SALES].sort((a, b) => {
    const comparison = new Date(b.date).getTime() - new Date(a.date).getTime()
    return sortOrder === 'desc' ? comparison : -comparison
  })

  const totalPages = Math.ceil(sortedSales.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedItems = sortedSales.slice(startIndex, startIndex + itemsPerPage)

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      default:
        return ''
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return t('sales.paid')
      case 'pending':
        return t('sales.pending')
      default:
        return status
    }
  }

  const totalAmount = SAMPLE_SALES.reduce((sum, item) => sum + item.amount, 0)
  const paidAmount = SAMPLE_SALES.filter((item) => item.status === 'paid').reduce(
    (sum, item) => sum + item.amount,
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('dashboard.sales')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View all transactions and payment status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All transactions</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Amount Received</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            ₹{paidAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paid transactions</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  {t('sales.orderId')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  {t('sales.date')}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  {t('sales.amount')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  {t('sales.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors last:border-b-0"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {transaction.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                        transaction.status
                      )}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/contexts/language-context'
import { SalesTable } from '@/components/dashboard/sales-table'

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

      <SalesTable />
    </div>
  )
}

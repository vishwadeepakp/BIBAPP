'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/contexts/language-context'
import { Search } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

const SAMPLE_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Wheat Flour 1kg', sku: 'WF-001', quantity: 500, status: 'in-stock' },
  { id: '2', name: 'Rice Premium 5kg', sku: 'RP-002', quantity: 150, status: 'low-stock' },
  { id: '3', name: 'Sugar 1kg', sku: 'SG-003', quantity: 0, status: 'out-of-stock' },
  { id: '4', name: 'Cooking Oil 1L', sku: 'CO-004', quantity: 200, status: 'in-stock' },
  { id: '5', name: 'Tea Leaves 500g', sku: 'TL-005', quantity: 75, status: 'low-stock' },
  { id: '6', name: 'Coffee Powder 250g', sku: 'CP-006', quantity: 120, status: 'in-stock' },
  { id: '7', name: 'Spices Mix 100g', sku: 'SM-007', quantity: 0, status: 'out-of-stock' },
  { id: '8', name: 'Milk Powder 400g', sku: 'MP-008', quantity: 300, status: 'in-stock' },
]

export function InventoryTable() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredItems = SAMPLE_INVENTORY.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'low-stock':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'out-of-stock':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return ''
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-stock':
        return t('inventory.inStock')
      case 'low-stock':
        return t('inventory.lowStock')
      case 'out-of-stock':
        return t('inventory.outOfStock')
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('dashboard.inventory')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your product inventory
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={t('inventory.search')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  {t('inventory.name')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  {t('inventory.sku')}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  {t('inventory.quantity')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  {t('inventory.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors last:border-b-0"
                >
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white text-center font-semibold">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedItems.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">No products found</p>
          </div>
        )}
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

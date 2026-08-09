'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/components/contexts/language-context'
import { Search, Plus } from 'lucide-react'
import { AddInventoryModal } from './add-inventory-modal'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useInventoryTable } from '@/hooks/useAi'

interface InventoryItem {
  id: string
  name: string
  sku?: string
  unit?: string
  quantity: number
  status?: string
  category?: string
  Category?: string
  quantity_per_package?: string | number
  expiry?: string | null
}

interface InventoryApiResponse {
  items?: InventoryItem[]
  data?: InventoryItem[] | { items?: InventoryItem[]; totalPages?: number; totalItems?: number; page?: number; limit?: number }
  totalPages?: number
  totalItems?: number
  total?: number
  page?: number
  limit?: number
}

export function InventoryTable() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const route = useRouter()
  const pathname = usePathname()
  const jsonObject = Object.fromEntries(searchParams.entries())
  const items = jsonObject?.items ? JSON.parse(jsonObject.items) : null

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [openModal, setOpenModal] = useState(false)

  const itemsPerPage = 5

  const { data, isLoading, error: queryError, refetch } = useInventoryTable({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm.trim(),
  })

  const inventoryItems = useMemo(() => {
    const payload = data as InventoryApiResponse | InventoryItem[] | undefined

    if (!payload) return []
    if (Array.isArray(payload)) return payload

    if (Array.isArray((payload as InventoryApiResponse)?.items)) {
      return (payload as InventoryApiResponse).items!
    }

    if (Array.isArray((payload as InventoryApiResponse)?.data)) {
      return ((payload as InventoryApiResponse).data as InventoryItem[])
    }

    return ((payload as InventoryApiResponse)?.data as { items?: InventoryItem[] } | undefined)?.items || []
  }, [data])

  const totalPages = useMemo(() => {
    const payload = data as InventoryApiResponse | InventoryItem[] | undefined
    if (!payload) {
      return 1
    }


    const payloadObject = payload.pagination as InventoryApiResponse

    const nestedData = payloadObject.data && typeof payloadObject.data === 'object' && !Array.isArray(payloadObject.data)
      ? payloadObject.data as { totalPages?: number; totalItems?: number; total?: number; items?: InventoryItem[] }
      : undefined

    const totalItems = payloadObject.totalItems
      ?? payloadObject.total
      ?? nestedData?.totalItems
      ?? nestedData?.total
      ?? undefined

    if (typeof payloadObject.totalPages === 'number' && payloadObject.totalPages > 0) {
      return payloadObject.totalPages
    }

    if (typeof nestedData?.totalPages === 'number' && nestedData.totalPages > 0) {
      return nestedData.totalPages
    }

    if (typeof totalItems === 'number' && totalItems > 0) {
      return Math.max(1, Math.ceil(totalItems / itemsPerPage))
    }

    return 1
  }, [data, itemsPerPage])

  const error = queryError ? 'Unable to load inventory from the backend right now.' : null

  useEffect(() => {
    if (items && items.length > 0) {
      setOpenModal(true)
    }
  }, [items])

  useEffect(() => {
    void refetch()
  }, [currentPage, searchTerm, itemsPerPage, refetch])

  const getStatusValue = (item: InventoryItem) => {
    if (item.status) return item.status

    const quantity = Number(item.quantity ?? 0)
    if (quantity <= 0) return 'out-of-stock'
    if (quantity < 50) return 'low-stock'
    return 'in-stock'
  }

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

  const closeModal = () => {
    route.push(pathname)
    setTimeout(() => {
      setOpenModal(false)
    }, 300)
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t('dashboard.inventory')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your product inventory
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Inventory
        </button>

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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="w-full overflow-x-scroll">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.name')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.category')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.quantity_per_package')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.unit')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.quantity')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.expiry')}
                  </th>
                  <th className="px-6 _per_p_p_p text-left text-sm font-semibold text-slate-900 dark:text-white">
                    {t('inventory.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      Loading inventory...
                    </td>
                  </tr>
                )}

                {!isLoading && !error && inventoryItems.map((item) => {
                  const status = getStatusValue(item)

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                        {item.category ?? item.Category ?? 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.quantity_per_package ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.unit ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white text-center font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white text-center font-semibold">
                        {item.expiry ? new Date(item.expiry).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!isLoading && !error && inventoryItems.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">No products found</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>

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
                className={`px-3 py-2 rounded-lg ${currentPage === page
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

      <AddInventoryModal
        open={openModal}
        onClose={() => closeModal()}
        jsonObject={items}
      />
    </>
  )
}

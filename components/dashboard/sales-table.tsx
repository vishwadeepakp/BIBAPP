'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/components/contexts/language-context'
import { Search } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useSaleTable } from '@/hooks/useAi'
import { Plus, Eye } from 'lucide-react'
import { AddSalesModal } from './addSalesModal'
import SaleDetailsModal from './ItemModel'

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

const dummyData = [
    {
        "id": 4,
        "sale_id": 2,
        "product_name": "Dahi",
        "brand_name": "Amul",
        "hsn_code": null,
        "quantity": 1,
        "unit_price": "22.00",
        "discount_value": "10.00",
        "discount_type": "percent",
        "total": "19.80",
        "createdAt": "2026-08-15T21:48:55.000Z",
        "updatedAt": "2026-08-15T21:48:55.000Z"
    }
];

export function SalesTable() {
    const { t } = useLanguage()
    const searchParams = useSearchParams()
    const route = useRouter()
    const pathname = usePathname()
    const jsonObject = Object.fromEntries(searchParams.entries())
    const items = jsonObject?.items ? JSON.parse(jsonObject.items) : null

    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [openModal, setOpenModal] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isItmModalOpen, setIsItemModalOpen] = useState(false);
    const [itemModalData, setItemModalData] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});


    const itemsPerPage = 10

    const { data, isLoading, error: queryError, refetch } = useSaleTable({
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


        const payloadObject = (payload as { pagination?: InventoryApiResponse }).pagination
            ?? (payload as InventoryApiResponse)

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

    const error = queryError ? t('inventory.loadError') : null

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

    const getStatusStyles = (status: number | string) => {
        if (status == 'completed') {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        } else {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }

    }

    const getStatusLabel = (quantity: number | string) => {
        if (quantity >= 10) {
            return t('inventory.inStock')
        } else if (quantity >= 1) {
            return t('inventory.lowStock')
        } else {
            return t('inventory.outOfStock')
        }
    }

    const closeModal = () => {
        route.push(pathname)
        setTimeout(() => {
            setOpenModal(false)
        }, 300)
    }

    const handleEyeClick = (item: number) => {

        setItemModalData(item.items);
        setSelectedItem({ ...item, invoice_number: item.invoice_number, sale_id: item.sale_id });
        // Toggle the modal state
        setIsItemModalOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your product stock efficiently and keep track of inventory levels in real-time.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" aria-label={t('inventory.addInventory')} />
                    </button>

                    <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 px-5 py-3 text-sm text-slate-600 dark:text-slate-300 opacity-70 cursor-not-allowed"
                        title="Coming soon"
                    >
                        <span>📷</span>
                        {t('inventory.barcodeScan')}
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t('inventory.comingSoon')}</span>
                    </button>

                    <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 px-5 py-3 text-sm text-slate-600 dark:text-slate-300 opacity-70 cursor-not-allowed"
                        title="Coming soon"
                    >
                        <span>🧾</span>
                        {t('inventory.aiBillScan')}
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t('inventory.comingSoon')}</span>
                    </button>
                </div>

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
                                        Bill / invoice
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Customer
                                    </th>
                                    <th className=" items-center px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Items
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        phone
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                                        Payment Mode
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                                        Date
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
                                            {t('inventory.loading')}
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && !error && inventoryItems.map((item: any, index) => {
                                    const status = getStatusValue(item)

                                    return (
                                        <tr
                                            key={index}
                                            className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors last:border-b-0"
                                        >
                                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                                                <span
                                                    className="inline-flex items-center text-green-600 cursor-pointer"
                                                    onClick={() => handleEyeClick(item)}
                                                >
                                                    {item.invoice_number} <Eye className="ml-2" />
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                                                {item.customer_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                                                {item.items && item.items.length > 0 ? item.items.length : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                                                {item.customer_phone ? item.customer_phone : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {item.grand_total ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {item.payment_mode ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white text-center font-semibold">
                                                {item.sale_date ? new Intl.DateTimeFormat('default', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.sale_date)) : t('inventory.notAvailable')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {item.payment_mode ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(item.status)}`}
                                                >
                                                    {item.status}
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
                            <p className="text-slate-500 dark:text-slate-400">{t('inventory.noProducts')}</p>
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
                            {t('inventory.previous')}
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
                            {t('inventory.next')}
                        </button>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <AddSalesModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {isItmModalOpen && (
                <SaleDetailsModal
                    isOpen={isItmModalOpen}
                    onClose={() => setIsItemModalOpen(false)}
                    saleItems={itemModalData}
                    invoiceInfo={selectedItem}
                />
            )}
        </>
    )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, ShoppingCart, Tag } from 'lucide-react'
import api from "@/api/axiosInstance"; // <--- आपका Axios instance import हो गया
export interface SaleItem {
    product_name: string
    brand_name: string
    hsn_code: string
    quantity: number | ''
    unit_price: number | ''
    discount_value: number | ''
    discount_type: 'percent' | 'fixed'
    total: number
}

interface AddSalesModalProps {
    open: boolean
    onClose: () => void
    onSave?: (salesData: any) => Promise<void> | void
}

// Custom Hook: Debounce API Calls
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

// ----------------------------------------------------------------------
// Simple & Validated Searchable Dropdown Component
// ----------------------------------------------------------------------
interface AutoCompleteDropdownProps {
    placeholder: string
    value: string
    onChange: (val: string) => void
    onSelectSuggestion?: (item: any) => void
    searchType: 'product' | 'brand'
    hasError?: boolean
}

function AutoCompleteDropdown({
    placeholder,
    value,
    onChange,
    onSelectSuggestion,
    searchType,
    hasError,
}: AutoCompleteDropdownProps) {
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isSelected, setIsSelected] = useState(false)

    const wrapperRef = useRef<HTMLDivElement>(null)
    const debouncedQuery = useDebounce(value, 300)

    // Validation: If user clicks outside without selecting from list, clear input
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                if (value && !isSelected) {
                    onChange('') // Clear invalid custom typing
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [value, isSelected, onChange])

    // Fetch API Suggestions
    useEffect(() => {
        if (isSelected || !debouncedQuery || debouncedQuery.trim().length < 2) {
            setSuggestions([])
            setLoading(false)
            return
        }

        let isMounted = true
        setLoading(true)

        const fetchSuggestions = async () => {
            try {
                // REPLACE WITH YOUR REAL API CALL:
                const res = await api.get(`/stock/stock-suggestion?productName=${debouncedQuery}`)
                console.log("data", res)

                if (isMounted) {
                    if (searchType === 'product') {
                        setSuggestions(res?.data?.data || [])
                    } else {
                        setSuggestions([
                            { name: `${debouncedQuery} Corp` },
                            { name: `${debouncedQuery} Industries` },
                        ])
                    }
                }
            } catch (err) {
                console.log('Failed to fetch suggestions', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchSuggestions()
        return () => {
            isMounted = false
        }
    }, [debouncedQuery, searchType, isSelected])

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                    onChange(e.target.value)
                    setIsSelected(false)
                    setIsOpen(true)
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 outline-none transition ${hasError
                    ? 'border-red-500 bg-red-50/30'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                    }`}
            />

            {loading && (
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-pulse">
                    Loading...
                </span>
            )}

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
                    {suggestions.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                onChange(item.name)
                                setIsSelected(true)
                                if (onSelectSuggestion) onSelectSuggestion(item)
                                setIsOpen(false)
                            }}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex justify-between items-center text-slate-800 dark:text-slate-200"
                        >
                            <span>{`${item.name} ${item.quantity_per_package}${item.unit}`}</span>
                            {item.brand && <span className="text-xs text-slate-400">({item.brand})</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ----------------------------------------------------------------------
// Main Add Sales Modal Component
// ----------------------------------------------------------------------
export function AddSalesModal({ open, onClose, onSave }: AddSalesModalProps) {
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerGstin, setCustomerGstin] = useState('')
    const [paymentMode, setPaymentMode] = useState('cash')
    const [status, setStatus] = useState('completed')
    const [notes, setNotes] = useState('')

    const [overallDiscountValue, setOverallDiscountValue] = useState<number | ''>('')
    const [overallDiscountType, setOverallDiscountType] = useState<'percent' | 'fixed'>('fixed')

    const [items, setItems] = useState<SaleItem[]>([
        {
            product_name: '',
            brand_name: '',
            hsn_code: '',
            quantity: 1,
            unit_price: '',
            discount_value: '',
            discount_type: 'percent',
            total: 0,
        },
    ])

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!open) return null

    const itemsTotalAfterDiscount = items.reduce(
        (acc, item) => acc + (Number(item.total) || 0),
        0
    )

    let globalDiscountAmount = 0
    const overallDiscNum = Number(overallDiscountValue) || 0
    if (overallDiscountType === 'percent') {
        globalDiscountAmount = (itemsTotalAfterDiscount * overallDiscNum) / 100
    } else {
        globalDiscountAmount = overallDiscNum
    }

    const grandTotal = Math.max(0, itemsTotalAfterDiscount - globalDiscountAmount)

    const calculateItemTotal = (
        quantity: number | '',
        unitPrice: number | '',
        discValue: number | '',
        discType: 'percent' | 'fixed'
    ) => {
        const qty = Number(quantity) || 0
        const price = Number(unitPrice) || 0
        const baseTotal = qty * price
        const discNum = Number(discValue) || 0
        const discountAmount = discType === 'percent' ? (baseTotal * discNum) / 100 : discNum
        return Math.max(0, baseTotal - discountAmount)
    }

    const handleSelectProduct = (index: number, selected: any) => {
        setItems((prevItems) => {
            const updated = [...prevItems]
            const item = { ...updated[index] }

            // 1. नाम, ब्रांड, प्राइस और HSN एक साथ सेट करें
            item.product_name = selected.name || item.product_name
            if (selected.brand) item.brand_name = selected.brand
            if (selected.sellPrice) item.unit_price = Number(selected.sellPrice)
            if (selected.hsn) item.hsn_code = selected.hsn

            // 2. तुरंत नया Total कैलकुलेट करें
            item.total = calculateItemTotal(
                item.quantity,
                item.unit_price,
                item.discount_value,
                item.discount_type
            )

            updated[index] = item
            return updated
        })
    }

    const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
        console.log('handleItemChange', index, field, value)
        const updatedItems = [...items]
        const item = { ...updatedItems[index] }

        if (field === 'quantity' || field === 'unit_price' || field === 'discount_value') {
            item[field] = value === '' ? '' : (Math.max(0, Number(value)) as any)
        } else {
            item[field] = value
        }

        item.total = calculateItemTotal(
            item.quantity,
            item.unit_price,
            item.discount_value,
            item.discount_type
        )

        updatedItems[index] = item
        setItems(updatedItems)
    }

    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                product_name: '',
                brand_name: '',
                hsn_code: '',
                quantity: 1,
                unit_price: '',
                discount_value: '',
                discount_type: 'percent',
                total: 0,
            },
        ])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return
        setItems((prev) => prev.filter((_, i) => i !== index))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!customerName.trim()) newErrors.customerName = 'Required'

        items.forEach((item, index) => {
            if (!item.product_name.trim()) newErrors[`item_${index}_name`] = 'Required'
            if (!item.quantity || Number(item.quantity) <= 0) newErrors[`item_${index}_qty`] = 'Invalid'
            if (item.unit_price === '' || Number(item.unit_price) < 0)
                newErrors[`item_${index}_price`] = 'Invalid'
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setIsSubmitting(true)
        try {
            const payload = {
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_gstin: customerGstin,
                payment_mode: paymentMode,
                status,
                notes,
                items,
                summary: {
                    subtotal: itemsTotalAfterDiscount,
                    overall_discount: {
                        type: overallDiscountType,
                        value: Number(overallDiscountValue) || 0,
                        amount: globalDiscountAmount,
                    },
                    grand_total: grandTotal,
                },
                date: new Date().toISOString(),
            }

            if (onSave) await onSave(payload)
            onClose()
        } catch (error) {
            console.error('Failed to submit sale:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
                <div className="relative w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
                                <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create GST Sale</h2>
                                <p className="text-sm text-slate-500">Record sales with product & brand search</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="space-y-6 p-6">
                        {/* Customer Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter customer name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2 text-sm bg-transparent outline-none ${errors.customerName
                                        ? 'border-red-500'
                                        : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Phone number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-sm outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    GSTIN
                                </label>
                                <input
                                    type="text"
                                    placeholder="GSTIN Number"
                                    value={customerGstin}
                                    onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-2 text-sm outline-none focus:border-emerald-500 uppercase"
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Products List
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                >
                                    <Plus className="h-4 w-4" /> Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60"
                                    >
                                        {/* Product Dropdown */}
                                        <div className="col-span-12 sm:col-span-3">
                                            <AutoCompleteDropdown
                                                placeholder="Select Product *"
                                                value={item.product_name}
                                                searchType="product"
                                                hasError={!!errors[`item_${index}_name`]}
                                                onChange={(val) => handleItemChange(index, 'product_name', val)}
                                                onSelectSuggestion={(selectedItem) => {
                                                    // 🟢 अब यह पूरी Row को एक ही झटके में सही से अपडेट करेगा
                                                    handleSelectProduct(index, selectedItem)
                                                }}
                                            />
                                        </div>

                                        {/* Brand Dropdown */}
                                        <div className="col-span-6 sm:col-span-2">
                                            <AutoCompleteDropdown
                                                placeholder="Select Brand"
                                                value={item.brand_name}
                                                searchType="brand"
                                                onChange={(val) => handleItemChange(index, 'brand_name', val)}
                                            />
                                        </div>

                                        {/* HSN */}
                                        <div className="col-span-6 sm:col-span-1">
                                            <input
                                                type="text"
                                                placeholder="HSN"
                                                value={item.hsn_code}
                                                onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-2 text-sm bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-4 sm:col-span-1">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                className={`w-full rounded-lg border px-2 py-2 text-sm bg-white dark:bg-slate-900 outline-none ${errors[`item_${index}_qty`] ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                                                    }`}
                                            />
                                        </div>

                                        {/* Unit Price */}
                                        <div className="col-span-4 sm:col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                className={`w-full rounded-lg border px-2 py-2 text-sm bg-white dark:bg-slate-900 outline-none ${errors[`item_${index}_price`] ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                                                    }`}
                                            />
                                        </div>

                                        {/* Discount */}
                                        <div className="col-span-4 sm:col-span-2 flex items-center gap-1">
                                            <input
                                                type="number"
                                                placeholder="Disc"
                                                value={item.discount_value}
                                                onChange={(e) => handleItemChange(index, 'discount_value', e.target.value)}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-2 text-sm bg-white dark:bg-slate-900 outline-none focus:border-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleItemChange(
                                                        index,
                                                        'discount_type',
                                                        item.discount_type === 'percent' ? 'fixed' : 'percent'
                                                    )
                                                }
                                                className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-2 text-xs font-bold bg-white dark:bg-slate-900"
                                            >
                                                {item.discount_type === 'percent' ? '%' : '₹'}
                                            </button>
                                        </div>

                                        {/* Total & Delete */}
                                        <div className="col-span-12 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                ₹{item.total.toFixed(0)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={items.length === 1}
                                                className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bill Summary */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium">Bill Discount:</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={overallDiscountValue}
                                        onChange={(e) =>
                                            setOverallDiscountValue(
                                                e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                                            )
                                        }
                                        className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-sm bg-white dark:bg-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOverallDiscountType(
                                                overallDiscountType === 'percent' ? 'fixed' : 'percent'
                                            )
                                        }
                                        className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900"
                                    >
                                        {overallDiscountType === 'percent' ? '%' : '₹'}
                                    </button>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-slate-500">
                                        Subtotal: ₹{itemsTotalAfterDiscount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-4">
                                <span className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                                    Grand Total
                                </span>
                                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Payment Mode</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI / Online</option>
                                    <option value="card">Card</option>
                                    <option value="credit">Credit (Udhar)</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border px-5 py-2 text-sm border-slate-300 dark:border-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="rounded-lg bg-emerald-600 px-6 py-2 text-sm text-white hover:bg-emerald-700"
                        >
                            {isSubmitting ? 'Saving...' : 'Complete Sale'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
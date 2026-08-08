'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, X, Upload, Package } from 'lucide-react'
import { useSaveInventoryData } from '@/hooks/useAi'

interface AddInventoryModalProps {
  open: boolean
  onClose: () => void
  jsonObject?: any[]
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function AddInventoryModal({
  open,
  onClose,
  jsonObject
}: AddInventoryModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [modelCount, setModelCount] = useState(1);

  const recognitionRef = useRef<any>(null)

  const [formData, setFormData] = useState<{
    name: string
    quantity_per_package: string
    quantity: string
    category: string
    status: string
    description: string
    unit: string
    selling_price: string
    tags: string[]
  }>({
    name: '',
    quantity_per_package: '',
    quantity: '',
    category: '',
    status: 'in-stock',
    description: '',
    unit: '',
    selling_price: '',
    tags: []
  })

  const saveInventoryData = useSaveInventoryData()


  useEffect(() => {
    if (jsonObject && jsonObject.length > 0) {
      const data = jsonObject[modelCount - 1];
      if (data) {
        setFormData({
          name: data.name || '',
          unit: data.unit || '',
          quantity_per_package: data.quantity_per_package || '',
          quantity: data.package_count || '',
          category: data.category || '',
          status: data.status || 'in-stock',
          description: data.description || '',
          selling_price: data.selling_price || '',
          tags: data.tags || [],
        })
      }
    }
  }, [jsonObject, modelCount])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript

      setFormData((prev) => ({
        ...prev,
        description: prev.description
          ? prev.description + ' ' + text
          : text,
      }))
    }

    recognitionRef.current = recognition
  }, [])

  const startListening = () => {
    recognitionRef.current?.start()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center">

        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}

          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <Package className="h-6 w-6 text-blue-600" />
              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Inventory
                  <span className="rounded-full bg-indigo-800/60 px-2 py-0.5 text-xs font-bold text-indigo-100 border border-indigo-400/30">
                    {modelCount} / {jsonObject?.length}
                  </span>
                </h2>

                <p className="text-sm text-slate-500">
                  Fill product information
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* Body */}

          <div className="space-y-5 p-6">

            {/* Product Name */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Product Name
              </label>

              <input
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Quantity per Package
                </label>

                <input
                  type="text"
                  placeholder="quantity per package"
                  value={formData.quantity_per_package}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_per_package: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Unit
                </label>

                <input
                  type="text"
                  placeholder="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Quantity
                </label>

                <input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                />

              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selling_price: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                />

              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                />

              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3"
                >
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out Of Stock</option>
                </select>

              </div>

            </div>

            {/* Description */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <div className="relative">

                <textarea
                  rows={5}
                  placeholder="Write description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 pr-16"
                />

                <button
                  type="button"
                  onClick={startListening}
                  className={`absolute bottom-3 right-3 rounded-full p-3 transition

                ${isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-600 text-white'
                    }`}
                >
                  <Mic className="h-5 w-5" />
                </button>

              </div>

            </div>

            {/* Upload */}
            {/* 
            <div>

              <label className="mb-2 block text-sm font-medium">
                Product Image
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-8 hover:border-blue-500 transition">

                <Upload className="mb-3 h-8 w-8 text-slate-500" />

                <span className="text-sm text-slate-500">
                  Click to upload image
                </span>

                <input
                  type="file"
                  className="hidden"
                />

              </label>

            </div> */}

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-5">

            <button
              onClick={() => {
                if (modelCount < (jsonObject?.length ?? 0)) {
                  setModelCount(modelCount + 1);
                } else {
                  onClose();
                }
              }}
              className="rounded-lg border border-slate-300 px-5 py-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                await saveInventoryData.mutateAsync(formData);

                if (modelCount < (jsonObject?.length ?? 0)) {
                  setModelCount(modelCount + 1);
                } else {
                  onClose();
                }
              }}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
              Save Product
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}
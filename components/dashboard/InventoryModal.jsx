'use client';

import React, { useEffect } from 'react';

export default function InventoryModal({ isOpen, onClose, data = [] }) {
  // ESC Key दबाने पर Popup बंद करने के लिए
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Background scroll freeze
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Date Formatting Helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop (Dark Overlay & Blur) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl transition-all max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Inventory Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Total items: {data.length}
            </p>
          </div>

          {/* Close Button (X) */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body: Table Direct Inside Modal */}
        <div className="flex-1 overflow-y-auto pr-1">
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm font-medium">Koi inventory data nahi mila.</p>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Item Name</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Quantity</th>
                      <th className="px-6 py-4 font-semibold">Price (₹)</th>
                      {/* <th className="px-6 py-4 font-semibold">Tags</th> */}
                      <th className="px-6 py-4 font-semibold">Added On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 capitalize whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {item.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.type === 'IN'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                          {parseFloat(item.quantity)} {item.unit}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {item.selling_price ? `₹${parseFloat(item.selling_price).toFixed(2)}` : '-'}
                        </td>
                        {/* <td className="px-6 py-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(item.tags) && item.tags.length > 0 ? (
                              item.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 border border-blue-100"
                                >
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </td> */}
                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
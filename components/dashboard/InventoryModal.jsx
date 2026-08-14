'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function InventoryModal({ isOpen, onClose, data = [] }) {
  const [mounted, setMounted] = useState(false);

  // SSR Safe Mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC Key दबाने पर Popup बंद करने के लिए
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const EXCLUDED_KEYS = ['id', 'user_id', 'raw_prompt', 'deleted_at'];

  const columns =
    data && data.length > 0
      ? Object.keys(data[0]).filter((key) => !EXCLUDED_KEYS.includes(key))
      : [];

  const formatHeader = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderCellValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    if (key === 'type') {
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            value === 'IN'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {value}
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400 text-xs">-</span>;
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {value.map((tag, idx) => (
            <span
              key={idx}
              className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 border border-blue-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === 'string' && (key.includes('at') || key.includes('date'))) {
      const parsedDate = Date.parse(value);
      if (!isNaN(parsedDate) && value.length >= 10) {
        return (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {new Date(value).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        );
      }
    }

    if (key.includes('price') && !isNaN(value)) {
      return <span className="font-medium text-gray-900">₹{parseFloat(value).toFixed(2)}</span>;
    }

    return <span className="font-medium text-gray-800">{value.toString()}</span>;
  };

  // React Portal से यह Directly <body> पर रेंडर होगा!
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="relative z-10 w-full max-w-6xl rounded-2xl bg-white p-6 shadow-2xl transition-all max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dynamic Inventory Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Total items: {data.length} | Columns detected: {columns.length}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
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
                      {columns.map((colKey) => (
                        <th key={colKey} className="px-6 py-4 font-semibold whitespace-nowrap">
                          {formatHeader(colKey)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {data.map((row, rowIndex) => (
                      <tr key={row.id || rowIndex} className="hover:bg-gray-50/80 transition-colors">
                        {columns.map((colKey) => (
                          <td key={colKey} className="px-6 py-4 whitespace-nowrap">
                            {renderCellValue(colKey, row[colKey])}
                          </td>
                        ))}
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
    </div>,
    document.body // DOM Target
  );
}
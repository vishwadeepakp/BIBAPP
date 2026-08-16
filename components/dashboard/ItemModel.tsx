import React, { useState, useRef } from 'react';
import { X, FileText, Download, Receipt, Share2, Printer, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import {  useGetProfile } from '@/hooks/useUserApi';
import {  useSaleItem } from '@/hooks/useAi';

const SaleDetailsModal = ({ isOpen, onClose, invoiceInfo = {}, storeDetailsProp = {} }) => {
  // 1. Invoice Type State: 'gst' for B2B Tax Invoice, 'retail' for Non-GST Bill
  const [invoiceType, setInvoiceType] = useState('gst');

  const printRef = useRef(null);
  const iframeRef = useRef(null);

  const { data } = useGetProfile();
  storeDetailsProp = data;

  const { data: saleData } = useSaleItem(invoiceInfo?.sale_id);
  console.log("saleData", saleData);
  const items = saleData;

  if (!isOpen || !items?.length) return null;

  // Dynamic Store / Seller Details
  const storeDetails = {
    name: storeDetailsProp?.storeName || "",
    tagline: storeDetailsProp?.tagline || "",
    address: `${storeDetailsProp?.addressLine1 || ''} ${storeDetailsProp?.addressLine2 || ''}, ${storeDetailsProp?.landmark || ''}, ${storeDetailsProp?.state || ''} - ${storeDetailsProp?.pincode || ''}`,
    gstin: storeDetailsProp?.gstin || "",
    pan: storeDetailsProp?.pan || "",
    state: storeDetailsProp?.state || "",
    phone: storeDetailsProp?.phone || "",
    email: storeDetailsProp?.email || "",
    // Bank Details - Dynamic check
    bankName: invoiceInfo?.bank_name || storeDetailsProp?.bankName || null,
    accountNo: invoiceInfo?.account_number || storeDetailsProp?.accountNo || null,
    ifsc: invoiceInfo?.ifsc_code || storeDetailsProp?.ifsc || null,
    branch: invoiceInfo?.bank_branch || storeDetailsProp?.branch || null
  };

  // Has Bank Details flag
  const hasBankDetails = Boolean(storeDetails.bankName && storeDetails.accountNo);

  // Dynamic Customer Details
  const customerDetails = {
    name: invoiceInfo?.customer_name || "N/A",
    phone: invoiceInfo?.customer_phone || "N/A",
    address: invoiceInfo?.customer_address || "",
    gstin: invoiceInfo?.customer_gstin || null,
    state: invoiceInfo?.customer_state || "Maharashtra (27)"
  };

  // Invoice Numbers & Dates
  const rawInvoiceNum = invoiceInfo?.invoice_number || `INV-${invoiceInfo?.id || items[0]?.sale_id || '1001'}`;
  // GST Rule: Invoice number should not exceed 16 chars
  const invoiceNum = rawInvoiceNum.length > 16 ? rawInvoiceNum.slice(-16) : rawInvoiceNum;
  
  const rawDate = invoiceInfo?.sale_date || invoiceInfo?.createdAt || items[0]?.createdAt || Date.now();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const paymentMode = (invoiceInfo?.payment_mode || 'CASH').toUpperCase();
  const paymentStatus = invoiceInfo?.status === 'completed' ? 'PAID' : (invoiceInfo?.status?.toUpperCase() || 'PAID');

  // Calculations
  const calculatedSubtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 1));
  }, 0);

  const subTotal = invoiceInfo?.subtotal ? parseFloat(invoiceInfo.subtotal) : calculatedSubtotal;

  // Item Discounts
  const itemDiscounts = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity || 1);
    const unitPrice = parseFloat(item.unit_price || 0);
    const disc = parseFloat(item.discount_value || 0);
    if (item.discount_type === 'percent') {
      return sum + ((unitPrice * qty) * (disc / 100));
    }
    return sum + disc;
  }, 0);

  // Overall Sale Discount
  const overallDiscount = parseFloat(invoiceInfo?.overall_discount_amount || 0);
  const totalDiscount = itemDiscounts + overallDiscount;

  // Net Taxable / Effective Base Value
  const taxableValue = Math.max(0, subTotal - totalDiscount);

  // GST Calculation (Intra-state 18% CGST/SGST Split)
  const cgstRate = 9;
  const sgstRate = 9;
  const cgstAmount = (taxableValue * cgstRate) / 100;
  const sgstAmount = (taxableValue * sgstRate) / 100;

  const grandTotalCalculated = invoiceType === 'gst' 
    ? (taxableValue + cgstAmount + sgstAmount) 
    : taxableValue;

  const grandTotal = invoiceInfo?.grand_total ? parseFloat(invoiceInfo.grand_total).toFixed(2) : grandTotalCalculated.toFixed(2);

  // 1. Direct Print via Dynamic iFrame
  const handleDirectPrint = () => {
    const element = printRef.current;
    if (!element) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Grab all external stylesheets for styling inside iframe
    const styleSheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('');
        } catch {
          return '';
        }
      })
      .join('\n');

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceType === 'gst' ? 'GST_TAX_INVOICE' : 'RETAIL_BILL'}_${invoiceNum}</title>
          <style>
            ${styleSheets}
            @media print {
              body { margin: 0; padding: 10px; background: white !important; }
              .no-print { display: none !important; }
            }
            body { font-family: sans-serif; color: #1e293b; background: white; }
          </style>
        </head>
        <body>
          <div>${element.innerHTML}</div>
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  };

  // 2. Download PDF Handler
  const generatePDF = () => {
    const element = printRef.current;
    if (!element) return;

    const fileName = `${invoiceType === 'gst' ? 'TAX_INVOICE' : 'RETAIL_BILL'}_${invoiceNum}.pdf`;

    const opt = {
      margin: [6, 6, 6, 6],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDocument) => {
          const elements = clonedDocument.querySelectorAll('*');
          elements.forEach((el) => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.backgroundColor.includes('lab')) el.style.backgroundColor = '#ffffff';
            if (computedStyle.color.includes('lab')) el.style.color = '#000000';
            if (computedStyle.borderColor.includes('lab')) el.style.borderColor = '#cbd5e1';
          });
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // 3. WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const billTypeHeader = invoiceType === 'gst' ? 'Tax Invoice (GST)' : 'Retail Sale Bill';

    const message =
      `*${billTypeHeader}*\n` +
      `*${storeDetails.name}*\n` +
      `-------------------------\n` +
      `📄 *Invoice No:* #${invoiceNum}\n` +
      `📅 *Date:* ${formattedDate}\n` +
      `💳 *Payment Mode:* ${paymentMode}\n` +
      `🛍️ *Total Items:* ${items.length}\n` +
      `💰 *Grand Total:* ₹${grandTotal}\n` +
      `-------------------------\n` +
      `Thank you for doing business with us!`;

    const encodedMsg = encodeURIComponent(message);
    const phone = customerDetails.phone !== "N/A" ? customerDetails.phone.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center p-2 sm:p-4 sm:items-center">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[94vh] border border-slate-200 dark:border-slate-800">

          {/* Modal Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-6 py-3.5 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900/40">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Sale Summary & Print Preview
                </h2>
                <p className="text-xs text-slate-500">Invoice #{invoiceNum}</p>
              </div>
            </div>

            {/* Layout Toggle Buttons (GST vs Retail) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setInvoiceType('gst')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  invoiceType === 'gst'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {invoiceType === 'gst' && <CheckCircle className="w-3.5 h-3.5" />}
                GST Tax Invoice
              </button>
              <button
                onClick={() => setInvoiceType('retail')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  invoiceType === 'retail'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {invoiceType === 'retail' && <CheckCircle className="w-3.5 h-3.5" />}
                Standard Bill
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Hidden iFrame for Instant Silent/Direct Printing */}
          <iframe ref={iframeRef} title="Print Frame" className="hidden" />

          {/* Printable Invoice Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950">
            <div
              ref={printRef}
              className="bg-white text-slate-800 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm max-w-3xl mx-auto font-sans"
              style={{ color: '#1e293b' }}
            >

              {/* Store Header Section */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{storeDetails.name}</h1>
                    <p className="text-xs text-slate-600 font-medium">{storeDetails.tagline}</p>
                    <p className="text-xs text-slate-600 max-w-xs mt-1">{storeDetails.address}</p>
                    <p className="text-xs text-slate-700 mt-1">
                      <strong>Ph:</strong> {storeDetails.phone} {storeDetails.email && `| Email: ${storeDetails.email}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block font-bold text-xs uppercase px-3 py-1 rounded-md mb-2 ${
                      invoiceType === 'gst' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
                    }`}>
                      {invoiceType === 'gst' ? 'TAX INVOICE' : 'RETAIL BILL / CASH MEMO'}
                    </span>
                    {invoiceType === 'gst' && storeDetails.gstin && (
                      <p className="text-xs text-slate-700"><strong>GSTIN:</strong> {storeDetails.gstin}</p>
                    )}
                    {storeDetails.pan && (
                      <p className="text-xs text-slate-700"><strong>PAN:</strong> {storeDetails.pan}</p>
                    )}
                    <p className="text-xs text-slate-700"><strong>State Code:</strong> {storeDetails.state}</p>
                  </div>
                </div>
              </div>

              {/* Billed To & Invoice Meta Details */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-1 border-b pb-1 border-slate-200">Billed To (Customer):</h3>
                  <p className="font-bold text-slate-900 text-sm">{customerDetails.name}</p>
                  <p className="text-slate-600">{customerDetails.address}</p>
                  <p className="text-slate-700 mt-1"><strong>Phone:</strong> {customerDetails.phone}</p>
                  {invoiceType === 'gst' && (
                    <p className="text-slate-700">
                      <strong>GSTIN:</strong> {customerDetails.gstin || 'Unregistered / B2C'}
                    </p>
                  )}
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-1 border-b pb-1 border-slate-200">Invoice Meta:</h3>
                  <div className="space-y-1">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Invoice No:</span>
                      <strong className="text-slate-900">{invoiceNum}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Invoice Date:</span>
                      <strong>{formattedDate}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <strong className="text-slate-900">{paymentMode}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <strong className="text-emerald-700 uppercase">{paymentStatus}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table - Layout Dynamic according to Type */}
              <div className="overflow-hidden border border-slate-300 rounded-lg mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3 border-r border-slate-700 text-center w-10">S.N.</th>
                      <th className="py-2.5 px-3 border-r border-slate-700">Item Description</th>
                      {invoiceType === 'gst' && (
                        <th className="py-2.5 px-3 border-r border-slate-700 text-center w-20">HSN/SAC</th>
                      )}
                      <th className="py-2.5 px-3 border-r border-slate-700 text-center w-16">Qty</th>
                      <th className="py-2.5 px-3 border-r border-slate-700 text-right w-24">Rate (₹)</th>
                      <th className="py-2.5 px-3 border-r border-slate-700 text-right w-20">Disc</th>
                      <th className="py-2.5 px-3 text-right w-28">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {items.map((item, index) => {
                      const qty = parseFloat(item.quantity || 1);
                      const unitPrice = parseFloat(item.unit_price || 0);
                      const rawTotal = qty * unitPrice;
                      const disc = parseFloat(item.discount_value || 0);
                      const discAmt = item.discount_type === 'percent' ? (rawTotal * (disc / 100)) : disc;
                      const itemTotal = item.total ? parseFloat(item.total) : (rawTotal - discAmt);

                      return (
                        <tr key={item.id || index} className="even:bg-slate-50">
                          <td className="py-2 px-3 border-r border-slate-200 text-center">{index + 1}</td>
                          <td className="py-2 px-3 border-r border-slate-200">
                            <p className="font-bold text-slate-900">{item.product_name}</p>
                            {item.brand_name && <p className="text-[10px] text-slate-500">Brand: {item.brand_name}</p>}
                          </td>
                          {invoiceType === 'gst' && (
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{item.hsn_code || '0401'}</td>
                          )}
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{qty}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right">₹{unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right text-red-600">
                            {disc > 0 ? `₹${discAmt.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-900">
                            ₹{itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Breakdown & Dynamic Bank Section */}
              <div className="flex justify-between items-start gap-4 mb-5">

                {/* Left Side: Dynamic Bank Details + Terms */}
                <div className="w-1/2 text-xs text-slate-600 space-y-3">
                  {hasBankDetails ? (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-1 border-b border-slate-200 pb-0.5">Bank Transfer Details:</h4>
                      <p><strong>Bank:</strong> {storeDetails.bankName}</p>
                      <p><strong>A/C No:</strong> {storeDetails.accountNo}</p>
                      {storeDetails.ifsc && <p><strong>IFSC:</strong> {storeDetails.ifsc}</p>}
                      {storeDetails.branch && <p><strong>Branch:</strong> {storeDetails.branch}</p>}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                      <p className="italic text-[11px]">Direct Cash / Digital POS Counter Invoice.</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-800">Terms & Conditions:</h4>
                    <ul className="list-disc pl-3 text-[10px] space-y-0.5 text-slate-500">
                      <li>Goods once sold will not be returned or exchanged.</li>
                      <li>Subject to local court jurisdiction.</li>
                      <li>This is a computer generated invoice.</li>
                    </ul>
                  </div>
                </div>

                {/* Right Side: Totals Calculation Table */}
                <div className="w-1/2">
                  <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                    <div className="flex justify-between p-2 border-b border-slate-200">
                      <span className="text-slate-600">Sub Total:</span>
                      <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between p-2 border-b border-slate-200 text-red-600">
                        <span>Total Discount:</span>
                        <span>- ₹{totalDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {invoiceType === 'gst' ? (
                      <>
                        <div className="flex justify-between p-2 border-b border-slate-200 font-semibold bg-slate-50">
                          <span>Taxable Amount:</span>
                          <span>₹{taxableValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-2 border-b border-slate-200">
                          <span className="text-slate-600">CGST (9%):</span>
                          <span>₹{cgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-2 border-b border-slate-200">
                          <span className="text-slate-600">SGST (9%):</span>
                          <span>₹{sgstAmount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between p-2 border-b border-slate-200 font-semibold bg-slate-50">
                        <span>Net Amount:</span>
                        <span>₹{taxableValue.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between p-2.5 bg-slate-900 text-white font-bold text-sm">
                      <span>Grand Total:</span>
                      <span className="text-emerald-400">₹{grandTotal}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Signature Section */}
              <div className="flex justify-between items-end pt-5 border-t border-slate-200 mt-2 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">E. & O.E.</p>
                  <p className="text-slate-700 font-medium mt-0.5">Thank you for your visit!</p>
                </div>
                <div className="text-center">
                  <div className="h-10 flex items-end justify-center mb-1">
                    <span className="font-serif italic text-slate-400 text-xs">{storeDetails.name}</span>
                  </div>
                  <p className="font-bold text-slate-800 border-t border-slate-400 pt-1 px-4">Authorised Signatory</p>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Bottom Action Bar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap justify-between items-center gap-3">
            
            <div className="flex flex-wrap gap-2">
              {/* Direct Print Button */}
              <button
                onClick={handleDirectPrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Printer className="w-4 h-4" />
                Direct Print
              </button>

              {/* Download PDF Button */}
              <button
                onClick={generatePDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>

              {/* Share on WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-xs font-medium rounded-lg border border-emerald-300 dark:border-emerald-800 transition"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp Share
              </button>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Payable Amount</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">₹{grandTotal}</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;
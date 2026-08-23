import React, { useState, useRef } from 'react';
import { X, FileText, Download, Receipt, Share2, Printer, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useGetProfile } from '@/hooks/useUserApi';
import { useSaleItem } from '@/hooks/useAi';

const SaleDetailsModal = ({ isOpen, onClose, invoiceInfo = {}, storeDetailsProp = {} }) => {
  // Invoice Type State: 'gst' for B2B Tax Invoice, 'retail' for Non-GST Bill
  const [invoiceType, setInvoiceType] = useState('gst');

  const printRef = useRef(null);
  const iframeRef = useRef(null);

  const { data: profileData } = useGetProfile();
  const activeStoreDetails = profileData || storeDetailsProp;

  const { data: saleData } = useSaleItem(invoiceInfo?.id);
  const items = Array.isArray(saleData) ? saleData : [];

  if (!isOpen || !items.length) return null;

  // Dynamic Store / Seller Details
  const storeDetails = {
    name: activeStoreDetails?.storeName || activeStoreDetails?.name || "",
    tagline: activeStoreDetails?.tagline || "",
    address: `${activeStoreDetails?.addressLine1 || ''} ${activeStoreDetails?.addressLine2 || ''}, ${activeStoreDetails?.landmark || ''}, ${activeStoreDetails?.state || ''} - ${activeStoreDetails?.pincode || ''}`.replace(/^[\s,]+|[\s,]+$/g, ''),
    gstin: activeStoreDetails?.gstin || "",
    pan: activeStoreDetails?.pan || "",
    state: activeStoreDetails?.state || "",
    phone: activeStoreDetails?.phone || "",
    email: activeStoreDetails?.email || "",
    bankName: invoiceInfo?.bank_name || activeStoreDetails?.bankName || null,
    accountNo: invoiceInfo?.account_number || activeStoreDetails?.accountNo || null,
    ifsc: invoiceInfo?.ifsc_code || activeStoreDetails?.ifsc || null,
    branch: invoiceInfo?.bank_branch || activeStoreDetails?.branch || null
  };

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
  const invoiceNum = rawInvoiceNum.length > 16 ? rawInvoiceNum.slice(-16) : rawInvoiceNum;

  const rawDate = invoiceInfo?.sale_date || invoiceInfo?.createdAt || items[0]?.createdAt || Date.now();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const paymentMode = (invoiceInfo?.payment_mode || 'CASH').toUpperCase();
  const paymentStatus = invoiceInfo?.status === 'completed' ? 'PAID' : (invoiceInfo?.status?.toUpperCase() || 'PAID');

  // Multi-Item Dynamic Calculations with per-item GST Rates
  let subTotal = 0;
  let totalDiscount = 0;
  let totalCgstAmount = 0;
  let totalSgstAmount = 0;

  const processedItems = items.map((item) => {
    const qty = parseFloat(item.quantity || 1);
    const unitPrice = parseFloat(item.unit_price || 0);
    const rawBaseTotal = qty * unitPrice;

    // Item-level Discount Calculation
    const discValue = parseFloat(item.discount_value || 0);
    const discAmt = item.discount_type === 'percent' ? (rawBaseTotal * (discValue / 100)) : discValue;
    const itemTaxableValue = Math.max(0, rawBaseTotal - discAmt);

    // Per Item Dynamic GST Split
    const itemGstRate = parseFloat(item.gst_rate !== undefined ? item.gst_rate : 18);
    const itemCgstRate = itemGstRate / 2;
    const itemSgstRate = itemGstRate / 2;

    const itemCgstAmt = (itemTaxableValue * itemCgstRate) / 100;
    const itemSgstAmt = (itemTaxableValue * itemSgstRate) / 100;
    const itemTotalTax = itemCgstAmt + itemSgstAmt;
    const itemGrandTotal = itemTaxableValue + itemTotalTax;

    subTotal += rawBaseTotal;
    totalDiscount += discAmt;
    totalCgstAmount += itemCgstAmt;
    totalSgstAmount += itemSgstAmt;

    return {
      ...item,
      qty,
      unitPrice,
      rawBaseTotal,
      discAmt,
      itemTaxableValue,
      itemGstRate,
      itemCgstRate,
      itemSgstRate,
      itemCgstAmt,
      itemSgstAmt,
      itemTotalTax,
      itemGrandTotal
    };
  });

  // Overall Sale Discount (if applied on total cart)
  const overallDiscount = parseFloat(invoiceInfo?.overall_discount_amount || 0);
  totalDiscount += overallDiscount;

  const netTaxableValue = Math.max(0, subTotal - totalDiscount);

  // Grand Total Calculation based on Invoice Type
  const totalTaxAmount = totalCgstAmount + totalSgstAmount;
  const grandTotalCalculated = invoiceType === 'gst'
    ? (netTaxableValue + totalTaxAmount)
    : netTaxableValue;

  const grandTotal = invoiceInfo?.grand_total ? parseFloat(invoiceInfo.grand_total).toFixed(2) : grandTotalCalculated.toFixed(2);

  // Direct Print Handler
  const handleDirectPrint = () => {
    const element = printRef.current;
    if (!element) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

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
              body { margin: 0; padding: 12px; background: white !important; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
            body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: #1e293b; background: white; }
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

  // Exact-Match PDF Export Handler
  const generatePDF = () => {
    const element = printRef.current;
    if (!element) return;

    const fileName = `${invoiceType === 'gst' ? 'TAX_INVOICE' : 'RETAIL_BILL'}_${invoiceNum}.pdf`;

    const opt = {
      margin: [4, 4, 4, 4],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 800,
        onclone: (clonedDocument) => {
          const clonedElement = clonedDocument.querySelector('#printable-invoice');
          if (clonedElement) {
            clonedElement.style.width = '790px';
            clonedElement.style.maxWidth = '100%';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.boxShadow = 'none';
          }
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

  // WhatsApp Share Handler
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[94vh] border border-slate-200 dark:border-slate-800">

          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3.5 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900/40">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Sale Summary & Print Preview
                </h2>
                <p className="text-xs text-slate-500">Invoice #{invoiceNum}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setInvoiceType('gst')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
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
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition ${
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
          </div>

          <iframe ref={iframeRef} title="Print Frame" className="hidden" />

          {/* Invoice Body Content */}
          <div className="p-2 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950">
            <div
              ref={printRef}
              id="printable-invoice"
              className="bg-white text-slate-800 p-4 sm:p-8 rounded-xl border border-slate-300 shadow-sm max-w-3xl mx-auto font-sans"
              style={{ color: '#1e293b' }}
            >

              {/* Store Details Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{storeDetails.name}</h1>
                    {storeDetails.tagline && <p className="text-xs text-slate-600 font-medium">{storeDetails.tagline}</p>}
                    <p className="text-xs text-slate-600 max-w-xs mt-1">{storeDetails.address}</p>
                    <p className="text-xs text-slate-700 mt-1">
                      <strong>Ph:</strong> {storeDetails.phone} {storeDetails.email && `| Email: ${storeDetails.email}`}
                    </p>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto">
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
                    {storeDetails.state && (
                      <p className="text-xs text-slate-700"><strong>State:</strong> {storeDetails.state}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billed To & Meta Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-1 border-b pb-1 border-slate-200">Billed To (Customer):</h3>
                  <p className="font-bold text-slate-900 text-sm">{customerDetails.name}</p>
                  {customerDetails.address && <p className="text-slate-600">{customerDetails.address}</p>}
                  <p className="text-slate-700 mt-1"><strong>Phone:</strong> {customerDetails.phone}</p>
                  {invoiceType === 'gst' && (
                    <p className="text-slate-700">
                      <strong>GSTIN:</strong> {customerDetails.gstin || 'Unregistered / B2C'}
                    </p>
                  )}
                </div>
                <div className="sm:border-l sm:border-slate-200 sm:pl-4">
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

              {/* Dynamic Items Table */}
              <div className="overflow-x-auto border border-slate-300 rounded-lg mb-4">
                <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider">
                      <th className="py-2 px-2 border-r border-slate-700 text-center w-8">#</th>
                      <th className="py-2 px-2 border-r border-slate-700">Item Description</th>
                      {invoiceType === 'gst' && (
                        <th className="py-2 px-2 border-r border-slate-700 text-center w-16">HSN/SAC</th>
                      )}
                      <th className="py-2 px-2 border-r border-slate-700 text-center w-12">Qty</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-right w-20">Rate (₹)</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-right w-16">Disc</th>
                      {invoiceType === 'gst' && (
                        <>
                          <th className="py-2 px-2 border-r border-slate-700 text-center w-14">GST %</th>
                          <th className="py-2 px-2 border-r border-slate-700 text-right w-20">Tax (₹)</th>
                        </>
                      )}
                      <th className="py-2 px-2 text-right w-24">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {processedItems.map((item, index) => (
                      <tr key={item.id || index} className="even:bg-slate-50">
                        <td className="py-2 px-2 border-r border-slate-200 text-center">{index + 1}</td>
                        <td className="py-2 px-2 border-r border-slate-200">
                          <p className="font-bold text-slate-900">{item.product_name}</p>
                          {item.brand_name && <p className="text-[10px] text-slate-500">Brand: {item.brand_name}</p>}
                        </td>
                        {invoiceType === 'gst' && (
                          <td className="py-2 px-2 border-r border-slate-200 text-center font-mono">{item.hsn_code || '--'}</td>
                        )}
                        <td className="py-2 px-2 border-r border-slate-200 text-center font-bold">{item.qty}</td>
                        <td className="py-2 px-2 border-r border-slate-200 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 border-r border-slate-200 text-right text-red-600">
                          {item.discAmt > 0 ? `₹${item.discAmt.toFixed(2)}` : '-'}
                        </td>
                        {invoiceType === 'gst' && (
                          <>
                            <td className="py-2 px-2 border-r border-slate-200 text-center font-semibold text-slate-800">
                              {item.itemGstRate}%
                            </td>
                            <td className="py-2 px-2 border-r border-slate-200 text-right text-slate-700">
                              ₹{item.itemTotalTax.toFixed(2)}
                            </td>
                          </>
                        )}
                        <td className="py-2 px-2 text-right font-semibold text-slate-900">
                          ₹{(invoiceType === 'gst' ? item.itemGrandTotal : item.itemTaxableValue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Breakdown & Dynamic Bank Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                <div className="w-full sm:w-1/2 text-xs text-slate-600 space-y-3 order-2 sm:order-1">
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

                {/* Calculation Summary Block */}
                <div className="w-full sm:w-1/2 order-1 sm:order-2">
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
                          <span>₹{netTaxableValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-2 border-b border-slate-200">
                          <span className="text-slate-600">CGST (Itemized Total):</span>
                          <span>₹{totalCgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-2 border-b border-slate-200">
                          <span className="text-slate-600">SGST (Itemized Total):</span>
                          <span>₹{totalSgstAmount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between p-2 border-b border-slate-200 font-semibold bg-slate-50">
                        <span>Net Amount:</span>
                        <span>₹{netTaxableValue.toFixed(2)}</span>
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

          {/* Modal Action Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
              <button
                onClick={handleDirectPrint}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow transition dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Printer className="w-4 h-4" />
                Direct Print
              </button>

              <button
                onClick={generatePDF}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-xs font-medium rounded-lg border border-emerald-300 dark:border-emerald-800 transition"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp Share
              </button>
            </div>

            <div className="text-center sm:text-right w-full sm:w-auto">
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
import { useRef } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { AdminInvoice } from '@/hooks/useAdminInvoices';
import { exportSectionBasedPDF } from '@/lib/pdfExport';
import orionLabsLogo from '@/assets/orion-labs-logo.png';

interface AdminInvoicePreviewProps {
  invoice: AdminInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAVY = '#1a1a2e';

export function AdminInvoicePreview({ invoice, open, onOpenChange }: AdminInvoicePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const taxAmount = invoice.subtotal * (invoice.tax_rate / 100);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    await exportSectionBasedPDF(contentRef.current, `${invoice.invoice_number}.pdf`);
  };

  const subscriptionRef = `REF-${invoice.tenant_user_id.slice(0, 8).toUpperCase()}`;

  const statusColor =
    invoice.status === 'paid' ? '#16a34a' :
    invoice.status === 'sent' ? '#2563eb' :
    invoice.status === 'overdue' ? '#dc2626' : '#6b7280';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <SheetTitle>Invoice Preview</SheetTitle>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </SheetHeader>

        <div className="p-4">
          <div ref={contentRef} className="bg-white text-black rounded-lg overflow-hidden" style={{ minHeight: 600 }}>
            
            {/* Navy Header Bar */}
            <div data-pdf-section style={{ background: NAVY }} className="px-8 py-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={orionLabsLogo} alt="Orion Labs" className="h-12 w-auto object-contain bg-white rounded-lg p-1.5" />
                  <div>
                    <h1 className="text-xl font-bold tracking-wide">ORION LABS</h1>
                    <p className="text-xs text-blue-200 mt-0.5">Business Management Platform</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold tracking-widest opacity-90">INVOICE</h2>
                  <p className="font-mono text-sm text-blue-200 mt-1">{invoice.invoice_number}</p>
                </div>
              </div>
            </div>

            {/* Status Strip */}
            <div data-pdf-section className="px-8 py-3 flex justify-between items-center" style={{ background: '#f0f4ff' }}>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                  style={{ background: statusColor }}
                >
                  {invoice.status}
                </span>
                <span className="text-xs text-gray-500 font-medium">Payment Terms: Due on Receipt</span>
              </div>
              <div className="text-xs text-gray-500">
                Issued {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
              </div>
            </div>

            {/* Body Content */}
            <div className="px-8 py-6">

              {/* Bill To & Dates Row */}
              <div data-pdf-section className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-4 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
                  <p className="font-semibold text-gray-900 text-base">{invoice.company_name}</p>
                  {invoice.tenant_email && <p className="text-sm text-gray-500 mt-0.5">{invoice.tenant_email}</p>}
                </div>
                <div className="p-4 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Invoice Details</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issue Date</span>
                      <span className="font-medium">{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Due Date</span>
                      <span className="font-medium">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
                    </div>
                    {invoice.payment_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Paid</span>
                        <span className="font-medium text-green-700">{format(new Date(invoice.payment_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div data-pdf-section className="mb-8 rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: NAVY }}>
                      <th className="text-left py-3 px-4 text-xs uppercase font-semibold text-blue-200 w-10">#</th>
                      <th className="text-left py-3 px-4 text-xs uppercase font-semibold text-blue-200">Description</th>
                      <th className="text-center py-3 px-4 text-xs uppercase font-semibold text-blue-200 w-16">Qty</th>
                      <th className="text-right py-3 px-4 text-xs uppercase font-semibold text-blue-200 w-28">Unit Price</th>
                      <th className="text-right py-3 px-4 text-xs uppercase font-semibold text-blue-200 w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : ''} style={i % 2 !== 0 ? { background: '#f8fafc' } : {}}>
                        <td className="py-3 px-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{item.description}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">M{Number(item.unit_price).toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                          M{(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div data-pdf-section className="flex justify-end mb-8">
                <div className="w-72 rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <div className="px-4 py-2 flex justify-between text-sm" style={{ background: '#f8fafc' }}>
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">M{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div className="px-4 py-2 flex justify-between text-sm border-t" style={{ borderColor: '#e2e8f0' }}>
                      <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                      <span className="font-medium">M{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="px-4 py-3 flex justify-between text-white font-bold text-lg" style={{ background: NAVY }}>
                    <span>Total Due</span>
                    <span>M{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div data-pdf-section className="mb-6 rounded-lg overflow-hidden" style={{ border: '1px solid #c7d2fe' }}>
                <div className="px-4 py-2" style={{ background: '#eef2ff' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: NAVY }}>Banking Details</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm bg-white">
                  <div><span className="text-gray-400">Bank:</span> <span className="font-semibold text-gray-800">First National Bank (FNB)</span></div>
                  <div><span className="text-gray-400">Branch:</span> <span className="font-semibold text-gray-800">Pioneer Mall</span></div>
                  <div><span className="text-gray-400">Account No:</span> <span className="font-semibold text-gray-800">63027317585</span></div>
                  <div><span className="text-gray-400">Reference:</span> <span className="font-semibold" style={{ color: NAVY }}>{subscriptionRef}</span></div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div data-pdf-section className="mb-6 p-4 rounded-lg" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}

              {/* Payment confirmation */}
              {invoice.status === 'paid' && invoice.payment_method && (
                <div data-pdf-section className="mb-6 p-4 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p className="text-sm">
                    <span className="font-semibold text-green-800">✓ Payment Received</span>
                    <span className="text-green-700"> via {invoice.payment_method}</span>
                    {invoice.payment_reference && <span className="text-green-600"> (Ref: {invoice.payment_reference})</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div data-pdf-section style={{ background: NAVY }} className="px-8 py-5 text-center">
              <p className="text-sm font-medium text-white">Thank you for your business!</p>
              <p className="text-xs text-blue-300 mt-1">Orion Labs · Pioneer Mall, Maseru, Lesotho · sales@orionlabslesotho.com</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useRef } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { AdminInvoice } from '@/hooks/useAdminInvoices';
import { exportSectionBasedPDF } from '@/lib/pdfExport';
import orionLabsLogo from '@/assets/orion-labs-logo.png';

interface AdminInvoicePreviewProps {
  invoice: AdminInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminInvoicePreview({ invoice, open, onOpenChange }: AdminInvoicePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const taxAmount = invoice.subtotal * (invoice.tax_rate / 100);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    await exportSectionBasedPDF(contentRef.current, `${invoice.invoice_number}.pdf`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Invoice Preview</SheetTitle>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </SheetHeader>

        <div ref={contentRef} className="bg-white text-black p-8 mt-4 rounded-lg border" style={{ minHeight: 600 }}>
          {/* Header */}
          <div data-pdf-section className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-3">
              <img src={orionLabsLogo} alt="Orion Labs" className="h-14 w-14 object-contain rounded" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orion Labs</h1>
                <p className="text-sm text-gray-500">Pioneer Mall, Maseru, Lesotho</p>
                <p className="text-sm text-gray-500">sales@orionlabslesotho.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
              <p className="font-mono text-lg">{invoice.invoice_number}</p>
              <Badge className={
                invoice.status === 'paid' ? 'bg-green-600 text-white' :
                invoice.status === 'sent' ? 'bg-blue-600 text-white' :
                invoice.status === 'overdue' ? 'bg-red-600 text-white' :
                'bg-gray-400 text-white'
              }>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Bill To & Dates */}
          <div data-pdf-section className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Bill To</p>
              <p className="font-semibold text-gray-900">{invoice.company_name}</p>
              {invoice.tenant_email && <p className="text-sm text-gray-600">{invoice.tenant_email}</p>}
            </div>
            <div className="text-right">
              <div className="text-sm space-y-1">
                <div><span className="text-gray-400">Issue Date:</span> {format(new Date(invoice.issue_date), 'MMM d, yyyy')}</div>
                <div><span className="text-gray-400">Due Date:</span> {format(new Date(invoice.due_date), 'MMM d, yyyy')}</div>
                {invoice.payment_date && (
                  <div><span className="text-gray-400">Paid:</span> {format(new Date(invoice.payment_date), 'MMM d, yyyy')}</div>
                )}
                <div className="font-semibold text-gray-700 pt-1">Payment Terms: Due on Receipt</div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table data-pdf-section className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs uppercase text-gray-400 font-semibold w-10">#</th>
                <th className="text-left py-2 text-xs uppercase text-gray-400 font-semibold">Description</th>
                <th className="text-right py-2 text-xs uppercase text-gray-400 font-semibold w-16">Qty</th>
                <th className="text-right py-2 text-xs uppercase text-gray-400 font-semibold w-28">Unit Price</th>
                <th className="text-right py-2 text-xs uppercase text-gray-400 font-semibold w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-sm text-gray-400">{i + 1}</td>
                  <td className="py-2 text-sm">{item.description}</td>
                  <td className="py-2 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 text-sm text-right">M{Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-2 text-sm text-right font-medium">
                    M{(item.quantity * item.unit_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div data-pdf-section className="flex justify-end mb-8">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>M{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({invoice.tax_rate}%)</span>
                  <span>M{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                <span>Total</span>
                <span>M{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div data-pdf-section className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Banking Details</p>
            <div className="text-sm space-y-1">
              <div><span className="text-gray-500">Bank:</span> <span className="font-medium">First National Bank (FNB)</span></div>
              <div><span className="text-gray-500">Branch:</span> <span className="font-medium">Pioneer Mall</span></div>
              <div><span className="text-gray-500">Account Number:</span> <span className="font-medium">63027317585</span></div>
              <div><span className="text-gray-500">Reference:</span> <span className="font-medium">{invoice.invoice_number}</span></div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div data-pdf-section className="mb-6 pt-4 border-t">
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment info */}
          {invoice.status === 'paid' && invoice.payment_method && (
            <div data-pdf-section className="mb-6 p-3 bg-green-50 rounded text-sm">
              <span className="font-medium text-green-800">Paid</span>
              <span className="text-green-700"> via {invoice.payment_method}</span>
              {invoice.payment_reference && <span className="text-green-700"> (Ref: {invoice.payment_reference})</span>}
            </div>
          )}

          {/* Footer */}
          <div data-pdf-section className="mt-8 pt-4 border-t text-center">
            <p className="text-sm font-medium text-gray-700">Thank you for your business!</p>
            <p className="text-xs text-gray-400 mt-1">Orion Labs · Pioneer Mall, Maseru, Lesotho · sales@orionlabslesotho.com</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

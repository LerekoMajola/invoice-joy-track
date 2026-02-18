import { useRef } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { AdminInvoice } from '@/hooks/useAdminInvoices';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    const canvas = await html2canvas(contentRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoice.invoice_number}.pdf`);
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orion Labs</h1>
              <p className="text-sm text-gray-500">Business Management Platform</p>
              <p className="text-sm text-gray-500">Maseru, Lesotho</p>
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
          <div className="grid grid-cols-2 gap-8 mb-8">
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
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs uppercase text-gray-400 font-semibold">Description</th>
                <th className="text-right py-2 text-xs uppercase text-gray-400 font-semibold w-16">Qty</th>
                <th className="text-right py-2 text-xs uppercase text-gray-400 font-semibold w-28">Unit Price</th>
                <th className="text-right py-2 text-xs uppercase text-gray-400 font-semibold w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
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
          <div className="flex justify-end">
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

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-4 border-t">
              <p className="text-xs font-semibold uppercase text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment info */}
          {invoice.status === 'paid' && invoice.payment_method && (
            <div className="mt-4 p-3 bg-green-50 rounded text-sm">
              <span className="font-medium text-green-800">Paid</span>
              <span className="text-green-700"> via {invoice.payment_method}</span>
              {invoice.payment_reference && <span className="text-green-700"> (Ref: {invoice.payment_reference})</span>}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

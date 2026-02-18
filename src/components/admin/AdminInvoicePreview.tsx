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
      <SheetContent side="right" className="w-full sm:max-w-[680px] overflow-y-auto p-0">
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <SheetTitle>Invoice Preview</SheetTitle>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </SheetHeader>

        <div className="p-4 flex justify-center">
          {/* A4 proportioned container: 210:297 ratio */}
          <div
            ref={contentRef}
            className="bg-white text-black overflow-hidden"
            style={{
              width: '595px',
              minHeight: '842px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: '12px',
              lineHeight: '1.4',
            }}
          >
            {/* Navy Header */}
            <div data-pdf-section style={{ background: NAVY, padding: '20px 28px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'middle', width: '72px' }}>
                      <img src={orionLabsLogo} alt="Orion Labs" style={{ height: '60px', width: 'auto', objectFit: 'contain', background: 'white', borderRadius: '8px', padding: '5px' }} />
                    </td>
                    <td style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                      <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>ORION LABS</div>
                      <div style={{ color: '#93c5fd', fontSize: '10px', marginTop: '2px' }}>Pioneer Mall, Maseru, Lesotho</div>
                      <div style={{ color: '#93c5fd', fontSize: '10px' }}>sales@orionlabslesotho.com</div>
                    </td>
                    <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', letterSpacing: '3px', opacity: 0.9 }}>INVOICE</div>
                      <div style={{ color: '#93c5fd', fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>{invoice.invoice_number}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms Strip */}
            <div data-pdf-section style={{ background: '#eef2ff', padding: '8px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 500 }}>Payment Terms: Due on Receipt</span>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>

              {/* Bill To & Details */}
              <div data-pdf-section style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', marginBottom: '6px' }}>Bill To</div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>{invoice.company_name}</div>
                  {invoice.tenant_email && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{invoice.tenant_email}</div>}
                </div>
                <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', marginBottom: '6px' }}>Invoice Details</div>
                  <table style={{ width: '100%', fontSize: '11px' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#9ca3af', padding: '1px 0' }}>Issue Date</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#9ca3af', padding: '1px 0' }}>Due Date</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</td>
                      </tr>
                      {invoice.payment_date && (
                        <tr>
                          <td style={{ color: '#9ca3af', padding: '1px 0' }}>Paid</td>
                          <td style={{ textAlign: 'right', fontWeight: 500, color: '#16a34a' }}>{format(new Date(invoice.payment_date), 'MMM d, yyyy')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Line Items */}
              <div data-pdf-section style={{ marginBottom: '24px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: NAVY }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: '#93c5fd', width: '32px' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: '#93c5fd' }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: '#93c5fd', width: '50px' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: '#93c5fd', width: '80px' }}>Unit Price</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, color: '#93c5fd', width: '80px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: any, i: number) => (
                      <tr key={i} style={{ background: i % 2 !== 0 ? '#f8fafc' : 'white' }}>
                        <td style={{ padding: '8px 12px', fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>{i + 1}</td>
                        <td style={{ padding: '8px 12px', fontSize: '11px', color: '#1f2937' }}>{item.description}</td>
                        <td style={{ padding: '8px 12px', fontSize: '11px', textAlign: 'center', color: '#4b5563' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 12px', fontSize: '11px', textAlign: 'right', color: '#4b5563' }}>M{Number(item.unit_price).toFixed(2)}</td>
                        <td style={{ padding: '8px 12px', fontSize: '11px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>M{(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div data-pdf-section style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <div style={{ width: '220px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', background: '#f8fafc' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal</span>
                    <span style={{ fontWeight: 500 }}>M{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#6b7280' }}>Tax ({invoice.tax_rate}%)</span>
                      <span style={{ fontWeight: 500 }}>M{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'white', background: NAVY }}>
                    <span>Total Due</span>
                    <span>M{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div data-pdf-section style={{ marginBottom: '16px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #c7d2fe' }}>
                <div style={{ background: '#eef2ff', padding: '6px 12px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: NAVY }}>Banking Details</div>
                </div>
                <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', fontSize: '11px', background: 'white' }}>
                  <div><span style={{ color: '#9ca3af' }}>Bank: </span><span style={{ fontWeight: 600, color: '#1f2937' }}>First National Bank (FNB)</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Branch: </span><span style={{ fontWeight: 600, color: '#1f2937' }}>Pioneer Mall</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Account No: </span><span style={{ fontWeight: 600, color: '#1f2937' }}>63027317585</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Reference: </span><span style={{ fontWeight: 600, color: NAVY }}>{subscriptionRef}</span></div>
                </div>
              </div>

              {/* Send POP instruction */}
              <div data-pdf-section style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', textAlign: 'center' }}>
                <span style={{ color: '#1e40af', fontWeight: 600 }}>Please send Proof of Payment (POP) to </span>
                <span style={{ color: NAVY, fontWeight: 700 }}>sales@orionlabslesotho.com</span>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div data-pdf-section style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '6px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#d97706', marginBottom: '4px' }}>Notes</div>
                  <div style={{ fontSize: '11px', color: '#374151', whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
                </div>
              )}

              {/* Payment confirmation */}
              {invoice.status === 'paid' && invoice.payment_method && (
                <div data-pdf-section style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600, color: '#166534' }}>✓ Payment Received</span>
                  <span style={{ color: '#15803d' }}> via {invoice.payment_method}</span>
                  {invoice.payment_reference && <span style={{ color: '#16a34a' }}> (Ref: {invoice.payment_reference})</span>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div data-pdf-section style={{ background: NAVY, padding: '14px 28px', textAlign: 'center', marginTop: 'auto' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'white' }}>Thank you for your business!</div>
              <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '4px' }}>Orion Labs · Pioneer Mall, Maseru, Lesotho · sales@orionlabslesotho.com</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

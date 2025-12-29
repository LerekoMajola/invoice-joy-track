import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatMaluti } from '@/lib/currency';
import html2pdf from 'html2pdf.js';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  sourceQuoteNumber?: string;
  clientName: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  description?: string;
  lineItems: LineItem[];
  taxRate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

interface InvoicePreviewProps {
  invoice: InvoiceData;
  onClose?: () => void;
}

export function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { profile, isLoading } = useCompanyProfile();

  const calculateSubtotal = () => {
    return invoice.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoice.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const opt = {
      margin: 0,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const primaryColor = profile?.template_primary_color || 'hsl(230, 35%, 18%)';
  const secondaryColor = profile?.template_secondary_color || 'hsl(230, 25%, 95%)';
  const accentColor = profile?.template_accent_color || 'hsl(230, 35%, 25%)';
  const fontFamily = profile?.template_font_family || 'DM Sans';
  const headerStyle = profile?.template_header_style || 'classic';
  const tableStyle = profile?.template_table_style || 'striped';

  const hasBankingDetails = profile?.bank_name || profile?.bank_account_number;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 print:hidden">
        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Invoice Document */}
      <div 
        ref={previewRef}
        className="bg-white shadow-lg mx-auto"
        style={{ 
          fontFamily: `'${fontFamily}', sans-serif`,
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          fontSize: '10pt',
          lineHeight: '1.4',
          color: '#1a1a1a',
        }}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-start pb-6 mb-6"
          style={{ 
            borderBottom: headerStyle === 'modern' ? `3px solid ${primaryColor}` : `1px solid ${primaryColor}`,
          }}
        >
          {/* Company Logo & Info */}
          <div className="flex items-start gap-4">
            {profile?.logo_url && (
              <img 
                src={profile.logo_url} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <h1 
                className="text-xl font-bold"
                style={{ color: primaryColor }}
              >
                {profile?.company_name || 'Your Company'}
              </h1>
              <div className="text-xs mt-1 space-y-0.5" style={{ color: accentColor }}>
                {profile?.address_line_1 && <p>{profile.address_line_1}</p>}
                {profile?.address_line_2 && <p>{profile.address_line_2}</p>}
                {(profile?.city || profile?.postal_code) && (
                  <p>{[profile.city, profile.postal_code].filter(Boolean).join(', ')}</p>
                )}
                {profile?.country && <p>{profile.country}</p>}
              </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="text-right">
            <h2 
              className="text-3xl font-bold tracking-wide"
              style={{ color: primaryColor }}
            >
              INVOICE
            </h2>
            {invoice.sourceQuoteNumber && (
              <p className="text-xs mt-1" style={{ color: accentColor }}>
                From Quote: {invoice.sourceQuoteNumber}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Details Row */}
        <div className="flex justify-between mb-8">
          {/* Bill To */}
          <div>
            <h3 
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: accentColor }}
            >
              Bill To
            </h3>
            <p className="font-semibold">{invoice.clientName}</p>
            {invoice.clientAddress && (
              <p className="text-sm whitespace-pre-line" style={{ color: accentColor }}>
                {invoice.clientAddress}
              </p>
            )}
          </div>

          {/* Invoice Info */}
          <div className="text-right">
            <div className="space-y-1">
              <div className="flex justify-end gap-4">
                <span className="text-xs uppercase tracking-wider" style={{ color: accentColor }}>
                  Invoice #
                </span>
                <span className="font-semibold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-xs uppercase tracking-wider" style={{ color: accentColor }}>
                  Invoice Date
                </span>
                <span>{invoice.date}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-xs uppercase tracking-wider" style={{ color: accentColor }}>
                  Due Date
                </span>
                <span className="font-semibold" style={{ color: primaryColor }}>{invoice.dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description/Scope */}
        {invoice.description && (
          <div 
            className="mb-6 p-4 rounded"
            style={{ backgroundColor: secondaryColor }}
          >
            <h3 
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: accentColor }}
            >
              Description
            </h3>
            <p className="text-sm whitespace-pre-line">{invoice.description}</p>
          </div>
        )}

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: primaryColor }}>
                <th className="text-left py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold">
                  Qty
                </th>
                <th className="text-left py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold">
                  Description
                </th>
                <th className="text-right py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold">
                  Unit Price
                </th>
                <th className="text-right py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr 
                  key={item.id}
                  style={{ 
                    backgroundColor: tableStyle === 'striped' && index % 2 === 0 
                      ? secondaryColor 
                      : 'transparent',
                    borderBottom: tableStyle === 'lined' ? '1px solid #e5e5e5' : 'none',
                  }}
                >
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">{formatMaluti(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatMaluti(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
              <span style={{ color: accentColor }}>Subtotal</span>
              <span>{formatMaluti(calculateSubtotal())}</span>
            </div>
            {profile?.vat_enabled && invoice.taxRate > 0 && (
              <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
                <span style={{ color: accentColor }}>
                  VAT ({invoice.taxRate}%)
                </span>
                <span>{formatMaluti(calculateTax())}</span>
              </div>
            )}
            <div 
              className="flex justify-between py-3 text-lg font-bold"
              style={{ color: primaryColor }}
            >
              <span>Total Due</span>
              <span>{formatMaluti(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        {hasBankingDetails && (
          <div 
            className="mb-6 p-4 rounded border-2"
            style={{ 
              backgroundColor: secondaryColor,
              borderColor: primaryColor,
            }}
          >
            <h3 
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: primaryColor }}
            >
              Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {profile?.bank_name && (
                <div className="flex">
                  <span className="w-32" style={{ color: accentColor }}>Bank Name:</span>
                  <span className="font-medium">{profile.bank_name}</span>
                </div>
              )}
              {profile?.bank_account_name && (
                <div className="flex">
                  <span className="w-32" style={{ color: accentColor }}>Account Name:</span>
                  <span className="font-medium">{profile.bank_account_name}</span>
                </div>
              )}
              {profile?.bank_account_number && (
                <div className="flex">
                  <span className="w-32" style={{ color: accentColor }}>Account No:</span>
                  <span className="font-medium">{profile.bank_account_number}</span>
                </div>
              )}
              {profile?.bank_branch_code && (
                <div className="flex">
                  <span className="w-32" style={{ color: accentColor }}>Branch Code:</span>
                  <span className="font-medium">{profile.bank_branch_code}</span>
                </div>
              )}
              {profile?.bank_swift_code && (
                <div className="flex">
                  <span className="w-32" style={{ color: accentColor }}>SWIFT Code:</span>
                  <span className="font-medium">{profile.bank_swift_code}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        {profile?.default_terms && (
          <div className="mb-8">
            <h3 
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: accentColor }}
            >
              Terms and Conditions
            </h3>
            <p className="text-xs whitespace-pre-line" style={{ color: accentColor }}>
              {profile.default_terms}
            </p>
          </div>
        )}

        {/* Signature Section */}
        <div className="flex justify-between mt-12 pt-8 border-t" style={{ borderColor: '#e5e5e5' }}>
          {/* Authorized Signature */}
          <div className="w-64">
            <p className="text-xs uppercase tracking-wider mb-4" style={{ color: accentColor }}>
              Authorized Signature
            </p>
            {profile?.signature_url ? (
              <img 
                src={profile.signature_url} 
                alt="Signature" 
                className="h-12 w-auto object-contain mb-2"
              />
            ) : (
              <div className="h-12 border-b-2" style={{ borderColor: primaryColor }}></div>
            )}
          </div>

          {/* Customer Signature */}
          <div className="w-64">
            <p className="text-xs uppercase tracking-wider mb-4" style={{ color: accentColor }}>
              Customer Signature
            </p>
            <div className="h-12 border-b-2" style={{ borderColor: primaryColor }}></div>
            <p className="text-xs mt-2" style={{ color: accentColor }}>Date: _____________</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 text-center border-t" style={{ borderColor: '#e5e5e5' }}>
          {profile?.footer_text ? (
            <p className="text-xs" style={{ color: accentColor }}>{profile.footer_text}</p>
          ) : (
            <p className="text-xs" style={{ color: accentColor }}>Thank you for your business!</p>
          )}
          <div className="flex justify-center gap-4 mt-2 text-xs" style={{ color: accentColor }}>
            {profile?.phone && <span>Tel: {profile.phone}</span>}
            {profile?.email && <span>Email: {profile.email}</span>}
            {profile?.website && <span>Web: {profile.website}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Pencil, Save, Send, CheckCircle, Truck } from 'lucide-react';
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
  purchaseOrderNumber?: string;
}

interface InvoicePreviewProps {
  invoice: InvoiceData;
  hasDeliveryNote?: boolean;
  onUpdate?: (data: InvoiceData) => void;
  onStatusChange?: (status: InvoiceData['status']) => void;
  onGenerateDeliveryNote?: () => void;
  onClose?: () => void;
}

export function InvoicePreview({ invoice, hasDeliveryNote, onUpdate, onStatusChange, onGenerateDeliveryNote, onClose }: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { profile, isLoading } = useCompanyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(invoice);

  // Sync with incoming invoice prop
  useEffect(() => {
    setInvoiceData(invoice);
  }, [invoice]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(invoiceData);
    }
    setIsEditing(false);
  };

  // Load custom font from profile
  useEffect(() => {
    if (profile?.template_font_url) {
      const existingLink = document.querySelector(`link[href="${profile.template_font_url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = profile.template_font_url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [profile?.template_font_url]);

  // Build company details from profile
  const getCompanyDetails = () => {
    if (!profile) return ['Company Name'];
    
    // Use header_info if available, otherwise fall back to individual fields
    if (profile.header_info) {
      return profile.header_info.split('\n');
    }
    
    const lines = [profile.company_name];
    if (profile.address_line_1) lines.push(profile.address_line_1);
    if (profile.address_line_2) lines.push(profile.address_line_2);
    if (profile.city || profile.postal_code) {
      lines.push([profile.city, profile.postal_code].filter(Boolean).join(', '));
    }
    if (profile.country) lines.push(profile.country);
    if (profile.phone) lines.push(`Tel: ${profile.phone}`);
    if (profile.email) lines.push(`Email: ${profile.email}`);
    if (profile.registration_number) lines.push(`IBR NO: ${profile.registration_number}`);
    if (profile.vat_enabled && profile.vat_number) lines.push(`TIN NO: ${profile.vat_number}`);
    
    return lines;
  };

  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const opt = {
      margin: 0,
      filename: `${invoiceData.invoiceNumber}.pdf`,
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
      <div className="flex justify-between items-center print:hidden">
        <div className="flex gap-2 items-center">
          {isEditing ? (
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {/* Status Actions */}
          {onStatusChange && invoiceData.status === 'draft' && (
            <Button 
              onClick={() => onStatusChange('sent')} 
              variant="outline" 
              size="sm"
              className="gap-2 text-info border-info/30 hover:bg-info/10"
            >
              <Send className="h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          {onStatusChange && invoiceData.status === 'sent' && (
            <Button 
              onClick={() => onStatusChange('paid')} 
              variant="outline" 
              size="sm"
              className="gap-2 text-success border-success/30 hover:bg-success/10"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          
          {/* Generate Delivery Note */}
          {onGenerateDeliveryNote && !hasDeliveryNote && (invoiceData.status === 'sent' || invoiceData.status === 'paid') && (
            <Button 
              onClick={onGenerateDeliveryNote} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Truck className="h-4 w-4" />
              Generate Delivery Note
            </Button>
          )}
          {hasDeliveryNote && (
            <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-success/10 text-success border-success/20">
              <Truck className="h-4 w-4" />
              Delivery Note Created
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
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
        <div className="flex justify-between items-start mb-6">
          {/* Company Info */}
          <div className="flex-1 max-w-md">
            <div className="text-sm" style={{ color: primaryColor }}>
              {getCompanyDetails().map((line, idx) => (
                <p key={idx} className={idx === 0 ? 'text-xl font-bold mb-1' : 'text-gray-600'}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Logo from profile */}
          <div>
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Company Logo" className="h-16 object-contain" />
            ) : (
              <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                No Logo
              </div>
            )}
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-right mb-6">
          <h1 
            className="text-4xl font-light tracking-widest uppercase"
            style={{ color: primaryColor }}
          >
            Invoice
          </h1>
          {invoiceData.sourceQuoteNumber && (
            <p className="text-xs mt-1" style={{ color: accentColor }}>
              From Quote: {invoiceData.sourceQuoteNumber}
            </p>
          )}
        </div>

        {/* Client & Invoice Info */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: primaryColor }}>To</p>
            <h3 className="text-lg font-bold text-gray-900">
              {invoiceData.clientName}
            </h3>
            {invoiceData.clientAddress && (
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {invoiceData.clientAddress}
              </p>
            )}
          </div>
          <div className="text-right space-y-1">
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>Invoice #</span>
              <span className="text-sm text-gray-900 w-32">{invoiceData.invoiceNumber}</span>
            </div>
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>Invoice date</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={invoiceData.date.split('T')[0]}
                  onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                  className="text-sm w-32 h-7 border-dashed"
                />
              ) : (
                <span className="text-sm text-gray-900 w-32">{new Date(invoiceData.date).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>Due date</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={invoiceData.dueDate.split('T')[0]}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  className="text-sm w-32 h-7 border-dashed"
                />
              ) : (
                <span className="text-sm text-gray-900 w-32">{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>PO #</span>
              {isEditing ? (
                <Input
                  type="text"
                  value={invoiceData.purchaseOrderNumber || ''}
                  onChange={(e) => setInvoiceData({ ...invoiceData, purchaseOrderNumber: e.target.value })}
                  placeholder="Enter PO #"
                  className="text-sm w-32 h-7 border-dashed"
                />
              ) : (
                <span className="text-sm text-gray-900 w-32">{invoiceData.purchaseOrderNumber || '-'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description/Scope */}
        {invoiceData.description && (
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
            <p className="text-sm whitespace-pre-line">{invoiceData.description}</p>
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
              {invoiceData.lineItems.map((item, index) => (
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
            {profile?.vat_enabled && invoiceData.taxRate > 0 && (
              <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
                <span style={{ color: accentColor }}>
                  VAT ({invoiceData.taxRate}%)
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

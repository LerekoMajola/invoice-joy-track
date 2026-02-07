import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Pencil, Save, Send, CheckCircle, Truck, Palette } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatMaluti } from '@/lib/currency';
import html2pdf from 'html2pdf.js';
import { TemplateSelector, templates, DocumentTemplate } from '@/components/quotes/DocumentTemplates';
import {
  DocumentHeader,
  DocumentWrapper,
  ClientInfoSection,
  DescriptionSection,
  getTableHeaderStyle,
  getTableRowStyle,
  TotalsSection,
  DocumentFooter,
  buildTemplateFromProfile,
  buildCompanyInfo,
} from '@/components/quotes/DocumentLayoutRenderer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);

  useEffect(() => { setInvoiceData(invoice); }, [invoice]);

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

  // Update template when profile loads
  useEffect(() => {
    if (profile && selectedTemplate.id === templates[0].id) {
      setSelectedTemplate(buildTemplateFromProfile(profile, templates[0]));
    }
  }, [profile]);

  const handleSave = () => { if (onUpdate) onUpdate(invoiceData); setIsEditing(false); };

  const company = buildCompanyInfo(profile);

  const calculateSubtotal = () => invoiceData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculateTax = () => calculateSubtotal() * (invoiceData.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    const opt = {
      margin: 0,
      filename: `${invoiceData.invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    try { await html2pdf().set(opt).from(previewRef.current).save(); }
    catch (error) { console.error('Error generating PDF:', error); }
  };

  const handlePrint = () => { window.print(); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasBankingDetails = profile?.bank_name || profile?.bank_account_number;
  const thStyle = getTableHeaderStyle(selectedTemplate);

  const headerFields = [
    { label: 'Invoice #', value: invoiceData.invoiceNumber },
    {
      label: 'Invoice date',
      value: isEditing ? (
        <Input type="date" value={invoiceData.date.split('T')[0]} onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })} className="text-sm w-32 h-7 border-dashed" />
      ) : new Date(invoiceData.date).toLocaleDateString()
    },
    {
      label: 'Due date',
      value: isEditing ? (
        <Input type="date" value={invoiceData.dueDate.split('T')[0]} onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })} className="text-sm w-32 h-7 border-dashed" />
      ) : new Date(invoiceData.dueDate).toLocaleDateString()
    },
    {
      label: 'PO #',
      value: isEditing ? (
        <Input type="text" value={invoiceData.purchaseOrderNumber || ''} onChange={(e) => setInvoiceData({ ...invoiceData, purchaseOrderNumber: e.target.value })} placeholder="Enter PO #" className="text-sm w-32 h-7 border-dashed" />
      ) : (invoiceData.purchaseOrderNumber || '-')
    },
  ];

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex gap-2 items-center">
          {isEditing ? (
            <Button onClick={handleSave} size="sm"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm"><Pencil className="h-4 w-4 mr-2" /> Edit</Button>
          )}
          {onStatusChange && invoiceData.status === 'draft' && (
            <Button onClick={() => onStatusChange('sent')} variant="outline" size="sm" className="gap-2 text-info border-info/30 hover:bg-info/10">
              <Send className="h-4 w-4" /> Mark as Sent
            </Button>
          )}
          {onStatusChange && invoiceData.status === 'sent' && (
            <Button onClick={() => onStatusChange('paid')} variant="outline" size="sm" className="gap-2 text-success border-success/30 hover:bg-success/10">
              <CheckCircle className="h-4 w-4" /> Mark as Paid
            </Button>
          )}
          {onGenerateDeliveryNote && !hasDeliveryNote && (invoiceData.status === 'sent' || invoiceData.status === 'paid') && (
            <Button onClick={onGenerateDeliveryNote} variant="outline" size="sm" className="gap-2">
              <Truck className="h-4 w-4" /> Generate Delivery Note
            </Button>
          )}
          {hasDeliveryNote && (
            <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-success/10 text-success border-success/20">
              <Truck className="h-4 w-4" /> Delivery Note Created
            </Badge>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Palette className="h-4 w-4" /> Template
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px]" align="start">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Choose Template</h4>
                <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
          <Button onClick={handlePrint} variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" /> Print</Button>
        </div>
      </div>

      {/* Invoice Document */}
      <DocumentWrapper template={selectedTemplate} fontFamily={selectedTemplate.fontFamily} innerRef={previewRef}>
        <DocumentHeader
          template={selectedTemplate}
          company={company}
          documentTitle="Invoice"
          fields={headerFields}
          extraTitleContent={invoiceData.sourceQuoteNumber ? (
            <p className="text-xs mt-0.5" style={{ color: selectedTemplate.accentColor }}>From Quote: {invoiceData.sourceQuoteNumber}</p>
          ) : undefined}
        />

        <ClientInfoSection template={selectedTemplate} label="To" fields={headerFields}>
          <h3 className="text-base font-bold text-gray-900">{invoiceData.clientName}</h3>
          {invoiceData.clientAddress && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.clientAddress}</p>
          )}
        </ClientInfoSection>

        {/* Description */}
        {invoiceData.description && (
          <DescriptionSection template={selectedTemplate} title="Description">
            <p className="text-sm whitespace-pre-line">{invoiceData.description}</p>
          </DescriptionSection>
        )}

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={thStyle}>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Qty</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Description</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold">Unit Price</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.map((item, index) => (
                <tr key={item.id} style={getTableRowStyle(selectedTemplate, index)}>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">{formatMaluti(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatMaluti(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <TotalsSection template={selectedTemplate}>
          <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
            <span style={{ color: selectedTemplate.accentColor }}>Subtotal</span>
            <span>{formatMaluti(calculateSubtotal())}</span>
          </div>
          {profile?.vat_enabled && invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
              <span style={{ color: selectedTemplate.accentColor }}>VAT ({invoiceData.taxRate}%)</span>
              <span>{formatMaluti(calculateTax())}</span>
            </div>
          )}
          <div className="flex justify-between py-3 text-lg font-bold" style={{ color: selectedTemplate.primaryColor }}>
            <span>Total Due</span>
            <span>{formatMaluti(calculateTotal())}</span>
          </div>
        </TotalsSection>

        {/* Banking Details */}
        {hasBankingDetails && (
          <DescriptionSection template={selectedTemplate} title="Payment Details">
            <div className="flex flex-col gap-y-0.5 text-xs">
              {profile?.bank_name && (
                <div className="flex">
                  <span className="w-24" style={{ color: selectedTemplate.accentColor }}>Bank Name:</span>
                  <span className="font-medium">{profile.bank_name}</span>
                </div>
              )}
              {profile?.bank_account_name && (
                <div className="flex">
                  <span className="w-24" style={{ color: selectedTemplate.accentColor }}>Account Name:</span>
                  <span className="font-medium">{profile.bank_account_name}</span>
                </div>
              )}
              {profile?.bank_account_number && (
                <div className="flex">
                  <span className="w-24" style={{ color: selectedTemplate.accentColor }}>Account No:</span>
                  <span className="font-medium">{profile.bank_account_number}</span>
                </div>
              )}
              {profile?.bank_branch_code && (
                <div className="flex">
                  <span className="w-24" style={{ color: selectedTemplate.accentColor }}>Branch Code:</span>
                  <span className="font-medium">{profile.bank_branch_code}</span>
                </div>
              )}
              {profile?.bank_swift_code && (
                <div className="flex">
                  <span className="w-24" style={{ color: selectedTemplate.accentColor }}>SWIFT Code:</span>
                  <span className="font-medium">{profile.bank_swift_code}</span>
                </div>
              )}
            </div>
          </DescriptionSection>
        )}

        {/* Terms */}
        {profile?.default_terms && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: selectedTemplate.accentColor }}>
              Terms and Conditions
            </h3>
            <p className="text-xs whitespace-pre-line" style={{ color: selectedTemplate.accentColor }}>
              {profile.default_terms}
            </p>
          </div>
        )}

        <DocumentFooter
          template={selectedTemplate}
          footerText={profile?.footer_text}
          phone={profile?.phone}
          email={profile?.email}
          website={profile?.website}
        />
      </DocumentWrapper>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Plus, X, Pencil, Save, Palette, Send, CheckCircle, XCircle, RotateCcw, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import html2pdf from 'html2pdf.js';
import { formatMaluti } from '@/lib/currency';
import { TemplateSelector, templates, DocumentTemplate } from './DocumentTemplates';
import {
  DocumentHeader,
  DocumentWrapper,
  ClientInfoSection,
  getTableHeaderStyle,
  getTableRowStyle,
  TotalsSection,
  DocumentFooter,
  SectionLabel,
  buildTemplateFromProfile,
  buildCompanyInfo,
} from './DocumentLayoutRenderer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

interface Client {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
}

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

interface QuoteData {
  quoteNumber: string;
  date: string;
  dueDate: string;
  status?: QuoteStatus;
  client: Client | null;
  lineItems: LineItem[];
  taxRate: number;
  termsAndConditions: string;
  description?: string;
  leadTime?: string;
  notes?: string;
}

interface QuotePreviewProps {
  quoteData: QuoteData;
  isConverted?: boolean;
  linkedInvoiceNumber?: string | null;
  onUpdate: (data: QuoteData) => void;
  onStatusChange?: (status: QuoteStatus) => void;
  onConvertToInvoice?: () => void;
  onClose: () => void;
}

export function QuotePreview({ quoteData, isConverted, linkedInvoiceNumber, onUpdate, onStatusChange, onConvertToInvoice, onClose }: QuotePreviewProps) {
  const { profile, isLoading } = useCompanyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<QuoteData>({
    ...quoteData,
    description: quoteData.description || '',
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);
  const quoteRef = useRef<HTMLDivElement>(null);

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

  const company = buildCompanyInfo(profile);

  const calculateSubtotal = () => data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculateTax = () => calculateSubtotal() * (data.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const addLineItem = () => {
    setData({
      ...data,
      lineItems: [...data.lineItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, costPrice: 0 }]
    });
  };

  const removeLineItem = (id: string) => {
    if (data.lineItems.length > 1) {
      setData({ ...data, lineItems: data.lineItems.filter(item => item.id !== id) });
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setData({
      ...data,
      lineItems: data.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleSave = () => { onUpdate(data); setIsEditing(false); };

  const handleDownloadPDF = () => {
    if (!quoteRef.current) return;
    const opt = {
      margin: 0.5,
      filename: `${data.quoteNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(quoteRef.current).save();
  };

  const headerFields = [
    { label: 'Quote #', value: data.quoteNumber },
    {
      label: 'Quote date',
      value: isEditing ? (
        <Input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="text-sm w-28 h-6 border-dashed" />
      ) : new Date(data.date).toLocaleDateString()
    },
    {
      label: 'Due date',
      value: isEditing ? (
        <Input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} className="text-sm w-28 h-6 border-dashed" />
      ) : new Date(data.dueDate).toLocaleDateString()
    },
  ];

  const thStyle = getTableHeaderStyle(selectedTemplate);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-auto">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 backdrop-blur py-3 px-4 rounded-lg border border-border shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Template
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
          <div className="flex items-center gap-2">
            {onStatusChange && quoteData.status === 'draft' && (
              <Button variant="outline" onClick={() => onStatusChange('sent')} className="gap-2 text-info border-info/30 hover:bg-info/10">
                <Send className="h-4 w-4" /> Mark as Sent
              </Button>
            )}
            {onStatusChange && quoteData.status === 'sent' && (
              <>
                <Button variant="outline" onClick={() => onStatusChange('accepted')} className="gap-2 text-success border-success/30 hover:bg-success/10">
                  <CheckCircle className="h-4 w-4" /> Accept
                </Button>
                <Button variant="outline" onClick={() => onStatusChange('rejected')} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            {onStatusChange && quoteData.status === 'rejected' && (
              <Button variant="outline" onClick={() => onStatusChange('draft')} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Revise
              </Button>
            )}
            {quoteData.status === 'accepted' && isConverted && (
              <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-success/10 text-success border-success/20">
                <CheckCircle className="h-4 w-4" /> Converted to {linkedInvoiceNumber}
              </Badge>
            )}
            {onConvertToInvoice && quoteData.status === 'accepted' && !isConverted && (
              <Button variant="outline" onClick={onConvertToInvoice} className="gap-2 text-success border-success/30 hover:bg-success/10">
                <Receipt className="h-4 w-4" /> Convert to Invoice
              </Button>
            )}
            {isEditing ? (
              <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
            )}
            <Button onClick={handleDownloadPDF} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
          </div>
        </div>

        {/* Quote Document */}
        <DocumentWrapper template={selectedTemplate} fontFamily={selectedTemplate.fontFamily} innerRef={quoteRef}>
          <DocumentHeader
            template={selectedTemplate}
            company={company}
            documentTitle="Quote"
            fields={headerFields}
          />

          <ClientInfoSection template={selectedTemplate} label="To" fields={headerFields}>
            <h3 className="text-base font-bold text-gray-900">{data.client?.company || 'Customer Name'}</h3>
            {data.client?.contactPerson && <p className="text-sm text-gray-600">Contact: {data.client.contactPerson}</p>}
            {isEditing ? (
              <Textarea
                value={data.client?.address || ''}
                onChange={(e) => setData({ ...data, client: data.client ? { ...data.client, address: e.target.value } : null })}
                placeholder="Client address..." className="mt-1 text-sm border-dashed w-64" rows={2}
              />
            ) : (
              data.client?.address && <p className="text-sm text-gray-600 whitespace-pre-line">{data.client.address}</p>
            )}
            {data.client?.phone && <p className="text-sm text-gray-600">Tel: {data.client.phone}</p>}
            {data.client?.email && <p className="text-sm text-gray-600">Email: {data.client.email}</p>}
          </ClientInfoSection>

          {/* Description */}
          <div className="mb-8">
            <SectionLabel template={selectedTemplate}>Description / Scope of Work</SectionLabel>
            {isEditing ? (
              <Textarea
                value={data.description || ''}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="Enter a detailed description..." className="text-sm border-dashed min-h-[100px]" rows={4}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{data.description || 'No description provided.'}</p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full" style={{ borderCollapse: selectedTemplate.tableStyle === 'bordered' ? 'collapse' : undefined }}>
              <thead>
                <tr style={thStyle}>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={selectedTemplate.tableStyle === 'bordered' ? { border: '1px solid #ccc' } : undefined}>QTY</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={selectedTemplate.tableStyle === 'bordered' ? { border: '1px solid #ccc' } : undefined}>Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold" style={selectedTemplate.tableStyle === 'bordered' ? { border: '1px solid #ccc' } : undefined}>Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold" style={selectedTemplate.tableStyle === 'bordered' ? { border: '1px solid #ccc' } : undefined}>Amount</th>
                  {isEditing && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => (
                  <tr key={item.id} style={getTableRowStyle(selectedTemplate, index)}>
                    <td className="py-3 px-4 text-sm">
                      {isEditing ? (
                        <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-16 h-8 text-sm border-dashed" />
                      ) : item.quantity.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {isEditing ? (
                        <Input value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} className="h-8 text-sm border-dashed" />
                      ) : item.description}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {isEditing ? (
                        <Input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-24 h-8 text-sm text-right border-dashed ml-auto" />
                      ) : formatMaluti(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">{formatMaluti(item.quantity * item.unitPrice)}</td>
                    {isEditing && (
                      <td className="py-3 px-2">
                        <button onClick={() => removeLineItem(item.id)} disabled={data.lineItems.length === 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditing && (
              <button onClick={addLineItem} className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add Line Item
              </button>
            )}
          </div>

          {/* Totals */}
          <TotalsSection template={selectedTemplate}>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-gray-900">{formatMaluti(calculateSubtotal())}</span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">VAT</span>
                    {isEditing && <span className="text-sm text-gray-600">(</span>}
                    {isEditing && (
                      <Input type="number" value={data.taxRate} onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })} className="w-12 h-6 text-xs text-center border-dashed p-1" />
                    )}
                    <span className="text-sm text-gray-600">{isEditing ? '%)' : `(${data.taxRate}%)`}</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatMaluti(calculateTax())}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>Total (M)</span>
                <span className="text-lg font-bold" style={{ color: selectedTemplate.primaryColor }}>{formatMaluti(calculateTotal())}</span>
              </div>
            </div>
          </TotalsSection>

          {/* Terms */}
          <div className="mb-6">
            <SectionLabel template={selectedTemplate}>Terms and Conditions</SectionLabel>
            {isEditing ? (
              <Textarea value={data.termsAndConditions} onChange={(e) => setData({ ...data, termsAndConditions: e.target.value })} className="text-sm border-dashed" rows={3} />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-line">{data.termsAndConditions}</p>
            )}
          </div>

          {/* Lead Time */}
          {(data.leadTime || isEditing) && (
            <div className="mb-6">
              <SectionLabel template={selectedTemplate}>Lead Time</SectionLabel>
              {isEditing ? (
                <Input value={data.leadTime || ''} onChange={(e) => setData({ ...data, leadTime: e.target.value })} placeholder="e.g., 2-3 weeks" className="text-sm border-dashed w-64 h-7" />
              ) : (
                <p className="text-sm text-gray-700">{data.leadTime}</p>
              )}
            </div>
          )}

          {/* Notes */}
          {(data.notes || isEditing) && (
            <div className="mb-12">
              <SectionLabel template={selectedTemplate}>Notes</SectionLabel>
              {isEditing ? (
                <Textarea value={data.notes || ''} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="Additional notes..." className="text-sm border-dashed" rows={2} />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-line">{data.notes}</p>
              )}
            </div>
          )}

          {/* Signature */}
          {profile?.signature_url && (
            <div className="mb-8">
              <SectionLabel template={selectedTemplate}>Authorized Signature</SectionLabel>
              <img src={profile.signature_url} alt="Signature" className="h-12 object-contain" />
            </div>
          )}

          <div className="flex justify-end mb-8">
            <div className="text-center">
              <div className="w-48 border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-400 italic">customer signature</p>
              </div>
            </div>
          </div>

          <DocumentFooter
            template={selectedTemplate}
            footerText={profile?.footer_text}
            phone={profile?.phone}
            email={profile?.email}
            website={profile?.website}
          />
        </DocumentWrapper>
      </div>
    </div>
  );
}

export default QuotePreview;

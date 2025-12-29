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
}

interface Client {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
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
  
  // Create a custom template from profile or use first predefined template
  const getCustomTemplate = (): DocumentTemplate => {
    if (profile?.template_primary_color) {
      return {
        id: 'custom',
        name: 'Custom',
        primaryColor: profile.template_primary_color,
        secondaryColor: profile.template_secondary_color || 'hsl(230, 25%, 95%)',
        accentColor: profile.template_accent_color || 'hsl(230, 35%, 25%)',
        fontFamily: profile.template_font_family ? `'${profile.template_font_family}', sans-serif` : "'DM Sans', sans-serif",
        headerStyle: (profile.template_header_style as 'classic' | 'modern' | 'minimal') || 'classic',
        tableStyle: (profile.template_table_style as 'striped' | 'bordered' | 'clean') || 'striped',
      };
    }
    return templates[0];
  };

  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(getCustomTemplate());
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
    if (profile && !selectedTemplate.id.startsWith('custom')) {
      // Only update if we haven't already selected a different template
      setSelectedTemplate(getCustomTemplate());
    }
  }, [profile]);

  // Build company details from profile
  const getCompanyDetails = () => {
    if (!profile) return 'Company Name\nAddress\nPhone\nEmail';
    
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
    
    return lines.join('\n');
  };

  const calculateSubtotal = () => {
    return data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (data.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const addLineItem = () => {
    setData({
      ...data,
      lineItems: [...data.lineItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeLineItem = (id: string) => {
    if (data.lineItems.length > 1) {
      setData({
        ...data,
        lineItems: data.lineItems.filter(item => item.id !== id)
      });
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setData({
      ...data,
      lineItems: data.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handleSave = () => {
    onUpdate(data);
    setIsEditing(false);
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-auto">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 backdrop-blur py-3 px-4 rounded-lg border border-border shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Template
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px]" align="start">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Choose Template</h4>
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={setSelectedTemplate}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Action Buttons */}
            {onStatusChange && quoteData.status === 'draft' && (
              <Button variant="outline" onClick={() => onStatusChange('sent')} className="gap-2 text-info border-info/30 hover:bg-info/10">
                <Send className="h-4 w-4" />
                Mark as Sent
              </Button>
            )}
            {onStatusChange && quoteData.status === 'sent' && (
              <>
                <Button variant="outline" onClick={() => onStatusChange('accepted')} className="gap-2 text-success border-success/30 hover:bg-success/10">
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </Button>
                <Button variant="outline" onClick={() => onStatusChange('rejected')} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {onStatusChange && quoteData.status === 'rejected' && (
              <Button variant="outline" onClick={() => onStatusChange('draft')} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Revise
              </Button>
            )}
            {quoteData.status === 'accepted' && isConverted && (
              <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-success/10 text-success border-success/20">
                <CheckCircle className="h-4 w-4" />
                Converted to {linkedInvoiceNumber}
              </Badge>
            )}
            {onConvertToInvoice && quoteData.status === 'accepted' && !isConverted && (
              <Button variant="outline" onClick={onConvertToInvoice} className="gap-2 text-success border-success/30 hover:bg-success/10">
                <Receipt className="h-4 w-4" />
                Convert to Invoice
              </Button>
            )}
            
            {isEditing ? (
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Quote Document */}
        <div 
          ref={quoteRef}
          className="bg-white text-gray-900 rounded-lg shadow-xl p-8 md:p-12"
          style={{ 
            minHeight: '297mm',
            fontFamily: selectedTemplate.fontFamily,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            {/* Company Info */}
            <div className="flex-1 max-w-md">
              <div className="whitespace-pre-line text-sm" style={{ color: selectedTemplate.primaryColor }}>
                {getCompanyDetails().split('\n').map((line, idx) => (
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

          {/* Quote Title */}
          <div className="text-right mb-8">
            <h1 
              className="text-4xl font-light tracking-widest uppercase"
              style={{ color: selectedTemplate.primaryColor }}
            >
              Quote
            </h1>
          </div>

          {/* Client & Quote Info */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: selectedTemplate.primaryColor }}>To</p>
              <h3 className="text-lg font-bold text-gray-900">
                {data.client?.company || 'Customer Name'}
              </h3>
              {isEditing ? (
                <Textarea
                  value={data.client?.address || ''}
                  onChange={(e) => setData({
                    ...data,
                    client: data.client ? { ...data.client, address: e.target.value } : null
                  })}
                  placeholder="Client address..."
                  className="mt-1 text-sm border-dashed w-64"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {data.client?.address || 'Client Address'}
                </p>
              )}
            </div>
            <div className="text-right space-y-1">
              <div className="flex justify-end gap-4">
                <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>Quote #</span>
                <span className="text-sm text-gray-900 w-28">{data.quoteNumber}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>Quote date</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="text-sm w-28 h-6 border-dashed"
                  />
                ) : (
                  <span className="text-sm text-gray-900 w-28">{new Date(data.date).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>Due date</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={data.dueDate}
                    onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                    className="text-sm w-28 h-6 border-dashed"
                  />
                ) : (
                  <span className="text-sm text-gray-900 w-28">{new Date(data.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quote Description */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold mb-2" style={{ color: selectedTemplate.primaryColor }}>Description / Scope of Work</h4>
            {isEditing ? (
              <Textarea
                value={data.description || ''}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="Enter a detailed description of the work to be performed, project scope, deliverables, etc..."
                className="text-sm border-dashed min-h-[100px]"
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {data.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full" style={{ 
              borderCollapse: selectedTemplate.tableStyle === 'bordered' ? 'collapse' : undefined 
            }}>
              <thead>
                <tr style={{ backgroundColor: selectedTemplate.primaryColor, color: 'white' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ border: selectedTemplate.tableStyle === 'bordered' ? '1px solid #ccc' : undefined }}>QTY</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ border: selectedTemplate.tableStyle === 'bordered' ? '1px solid #ccc' : undefined }}>Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold" style={{ border: selectedTemplate.tableStyle === 'bordered' ? '1px solid #ccc' : undefined }}>Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold" style={{ border: selectedTemplate.tableStyle === 'bordered' ? '1px solid #ccc' : undefined }}>Amount</th>
                  {isEditing && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => {
                  const getRowStyle = () => {
                    switch (selectedTemplate.tableStyle) {
                      case 'striped':
                        return { backgroundColor: index % 2 === 0 ? selectedTemplate.secondaryColor : 'white' };
                      case 'bordered':
                        return {};
                      case 'clean':
                        return { borderBottom: index < data.lineItems.length - 1 ? '1px solid #eee' : undefined };
                      default:
                        return {};
                    }
                  };
                  return (
                  <tr key={item.id} style={getRowStyle()}>
                    <td className="py-3 px-4 text-sm">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 h-8 text-sm border-dashed"
                        />
                      ) : (
                        item.quantity.toFixed(2)
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {isEditing ? (
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="h-8 text-sm border-dashed"
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-sm text-right border-dashed ml-auto"
                        />
                      ) : (
                        formatMaluti(item.unitPrice)
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {formatMaluti(item.quantity * item.unitPrice)}
                    </td>
                    {isEditing && (
                      <td className="py-3 px-2">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          disabled={data.lineItems.length === 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {isEditing && (
              <button
                onClick={addLineItem}
                className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add Line Item
              </button>
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-gray-900">{formatMaluti(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">Sales Tax</span>
                  {isEditing ? (
                    <span className="text-sm text-gray-600">(</span>
                  ) : null}
                  {isEditing ? (
                    <Input
                      type="number"
                      value={data.taxRate}
                      onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-12 h-6 text-xs text-center border-dashed p-1"
                    />
                  ) : null}
                  <span className="text-sm text-gray-600">
                    {isEditing ? '%)' : `(${data.taxRate}%)`}
                  </span>
                </div>
                <span className="text-sm text-gray-900">{formatMaluti(calculateTax())}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>Total (M)</span>
                <span className="text-lg font-bold" style={{ color: selectedTemplate.primaryColor }}>{formatMaluti(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-12">
            <h4 className="text-sm font-semibold mb-2" style={{ color: selectedTemplate.primaryColor }}>Terms and Conditions</h4>
            {isEditing ? (
              <Textarea
                value={data.termsAndConditions}
                onChange={(e) => setData({ ...data, termsAndConditions: e.target.value })}
                className="text-sm border-dashed"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-line">{data.termsAndConditions}</p>
            )}
          </div>

          {/* Authorized Signature from Settings */}
          {profile?.signature_url && (
            <div className="mb-8">
              <p className="text-sm font-semibold mb-2" style={{ color: selectedTemplate.primaryColor }}>Authorized Signature</p>
              <img src={profile.signature_url} alt="Signature" className="h-12 object-contain" />
            </div>
          )}

          {/* Customer Signature */}
          <div className="flex justify-end mb-8">
            <div className="text-center">
              <div className="w-48 border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-400 italic">customer signature</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
            <p>{profile?.footer_text || 'Thank you for your business!'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotePreview;

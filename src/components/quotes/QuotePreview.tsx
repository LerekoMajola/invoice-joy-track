import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Plus, X, Pencil, Save, Palette } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { TemplateSelector, templates, DocumentTemplate } from './DocumentTemplates';
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

interface Client {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  address?: string;
}

interface QuoteData {
  quoteNumber: string;
  date: string;
  dueDate: string;
  client: Client | null;
  lineItems: LineItem[];
  taxRate: number;
  termsAndConditions: string;
  description?: string;
}

interface CompanyInfo {
  details: string;
  logo: string | null;
}

interface QuotePreviewProps {
  quoteData: QuoteData;
  onUpdate: (data: QuoteData) => void;
  onClose: () => void;
}

export function QuotePreview({ quoteData, onUpdate, onClose }: QuotePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<QuoteData>({
    ...quoteData,
    description: quoteData.description || '',
  });
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    details: 'Your Company Inc.\n1234 Company St.\nMaseru, Lesotho 100\nTel: +266 2222 1234\nEmail: info@company.co.ls',
    logo: null,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);
  const quoteRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const calculateSubtotal = () => {
    return data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (data.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo({ ...companyInfo, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
              {isEditing ? (
                <Textarea
                  value={companyInfo.details}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, details: e.target.value })}
                  className="text-sm border-dashed min-h-[120px] resize-none"
                  placeholder="Company name, address, phone, email..."
                  rows={5}
                />
              ) : (
              <div className="whitespace-pre-line text-sm" style={{ color: selectedTemplate.primaryColor }}>
                  {companyInfo.details.split('\n').map((line, idx) => (
                    <p key={idx} className={idx === 0 ? 'text-xl font-bold mb-1' : 'text-gray-600'}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              {companyInfo.logo ? (
                <div className="relative group">
                  <img src={companyInfo.logo} alt="Company Logo" className="h-16 object-contain" />
                  {isEditing && (
                    <button
                      onClick={() => setCompanyInfo({ ...companyInfo, logo: null })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  Upload Logo
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
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
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: selectedTemplate.primaryColor, color: 'white' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold">QTY</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
                  {isEditing && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? selectedTemplate.secondaryColor : 'white' }}>
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
                        `M${item.unitPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      M{(item.quantity * item.unitPrice).toFixed(2)}
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
                ))}
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
                <span className="text-sm text-gray-900">M{calculateSubtotal().toFixed(2)}</span>
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
                <span className="text-sm text-gray-900">M{calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>Total (M)</span>
                <span className="text-lg font-bold" style={{ color: selectedTemplate.primaryColor }}>M{calculateTotal().toFixed(2)}</span>
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

          {/* Signature */}
          <div className="flex justify-end">
            <div className="text-center">
              <div className="w-48 border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-400 italic">customer signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

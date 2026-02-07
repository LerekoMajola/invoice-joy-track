import { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X, Download, Printer, Package, Pencil, Save, Plus, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import html2pdf from 'html2pdf.js';
import { cn } from '@/lib/utils';
import { TemplateSelector, templates, DocumentTemplate } from '@/components/quotes/DocumentTemplates';
import {
  DocumentHeader,
  DocumentWrapper,
  ClientInfoSection,
  getTableHeaderStyle,
  getTableRowStyle,
  DocumentFooter,
  buildTemplateFromProfile,
  buildCompanyInfo,
} from '@/components/quotes/DocumentLayoutRenderer';

interface DeliveryNoteItem {
  id: string;
  description: string;
  quantity: number | null;
}

interface DeliveryNoteData {
  id: string;
  note_number: string;
  client_name: string;
  date: string;
  delivery_address: string | null;
  status: string | null;
  invoice_id: string | null;
  items?: DeliveryNoteItem[];
}

interface DeliveryNotePreviewProps {
  deliveryNote: DeliveryNoteData;
  invoiceNumber?: string;
  onClose: () => void;
  onUpdate?: (data: DeliveryNoteData) => void;
}

export function DeliveryNotePreview({ deliveryNote, invoiceNumber, onClose, onUpdate }: DeliveryNotePreviewProps) {
  const { profile, isLoading } = useCompanyProfile();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<DeliveryNoteData>(deliveryNote);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);

  useEffect(() => { setData(deliveryNote); }, [deliveryNote]);

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

  const handleSave = () => { if (onUpdate) onUpdate(data); setIsEditing(false); };

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;
    const opt = {
      margin: 0, filename: `${data.note_number}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(contentRef.current).save();
  };

  const handlePrint = () => { window.print(); };

  const formatDisplayDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'dd MMMM yyyy'); } catch { return dateStr; }
  };

  const updateItem = (itemId: string, field: keyof DeliveryNoteItem, value: string | number) => {
    setData(prev => ({ ...prev, items: prev.items?.map(item => item.id === itemId ? { ...item, [field]: value } : item) }));
  };

  const addItem = () => {
    setData(prev => ({ ...prev, items: [...(prev.items || []), { id: `new-${Date.now()}`, description: '', quantity: 1 }] }));
  };

  const removeItem = (itemId: string) => {
    setData(prev => ({ ...prev, items: prev.items?.filter(item => item.id !== itemId) }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const thStyle = getTableHeaderStyle(selectedTemplate);

  const headerFields = [
    { label: 'Delivery Note #', value: data.note_number },
    {
      label: 'Date',
      value: isEditing ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-32 justify-start text-left font-normal h-8 text-sm", !data.date && "text-muted-foreground")}>
              {data.date ? format(new Date(data.date), 'dd MMM yyyy') : 'Pick date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={data.date ? new Date(data.date) : undefined} onSelect={(date) => date && setData({ ...data, date: format(date, 'yyyy-MM-dd') })} initialFocus />
          </PopoverContent>
        </Popover>
      ) : formatDisplayDate(data.date)
    },
    ...(invoiceNumber ? [{ label: 'Invoice Ref', value: invoiceNumber }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Delivery Note Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button variant="default" size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" /> Edit</Button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2"><Palette className="h-4 w-4" /> Template</Button>
              </PopoverTrigger>
              <PopoverContent className="w-[540px]" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Choose Template</h4>
                  <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isEditing}><Printer className="h-4 w-4 mr-2" /> Print</Button>
            <Button variant="default" size="sm" onClick={handleDownloadPDF} disabled={isEditing}><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <DocumentWrapper template={selectedTemplate} fontFamily={selectedTemplate.fontFamily} innerRef={contentRef}>
            <DocumentHeader
              template={selectedTemplate}
              company={company}
              documentTitle="Delivery Note"
              fields={headerFields}
            />

            <ClientInfoSection template={selectedTemplate} label="Deliver To" fields={headerFields}>
              {isEditing ? (
                <Input value={data.client_name} onChange={(e) => setData({ ...data, client_name: e.target.value })} className="text-base font-bold mb-2 h-8" placeholder="Client Name" />
              ) : (
                <h3 className="text-base font-bold text-gray-900">{data.client_name}</h3>
              )}
              {isEditing ? (
                <Textarea value={data.delivery_address || ''} onChange={(e) => setData({ ...data, delivery_address: e.target.value })} className="text-sm min-h-[60px]" placeholder="Delivery Address" />
              ) : (
                data.delivery_address && <p className="text-sm text-gray-600 whitespace-pre-line">{data.delivery_address}</p>
              )}
            </ClientInfoSection>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={thStyle}>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold w-16">#</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Description</th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold w-32">Quantity</th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold w-32">{isEditing ? 'Actions' : 'Received'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, index) => (
                      <tr key={item.id} style={getTableRowStyle(selectedTemplate, index)}>
                        <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {isEditing ? <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="h-8 text-sm" placeholder="Item description" /> : item.description}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-gray-900 font-medium">
                          {isEditing ? <Input type="number" value={item.quantity || 1} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="h-8 text-sm text-center w-20 mx-auto" min={1} /> : (item.quantity || 1)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-400 mx-auto rounded"></div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500 italic">No items listed</td></tr>
                  )}
                  {isEditing && (
                    <tr>
                      <td colSpan={4} className="py-2 px-4">
                        <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                          <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Goods Receipt Acknowledgment */}
            <div className="border-2 rounded-lg p-6 mb-8" style={{ borderColor: selectedTemplate.primaryColor }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: selectedTemplate.primaryColor }}>
                Goods Receipt Acknowledgment
              </h3>
              <div className="flex items-start gap-3 mb-6 p-3 rounded" style={{ backgroundColor: selectedTemplate.secondaryColor }}>
                <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  I confirm that I have received all goods listed above and have inspected them for any visible damage or discrepancies.
                  The goods are received in acceptable condition unless otherwise noted in the remarks section below.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Receiver's Name (Print)</label>
                  <div className="border-b-2 border-gray-400 py-3 min-h-[36px]"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date & Time Received</label>
                  <div className="border-b-2 border-gray-400 py-3 min-h-[36px]"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Receiver's Signature</label>
                  <div className="border-2 border-dashed border-gray-400 rounded h-24 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Sign Here</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Company Stamp</label>
                  <div className="border-2 border-dashed border-gray-400 rounded h-24 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Stamp Here</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: selectedTemplate.accentColor }}>
                Remarks / Condition of Goods
              </h3>
              <div className="border rounded p-3 min-h-[80px]">
                <div className="border-b border-gray-200 py-2"></div>
                <div className="border-b border-gray-200 py-2"></div>
                <div className="border-b border-gray-200 py-2"></div>
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
    </div>
  );
}

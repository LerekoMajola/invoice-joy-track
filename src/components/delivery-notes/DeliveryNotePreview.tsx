import { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X, Download, Printer, Package, Pencil, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import html2pdf from 'html2pdf.js';
import { cn } from '@/lib/utils';

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

  const primaryColor = profile?.template_primary_color || 'hsl(230, 35%, 18%)';
  const secondaryColor = profile?.template_secondary_color || 'hsl(230, 25%, 95%)';
  const accentColor = profile?.template_accent_color || 'hsl(230, 35%, 25%)';
  const fontFamily = profile?.template_font_family || 'DM Sans';
  const tableStyle = profile?.template_table_style || 'striped';

  // Sync with incoming prop
  useEffect(() => {
    setData(deliveryNote);
  }, [deliveryNote]);

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
    
    return lines;
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(data);
    }
    setIsEditing(false);
  };

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;

    const opt = {
      margin: 0,
      filename: `${data.note_number}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(contentRef.current).save();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const updateItem = (itemId: string, field: keyof DeliveryNoteItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items?.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    const newItem: DeliveryNoteItem = {
      id: `new-${Date.now()}`,
      description: '',
      quantity: 1
    };
    setData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId)
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isEditing}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="default" size="sm" onClick={handleDownloadPDF} disabled={isEditing}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <div
            ref={contentRef}
            className="bg-white mx-auto shadow-lg"
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
            <div className="flex justify-between items-start mb-3">
              {/* Company Info */}
              <div className="flex-1 max-w-md">
                <div className="text-sm leading-tight" style={{ color: primaryColor }}>
                  {getCompanyDetails().map((line, idx) => (
                    <p key={idx} className={idx === 0 ? 'text-xl font-bold mb-0.5' : 'text-gray-600'}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Logo from profile */}
              <div>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Company Logo" className="h-14 object-contain" />
                ) : (
                  <div className="h-14 w-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No Logo
                  </div>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div className="text-right mb-3">
              <h1 
                className="text-3xl font-light tracking-widest uppercase"
                style={{ color: primaryColor }}
              >
                Delivery Note
              </h1>
            </div>

            {/* Client & Document Info */}
            <div className="flex justify-between items-start mb-4">
              <div className="leading-tight flex-1 max-w-sm">
                <p className="text-sm font-semibold mb-1" style={{ color: primaryColor }}>Deliver To</p>
                {isEditing ? (
                  <Input
                    value={data.client_name}
                    onChange={(e) => setData({ ...data, client_name: e.target.value })}
                    className="text-base font-bold mb-2 h-8"
                    placeholder="Client Name"
                  />
                ) : (
                  <h3 className="text-base font-bold text-gray-900">
                    {data.client_name}
                  </h3>
                )}
                {isEditing ? (
                  <Textarea
                    value={data.delivery_address || ''}
                    onChange={(e) => setData({ ...data, delivery_address: e.target.value })}
                    className="text-sm min-h-[60px]"
                    placeholder="Delivery Address"
                  />
                ) : (
                  data.delivery_address && (
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {data.delivery_address}
                    </p>
                  )
                )}
              </div>
              <div className="text-right space-y-1">
                <div className="flex justify-end gap-4 items-center">
                  <span className="text-sm font-semibold" style={{ color: primaryColor }}>Delivery Note #</span>
                  <span className="text-sm text-gray-900 w-32">{data.note_number}</span>
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <span className="text-sm font-semibold" style={{ color: primaryColor }}>Date</span>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-32 justify-start text-left font-normal h-8 text-sm",
                            !data.date && "text-muted-foreground"
                          )}
                        >
                          {data.date ? format(new Date(data.date), 'dd MMM yyyy') : 'Pick date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={data.date ? new Date(data.date) : undefined}
                          onSelect={(date) => date && setData({ ...data, date: format(date, 'yyyy-MM-dd') })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-sm text-gray-900 w-32">{formatDisplayDate(data.date)}</span>
                  )}
                </div>
                {invoiceNumber && (
                  <div className="flex justify-end gap-4 items-center">
                    <span className="text-sm font-semibold" style={{ color: primaryColor }}>Invoice Ref</span>
                    <span className="text-sm text-gray-900 w-32">{invoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: primaryColor }}>
                    <th className="text-left py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold w-16">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold">
                      Description
                    </th>
                    <th className="text-center py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold w-32">
                      Quantity
                    </th>
                    <th className="text-center py-3 px-4 text-white text-xs uppercase tracking-wider font-semibold w-32">
                      {isEditing ? 'Actions' : 'Received'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, index) => (
                      <tr 
                        key={item.id}
                        style={{ 
                          backgroundColor: tableStyle === 'striped' && index % 2 === 0 
                            ? secondaryColor 
                            : 'transparent',
                          borderBottom: tableStyle === 'lined' ? '1px solid #e5e5e5' : 'none',
                        }}
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {isEditing ? (
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Item description"
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-gray-900 font-medium">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="h-8 text-sm text-center w-20 mx-auto"
                              min={1}
                            />
                          ) : (
                            item.quantity || 1
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-400 mx-auto rounded"></div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                        No items listed
                      </td>
                    </tr>
                  )}
                  {isEditing && (
                    <tr>
                      <td colSpan={4} className="py-2 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addItem}
                          className="w-full border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Goods Receipt Acknowledgment */}
            <div 
              className="border-2 rounded-lg p-6 mb-8"
              style={{ borderColor: primaryColor }}
            >
              <h3 
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: primaryColor }}
              >
                Goods Receipt Acknowledgment
              </h3>

              <div 
                className="flex items-start gap-3 mb-6 p-3 rounded"
                style={{ backgroundColor: secondaryColor }}
              >
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

            {/* Remarks Section */}
            <div className="mb-8">
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: accentColor }}
              >
                Remarks / Condition of Goods
              </h3>
              <div className="border rounded p-3 min-h-[80px]">
                <div className="border-b border-gray-200 py-2"></div>
                <div className="border-b border-gray-200 py-2"></div>
                <div className="border-b border-gray-200 py-2"></div>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="text-center text-xs pt-4 border-t"
              style={{ color: accentColor, borderColor: '#e5e5e5' }}
            >
              {profile?.footer_text ? (
                <p>{profile.footer_text}</p>
              ) : (
                <p>Thank you for your business</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
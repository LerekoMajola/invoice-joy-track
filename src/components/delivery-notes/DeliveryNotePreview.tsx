import { useRef } from 'react';
import { format } from 'date-fns';
import { X, Download, Printer, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import html2pdf from 'html2pdf.js';

interface DeliveryNoteItem {
  id: string;
  description: string;
  quantity: number | null;
}

interface DeliveryNotePreviewProps {
  deliveryNote: {
    id: string;
    note_number: string;
    client_name: string;
    date: string;
    delivery_address: string | null;
    status: string | null;
    invoice_id: string | null;
    items?: DeliveryNoteItem[];
  };
  invoiceNumber?: string;
  onClose: () => void;
}

export function DeliveryNotePreview({ deliveryNote, invoiceNumber, onClose }: DeliveryNotePreviewProps) {
  const { profile } = useCompanyProfile();
  const contentRef = useRef<HTMLDivElement>(null);

  const primaryColor = profile?.template_primary_color || 'hsl(230, 35%, 18%)';
  const secondaryColor = profile?.template_secondary_color || 'hsl(230, 25%, 95%)';
  const accentColor = profile?.template_accent_color || 'hsl(230, 35%, 25%)';
  const fontFamily = profile?.template_font_family || 'DM Sans';

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;

    const opt = {
      margin: 10,
      filename: `${deliveryNote.note_number}.pdf`,
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
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="default" size="sm" onClick={handleDownloadPDF}>
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
              fontFamily: fontFamily,
              maxWidth: '210mm',
              minHeight: '297mm',
              padding: '20mm',
            }}
          >
            {/* Company Header */}
            <div className="flex justify-between items-start mb-8">
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
                    className="text-2xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {profile?.company_name || 'Your Company'}
                  </h1>
                  {profile?.address_line_1 && (
                    <p className="text-sm text-gray-600">{profile.address_line_1}</p>
                  )}
                  {profile?.address_line_2 && (
                    <p className="text-sm text-gray-600">{profile.address_line_2}</p>
                  )}
                  {(profile?.city || profile?.postal_code) && (
                    <p className="text-sm text-gray-600">
                      {[profile.city, profile.postal_code].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {profile?.country && (
                    <p className="text-sm text-gray-600">{profile.country}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {profile?.phone && (
                  <p className="text-sm text-gray-600">Tel: {profile.phone}</p>
                )}
                {profile?.email && (
                  <p className="text-sm text-gray-600">{profile.email}</p>
                )}
                {profile?.registration_number && (
                  <p className="text-sm text-gray-600">Reg: {profile.registration_number}</p>
                )}
                {profile?.vat_number && (
                  <p className="text-sm text-gray-600">VAT: {profile.vat_number}</p>
                )}
              </div>
            </div>

            {/* Document Title */}
            <div 
              className="text-center py-4 mb-6 rounded"
              style={{ backgroundColor: secondaryColor }}
            >
              <h2 
                className="text-2xl font-bold tracking-wide"
                style={{ color: primaryColor }}
              >
                DELIVERY NOTE
              </h2>
            </div>

            {/* Document Info & Recipient */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Recipient Info */}
              <div>
                <h3 
                  className="text-sm font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: accentColor }}
                >
                  Deliver To
                </h3>
                <div className="border-l-4 pl-3" style={{ borderColor: accentColor }}>
                  <p className="font-semibold text-gray-900">{deliveryNote.client_name}</p>
                  {deliveryNote.delivery_address && (
                    <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
                      {deliveryNote.delivery_address}
                    </p>
                  )}
                </div>
              </div>

              {/* Document Details */}
              <div className="text-right">
                <div className="inline-block text-left">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-gray-500">Delivery Note #:</span>
                    <span className="font-semibold" style={{ color: primaryColor }}>
                      {deliveryNote.note_number}
                    </span>
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{formatDisplayDate(deliveryNote.date)}</span>
                    {invoiceNumber && (
                      <>
                        <span className="text-gray-500">Invoice Ref:</span>
                        <span className="font-medium">{invoiceNumber}</span>
                      </>
                    )}
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${deliveryNote.status === 'delivered' ? 'text-green-600' : 'text-amber-600'}`}>
                      {deliveryNote.status === 'delivered' ? 'Delivered' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: primaryColor }}>
                    <th className="text-left py-3 px-4 text-white text-sm font-semibold w-16">#</th>
                    <th className="text-left py-3 px-4 text-white text-sm font-semibold">Description</th>
                    <th className="text-center py-3 px-4 text-white text-sm font-semibold w-32">Quantity</th>
                    <th className="text-center py-3 px-4 text-white text-sm font-semibold w-32">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryNote.items && deliveryNote.items.length > 0 ? (
                    deliveryNote.items.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={index % 2 === 0 ? 'bg-white' : ''}
                        style={{ backgroundColor: index % 2 === 1 ? secondaryColor : undefined }}
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-900 font-medium">
                          {item.quantity || 1}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-6 h-6 border-2 border-gray-400 mx-auto rounded"></div>
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
                </tbody>
              </table>
            </div>

            {/* Delivery Information Section */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 
                  className="text-sm font-semibold mb-3 uppercase tracking-wide"
                  style={{ color: accentColor }}
                >
                  Delivery Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Driver Name</label>
                    <div className="border-b border-gray-300 py-2 min-h-[28px]"></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Vehicle Registration</label>
                    <div className="border-b border-gray-300 py-2 min-h-[28px]"></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Delivery Date & Time</label>
                    <div className="border-b border-gray-300 py-2 min-h-[28px]"></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 
                  className="text-sm font-semibold mb-3 uppercase tracking-wide"
                  style={{ color: accentColor }}
                >
                  Special Instructions
                </h3>
                <div 
                  className="border rounded p-3 min-h-[100px] text-sm text-gray-400 italic"
                  style={{ borderColor: secondaryColor }}
                >
                  Notes / Special handling instructions...
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Goods Receipt Acknowledgment */}
            <div 
              className="border-2 rounded-lg p-6 mb-8"
              style={{ borderColor: accentColor }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5" style={{ color: accentColor }} />
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: primaryColor }}
                >
                  Goods Receipt Acknowledgment
                </h3>
              </div>

              <div className="flex items-start gap-3 mb-6 p-3 rounded" style={{ backgroundColor: secondaryColor }}>
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
                className="text-sm font-semibold mb-2 uppercase tracking-wide"
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

            {/* Authorized Signature */}
            <div className="flex justify-between items-end mb-8">
              <div className="w-64">
                <label className="text-xs text-gray-500 block mb-1">Authorized Signature</label>
                {profile?.signature_url ? (
                  <div className="border-b-2 border-gray-400 py-2">
                    <img 
                      src={profile.signature_url} 
                      alt="Authorized Signature" 
                      className="h-12 object-contain"
                    />
                  </div>
                ) : (
                  <div className="border-b-2 border-gray-400 py-6"></div>
                )}
                <p className="text-xs text-gray-500 mt-1">For {profile?.company_name || 'Company'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  This is a computer-generated document.
                </p>
              </div>
            </div>

            {/* Footer */}
            {profile?.footer_text && (
              <div 
                className="text-center text-xs pt-4 border-t"
                style={{ color: accentColor, borderColor: secondaryColor }}
              >
                {profile.footer_text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

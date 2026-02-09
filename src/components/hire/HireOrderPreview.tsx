import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, Download, Printer, ClipboardList, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { exportSectionBasedPDF } from '@/lib/pdfExport';
import { TemplateSelector, templates, DocumentTemplate } from '@/components/quotes/DocumentTemplates';
import {
  DocumentHeader,
  DocumentWrapper,
  ClientInfoSection,
  getTableHeaderStyle,
  getTableRowStyle,
  DocumentFooter,
  TotalsSection,
  buildTemplateFromProfile,
  buildCompanyInfo,
} from '@/components/quotes/DocumentLayoutRenderer';
import { HireOrder, HireOrderItem } from '@/hooks/useHireOrders';
import { formatMaluti } from '@/lib/currency';

interface HireOrderPreviewProps {
  order: HireOrder;
  items: HireOrderItem[];
  onClose: () => void;
}

export function HireOrderPreview({ order, items, onClose }: HireOrderPreviewProps) {
  const { profile, isLoading } = useCompanyProfile();
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);

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

  useEffect(() => {
    if (profile && selectedTemplate.id === templates[0].id) {
      setSelectedTemplate(buildTemplateFromProfile(profile, templates[0]));
    }
  }, [profile]);

  const company = buildCompanyInfo(profile);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    await exportSectionBasedPDF(contentRef.current, `${order.order_number}.pdf`);
  };

  const handlePrint = () => { window.print(); };

  const formatDisplayDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'dd MMMM yyyy'); } catch { return dateStr; }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const thStyle = getTableHeaderStyle(selectedTemplate);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const balanceDue = order.total - order.deposit_paid;

  const headerFields = [
    { label: 'Order #', value: order.order_number },
    { label: 'Hire Start', value: formatDisplayDate(order.hire_start) },
    { label: 'Hire End', value: formatDisplayDate(order.hire_end) },
    { label: 'Status', value: order.status.charAt(0).toUpperCase() + order.status.slice(1) },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-portal">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b gap-2 hire-order-modal-chrome">
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardList className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold truncate">Hire Agreement</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm"><Palette className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Template</span></Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(600px,calc(100vw-2rem))]" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Choose Template</h4>
                  <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Print</span></Button>
            <Button variant="default" size="sm" onClick={handleDownloadPDF}><Download className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">PDF</span></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30 hire-order-print-content">
          <DocumentWrapper template={selectedTemplate} fontFamily={selectedTemplate.fontFamily} innerRef={contentRef}>
            {/* Header + Client */}
            <div data-pdf-section style={{ paddingBottom: '4px' }}>
              <DocumentHeader
                template={selectedTemplate}
                company={company}
                documentTitle="Hire Agreement"
                fields={headerFields}
              />
              <ClientInfoSection template={selectedTemplate} label="Client" fields={headerFields}>
                <h3 className="text-base font-bold text-gray-900">{order.client_name}</h3>
                {order.client_phone && <p className="text-sm text-gray-600">Tel: {order.client_phone}</p>}
              </ClientInfoSection>
            </div>

            {/* Equipment Table */}
            <div className="mb-8" data-pdf-section style={{ paddingBottom: '4px' }}>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={thStyle}>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold w-16">#</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Equipment</th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold w-16">Qty</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold w-28">Daily Rate</th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold w-28">Condition</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold w-28">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item, index) => (
                    <tr key={item.id} style={getTableRowStyle(selectedTemplate, index)}>
                      <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.equipment_name}</td>
                      <td className="py-3 px-4 text-sm text-center text-gray-900">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">{formatMaluti(item.daily_rate)}</td>
                      <td className="py-3 px-4 text-sm text-center text-gray-600 capitalize">{item.condition_out || '—'}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">{formatMaluti(item.subtotal)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-500 italic">No items listed</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div data-pdf-section style={{ paddingBottom: '4px' }}>
              <TotalsSection template={selectedTemplate}>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatMaluti(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Deposit Paid</span><span>−{formatMaluti(order.deposit_paid)}</span></div>
                  <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold" style={{ borderColor: selectedTemplate.primaryColor }}>
                    <span>Balance Due</span><span>{formatMaluti(balanceDue)}</span>
                  </div>
                </div>
              </TotalsSection>
            </div>

            {/* Terms + Signatures */}
            <div data-pdf-section style={{ paddingBottom: '4px' }}>
              <div className="mb-6 p-4 rounded" style={{ backgroundColor: selectedTemplate.secondaryColor }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: selectedTemplate.accentColor }}>Terms & Conditions</h3>
                <p className="text-xs text-gray-700 whitespace-pre-line">
                  {profile?.default_terms || 'Equipment must be returned in the same condition as received. Late returns will incur additional daily charges. The hirer is responsible for any loss or damage to equipment during the hire period. A deposit is required before equipment release.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">For {profile?.company_name || 'Company'}</label>
                  {profile?.signature_url ? (
                    <img src={profile.signature_url} alt="Signature" className="h-16 object-contain mb-1" />
                  ) : (
                    <div className="border-2 border-dashed border-gray-400 rounded h-20 flex items-center justify-center mb-1">
                      <span className="text-xs text-gray-400">Authorised Signature</span>
                    </div>
                  )}
                  <div className="border-b-2 border-gray-400 py-1 min-h-[24px]"></div>
                  <p className="text-[10px] text-gray-400 mt-1">Name & Date</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Customer Acknowledgment</label>
                  <div className="border-2 border-dashed border-gray-400 rounded h-20 flex items-center justify-center mb-1">
                    <span className="text-xs text-gray-400">Customer Signature</span>
                  </div>
                  <div className="border-b-2 border-gray-400 py-1 min-h-[24px]"></div>
                  <p className="text-[10px] text-gray-400 mt-1">Name & Date</p>
                </div>
              </div>

              <DocumentFooter
                template={selectedTemplate}
                footerText={profile?.footer_text}
                phone={profile?.phone}
                email={profile?.email}
                website={profile?.website}
              />
            </div>
          </DocumentWrapper>
        </div>
      </div>
    </div>,
    document.body
  );
}

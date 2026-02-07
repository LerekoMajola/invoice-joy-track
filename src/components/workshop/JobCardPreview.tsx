import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, Palette } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatMaluti } from '@/lib/currency';
import html2pdf from 'html2pdf.js';
import type { JobCard } from '@/hooks/useJobCards';
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
  SectionLabel,
  buildTemplateFromProfile,
  buildCompanyInfo,
} from '@/components/quotes/DocumentLayoutRenderer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface JobCardPreviewProps {
  jobCard: JobCard;
}

export function JobCardPreview({ jobCard }: JobCardPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { profile, isLoading } = useCompanyProfile();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);

  // Update template when profile loads
  useEffect(() => {
    if (profile && selectedTemplate.id === templates[0].id) {
      setSelectedTemplate(buildTemplateFromProfile(profile, templates[0]));
    }
  }, [profile]);

  // Load custom font
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

  const company = buildCompanyInfo(profile);

  const partsItems = jobCard.lineItems.filter((i) => i.itemType === 'parts');
  const labourItems = jobCard.lineItems.filter((i) => i.itemType === 'labour');
  const partsSubtotal = partsItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const labourSubtotal = labourItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotal = partsSubtotal + labourSubtotal;
  const tax = subtotal * (jobCard.taxRate / 100);
  const total = subtotal + tax;

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    const opt = {
      margin: 0,
      filename: `${jobCard.jobCardNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    try { await html2pdf().set(opt).from(previewRef.current).save(); }
    catch (error) { console.error('Error generating PDF:', error); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const thStyle = getTableHeaderStyle(selectedTemplate);

  const headerFields = [
    { label: 'Job Card #', value: jobCard.jobCardNumber },
    { label: 'Date', value: new Date(jobCard.createdAt).toLocaleDateString() },
    { label: 'Status', value: jobCard.status.replace('_', ' ') },
  ];

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 print:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2"><Palette className="h-4 w-4" /> Template</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px]" align="end">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Choose Template</h4>
              <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
            </div>
          </PopoverContent>
        </Popover>
        <Button onClick={handleDownloadPDF} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
        <Button onClick={() => window.print()} variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" />Print</Button>
      </div>

      {/* Document */}
      <DocumentWrapper template={selectedTemplate} fontFamily={selectedTemplate.fontFamily} innerRef={previewRef}>
        <DocumentHeader
          template={selectedTemplate}
          company={company}
          documentTitle="Job Card"
          fields={headerFields}
        />

        <ClientInfoSection template={selectedTemplate} label="Client" fields={headerFields}>
          <h3 className="text-base font-bold text-gray-900">{jobCard.clientName}</h3>
        </ClientInfoSection>

        {/* Vehicle Details */}
        <DescriptionSection template={selectedTemplate} title="Vehicle Details">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {jobCard.vehicleReg && <div><span className="text-gray-500">Reg:</span> <span className="font-medium">{jobCard.vehicleReg}</span></div>}
            {jobCard.vehicleMake && <div><span className="text-gray-500">Make:</span> <span className="font-medium">{jobCard.vehicleMake}</span></div>}
            {jobCard.vehicleModel && <div><span className="text-gray-500">Model:</span> <span className="font-medium">{jobCard.vehicleModel}</span></div>}
            {jobCard.vehicleYear && <div><span className="text-gray-500">Year:</span> <span className="font-medium">{jobCard.vehicleYear}</span></div>}
            {jobCard.vehicleVin && <div><span className="text-gray-500">VIN:</span> <span className="font-medium">{jobCard.vehicleVin}</span></div>}
            {jobCard.vehicleMileage && <div><span className="text-gray-500">Mileage:</span> <span className="font-medium">{jobCard.vehicleMileage}</span></div>}
            {jobCard.vehicleColor && <div><span className="text-gray-500">Color:</span> <span className="font-medium">{jobCard.vehicleColor}</span></div>}
          </div>
        </DescriptionSection>

        {/* Issue / Diagnosis / Recommended Work */}
        {jobCard.reportedIssue && (
          <div className="mb-4">
            <SectionLabel template={selectedTemplate}>Reported Issue</SectionLabel>
            <p className="text-sm whitespace-pre-line">{jobCard.reportedIssue}</p>
          </div>
        )}
        {jobCard.diagnosis && (
          <div className="mb-4">
            <SectionLabel template={selectedTemplate}>Diagnosis</SectionLabel>
            <p className="text-sm whitespace-pre-line">{jobCard.diagnosis}</p>
          </div>
        )}
        {jobCard.recommendedWork && (
          <div className="mb-4">
            <SectionLabel template={selectedTemplate}>Recommended Work</SectionLabel>
            <p className="text-sm whitespace-pre-line">{jobCard.recommendedWork}</p>
          </div>
        )}

        {/* Parts Table */}
        {partsItems.length > 0 && (
          <div className="mb-4">
            <SectionLabel template={selectedTemplate}>Parts</SectionLabel>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={thStyle}>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider font-semibold">Qty</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider font-semibold">Description</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider font-semibold">Part #</th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">Unit Price</th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {partsItems.map((item, index) => (
                  <tr key={item.id} style={getTableRowStyle(selectedTemplate, index)}>
                    <td className="py-2 px-3">{item.quantity}</td>
                    <td className="py-2 px-3">{item.description}</td>
                    <td className="py-2 px-3 text-gray-500">{item.partNumber || '-'}</td>
                    <td className="py-2 px-3 text-right">{formatMaluti(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatMaluti(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-sm mt-1 pr-3" style={{ color: selectedTemplate.accentColor }}>Parts Subtotal: {formatMaluti(partsSubtotal)}</div>
          </div>
        )}

        {/* Labour Table */}
        {labourItems.length > 0 && (
          <div className="mb-4">
            <SectionLabel template={selectedTemplate}>Labour</SectionLabel>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={thStyle}>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider font-semibold">Hours</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-wider font-semibold">Description</th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">Rate</th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {labourItems.map((item, index) => (
                  <tr key={item.id} style={getTableRowStyle(selectedTemplate, index)}>
                    <td className="py-2 px-3">{item.quantity}</td>
                    <td className="py-2 px-3">{item.description}</td>
                    <td className="py-2 px-3 text-right">{formatMaluti(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatMaluti(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-sm mt-1 pr-3" style={{ color: selectedTemplate.accentColor }}>Labour Subtotal: {formatMaluti(labourSubtotal)}</div>
          </div>
        )}

        {/* Totals */}
        {jobCard.lineItems.length > 0 && (
          <TotalsSection template={selectedTemplate}>
            <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
              <span style={{ color: selectedTemplate.accentColor }}>Subtotal</span>
              <span>{formatMaluti(subtotal)}</span>
            </div>
            {jobCard.taxRate > 0 && (
              <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
                <span style={{ color: selectedTemplate.accentColor }}>VAT ({jobCard.taxRate}%)</span>
                <span>{formatMaluti(tax)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-bold" style={{ color: selectedTemplate.primaryColor }}>
              <span>Total</span>
              <span>{formatMaluti(total)}</span>
            </div>
          </TotalsSection>
        )}

        {/* Signature Lines */}
        <div className="mt-12 grid grid-cols-2 gap-12">
          <div>
            <div className="border-b border-gray-400 mb-2 h-8" />
            <p className="text-xs text-gray-500">Technician Signature</p>
          </div>
          <div>
            <div className="border-b border-gray-400 mb-2 h-8" />
            <p className="text-xs text-gray-500">Customer Signature</p>
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
  );
}

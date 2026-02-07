import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatMaluti } from '@/lib/currency';
import html2pdf from 'html2pdf.js';
import type { JobCard } from '@/hooks/useJobCards';

interface JobCardPreviewProps {
  jobCard: JobCard;
}

export function JobCardPreview({ jobCard }: JobCardPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { profile, isLoading } = useCompanyProfile();

  const getCompanyDetails = () => {
    if (!profile) return ['Company Name'];
    if (profile.header_info) return profile.header_info.split('\n');
    const lines = [profile.company_name];
    if (profile.address_line_1) lines.push(profile.address_line_1);
    if (profile.address_line_2) lines.push(profile.address_line_2);
    if (profile.city || profile.postal_code) lines.push([profile.city, profile.postal_code].filter(Boolean).join(', '));
    if (profile.country) lines.push(profile.country);
    if (profile.phone) lines.push(`Tel: ${profile.phone}`);
    if (profile.email) lines.push(`Email: ${profile.email}`);
    return lines;
  };

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
    try {
      await html2pdf().set(opt).from(previewRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const primaryColor = profile?.template_primary_color || 'hsl(230, 35%, 18%)';
  const secondaryColor = profile?.template_secondary_color || 'hsl(230, 25%, 95%)';
  const accentColor = profile?.template_accent_color || 'hsl(230, 35%, 25%)';
  const fontFamily = profile?.template_font_family || 'DM Sans';
  const tableStyle = profile?.template_table_style || 'striped';

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />Download PDF
        </Button>
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />Print
        </Button>
      </div>

      {/* Document */}
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
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 max-w-md">
            <div className="text-sm leading-tight" style={{ color: primaryColor }}>
              {getCompanyDetails().map((line, idx) => (
                <p key={idx} className={idx === 0 ? 'text-xl font-bold mb-0.5' : 'text-gray-600'}>{line}</p>
              ))}
            </div>
          </div>
          <div>
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Company Logo" className="h-14 object-contain" />
            ) : (
              <div className="h-14 w-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Logo</div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-right mb-4">
          <h1 className="text-3xl font-light tracking-widest uppercase" style={{ color: primaryColor }}>
            Job Card
          </h1>
        </div>

        {/* Job Card Info & Client */}
        <div className="flex justify-between items-start mb-4">
          <div className="leading-tight">
            <p className="text-sm font-semibold mb-1" style={{ color: primaryColor }}>Client</p>
            <h3 className="text-base font-bold text-gray-900">{jobCard.clientName}</h3>
          </div>
          <div className="text-right space-y-1">
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>Job Card #</span>
              <span className="text-sm text-gray-900 w-32">{jobCard.jobCardNumber}</span>
            </div>
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>Date</span>
              <span className="text-sm text-gray-900 w-32">{new Date(jobCard.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-end gap-4 items-center">
              <span className="text-sm font-semibold" style={{ color: primaryColor }}>Status</span>
              <span className="text-sm text-gray-900 w-32 capitalize">{jobCard.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: secondaryColor }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>
            Vehicle Details
          </h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {jobCard.vehicleReg && <div><span className="text-gray-500">Reg:</span> <span className="font-medium">{jobCard.vehicleReg}</span></div>}
            {jobCard.vehicleMake && <div><span className="text-gray-500">Make:</span> <span className="font-medium">{jobCard.vehicleMake}</span></div>}
            {jobCard.vehicleModel && <div><span className="text-gray-500">Model:</span> <span className="font-medium">{jobCard.vehicleModel}</span></div>}
            {jobCard.vehicleYear && <div><span className="text-gray-500">Year:</span> <span className="font-medium">{jobCard.vehicleYear}</span></div>}
            {jobCard.vehicleVin && <div><span className="text-gray-500">VIN:</span> <span className="font-medium">{jobCard.vehicleVin}</span></div>}
            {jobCard.vehicleMileage && <div><span className="text-gray-500">Mileage:</span> <span className="font-medium">{jobCard.vehicleMileage}</span></div>}
            {jobCard.vehicleColor && <div><span className="text-gray-500">Color:</span> <span className="font-medium">{jobCard.vehicleColor}</span></div>}
          </div>
        </div>

        {/* Reported Issue */}
        {jobCard.reportedIssue && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Reported Issue</h3>
            <p className="text-sm whitespace-pre-line">{jobCard.reportedIssue}</p>
          </div>
        )}

        {/* Diagnosis */}
        {jobCard.diagnosis && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Diagnosis</h3>
            <p className="text-sm whitespace-pre-line">{jobCard.diagnosis}</p>
          </div>
        )}

        {jobCard.recommendedWork && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Recommended Work</h3>
            <p className="text-sm whitespace-pre-line">{jobCard.recommendedWork}</p>
          </div>
        )}

        {/* Parts Table */}
        {partsItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>Parts</h3>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="text-left py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Qty</th>
                  <th className="text-left py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Description</th>
                  <th className="text-left py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Part #</th>
                  <th className="text-right py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Unit Price</th>
                  <th className="text-right py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {partsItems.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: tableStyle === 'striped' && index % 2 === 0 ? secondaryColor : 'transparent', borderBottom: tableStyle === 'lined' ? '1px solid #e5e5e5' : 'none' }}>
                    <td className="py-2 px-3">{item.quantity}</td>
                    <td className="py-2 px-3">{item.description}</td>
                    <td className="py-2 px-3 text-gray-500">{item.partNumber || '-'}</td>
                    <td className="py-2 px-3 text-right">{formatMaluti(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatMaluti(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-sm mt-1 pr-3" style={{ color: accentColor }}>Parts Subtotal: {formatMaluti(partsSubtotal)}</div>
          </div>
        )}

        {/* Labour Table */}
        {labourItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>Labour</h3>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="text-left py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Hours</th>
                  <th className="text-left py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Description</th>
                  <th className="text-right py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Rate</th>
                  <th className="text-right py-2 px-3 text-white text-xs uppercase tracking-wider font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {labourItems.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: tableStyle === 'striped' && index % 2 === 0 ? secondaryColor : 'transparent', borderBottom: tableStyle === 'lined' ? '1px solid #e5e5e5' : 'none' }}>
                    <td className="py-2 px-3">{item.quantity}</td>
                    <td className="py-2 px-3">{item.description}</td>
                    <td className="py-2 px-3 text-right">{formatMaluti(item.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatMaluti(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-sm mt-1 pr-3" style={{ color: accentColor }}>Labour Subtotal: {formatMaluti(labourSubtotal)}</div>
          </div>
        )}

        {/* Totals */}
        {jobCard.lineItems.length > 0 && (
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
                <span style={{ color: accentColor }}>Subtotal</span>
                <span>{formatMaluti(subtotal)}</span>
              </div>
              {jobCard.taxRate > 0 && (
                <div className="flex justify-between py-2 border-b" style={{ borderColor: '#e5e5e5' }}>
                  <span style={{ color: accentColor }}>VAT ({jobCard.taxRate}%)</span>
                  <span>{formatMaluti(tax)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-lg font-bold" style={{ color: primaryColor }}>
                <span>Total</span>
                <span>{formatMaluti(total)}</span>
              </div>
            </div>
          </div>
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

        {/* Footer */}
        {profile?.footer_text && (
          <div className="mt-8 text-center text-xs text-gray-400">{profile.footer_text}</div>
        )}
      </div>
    </div>
  );
}

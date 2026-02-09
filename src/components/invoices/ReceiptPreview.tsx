import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatMaluti } from '@/lib/currency';
import html2pdf from 'html2pdf.js';
import { templates, DocumentTemplate } from '@/components/quotes/DocumentTemplates';
import {
  DocumentHeader,
  DocumentWrapper,
  DocumentFooter,
  DescriptionSection,
  buildTemplateFromProfile,
  buildCompanyInfo,
} from '@/components/quotes/DocumentLayoutRenderer';

interface ReceiptData {
  invoiceNumber: string;
  clientName: string;
  clientAddress?: string;
  total: number;
  paymentMethod: string;
  paymentDate: string;
  paymentReference?: string;
}

interface ReceiptPreviewProps {
  receipt: ReceiptData;
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash',
  eft: 'EFT',
  card_swipe: 'Card Swipe',
  mpesa: 'M-Pesa',
  ecocash: 'EcoCash',
};

export function ReceiptPreview({ receipt }: ReceiptPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { profile, isLoading } = useCompanyProfile();
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

  const receiptNumber = receipt.invoiceNumber.replace('INV-', 'REC-');

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    const opt = {
      margin: 0,
      filename: `${receiptNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
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

  const company = buildCompanyInfo(profile);

  const headerFields = [
    { label: 'Receipt #', value: receiptNumber },
    { label: 'Payment Date', value: new Date(receipt.paymentDate).toLocaleDateString() },
    { label: 'Invoice Ref', value: receipt.invoiceNumber },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handleDownloadPDF} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
        <Button onClick={handlePrint} variant="outline" size="sm"><Printer className="h-4 w-4 mr-2" /> Print</Button>
      </div>

      <DocumentWrapper template={selectedTemplate} fontFamily={selectedTemplate.fontFamily} innerRef={previewRef}>
        <DocumentHeader
          template={selectedTemplate}
          company={company}
          documentTitle="Receipt"
          fields={headerFields}
          extraTitleContent={
            <p className="text-xs mt-0.5" style={{ color: selectedTemplate.accentColor }}>Proof of Payment</p>
          }
        />

        {/* Client */}
        <DescriptionSection template={selectedTemplate} title="Received From">
          <h3 className="text-base font-bold text-gray-900">{receipt.clientName}</h3>
          {receipt.clientAddress && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{receipt.clientAddress}</p>
          )}
        </DescriptionSection>

        {/* Payment Details */}
        <DescriptionSection template={selectedTemplate} title="Payment Details">
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-36 font-medium" style={{ color: selectedTemplate.accentColor }}>Amount Paid:</span>
              <span className="font-bold text-lg" style={{ color: selectedTemplate.primaryColor }}>{formatMaluti(receipt.total)}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-medium" style={{ color: selectedTemplate.accentColor }}>Payment Method:</span>
              <span className="font-medium">{paymentMethodLabels[receipt.paymentMethod] || receipt.paymentMethod}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-medium" style={{ color: selectedTemplate.accentColor }}>Payment Date:</span>
              <span>{new Date(receipt.paymentDate).toLocaleDateString()}</span>
            </div>
            {receipt.paymentReference && (
              <div className="flex">
                <span className="w-36 font-medium" style={{ color: selectedTemplate.accentColor }}>Reference:</span>
                <span>{receipt.paymentReference}</span>
              </div>
            )}
            <div className="flex">
              <span className="w-36 font-medium" style={{ color: selectedTemplate.accentColor }}>Invoice Reference:</span>
              <span>{receipt.invoiceNumber}</span>
            </div>
          </div>
        </DescriptionSection>

        {/* PAID stamp */}
        <div className="flex justify-center my-8">
          <div
            className="px-10 py-4 border-4 rounded-lg text-3xl font-black uppercase tracking-widest transform -rotate-6"
            style={{
              borderColor: selectedTemplate.primaryColor,
              color: selectedTemplate.primaryColor,
              opacity: 0.25,
            }}
          >
            PAID
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

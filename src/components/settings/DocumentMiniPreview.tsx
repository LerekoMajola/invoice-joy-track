import React from 'react';
import type { DocumentTemplate } from '@/components/quotes/DocumentTemplates';
import {
  DocumentHeader,
  DocumentWrapper,
  ClientInfoSection,
  getTableHeaderStyle,
  getTableRowStyle,
  TotalsSection,
  DocumentFooter,
} from '@/components/quotes/DocumentLayoutRenderer';

interface DocumentMiniPreviewProps {
  template: DocumentTemplate;
}

const SAMPLE_FIELDS = [
  { label: 'Quote #', value: 'QUO-001' },
  { label: 'Date', value: '07 Feb 2026' },
  { label: 'Valid Until', value: '07 Mar 2026' },
];

const SAMPLE_ITEMS = [
  { description: 'Website Design & Development', qty: 1, price: 'M 8,500.00' },
  { description: 'Logo & Branding Package', qty: 1, price: 'M 3,200.00' },
  { description: 'SEO Optimization Setup', qty: 1, price: 'M 1,800.00' },
];

const SAMPLE_COMPANY = {
  lines: ['Acme Solutions (Pty) Ltd', '14 Main Street, Maseru', 'Tel: +266 2231 4567', 'Email: info@acme.co.ls'],
  logoUrl: null,
};

export function DocumentMiniPreview({ template }: DocumentMiniPreviewProps) {
  const thStyle = getTableHeaderStyle(template);

  return (
    <div className="origin-top-left" style={{ width: '210mm', transform: 'scale(0.18)', transformOrigin: 'top left' }}>
      <div style={{ fontFamily: template.fontFamily, pointerEvents: 'none' }}>
        <DocumentWrapper template={template} fontFamily={template.fontFamily}>
          <DocumentHeader
            template={template}
            company={SAMPLE_COMPANY}
            documentTitle="Quotation"
            fields={SAMPLE_FIELDS}
          />

          <ClientInfoSection template={template} label="Bill To" fields={SAMPLE_FIELDS}>
            <h3 className="text-base font-bold text-gray-900">Client Company Ltd</h3>
            <p className="text-sm text-gray-600">45 Commerce Ave, Maseru 100</p>
            <p className="text-sm text-gray-600">Lesotho</p>
          </ClientInfoSection>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={thStyle}>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold w-16">#</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Description</th>
                  <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold w-20">Qty</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold w-32">Unit Price</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ITEMS.map((item, index) => (
                  <tr key={index} style={getTableRowStyle(template, index)}>
                    <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-900">{item.qty}</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900">{item.price}</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <TotalsSection template={template}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">M 13,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (15%)</span>
                <span className="font-medium">M 2,025.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-base font-bold" style={{ color: template.primaryColor }}>
                <span>Total</span>
                <span>M 15,525.00</span>
              </div>
            </div>
          </TotalsSection>

          <DocumentFooter
            template={template}
            footerText="Thank you for your business!"
            phone="+266 2231 4567"
            email="info@acme.co.ls"
            website="www.acme.co.ls"
          />
        </DocumentWrapper>
      </div>
    </div>
  );
}

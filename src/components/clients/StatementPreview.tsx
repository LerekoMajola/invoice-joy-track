import type { RefObject } from 'react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useCurrency } from '@/hooks/useCurrency';
import { buildStatement, buildStatementNumber } from '@/lib/statementCalculations';
import type { Invoice } from '@/hooks/useInvoices';
import type { Client } from '@/hooks/useClients';
import {
  DocumentWrapper,
  DocumentHeader,
  ClientInfoSection,
  DocumentFooter,
  buildTemplateFromProfile,
  buildCompanyInfo,
  getTableHeaderStyle,
  getTableRowStyle,
} from '@/components/quotes/DocumentLayoutRenderer';
import { templates } from '@/components/quotes/DocumentTemplates';

interface StatementPreviewProps {
  client: Client;
  invoices: Invoice[];
  periodStart: Date;
  periodEnd: Date;
  innerRef?: RefObject<HTMLDivElement>;
}

export function StatementPreview({ client, invoices, periodStart, periodEnd, innerRef }: StatementPreviewProps) {
    const { profile, isLoading } = useCompanyProfile();
    const { fc } = useCurrency();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    const template = profile ? buildTemplateFromProfile(profile, templates[0]) : templates[0];
    const company = buildCompanyInfo(profile);
    const statement = buildStatement(invoices, periodStart, periodEnd);
    const statementNumber = buildStatementNumber(client.id, periodEnd);
    const thStyle = getTableHeaderStyle(template);

    const headerFields = [
      { label: 'Statement #', value: statementNumber },
      { label: 'Statement date', value: periodEnd.toLocaleDateString() },
      { label: 'From', value: periodStart.toLocaleDateString() },
      { label: 'To', value: periodEnd.toLocaleDateString() },
    ];

    return (
      <DocumentWrapper template={template} fontFamily={template.fontFamily} innerRef={innerRef}>
        <div className="flex justify-between items-end mb-6 pb-4 border-b-2" style={{ borderColor: template.primaryColor }}>
          <h1 className="text-3xl font-light tracking-widest uppercase" style={{ color: template.primaryColor }}>
            Statement of Account
          </h1>
          <div className="text-right text-xs">
            {headerFields.map((f, i) => (
              <div key={i} className="flex gap-2 justify-end">
                <span style={{ color: template.accentColor }}>{f.label}:</span>
                <span className="font-medium">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        <ClientInfoSection template={template} label="To" fields={headerFields}>
          <h3 className="text-base font-bold text-gray-900">{client.company}</h3>
          {client.contactPerson && (
            <p className="text-sm text-gray-700">{client.contactPerson}</p>
          )}
          {client.address && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{client.address}</p>
          )}
          {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
          {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
        </ClientInfoSection>

        {/* Opening Balance */}
        <div className="mb-4 flex justify-between items-center py-3 px-4 rounded" style={{ background: '#f5f5f5' }}>
          <span className="text-sm font-semibold" style={{ color: template.accentColor }}>
            Opening Balance (as at {periodStart.toLocaleDateString()})
          </span>
          <span className="text-sm font-bold">{fc(statement.openingBalance)}</span>
        </div>

        {/* Transactions */}
        <div className="mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={thStyle}>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Reference</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Description</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold">Debit</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold">Credit</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {statement.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-sm text-gray-500">
                    No transactions in this period.
                  </td>
                </tr>
              ) : (
                statement.rows.map((row, i) => (
                  <tr key={i} style={getTableRowStyle(template, i)}>
                    <td className="py-2 px-4 text-sm">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 text-sm">{row.reference}</td>
                    <td className="py-2 px-4 text-sm">{row.description}</td>
                    <td className="py-2 px-4 text-sm text-right">{row.debit ? fc(row.debit) : '—'}</td>
                    <td className="py-2 px-4 text-sm text-right">{row.credit ? fc(row.credit) : '—'}</td>
                    <td className="py-2 px-4 text-sm text-right font-medium">{fc(row.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mb-6 ml-auto" style={{ width: '60%' }}>
          <div className="flex justify-between py-2 border-b text-sm" style={{ borderColor: '#e5e5e5' }}>
            <span style={{ color: template.accentColor }}>Opening balance</span>
            <span>{fc(statement.openingBalance)}</span>
          </div>
          <div className="flex justify-between py-2 border-b text-sm" style={{ borderColor: '#e5e5e5' }}>
            <span style={{ color: template.accentColor }}>Invoiced this period</span>
            <span>{fc(statement.totalInvoiced)}</span>
          </div>
          <div className="flex justify-between py-2 border-b text-sm" style={{ borderColor: '#e5e5e5' }}>
            <span style={{ color: template.accentColor }}>Paid this period</span>
            <span>−{fc(statement.totalPaid)}</span>
          </div>
          <div className="flex justify-between py-3 text-lg font-bold" style={{ color: template.primaryColor }}>
            <span>Amount Due</span>
            <span>{fc(statement.closingBalance)}</span>
          </div>
        </div>

        {/* Aging */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: template.accentColor }}>
            Aging Summary
          </h3>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={thStyle}>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">Current</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">1–30 days</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">31–60 days</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">61–90 days</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">90+ days</th>
                <th className="text-right py-2 px-3 text-xs uppercase tracking-wider font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={getTableRowStyle(template, 0)}>
                <td className="py-2 px-3 text-sm text-right">{fc(statement.aging.current)}</td>
                <td className="py-2 px-3 text-sm text-right">{fc(statement.aging.d1_30)}</td>
                <td className="py-2 px-3 text-sm text-right">{fc(statement.aging.d31_60)}</td>
                <td className="py-2 px-3 text-sm text-right">{fc(statement.aging.d61_90)}</td>
                <td className="py-2 px-3 text-sm text-right">{fc(statement.aging.d90_plus)}</td>
                <td className="py-2 px-3 text-sm text-right font-bold">
                  {fc(
                    statement.aging.current +
                      statement.aging.d1_30 +
                      statement.aging.d31_60 +
                      statement.aging.d61_90 +
                      statement.aging.d90_plus
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <DocumentFooter
          template={template}
          footerText={profile?.footer_text}
          phone={profile?.phone}
          email={profile?.email}
          website={profile?.website}
        />
      </DocumentWrapper>
    );
}


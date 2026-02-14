import { format } from 'date-fns';
import { Users, FileText, Receipt, TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTenantData } from '@/hooks/useAdminTenantData';
import { formatMaluti } from '@/lib/currency';

interface TenantBusinessInsightsProps {
  tenantUserId: string;
}

const invoiceStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const quoteStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export function TenantBusinessInsights({ tenantUserId }: TenantBusinessInsightsProps) {
  const { data, isLoading, error } = useAdminTenantData(tenantUserId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">Failed to load business insights.</p>;
  }

  if (!data) return null;

  const { clients, invoices, quotes, summary } = data;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{summary.total_clients}</div>
            <div className="text-xs text-muted-foreground">Clients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{formatMaluti(summary.total_revenue)}</div>
            <div className="text-xs text-muted-foreground">Revenue (Paid)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{summary.active_invoices}</div>
            <div className="text-xs text-muted-foreground">Active Invoices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{summary.quote_conversion_rate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Quote Conversion</div>
          </CardContent>
        </Card>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" className="w-full">
        {/* Clients */}
        <AccordionItem value="clients">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Clients ({clients.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-xs">{c.company}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.contact_person || '—'}</TableCell>
                      <TableCell className="text-right text-xs">{formatMaluti(c.total_revenue || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Invoices */}
        <AccordionItem value="invoices">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Invoices ({invoices.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-xs font-medium">{inv.invoice_number}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{inv.client_name}</TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[inv.status || 'draft'] || ''} variant="secondary">
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatMaluti(inv.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Quotes */}
        <AccordionItem value="quotes">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Quotes ({quotes.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quotes yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="text-xs font-medium">{q.quote_number}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{q.client_name}</TableCell>
                      <TableCell>
                        <Badge className={quoteStatusColors[q.status || 'draft'] || ''} variant="secondary">
                          {q.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatMaluti(q.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

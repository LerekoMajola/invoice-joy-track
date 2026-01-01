import { Receipt } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMaluti } from '@/lib/currency';
import { ProfitMarginBadge } from './ProfitMarginBadge';
import type { JobProfitability } from '@/hooks/useJobProfitability';

interface JobProfitabilityTableProps {
  jobs: JobProfitability[];
}

export function JobProfitabilityTable({ jobs }: JobProfitabilityTableProps) {
  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Receipt className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No paid invoices yet</p>
          <p className="text-sm">Complete paid invoices to track job profitability</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-slide-up">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Job Profitability Breakdown</h3>
        <p className="text-sm text-muted-foreground">Detailed profit analysis for each completed job</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="font-semibold">Invoice</TableHead>
            <TableHead className="font-semibold">Client</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold text-right">Revenue</TableHead>
            <TableHead className="font-semibold text-right">Cost</TableHead>
            <TableHead className="font-semibold text-right">Profit</TableHead>
            <TableHead className="font-semibold text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, index) => (
            <TableRow 
              key={job.invoiceId} 
              className="animate-slide-up" 
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">{job.invoiceNumber}</span>
                    {job.quoteNumber && (
                      <p className="text-xs text-muted-foreground">from {job.quoteNumber}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{job.clientName}</TableCell>
              <TableCell className="text-muted-foreground">{formatDisplayDate(job.date)}</TableCell>
              <TableCell className="text-right font-medium">{formatMaluti(job.revenue)}</TableCell>
              <TableCell className="text-right text-rose-500">{formatMaluti(job.cost)}</TableCell>
              <TableCell className="text-right font-semibold text-emerald-600">
                {formatMaluti(job.grossProfit)}
              </TableCell>
              <TableCell className="text-right">
                <ProfitMarginBadge margin={job.marginPercent} status={job.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

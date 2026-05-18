import { useMemo, useRef, useState } from 'react';
import { format, subDays, startOfYear } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Download, Printer, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';
import type { Client } from '@/hooks/useClients';
import { StatementPreview } from './StatementPreview';
import html2pdf from 'html2pdf.js';
import { buildStatementNumber } from '@/lib/statementCalculations';

interface Props {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatementOfAccountDialog({ client, open, onOpenChange }: Props) {
  const { invoices, isLoading } = useInvoices();
  const previewRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [periodStart, setPeriodStart] = useState<Date>(subDays(today, 90));
  const [periodEnd, setPeriodEnd] = useState<Date>(today);
  const [outstandingOnly, setOutstandingOnly] = useState(false);

  const clientInvoices = useMemo(() => {
    if (!client) return [];
    const filtered = invoices.filter(
      (inv) =>
        inv.clientId === client.id ||
        inv.clientName?.toLowerCase() === client.company.toLowerCase()
    );
    if (!outstandingOnly) return filtered;
    return filtered.filter(
      (inv) => inv.status !== 'paid' && inv.status !== 'draft'
    );
  }, [invoices, client, outstandingOnly]);

  const handleDownload = async () => {
    if (!previewRef.current || !client) return;
    const num = buildStatementNumber(client.id, periodEnd);
    const opt = {
      margin: 0,
      filename: `${num}-${client.company.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    try {
      await html2pdf().set(opt).from(previewRef.current).save();
    } catch (e) {
      console.error('Error generating PDF:', e);
    }
  };

  const handlePrint = () => window.print();

  const quickRanges = [
    { label: '30 days', from: subDays(today, 30) },
    { label: '90 days', from: subDays(today, 90) },
    { label: '6 months', from: subDays(today, 180) },
    { label: 'Year to date', from: startOfYear(today) },
  ];

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="font-display">Statement of Account — {client.company}</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex flex-wrap gap-1">
            {quickRanges.map((r) => (
              <Button
                key={r.label}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPeriodStart(r.from);
                  setPeriodEnd(today);
                }}
                className={cn(
                  periodStart.getTime() === r.from.getTime() && 'bg-muted'
                )}
              >
                {r.label}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(periodStart, 'MMM d')} – {format(periodEnd, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: periodStart, to: periodEnd }}
                  onSelect={(range) => {
                    if (range?.from) setPeriodStart(range.from);
                    if (range?.to) setPeriodEnd(range.to);
                  }}
                  numberOfMonths={2}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
              <Switch
                checked={outstandingOnly}
                onCheckedChange={setOutstandingOnly}
                size="sm"
              />
              Outstanding only
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>

        {/* Preview */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <StatementPreview
            innerRef={previewRef}
            client={client}
            invoices={clientInvoices}
            periodStart={periodStart}
            periodEnd={periodEnd}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

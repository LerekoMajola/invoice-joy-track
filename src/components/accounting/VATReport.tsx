import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatMaluti } from '@/lib/currency';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface VATReportProps {
  periodStart: Date;
  periodEnd: Date;
}

interface MonthlyVAT {
  month: string;
  outputVAT: number;
  inputVAT: number;
  netVAT: number;
}

export function VATReport({ periodStart, periodEnd }: VATReportProps) {
  const { user } = useAuth();
  const { profile } = useCompanyProfile();
  const defaultTaxRate = profile?.default_tax_rate ?? 15;
  const startStr = format(periodStart, 'yyyy-MM-dd');
  const endStr = format(periodEnd, 'yyyy-MM-dd');

  // Fetch paid invoices with tax info
  const { data: invoices = [] } = useQuery({
    queryKey: ['vat-invoices', user?.id, startStr, endStr],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('total, tax_rate, date, status')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('date', startStr)
        .lte('date', endStr);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch paid expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['vat-expenses', user?.id, startStr, endStr],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, date, status')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('date', startStr)
        .lte('date', endStr);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const months = eachMonthOfInterval({ start: periodStart, end: periodEnd });

  const monthlyData: MonthlyVAT[] = months.map((monthDate) => {
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);
    const mStartStr = format(mStart, 'yyyy-MM-dd');
    const mEndStr = format(mEnd, 'yyyy-MM-dd');

    // Output VAT from invoices
    const monthInvoices = invoices.filter((i) => i.date >= mStartStr && i.date <= mEndStr);
    const outputVAT = monthInvoices.reduce((sum, i) => {
      const total = Number(i.total || 0);
      const rate = Number(i.tax_rate || defaultTaxRate);
      // VAT = total * rate / (100 + rate)
      return sum + (total * rate) / (100 + rate);
    }, 0);

    // Input VAT from expenses (assume standard rate)
    const monthExpenses = expenses.filter((e) => e.date >= mStartStr && e.date <= mEndStr);
    const inputVAT = monthExpenses.reduce((sum, e) => {
      const amount = Number(e.amount || 0);
      return sum + (amount * defaultTaxRate) / (100 + defaultTaxRate);
    }, 0);

    return {
      month: format(monthDate, 'MMMM yyyy'),
      outputVAT,
      inputVAT,
      netVAT: outputVAT - inputVAT,
    };
  });

  const totalOutputVAT = monthlyData.reduce((s, m) => s + m.outputVAT, 0);
  const totalInputVAT = monthlyData.reduce((s, m) => s + m.inputVAT, 0);
  const totalNetVAT = totalOutputVAT - totalInputVAT;

  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT Report</CardTitle>
        <p className="text-sm text-muted-foreground">
          Period: {format(periodStart, 'MMMM d, yyyy')} — {format(periodEnd, 'MMMM d, yyyy')}
          {' '}| Standard Rate: {defaultTaxRate}%
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold">Monthly Breakdown</h4>
          <div className="space-y-2">
            {monthlyData.map((m) => (
              <div key={m.month} className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                <span className="font-medium">{m.month}</span>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs block">Output VAT</span>
                  <span>{formatMaluti(m.outputVAT)}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs block">Input VAT</span>
                  <span>{formatMaluti(m.inputVAT)}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs block">Net</span>
                  <span className={m.netVAT >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {formatMaluti(Math.abs(m.netVAT))}
                    {m.netVAT < 0 ? ' (Refund)' : ' (Payable)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-4">
          <h4 className="font-semibold">Summary</h4>
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span>Output VAT (Collected on Sales)</span>
              <span className="font-medium">{formatMaluti(totalOutputVAT)}</span>
            </div>
            <div className="flex justify-between">
              <span>Input VAT (Paid on Purchases)</span>
              <span className="font-medium">{formatMaluti(totalInputVAT)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{totalNetVAT >= 0 ? 'VAT Payable' : 'VAT Refundable'}</span>
              <span className={totalNetVAT >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {formatMaluti(Math.abs(totalNetVAT))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

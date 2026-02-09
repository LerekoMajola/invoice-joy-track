import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatMaluti } from '@/lib/currency';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface BalanceSheetProps {
  periodEnd: Date;
}

export function BalanceSheet({ periodEnd }: BalanceSheetProps) {
  const { user } = useAuth();
  const { totalBalance, activeAccounts } = useBankAccounts();
  const endStr = format(periodEnd, 'yyyy-MM-dd');

  // Accounts Receivable: unpaid/outstanding invoices as of period end
  const { data: receivables = 0 } = useQuery({
    queryKey: ['balance-sheet-receivables', user?.id, endStr],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from('invoices')
        .select('total')
        .eq('user_id', user.id)
        .in('status', ['sent', 'draft', 'overdue'])
        .lte('date', endStr);
      if (error) throw error;
      return (data || []).reduce((sum, i) => sum + Number(i.total || 0), 0);
    },
    enabled: !!user?.id,
  });

  // Accounts Payable: pending expenses as of period end
  const { data: payables = 0 } = useQuery({
    queryKey: ['balance-sheet-payables', user?.id, endStr],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lte('date', endStr);
      if (error) throw error;
      return (data || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    },
    enabled: !!user?.id,
  });

  const totalAssets = totalBalance + receivables;
  const totalLiabilities = payables;
  const netEquity = totalAssets - totalLiabilities;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet</CardTitle>
        <p className="text-sm text-muted-foreground">
          As at {format(periodEnd, 'MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assets */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Assets</h4>
          <div className="pl-4 space-y-2">
            <h5 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Current Assets</h5>
            {activeAccounts.map((acc) => (
              <div key={acc.id} className="flex justify-between text-sm">
                <span>Cash — {acc.account_name}</span>
                <span>{formatMaluti(Number(acc.current_balance))}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span>Accounts Receivable</span>
              <span>{formatMaluti(receivables)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total Assets</span>
            <span>{formatMaluti(totalAssets)}</span>
          </div>
        </div>

        {/* Liabilities */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Liabilities</h4>
          <div className="pl-4 space-y-2">
            <h5 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Current Liabilities</h5>
            <div className="flex justify-between text-sm">
              <span>Accounts Payable</span>
              <span>{formatMaluti(payables)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total Liabilities</span>
            <span>{formatMaluti(totalLiabilities)}</span>
          </div>
        </div>

        {/* Equity */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Equity</h4>
          <div className="pl-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Net Assets (Assets − Liabilities)</span>
              <span>{formatMaluti(netEquity)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total Equity</span>
            <span className={netEquity >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {formatMaluti(netEquity)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

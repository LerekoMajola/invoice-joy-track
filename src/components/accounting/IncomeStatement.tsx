import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatMaluti } from '@/lib/currency';
import { AccountingStats } from '@/hooks/useAccountingStats';

interface IncomeStatementProps {
  stats: AccountingStats;
  expensesByCategory: Array<{ name: string; total: number; color: string }>;
  periodStart: Date;
  periodEnd: Date;
}

export function IncomeStatement({
  stats,
  expensesByCategory,
  periodStart,
  periodEnd,
}: IncomeStatementProps) {
  const totalExpensesWithPayroll = stats.totalExpenses + stats.payrollCosts;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Income Statement</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Period: {format(periodStart, 'MMMM d, yyyy')} - {format(periodEnd, 'MMMM d, yyyy')}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">REVENUE</h3>
          <div className="pl-4 space-y-2">
            <div className="flex justify-between">
              <span>Sales Revenue (Paid Invoices)</span>
              <span className="font-medium">{formatMaluti(stats.totalRevenue)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>TOTAL REVENUE</span>
            <span className="text-green-600 dark:text-green-400">{formatMaluti(stats.totalRevenue)}</span>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">EXPENSES</h3>
          <div className="pl-4 space-y-2">
            {expensesByCategory.length > 0 ? (
              expensesByCategory.map((cat) => (
                <div key={cat.name} className="flex justify-between">
                  <span>{cat.name}</span>
                  <span className="font-medium">{formatMaluti(cat.total)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-muted-foreground">
                <span>No expenses recorded</span>
                <span>{formatMaluti(0)}</span>
              </div>
            )}
            {stats.payrollCosts > 0 && (
              <div className="flex justify-between">
                <span>Payroll</span>
                <span className="font-medium">{formatMaluti(stats.payrollCosts)}</span>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>TOTAL EXPENSES</span>
            <span className="text-red-600 dark:text-red-400">{formatMaluti(totalExpensesWithPayroll)}</span>
          </div>
        </div>

        {/* Net Income */}
        <div className="pt-4 border-t-2 border-primary">
          <div className="flex justify-between text-xl font-bold">
            <span>NET INCOME</span>
            <span className={stats.netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {formatMaluti(stats.netCashFlow)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            (Revenue - Expenses - Payroll)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

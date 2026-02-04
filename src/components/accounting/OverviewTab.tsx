import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Clock, Users } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useAccountingStats } from '@/hooks/useAccountingStats';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { CashFlowChart } from './CashFlowChart';

export function OverviewTab() {
  const { stats, expensesByCategory } = useAccountingStats();

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatMaluti(stats.totalRevenue),
      icon: TrendingUp,
      description: 'From paid invoices',
      colorClass: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Total Expenses',
      value: formatMaluti(stats.totalExpenses),
      icon: TrendingDown,
      description: 'Paid expenses this period',
      colorClass: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Payroll Costs',
      value: formatMaluti(stats.payrollCosts),
      icon: Users,
      description: 'Staff payments',
      colorClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Net Cash Flow',
      value: formatMaluti(stats.netCashFlow),
      icon: DollarSign,
      description: 'Revenue - Expenses - Payroll',
      colorClass: stats.netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Cash on Hand',
      value: formatMaluti(stats.cashOnHand),
      icon: Wallet,
      description: 'Total bank balance',
      colorClass: 'text-primary',
    },
    {
      title: 'Outstanding',
      value: formatMaluti(stats.outstandingInvoices),
      icon: Clock,
      description: 'Unpaid invoices',
      colorClass: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.colorClass}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.colorClass}`}>{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCategoryChart data={expensesByCategory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

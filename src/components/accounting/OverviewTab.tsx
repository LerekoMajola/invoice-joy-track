import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Clock, Users } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useAccountingStats } from '@/hooks/useAccountingStats';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { CashFlowChart } from './CashFlowChart';
import { cn } from '@/lib/utils';

export function OverviewTab() {
  const { stats, expensesByCategory } = useAccountingStats();

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatMaluti(stats.totalRevenue),
      icon: TrendingUp,
      description: 'From paid invoices',
      gradient: 'from-success to-accent',
      bgGradient: 'from-success/10 to-accent/10',
    },
    {
      title: 'Total Expenses',
      value: formatMaluti(stats.totalExpenses),
      icon: TrendingDown,
      description: 'Paid expenses this period',
      gradient: 'from-destructive to-coral',
      bgGradient: 'from-destructive/10 to-coral/10',
    },
    {
      title: 'Payroll Costs',
      value: formatMaluti(stats.payrollCosts),
      icon: Users,
      description: 'Staff payments',
      gradient: 'from-info to-cyan',
      bgGradient: 'from-info/10 to-cyan/10',
    },
    {
      title: 'Net Cash Flow',
      value: formatMaluti(stats.netCashFlow),
      icon: DollarSign,
      description: 'Revenue - Expenses - Payroll',
      gradient: stats.netCashFlow >= 0 ? 'from-success to-accent' : 'from-destructive to-coral',
      bgGradient: stats.netCashFlow >= 0 ? 'from-success/10 to-accent/10' : 'from-destructive/10 to-coral/10',
    },
    {
      title: 'Cash on Hand',
      value: formatMaluti(stats.cashOnHand),
      icon: Wallet,
      description: 'Total bank balance',
      gradient: 'from-primary to-violet',
      bgGradient: 'from-primary/10 to-violet/10',
    },
    {
      title: 'Outstanding',
      value: formatMaluti(stats.outstandingInvoices),
      icon: Clock,
      description: 'Unpaid invoices',
      gradient: 'from-warning to-coral',
      bgGradient: 'from-warning/10 to-coral/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card 
            key={card.title}
            className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Gradient overlay on hover */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
              card.bgGradient
            )} />
            
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn(
                "p-2 rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
                card.gradient
              )}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-violet text-white">
                <TrendingUp className="h-4 w-4" />
              </div>
              Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-coral to-warning text-white">
                <TrendingDown className="h-4 w-4" />
              </div>
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCategoryChart data={expensesByCategory} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

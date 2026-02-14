import { Building2, DollarSign, Users, TrendingUp, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMaluti } from '@/lib/currency';
import { AdminStats } from '@/hooks/useAdminStats';

interface PlatformStatsCardsProps {
  stats: AdminStats;
}

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
  const cards = [
    {
      title: 'Total Tenants',
      value: stats.totalTenants.toString(),
      description: `${stats.recentSignups} new in last 30 days`,
      icon: Building2,
    },
    {
      title: 'Monthly Recurring Revenue',
      value: formatMaluti(stats.mrr),
      description: `${stats.activeSubscriptions} active subscriptions`,
      icon: DollarSign,
    },
    {
      title: 'Active Trials',
      value: stats.activeTrials.toString(),
      description: `${stats.trialConversionRate.toFixed(1)}% conversion rate`,
      icon: Clock,
    },
    {
      title: 'Platform Revenue',
      value: formatMaluti(stats.totalRevenue),
      description: `From ${stats.totalSubscriptions} subscriptions`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

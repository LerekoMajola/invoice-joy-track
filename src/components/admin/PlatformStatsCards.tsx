import { Building2, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatMaluti } from '@/lib/currency';
import { AdminStats } from '@/hooks/useAdminStats';

interface PlatformStatsCardsProps {
  stats: AdminStats;
}

const cards = [
  {
    key: 'tenants',
    title: 'Total Tenants',
    icon: Building2,
    getValue: (s: AdminStats) => s.totalTenants.toString(),
    getDesc: (s: AdminStats) => `${s.recentSignups} new in last 30 days`,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    key: 'mrr',
    title: 'Monthly Revenue',
    icon: DollarSign,
    getValue: (s: AdminStats) => formatMaluti(s.mrr),
    getDesc: () => 'Confirmed payments this month',
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/50',
  },
  {
    key: 'trials',
    title: 'Active Trials',
    icon: Clock,
    getValue: (s: AdminStats) => s.activeTrials.toString(),
    getDesc: (s: AdminStats) => `${s.trialConversionRate.toFixed(1)}% conversion rate`,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    key: 'revenue',
    title: 'Platform Revenue',
    icon: TrendingUp,
    getValue: (s: AdminStats) => formatMaluti(s.totalRevenue),
    getDesc: () => 'Total confirmed & collected',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
  },
];

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} className="border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              <div className={`h-10 w-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.getValue(stats)}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.getDesc(stats)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

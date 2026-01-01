import { TrendingUp, TrendingDown, DollarSign, Target, Trophy, AlertTriangle } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { ProfitabilityStats as Stats } from '@/hooks/useJobProfitability';

interface ProfitabilityStatsProps {
  stats: Stats;
  targetMargin: number;
}

export function ProfitabilityStats({ stats, targetMargin }: ProfitabilityStatsProps) {
  const statCards = [
    {
      label: 'Total Revenue',
      value: formatMaluti(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Cost',
      value: formatMaluti(stats.totalCost),
      icon: TrendingDown,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      label: 'Gross Profit',
      value: formatMaluti(stats.grossProfit),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Avg. Margin',
      value: `${stats.averageMargin.toFixed(1)}%`,
      icon: Target,
      color: stats.averageMargin >= targetMargin ? 'text-emerald-500' : 'text-amber-500',
      bgColor: stats.averageMargin >= targetMargin ? 'bg-emerald-500/10' : 'bg-amber-500/10',
    },
    {
      label: 'Jobs Tracked',
      value: stats.jobsTracked.toString(),
      icon: Trophy,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
    },
    {
      label: 'Below Target',
      value: stats.jobsBelowTarget.toString(),
      icon: AlertTriangle,
      color: stats.jobsBelowTarget > 0 ? 'text-amber-500' : 'text-emerald-500',
      bgColor: stats.jobsBelowTarget > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4 shadow-card animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn('text-2xl font-display font-semibold mt-1', stat.color)}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

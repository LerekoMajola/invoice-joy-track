import { TrendingUp, TrendingDown, DollarSign, Target, Trophy, AlertTriangle } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import type { ProfitabilityStats as Stats } from '@/hooks/useJobProfitability';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface ProfitabilityStatsProps {
  stats: Stats;
  targetMargin: number;
}

export function ProfitabilityStats({ stats, targetMargin }: ProfitabilityStatsProps) {
  const { user } = useAuth();
  const { profile } = useCompanyProfile();
  const displayName = profile?.contact_person || profile?.company_name || user?.email?.split('@')[0] || '';

  const statCards = [
    { label: 'Total Revenue', value: formatMaluti(stats.totalRevenue), icon: DollarSign },
    { label: 'Total Cost', value: formatMaluti(stats.totalCost), icon: TrendingDown },
    { label: 'Gross Profit', value: formatMaluti(stats.grossProfit), icon: TrendingUp },
    { label: 'Avg. Margin', value: `${stats.averageMargin.toFixed(1)}%`, icon: Target },
    { label: 'Jobs Tracked', value: stats.jobsTracked.toString(), icon: Trophy },
    { label: 'Below Target', value: stats.jobsBelowTarget.toString(), icon: AlertTriangle },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-lg animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-white/20">
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-white/80">{stat.label}</p>
            <p className="text-2xl font-display font-semibold mt-1 text-white">
              {stat.value}
            </p>
          </div>
          {displayName && (
            <p className="mt-2 text-xs text-white/60 truncate">{displayName}</p>
          )}
        </div>
      ))}
    </div>
  );
}

import { Building2, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { AdminStats } from '@/hooks/useAdminStats';
import { useAuth } from '@/hooks/useAuth';

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
  },
  {
    key: 'mrr',
    title: 'Monthly Revenue',
    icon: DollarSign,
    getValue: (s: AdminStats) => formatMaluti(s.mrr),
    getDesc: () => 'Confirmed payments this month',
  },
  {
    key: 'trials',
    title: 'Active Trials',
    icon: Clock,
    getValue: (s: AdminStats) => s.activeTrials.toString(),
    getDesc: (s: AdminStats) => `${s.trialConversionRate.toFixed(1)}% conversion rate`,
  },
  {
    key: 'revenue',
    title: 'Platform Revenue',
    icon: TrendingUp,
    getValue: (s: AdminStats) => formatMaluti(s.totalRevenue),
    getDesc: () => 'Total confirmed & collected',
  },
];

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || '';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/80">{card.title}</span>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold">{card.getValue(stats)}</div>
          <p className="text-xs text-white/70 mt-1">{card.getDesc(stats)}</p>
          {displayName && (
            <p className="mt-2 text-xs text-white/60 truncate">{displayName}</p>
          )}
        </div>
      ))}
    </div>
  );
}

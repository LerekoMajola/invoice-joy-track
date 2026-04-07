import { PlatformStatsCards } from './PlatformStatsCards';
import { SignupsChart } from './SignupsChart';
import { RevenueChart } from './RevenueChart';
import { useAdminStats, SystemBreakdown } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { SYSTEM_ICONS, SYSTEM_LABELS } from './adminConstants';

const ALL_SYSTEMS = ['business', 'gym'];

function WelcomeBanner({ stats }: { stats: { totalTenants: number; mrr: number } }) {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl p-6 text-primary-foreground shadow-lg">
      <div className="flex items-center gap-3 mb-1">
        <Sparkles className="h-6 w-6 opacity-80" />
        <h2 className="text-xl font-bold">Platform Overview</h2>
      </div>
      <p className="opacity-80 text-sm">
        You have <span className="font-semibold opacity-100">{stats.totalTenants} tenants</span> generating{' '}
        <span className="font-semibold opacity-100">{formatMaluti(stats.mrr)}</span> monthly revenue.
      </p>
    </div>
  );
}

function LifecycleFunnel({ stats }: { stats: { activeTrials: number; activeSubscriptions: number; totalTenants: number; systemBreakdown: SystemBreakdown[] } }) {
  const pastDue = stats.systemBreakdown.reduce((sum, b) => sum + b.expired, 0);
  const stages = [
    { label: 'Trial', count: stats.activeTrials, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { label: 'Active', count: stats.activeSubscriptions, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { label: 'Past Due / Expired', count: pastDue, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Customer Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className={`rounded-lg px-4 py-3 text-center min-w-[100px] ${stage.className}`}>
                <div className="text-2xl font-bold">{stage.count}</div>
                <div className="text-xs font-medium mt-0.5">{stage.label}</div>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemBreakdownCards({ breakdown }: { breakdown: SystemBreakdown[] }) {
  const breakdownMap = new Map(breakdown.map(b => [b.system_type, b]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Tenants by System</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_SYSTEMS.map((st) => {
            const item = breakdownMap.get(st);
            const Icon = SYSTEM_ICONS[st] || SYSTEM_ICONS.business;
            const label = SYSTEM_LABELS[st] || st;
            const isEmpty = !item || item.total === 0;

            return (
              <div
                key={st}
                className={`rounded-lg border p-4 transition-colors ${isEmpty ? 'opacity-40 border-dashed' : 'hover:bg-muted/50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{item?.total || 0}</div>
                {!isEmpty && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item!.active > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item!.active} active
                      </Badge>
                    )}
                    {item!.trialing > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {item!.trialing} trial
                      </Badge>
                    )}
                    {item!.expired > 0 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {item!.expired} expired
                      </Badge>
                    )}
                  </div>
                )}
                {isEmpty && (
                  <p className="text-xs text-muted-foreground mt-1">No tenants yet</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminOverviewTab() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load platform statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner stats={stats} />
      <PlatformStatsCards stats={stats} />
      <LifecycleFunnel stats={stats} />
      <SystemBreakdownCards breakdown={stats.systemBreakdown} />
      <div className="grid gap-6 md:grid-cols-2">
        <SignupsChart data={stats.signupsByMonth} />
        <RevenueChart data={stats.revenueByMonth} />
      </div>
    </div>
  );
}

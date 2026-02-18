import { PlatformStatsCards } from './PlatformStatsCards';
import { SignupsChart } from './SignupsChart';
import { RevenueChart } from './RevenueChart';
import { useAdminStats, SystemBreakdown } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Car, Dumbbell, Sparkles } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';

const SYSTEM_CONFIG: Record<string, { label: string; icon: typeof Briefcase; gradient: string }> = {
  business: { label: 'Business', icon: Briefcase, gradient: 'from-blue-500 to-indigo-600' },
  workshop: { label: 'Workshop', icon: Wrench, gradient: 'from-orange-500 to-amber-600' },
  school: { label: 'School', icon: GraduationCap, gradient: 'from-emerald-500 to-green-600' },
  legal: { label: 'Legal', icon: Scale, gradient: 'from-teal-500 to-cyan-600' },
  hire: { label: 'HirePro', icon: Hammer, gradient: 'from-yellow-500 to-amber-600' },
  guesthouse: { label: 'StayPro', icon: Hotel, gradient: 'from-rose-500 to-red-600' },
  fleet: { label: 'FleetPro', icon: Car, gradient: 'from-slate-500 to-gray-600' },
  gym: { label: 'GymPro', icon: Dumbbell, gradient: 'from-lime-500 to-green-600' },
};

const ALL_SYSTEMS = ['business', 'workshop', 'school', 'legal', 'hire', 'guesthouse', 'fleet', 'gym'];

function WelcomeBanner({ stats }: { stats: { totalTenants: number; mrr: number } }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-1">
        <Sparkles className="h-6 w-6 text-yellow-300" />
        <h2 className="text-xl font-bold">Platform Overview</h2>
      </div>
      <p className="text-white/80 text-sm">
        You have <span className="font-semibold text-white">{stats.totalTenants} tenants</span> generating{' '}
        <span className="font-semibold text-white">{formatMaluti(stats.mrr)}</span> monthly revenue.
      </p>
    </div>
  );
}

function SystemBreakdownCards({ breakdown }: { breakdown: SystemBreakdown[] }) {
  const breakdownMap = new Map(breakdown.map(b => [b.system_type, b]));

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">Tenants by System</h3>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {ALL_SYSTEMS.map((st) => {
          const item = breakdownMap.get(st);
          const config = SYSTEM_CONFIG[st];
          const Icon = config.icon;
          const isEmpty = !item || item.total === 0;

          if (isEmpty) {
            return (
              <Card key={st} className="opacity-40 border-dashed">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">No tenants yet</p>
                </CardContent>
              </Card>
            );
          }

          return (
            <div
              key={st}
              className={`bg-gradient-to-br ${config.gradient} rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white/90">{config.label}</span>
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold">{item.total}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.active > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs hover:bg-white/30">
                    {item.active} active
                  </Badge>
                )}
                {item.trialing > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs hover:bg-white/30">
                    {item.trialing} trial
                  </Badge>
                )}
                {item.expired > 0 && (
                  <Badge className="bg-white/10 text-white/80 border-white/20 text-xs hover:bg-white/20">
                    {item.expired} expired
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
            <Skeleton key={i} className="h-32 rounded-xl" />
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
      <SystemBreakdownCards breakdown={stats.systemBreakdown} />
      <div className="grid gap-6 md:grid-cols-2">
        <SignupsChart data={stats.signupsByMonth} />
        <RevenueChart data={stats.revenueByMonth} />
      </div>
    </div>
  );
}

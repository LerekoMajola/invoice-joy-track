import { PlatformStatsCards } from './PlatformStatsCards';
import { SignupsChart } from './SignupsChart';
import { RevenueChart } from './RevenueChart';
import { useAdminStats, SystemBreakdown } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Car, Dumbbell } from 'lucide-react';

const SYSTEM_CONFIG: Record<string, { label: string; icon: typeof Briefcase; color: string }> = {
  business: { label: 'Business', icon: Briefcase, color: 'text-primary' },
  workshop: { label: 'Workshop', icon: Wrench, color: 'text-warning' },
  school: { label: 'School', icon: GraduationCap, color: 'text-info' },
  legal: { label: 'Legal', icon: Scale, color: 'text-emerald-600' },
  hire: { label: 'HirePro', icon: Hammer, color: 'text-amber-600' },
  guesthouse: { label: 'StayPro', icon: Hotel, color: 'text-rose-600' },
  fleet: { label: 'FleetPro', icon: Car, color: 'text-slate-600' },
  gym: { label: 'GymPro', icon: Dumbbell, color: 'text-lime-600' },
};

function SystemBreakdownCards({ breakdown }: { breakdown: SystemBreakdown[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-3">Tenants by System</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {breakdown.map((item) => {
          const config = SYSTEM_CONFIG[item.system_type] || SYSTEM_CONFIG.business;
          const Icon = config.icon;
          return (
            <Card key={item.system_type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.total}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.active > 0 && (
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
                      {item.active} active
                    </Badge>
                  )}
                  {item.trialing > 0 && (
                    <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                      {item.trialing} trial
                    </Badge>
                  )}
                  {item.expired > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.expired} expired
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {/* Show empty state for missing system types */}
        {['business', 'workshop', 'school', 'legal', 'hire', 'guesthouse', 'fleet', 'gym']
          .filter(st => !breakdown.some(b => b.system_type === st))
          .map(st => {
            const config = SYSTEM_CONFIG[st];
            const Icon = config.icon;
            return (
              <Card key={st} className="opacity-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-2">No tenants yet</p>
                </CardContent>
              </Card>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
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
      <PlatformStatsCards stats={stats} />
      <SystemBreakdownCards breakdown={stats.systemBreakdown} />
      <div className="grid gap-6 md:grid-cols-2">
        <SignupsChart data={stats.signupsByMonth} />
        <RevenueChart data={stats.revenueByMonth} />
      </div>
    </div>
  );
}

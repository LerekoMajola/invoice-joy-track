import { PlatformStatsCards } from './PlatformStatsCards';
import { SignupsChart } from './SignupsChart';
import { RevenueChart } from './RevenueChart';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
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
      <div className="grid gap-6 md:grid-cols-2">
        <SignupsChart data={stats.signupsByMonth} />
        <RevenueChart data={stats.revenueByMonth} />
      </div>
    </div>
  );
}

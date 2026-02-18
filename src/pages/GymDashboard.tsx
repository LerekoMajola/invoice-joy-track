import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, CalendarDays, UserCheck, Wallet, Snowflake, AlertTriangle } from 'lucide-react';
import { useGymMembers } from '@/hooks/useGymMembers';
import { useGymMemberSubscriptions } from '@/hooks/useGymMemberSubscriptions';
import { useCurrency } from '@/hooks/useCurrency';
import { differenceInDays, parseISO } from 'date-fns';

export default function GymDashboard() {
  const { members } = useGymMembers();
  const { subscriptions } = useGymMemberSubscriptions();
  const { fc } = useCurrency();

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const frozen = members.filter(m => m.status === 'frozen').length;
    const today = new Date();
    const expiringThisMonth = subscriptions.filter(s => {
      if (s.status !== 'active') return false;
      const days = differenceInDays(parseISO(s.endDate), today);
      return days >= 0 && days <= 30;
    }).length;
    const revenueThisMonth = subscriptions
      .filter(s => {
        const created = parseISO(s.createdAt);
        return created.getMonth() === today.getMonth() && created.getFullYear() === today.getFullYear();
      })
      .reduce((sum, s) => sum + s.amountPaid, 0);
    return { total, active, frozen, expiringThisMonth, revenueThisMonth };
  }, [members, subscriptions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">GymPro Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your fitness centre at a glance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members" value={String(stats.total)} icon={Users} />
          <StatCard title="Active Members" value={String(stats.active)} icon={UserCheck} />
          <StatCard title="Expiring Soon" value={String(stats.expiringThisMonth)} icon={AlertTriangle} />
          <StatCard title="Revenue This Month" value={fc(stats.revenueThisMonth)} icon={Wallet} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-3">Membership Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium text-green-600">{stats.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frozen</span>
                <span className="font-medium text-blue-600">{stats.frozen}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prospects</span>
                <span className="font-medium">{members.filter(m => m.status === 'prospect').length}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-3">Quick Info</h3>
            <p className="text-sm text-muted-foreground">
              Start by adding members and creating membership plans. Navigate to the Members page to manage your gym roster, assign plans, and track subscriptions.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

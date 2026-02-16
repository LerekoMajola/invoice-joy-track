import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, CalendarDays, UserCheck, Wallet } from 'lucide-react';

export default function GymDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">GymPro Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your fitness centre at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members" value="0" icon={Users} />
          <StatCard title="Active Classes" value="0" icon={CalendarDays} />
          <StatCard title="Check-ins Today" value="0" icon={UserCheck} />
          <StatCard title="Revenue This Month" value="M 0" icon={Wallet} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Your gym management modules will appear here. Start by adding members and setting up classes.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

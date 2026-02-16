import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users } from 'lucide-react';

export default function GymMembers() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage gym members and subscriptions</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">Coming Soon</h3>
          <p className="text-muted-foreground text-sm">Member management with subscription tracking is on the way.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserCheck } from 'lucide-react';

export default function GymAttendance() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Track member check-ins and visit logs</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <UserCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">Coming Soon</h3>
          <p className="text-muted-foreground text-sm">Attendance tracking with check-in logs is on the way.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

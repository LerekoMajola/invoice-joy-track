import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarDays } from 'lucide-react';

export default function GymClasses() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground text-sm mt-1">Schedule and manage fitness classes</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">Coming Soon</h3>
          <p className="text-muted-foreground text-sm">Class scheduling with trainer assignment is on the way.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

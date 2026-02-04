import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useStaff, StaffMember } from '@/hooks/useStaff';
import { AddStaffDialog, StaffDetailDialog, StaffList } from '@/components/staff';
import { UserPlus } from 'lucide-react';

export default function Staff() {
  const { staff, isLoading } = useStaff();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
            <p className="text-muted-foreground">
              Manage your team members and their access levels
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>

        {/* Staff List */}
        <StaffList
          staff={staff}
          isLoading={isLoading}
          onSelect={setSelectedStaff}
        />

        {/* Dialogs */}
        <AddStaffDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
        <StaffDetailDialog
          staff={selectedStaff}
          open={!!selectedStaff}
          onOpenChange={(open) => !open && setSelectedStaff(null)}
        />
      </div>
    </DashboardLayout>
  );
}

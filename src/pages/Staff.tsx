import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaff, StaffMember } from '@/hooks/useStaff';
import { AddStaffDialog, StaffDetailDialog, StaffList, PayrollTab } from '@/components/staff';
import { UserPlus, Users, Receipt } from 'lucide-react';

export default function Staff() {
  const { staff, isLoading } = useStaff();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
            <p className="text-muted-foreground">
              Manage your team members, payroll, and HR
            </p>
          </div>
          {activeTab === 'overview' && (
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/60 border border-border p-1 rounded-lg h-auto">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium">
              <Receipt className="h-4 w-4" />
              Payroll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <StaffList
              staff={staff}
              isLoading={isLoading}
              onSelect={setSelectedStaff}
            />
          </TabsContent>

          <TabsContent value="payroll" className="mt-6">
            <PayrollTab />
          </TabsContent>
        </Tabs>

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

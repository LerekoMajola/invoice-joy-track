import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminOverviewTab, CustomersTab, BillingTab, AdminSettingsTab, AdminInvoicesTab, AdminCRMTab } from '@/components/admin';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

export default function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <PlatformLogo
              className="h-10 sm:h-16 w-auto rounded-xl sm:rounded-2xl p-2 sm:p-4 bg-white shadow-sm"
              fallbackIcon={
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              }
            />
            <div>
              <h1 className="text-base sm:text-xl font-bold">Platform Admin</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Management Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard')}>
              Go to App
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="w-max sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminOverviewTab />
          </TabsContent>

          <TabsContent value="crm">
            <AdminCRMTab />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          <TabsContent value="invoices">
            <AdminInvoicesTab />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

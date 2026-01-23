import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Target, Kanban, BarChart3 } from 'lucide-react';
import { LeadsTab } from '@/components/crm/LeadsTab';
import { ClientsTab } from '@/components/crm/ClientsTab';
import { PipelineTab } from '@/components/crm/PipelineTab';
import { AnalyticsTab } from '@/components/crm/AnalyticsTab';

export default function CRM() {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <DashboardLayout>
      <Header 
        title="Clients & Leads" 
        subtitle="Manage your sales pipeline and client relationships"
      />
      
      <div className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="leads" className="gap-2">
              <Target className="h-4 w-4 hidden sm:block" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4 hidden sm:block" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Kanban className="h-4 w-4 hidden sm:block" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <LeadsTab />
          </TabsContent>

          <TabsContent value="clients" className="mt-6">
            <ClientsTab />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-6">
            <PipelineTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

 import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Button } from '@/components/ui/button';
 import { Users, Kanban, BarChart3, List, Plus } from 'lucide-react';
import { ClientsTab } from '@/components/crm/ClientsTab';
 import { PipelineBoard } from '@/components/crm/PipelineBoard';
 import { DealsListView } from '@/components/crm/DealsListView';
 import { DealDetailPanel } from '@/components/crm/DealDetailPanel';
 import { ForecastTab } from '@/components/crm/ForecastTab';
 import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
 import { AddActivityDialog } from '@/components/leads/AddActivityDialog';
 import { Deal } from '@/hooks/useDeals';

export default function CRM() {
   const [activeTab, setActiveTab] = useState('pipeline');
   const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
   const [detailPanelOpen, setDetailPanelOpen] = useState(false);
   const [addDealOpen, setAddDealOpen] = useState(false);
   const [activityDialogOpen, setActivityDialogOpen] = useState(false);
 
   // Keyboard shortcuts
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       // Ignore if typing in an input
       if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
         return;
       }
 
       switch (e.key.toLowerCase()) {
         case 'n':
           setAddDealOpen(true);
           break;
         case '/':
           e.preventDefault();
           // Focus search input if exists
           const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
           searchInput?.focus();
           break;
       }
     };
 
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, []);
 
   const handleDealClick = (deal: Deal) => {
     setSelectedDeal(deal);
     setDetailPanelOpen(true);
   };
 
   const handleQuickAction = (action: 'call' | 'email' | 'note', deal: Deal) => {
     setSelectedDeal(deal);
     if (action === 'note') {
       setActivityDialogOpen(true);
     } else if (action === 'email' && deal.email) {
       window.location.href = `mailto:${deal.email}`;
     } else if (action === 'call' && deal.phone) {
       window.location.href = `tel:${deal.phone}`;
     }
   };

  return (
    <DashboardLayout>
       <Header 
         title="Sales CRM" 
         subtitle="Manage deals, track pipeline health, and forecast revenue"
         action={{
           label: 'New Deal',
           onClick: () => setAddDealOpen(true),
         }}
       />
      
      <div className="p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
             <TabsTrigger value="pipeline" className="gap-2">
               <Kanban className="h-4 w-4 hidden sm:block" />
               Pipeline
             </TabsTrigger>
             <TabsTrigger value="deals" className="gap-2">
               <List className="h-4 w-4 hidden sm:block" />
               Deals
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4 hidden sm:block" />
              Clients
            </TabsTrigger>
             <TabsTrigger value="forecast" className="gap-2">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
               Forecast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-6">
             <PipelineBoard 
               onDealClick={handleDealClick}
               onAddDeal={() => setAddDealOpen(true)}
               onQuickAction={handleQuickAction}
             />
          </TabsContent>

           <TabsContent value="deals" className="mt-6">
             <DealsListView onDealClick={handleDealClick} />
           </TabsContent>
 
           <TabsContent value="clients" className="mt-6">
             <ClientsTab />
           </TabsContent>
 
           <TabsContent value="forecast" className="mt-6">
             <ForecastTab onDealClick={handleDealClick} />
          </TabsContent>
        </Tabs>
 
         {/* Mobile FAB */}
         <Button
           variant="gradient"
           size="icon"
           className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-50"
           onClick={() => setAddDealOpen(true)}
         >
           <Plus className="h-6 w-6" />
         </Button>
      </div>
 
       {/* Dialogs & Panels */}
       <DealDetailPanel
         open={detailPanelOpen}
         onOpenChange={setDetailPanelOpen}
         deal={selectedDeal}
         onAddActivity={() => {
           setDetailPanelOpen(false);
           setActivityDialogOpen(true);
         }}
       />
 
       <AddLeadDialog 
         open={addDealOpen} 
         onOpenChange={setAddDealOpen} 
       />
 
       <AddActivityDialog
         open={activityDialogOpen}
         onOpenChange={setActivityDialogOpen}
         lead={selectedDeal as any}
       />
    </DashboardLayout>
  );
}

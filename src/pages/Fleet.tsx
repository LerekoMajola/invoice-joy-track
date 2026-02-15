import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Wrench, Fuel, BarChart3, LayoutDashboard, CircleDot, Users, FileText, Settings } from 'lucide-react';
import { useFleetVehicles } from '@/hooks/useFleetVehicles';
import { useFleetServiceLogs } from '@/hooks/useFleetServiceLogs';
import { useFleetFuelLogs } from '@/hooks/useFleetFuelLogs';
import { useFleetCosts } from '@/hooks/useFleetCosts';
import { useFleetIncidents } from '@/hooks/useFleetIncidents';
import { FleetOverviewTab } from '@/components/fleet/FleetOverviewTab';
import { VehiclesTab } from '@/components/fleet/VehiclesTab';
import { MaintenanceTab } from '@/components/fleet/MaintenanceTab';
import { ServiceLogTab } from '@/components/fleet/ServiceLogTab';
import { FuelLogTab } from '@/components/fleet/FuelLogTab';
import { TyresTab } from '@/components/fleet/TyresTab';
import { DriversTab } from '@/components/fleet/DriversTab';
import { CostsTab } from '@/components/fleet/CostsTab';
import { FleetDocumentsTab } from '@/components/fleet/FleetDocumentsTab';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Fleet() {
  const { vehicles, isLoading: vehiclesLoading, createVehicle, deleteVehicle } = useFleetVehicles();
  const { serviceLogs, createLog: createServiceLog, deleteLog: deleteServiceLog } = useFleetServiceLogs();
  const { fuelLogs, createLog: createFuelLog, deleteLog: deleteFuelLog } = useFleetFuelLogs();
  const { costsByVehicle, monthlyTotal } = useFleetCosts();
  const { incidents } = useFleetIncidents();

  return (
    <DashboardLayout>
      <Header
        title="FleetPro"
        subtitle="Vehicle registry, maintenance, and cost intelligence"
      />

      <div className="p-4 md:p-6 pb-safe">
        <Tabs defaultValue="overview" className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="overview" className="gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="gap-1.5">
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">Vehicles</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-1.5">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Maintenance</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-1.5">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Service</span>
              </TabsTrigger>
              <TabsTrigger value="fuel" className="gap-1.5">
                <Fuel className="h-4 w-4" />
                <span className="hidden sm:inline">Fuel</span>
              </TabsTrigger>
              <TabsTrigger value="tyres" className="gap-1.5">
                <CircleDot className="h-4 w-4" />
                <span className="hidden sm:inline">Tyres</span>
              </TabsTrigger>
              <TabsTrigger value="drivers" className="gap-1.5">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Drivers</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Costs</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="overview">
            <FleetOverviewTab vehicles={vehicles} monthlyTotal={monthlyTotal} costsByVehicle={costsByVehicle} />
          </TabsContent>

          <TabsContent value="vehicles">
            <VehiclesTab
              vehicles={vehicles}
              costsByVehicle={costsByVehicle}
              serviceLogs={serviceLogs}
              fuelLogs={fuelLogs}
              incidents={incidents}
              onCreateVehicle={createVehicle}
              onDeleteVehicle={deleteVehicle}
            />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceTab vehicles={vehicles} />
          </TabsContent>

          <TabsContent value="services">
            <ServiceLogTab serviceLogs={serviceLogs} vehicles={vehicles} onCreateLog={createServiceLog} onDeleteLog={deleteServiceLog} />
          </TabsContent>

          <TabsContent value="fuel">
            <FuelLogTab fuelLogs={fuelLogs} vehicles={vehicles} onCreateLog={createFuelLog} onDeleteLog={deleteFuelLog} />
          </TabsContent>

          <TabsContent value="tyres">
            <TyresTab vehicles={vehicles} />
          </TabsContent>

          <TabsContent value="drivers">
            <DriversTab />
          </TabsContent>

          <TabsContent value="documents">
            <FleetDocumentsTab vehicles={vehicles} />
          </TabsContent>

          <TabsContent value="costs">
            <CostsTab vehicles={vehicles} costsByVehicle={costsByVehicle} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

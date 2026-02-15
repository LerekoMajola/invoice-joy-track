import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Wrench, Fuel, BarChart3, LayoutDashboard } from 'lucide-react';
import { useFleetVehicles } from '@/hooks/useFleetVehicles';
import { useFleetServiceLogs } from '@/hooks/useFleetServiceLogs';
import { useFleetFuelLogs } from '@/hooks/useFleetFuelLogs';
import { useFleetCosts } from '@/hooks/useFleetCosts';
import { useFleetIncidents } from '@/hooks/useFleetIncidents';
import { FleetOverviewTab } from '@/components/fleet/FleetOverviewTab';
import { VehiclesTab } from '@/components/fleet/VehiclesTab';
import { ServiceLogTab } from '@/components/fleet/ServiceLogTab';
import { FuelLogTab } from '@/components/fleet/FuelLogTab';
import { CostsTab } from '@/components/fleet/CostsTab';

export default function Fleet() {
  const { vehicles, isLoading: vehiclesLoading, createVehicle, deleteVehicle } = useFleetVehicles();
  const { serviceLogs, createLog: createServiceLog, deleteLog: deleteServiceLog } = useFleetServiceLogs();
  const { fuelLogs, createLog: createFuelLog, deleteLog: deleteFuelLog } = useFleetFuelLogs();
  const { costsByVehicle, monthlyTotal } = useFleetCosts();
  const { incidents } = useFleetIncidents();

  return (
    <DashboardLayout>
      <Header
        title="Fleet Management"
        subtitle="Vehicle registry, maintenance, and cost intelligence"
      />

      <div className="p-4 md:p-6 pb-safe">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-1.5">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Vehicles</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1.5">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="fuel" className="gap-1.5">
              <Fuel className="h-4 w-4" />
              <span className="hidden sm:inline">Fuel</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Costs</span>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="services">
            <ServiceLogTab serviceLogs={serviceLogs} vehicles={vehicles} onCreateLog={createServiceLog} onDeleteLog={deleteServiceLog} />
          </TabsContent>

          <TabsContent value="fuel">
            <FuelLogTab fuelLogs={fuelLogs} vehicles={vehicles} onCreateLog={createFuelLog} onDeleteLog={deleteFuelLog} />
          </TabsContent>

          <TabsContent value="costs">
            <CostsTab vehicles={vehicles} costsByVehicle={costsByVehicle} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

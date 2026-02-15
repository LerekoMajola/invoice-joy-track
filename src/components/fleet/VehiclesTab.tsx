import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Car, Trash2 } from 'lucide-react';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { VehicleHealthBadge } from './VehicleHealthBadge';
import { AddVehicleDialog } from './AddVehicleDialog';
import { VehicleDetailDialog } from './VehicleDetailDialog';
import { formatMaluti } from '@/lib/currency';
import { FleetCostSummary } from '@/hooks/useFleetCosts';
import { FleetServiceLog } from '@/hooks/useFleetServiceLogs';
import { FleetFuelLog } from '@/hooks/useFleetFuelLogs';
import { FleetIncident } from '@/hooks/useFleetIncidents';

interface VehiclesTabProps {
  vehicles: FleetVehicle[];
  costsByVehicle: Record<string, FleetCostSummary>;
  serviceLogs: FleetServiceLog[];
  fuelLogs: FleetFuelLog[];
  incidents: FleetIncident[];
  onCreateVehicle: (v: any) => Promise<any>;
  onDeleteVehicle: (id: string) => Promise<boolean>;
}

export function VehiclesTab({ vehicles, costsByVehicle, serviceLogs, fuelLogs, incidents, onCreateVehicle, onDeleteVehicle }: VehiclesTabProps) {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);

  const filtered = vehicles.filter(v =>
    `${v.make} ${v.model} ${v.licensePlate || ''} ${v.assignedDriver || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>{vehicles.length} vehicles in fleet</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No vehicles found. Add your first vehicle to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{v.make} {v.model} ({v.year})</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.licensePlate || 'No plate'} · {v.odometer.toLocaleString()} km
                        {v.assignedDriver && ` · ${v.assignedDriver}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {costsByVehicle[v.id] && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">{formatMaluti(costsByVehicle[v.id].total)}</span>
                    )}
                    <VehicleHealthBadge score={v.healthScore} showScore={false} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddVehicleDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={onCreateVehicle} />

      {selectedVehicle && (
        <VehicleDetailDialog
          vehicle={selectedVehicle}
          open={!!selectedVehicle}
          onOpenChange={(open) => { if (!open) setSelectedVehicle(null); }}
          costSummary={costsByVehicle[selectedVehicle.id]}
          serviceLogs={serviceLogs.filter(l => l.vehicleId === selectedVehicle.id)}
          fuelLogs={fuelLogs.filter(l => l.vehicleId === selectedVehicle.id)}
          incidents={incidents.filter(i => i.vehicleId === selectedVehicle.id)}
          onDelete={() => onDeleteVehicle(selectedVehicle.id).then(() => setSelectedVehicle(null))}
        />
      )}
    </>
  );
}

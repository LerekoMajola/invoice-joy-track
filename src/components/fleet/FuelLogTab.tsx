import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Fuel, Trash2 } from 'lucide-react';
import { FleetFuelLog } from '@/hooks/useFleetFuelLogs';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { AddFuelLogDialog } from './AddFuelLogDialog';
import { formatMaluti } from '@/lib/currency';
import { format, parseISO } from 'date-fns';

interface FuelLogTabProps {
  fuelLogs: FleetFuelLog[];
  vehicles: FleetVehicle[];
  onCreateLog: (log: any) => Promise<boolean>;
  onDeleteLog: (id: string) => Promise<boolean>;
}

export function FuelLogTab({ fuelLogs, vehicles, onCreateLog, onDeleteLog }: FuelLogTabProps) {
  const [addOpen, setAddOpen] = useState(false);

  const getVehicleLabel = (vehicleId: string) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.make} ${v.model}` : 'Unknown';
  };

  const totalLitres = fuelLogs.reduce((sum, l) => sum + l.litres, 0);
  const totalCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fuel Log</CardTitle>
              <CardDescription>{fuelLogs.length} entries · {totalLitres.toFixed(1)}L · {formatMaluti(totalCost)}</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Log Fuel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fuelLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Fuel className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No fuel records yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fuelLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{log.litres}L</p>
                    <p className="text-xs text-muted-foreground">
                      {getVehicleLabel(log.vehicleId)} · {format(parseISO(log.date), 'dd MMM yyyy')}
                      {log.station && ` · ${log.station}`}
                      {log.odometer && ` · ${log.odometer.toLocaleString()} km`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-sm">{formatMaluti(log.cost)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteLog(log.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddFuelLogDialog open={addOpen} onOpenChange={setAddOpen} vehicles={vehicles} onSubmit={onCreateLog} />
    </>
  );
}

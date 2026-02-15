import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, Trash2 } from 'lucide-react';
import { FleetServiceLog } from '@/hooks/useFleetServiceLogs';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { AddServiceLogDialog } from './AddServiceLogDialog';
import { formatMaluti } from '@/lib/currency';
import { format, parseISO } from 'date-fns';

interface ServiceLogTabProps {
  serviceLogs: FleetServiceLog[];
  vehicles: FleetVehicle[];
  onCreateLog: (log: any) => Promise<boolean>;
  onDeleteLog: (id: string) => Promise<boolean>;
}

export function ServiceLogTab({ serviceLogs, vehicles, onCreateLog, onDeleteLog }: ServiceLogTabProps) {
  const [addOpen, setAddOpen] = useState(false);

  const getVehicleLabel = (vehicleId: string) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.make} ${v.model}` : 'Unknown';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service & Repair Log</CardTitle>
              <CardDescription>{serviceLogs.length} records</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Log Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {serviceLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No service records yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {serviceLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{log.serviceType}</p>
                    <p className="text-xs text-muted-foreground">
                      {getVehicleLabel(log.vehicleId)} · {format(parseISO(log.serviceDate), 'dd MMM yyyy')}
                      {log.provider && ` · ${log.provider}`}
                    </p>
                    {log.partsReplaced && <p className="text-xs text-muted-foreground mt-0.5">Parts: {log.partsReplaced}</p>}
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

      <AddServiceLogDialog open={addOpen} onOpenChange={setAddOpen} vehicles={vehicles} onSubmit={onCreateLog} />
    </>
  );
}

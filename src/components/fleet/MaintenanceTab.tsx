import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { useFleetMaintenanceSchedules, FleetMaintenanceSchedule } from '@/hooks/useFleetMaintenanceSchedules';
import { AddMaintenanceScheduleDialog } from './AddMaintenanceScheduleDialog';
import { Plus, Calendar, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

interface MaintenanceTabProps {
  vehicles: FleetVehicle[];
}

export function MaintenanceTab({ vehicles }: MaintenanceTabProps) {
  const { schedules, overdue, upcoming, createSchedule, markCompleted, deleteSchedule } = useFleetMaintenanceSchedules();
  const [showAdd, setShowAdd] = useState(false);

  const getVehicleLabel = (vid: string) => {
    const v = vehicles.find(v => v.id === vid);
    return v ? `${v.make} ${v.model} (${v.licensePlate || v.year})` : 'Unknown';
  };

  const getStatusBadge = (s: FleetMaintenanceSchedule) => {
    if (!s.nextDueDate) return <Badge variant="outline">No schedule</Badge>;
    const days = differenceInDays(parseISO(s.nextDueDate), new Date());
    if (days < 0) return <Badge variant="destructive">Overdue by {Math.abs(days)}d</Badge>;
    if (days <= 14) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Due in {days}d</Badge>;
    return <Badge variant="outline" className="text-emerald-600">Due in {days}d</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Maintenance Schedules</h3>
          <p className="text-sm text-muted-foreground">{overdue.length} overdue · {upcoming.length} upcoming</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Add Schedule</Button>
      </div>

      {overdue.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" />Overdue Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-background">
                <div>
                  <p className="font-medium text-sm">{s.serviceType}</p>
                  <p className="text-xs text-muted-foreground">{getVehicleLabel(s.vehicleId)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(s)}
                  <Button size="sm" variant="outline" onClick={() => {
                    const v = vehicles.find(v => v.id === s.vehicleId);
                    markCompleted(s.id, v?.odometer || 0);
                  }}><CheckCircle className="h-3.5 w-3.5 mr-1" />Done</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />All Schedules</CardTitle>
          <CardDescription>Preventative maintenance calendar for your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No maintenance schedules yet. Add one to stay ahead of repairs.</p>
          ) : (
            <div className="space-y-2">
              {schedules.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{s.serviceType}</p>
                      {getStatusBadge(s)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{getVehicleLabel(s.vehicleId)}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      {s.intervalKm && <span>Every {s.intervalKm.toLocaleString()} km</span>}
                      {s.intervalMonths && <span>Every {s.intervalMonths} months</span>}
                      {s.nextDueDate && <span>Next: {format(parseISO(s.nextDueDate), 'dd MMM yyyy')}</span>}
                      {s.nextDueOdometer && <span>At: {s.nextDueOdometer.toLocaleString()} km</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      const v = vehicles.find(v => v.id === s.vehicleId);
                      markCompleted(s.id, v?.odometer || 0);
                    }}><CheckCircle className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSchedule(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddMaintenanceScheduleDialog open={showAdd} onOpenChange={setShowAdd} vehicles={vehicles} onSubmit={createSchedule} />
    </div>
  );
}

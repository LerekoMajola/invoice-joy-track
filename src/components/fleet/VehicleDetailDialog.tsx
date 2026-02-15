import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleHealthBadge } from './VehicleHealthBadge';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetCostSummary } from '@/hooks/useFleetCosts';
import { FleetServiceLog } from '@/hooks/useFleetServiceLogs';
import { FleetFuelLog } from '@/hooks/useFleetFuelLogs';
import { FleetIncident } from '@/hooks/useFleetIncidents';
import { formatMaluti } from '@/lib/currency';
import { format, parseISO } from 'date-fns';
import { Trash2, Wrench, Fuel, AlertTriangle, FileText } from 'lucide-react';

interface VehicleDetailDialogProps {
  vehicle: FleetVehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costSummary?: FleetCostSummary;
  serviceLogs: FleetServiceLog[];
  fuelLogs: FleetFuelLog[];
  incidents: FleetIncident[];
  onDelete: () => void;
}

export function VehicleDetailDialog({ vehicle, open, onOpenChange, costSummary, serviceLogs, fuelLogs, incidents, onDelete }: VehicleDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{vehicle.make} {vehicle.model} ({vehicle.year})</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{vehicle.licensePlate || 'No plate'} · {vehicle.odometer.toLocaleString()} km</p>
            </div>
            <VehicleHealthBadge score={vehicle.healthScore} />
          </div>
        </DialogHeader>

        {/* Key Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Purchase</p>
            <p className="font-semibold text-sm">{formatMaluti(vehicle.purchasePrice)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="font-semibold text-sm">{formatMaluti(costSummary?.total || 0)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">License Exp.</p>
            <p className="font-semibold text-sm">{vehicle.licenseExpiry ? format(parseISO(vehicle.licenseExpiry), 'dd MMM yyyy') : '—'}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Insurance Exp.</p>
            <p className="font-semibold text-sm">{vehicle.insuranceExpiry ? format(parseISO(vehicle.insuranceExpiry), 'dd MMM yyyy') : '—'}</p>
          </div>
        </div>

        {vehicle.healthScore < 40 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
            <p className="font-medium text-red-600">⚠️ Replace-or-Keep Alert</p>
            <p className="text-muted-foreground mt-1">This vehicle's health score suggests it may no longer be financially efficient to maintain. Consider replacement.</p>
          </div>
        )}

        <Tabs defaultValue="services" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="gap-1.5 text-xs"><Wrench className="h-3.5 w-3.5" />Services ({serviceLogs.length})</TabsTrigger>
            <TabsTrigger value="fuel" className="gap-1.5 text-xs"><Fuel className="h-3.5 w-3.5" />Fuel ({fuelLogs.length})</TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" />Incidents ({incidents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="max-h-48 overflow-y-auto space-y-2">
            {serviceLogs.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No service records</p> : serviceLogs.map(l => (
              <div key={l.id} className="flex justify-between items-center p-2 rounded border border-border text-sm">
                <div>
                  <p className="font-medium">{l.serviceType}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(l.serviceDate), 'dd MMM yyyy')}{l.provider && ` · ${l.provider}`}</p>
                </div>
                <span className="font-medium">{formatMaluti(l.cost)}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="fuel" className="max-h-48 overflow-y-auto space-y-2">
            {fuelLogs.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No fuel records</p> : fuelLogs.map(l => (
              <div key={l.id} className="flex justify-between items-center p-2 rounded border border-border text-sm">
                <div>
                  <p className="font-medium">{l.litres}L</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(l.date), 'dd MMM yyyy')}{l.station && ` · ${l.station}`}</p>
                </div>
                <span className="font-medium">{formatMaluti(l.cost)}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="incidents" className="max-h-48 overflow-y-auto space-y-2">
            {incidents.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No incidents</p> : incidents.map(i => (
              <div key={i.id} className="flex justify-between items-center p-2 rounded border border-border text-sm">
                <div>
                  <p className="font-medium">{i.incidentType}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(i.date), 'dd MMM yyyy')}{i.driverName && ` · ${i.driverName}`}</p>
                </div>
                <span className="font-medium">{formatMaluti(i.cost)}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-2 border-t">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />Delete Vehicle
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

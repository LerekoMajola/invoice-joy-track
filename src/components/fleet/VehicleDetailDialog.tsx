import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleHealthBadge } from './VehicleHealthBadge';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetCostSummary } from '@/hooks/useFleetCosts';
import { FleetServiceLog } from '@/hooks/useFleetServiceLogs';
import { FleetFuelLog } from '@/hooks/useFleetFuelLogs';
import { FleetIncident } from '@/hooks/useFleetIncidents';
import { formatMaluti } from '@/lib/currency';
import { format, parseISO } from 'date-fns';
import { Trash2, Wrench, Fuel, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const costPerKm = vehicle.odometer > 0 && costSummary ? costSummary.total / vehicle.odometer : 0;
  const v = vehicle as any; // For new fields that may not be in TS types yet

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
            <p className="text-xs text-muted-foreground">Cost/km</p>
            <p className="font-semibold text-sm">{costPerKm > 0 ? `M${costPerKm.toFixed(2)}` : '—'}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-semibold text-sm capitalize">{vehicle.status}</p>
          </div>
        </div>

        {/* Extra details row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">License Exp.</p>
            <p className="font-semibold text-sm">{vehicle.licenseExpiry ? format(parseISO(vehicle.licenseExpiry), 'dd MMM yyyy') : '—'}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Insurance Exp.</p>
            <p className="font-semibold text-sm">{vehicle.insuranceExpiry ? format(parseISO(vehicle.insuranceExpiry), 'dd MMM yyyy') : '—'}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Driver</p>
            <p className="font-semibold text-sm">{vehicle.assignedDriver || '—'}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">VIN</p>
            <p className="font-semibold text-sm text-xs">{vehicle.vin || '—'}</p>
          </div>
        </div>

        {/* Replace-or-Keep recommendation */}
        {vehicle.healthScore < 40 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
            <p className="font-medium text-destructive">⚠️ Replace-or-Keep Recommendation</p>
            <p className="text-muted-foreground mt-1">
              Health score: {vehicle.healthScore}/100. Total spend: {formatMaluti(costSummary?.total || 0)} vs purchase price: {formatMaluti(vehicle.purchasePrice)}.
              {costSummary && costSummary.total > vehicle.purchasePrice * 0.5 
                ? ' Maintenance costs exceed 50% of purchase price — strongly consider replacement.'
                : ' Monitor closely — rising costs may justify replacement soon.'}
            </p>
          </div>
        )}

        <Tabs defaultValue="services" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services" className="gap-1.5 text-xs"><Wrench className="h-3.5 w-3.5" />Services ({serviceLogs.length})</TabsTrigger>
            <TabsTrigger value="fuel" className="gap-1.5 text-xs"><Fuel className="h-3.5 w-3.5" />Fuel ({fuelLogs.length})</TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" />Incidents ({incidents.length})</TabsTrigger>
            <TabsTrigger value="info" className="gap-1.5 text-xs"><Info className="h-3.5 w-3.5" />Details</TabsTrigger>
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

          <TabsContent value="info" className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {vehicle.financeDetails && (
                <div className="col-span-2 p-2 rounded border border-border">
                  <p className="text-xs text-muted-foreground">Finance Details</p>
                  <p>{vehicle.financeDetails}</p>
                </div>
              )}
              {vehicle.notes && (
                <div className="col-span-2 p-2 rounded border border-border">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p>{vehicle.notes}</p>
                </div>
              )}
            </div>
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

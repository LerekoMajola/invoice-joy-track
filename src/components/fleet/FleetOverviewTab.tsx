import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FleetStatsCards } from './FleetStatsCards';
import { VehicleHealthBadge } from './VehicleHealthBadge';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { AlertTriangle, Calendar, Shield, Wrench, CircleDot, FileText } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { formatMaluti } from '@/lib/currency';
import { FleetCostSummary } from '@/hooks/useFleetCosts';
import { useFleetMaintenanceSchedules } from '@/hooks/useFleetMaintenanceSchedules';
import { useFleetTyres } from '@/hooks/useFleetTyres';
import { useFleetDrivers } from '@/hooks/useFleetDrivers';
import { useFleetDocuments } from '@/hooks/useFleetDocuments';

interface FleetOverviewTabProps {
  vehicles: FleetVehicle[];
  monthlyTotal: number;
  costsByVehicle: Record<string, FleetCostSummary>;
}

interface Alert {
  vehicleLabel: string;
  message: string;
  severity: 'warning' | 'danger';
  category: string;
}

export function FleetOverviewTab({ vehicles, monthlyTotal, costsByVehicle }: FleetOverviewTabProps) {
  const today = new Date();
  const { overdue } = useFleetMaintenanceSchedules();
  const { needingReplacement } = useFleetTyres();
  const { expiringLicenses } = useFleetDrivers();
  const { expiringDocuments } = useFleetDocuments();

  // Generate alerts
  const alerts: Alert[] = [];

  // Vehicle license/insurance alerts
  vehicles.forEach(v => {
    const label = `${v.make} ${v.model} (${v.licensePlate || v.year})`;
    if (v.licenseExpiry) {
      const days = differenceInDays(parseISO(v.licenseExpiry), today);
      if (days < 0) alerts.push({ vehicleLabel: label, message: 'License expired', severity: 'danger', category: 'License' });
      else if (days <= 30) alerts.push({ vehicleLabel: label, message: `License expires in ${days} days`, severity: 'warning', category: 'License' });
    }
    if (v.insuranceExpiry) {
      const days = differenceInDays(parseISO(v.insuranceExpiry), today);
      if (days < 0) alerts.push({ vehicleLabel: label, message: 'Insurance expired', severity: 'danger', category: 'Insurance' });
      else if (days <= 30) alerts.push({ vehicleLabel: label, message: `Insurance expires in ${days} days`, severity: 'warning', category: 'Insurance' });
    }
    if (v.healthScore < 40) {
      alerts.push({ vehicleLabel: label, message: 'Vehicle may need replacement', severity: 'danger', category: 'Health' });
    }
  });

  // Maintenance overdue alerts
  overdue.forEach(s => {
    const v = vehicles.find(v => v.id === s.vehicleId);
    const label = v ? `${v.make} ${v.model}` : 'Unknown';
    alerts.push({ vehicleLabel: label, message: `${s.serviceType} overdue`, severity: 'danger', category: 'Maintenance' });
  });

  // Tyre alerts
  needingReplacement.forEach(t => {
    const v = vehicles.find(v => v.id === t.vehicleId);
    const label = v ? `${v.make} ${v.model}` : 'Unknown';
    alerts.push({ vehicleLabel: label, message: `Tyre replacement needed (${t.position})`, severity: 'warning', category: 'Tyres' });
  });

  // Driver license alerts
  expiringLicenses.forEach(d => {
    alerts.push({ vehicleLabel: d.fullName, message: 'Driver license expiring', severity: 'warning', category: 'Driver' });
  });

  // Document expiry alerts
  expiringDocuments.forEach(d => {
    const v = vehicles.find(v => v.id === d.vehicleId);
    const label = v ? `${v.make} ${v.model}` : 'Unknown';
    alerts.push({ vehicleLabel: label, message: `${d.documentType} expiring`, severity: 'warning', category: 'Document' });
  });

  // Sort: critical first
  const sortedAlerts = [...alerts].sort((a, b) => (a.severity === 'danger' ? -1 : 1) - (b.severity === 'danger' ? -1 : 1));
  const sortedVehicles = [...vehicles].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="space-y-6">
      <FleetStatsCards vehicles={vehicles} monthlyTotal={monthlyTotal} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Smart Alerts Center */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Smart Alerts ({sortedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No alerts — all vehicles are in good standing. ✅</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {sortedAlerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                    alert.severity === 'danger' ? 'bg-destructive/5 border-destructive/20' : 'bg-amber-500/5 border-amber-500/20'
                  }`}>
                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === 'danger' ? 'bg-destructive' : 'bg-amber-500'
                    }`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{alert.vehicleLabel}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{alert.category}</span>
                      </div>
                      <p className="text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Health Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Vehicle Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedVehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Add vehicles to see health overview.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {sortedVehicles.slice(0, 10).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                    <div>
                      <p className="font-medium text-sm">{v.make} {v.model}</p>
                      <p className="text-xs text-muted-foreground">{v.licensePlate || v.year} · {v.odometer.toLocaleString()} km</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {costsByVehicle[v.id] && (
                        <span className="text-xs text-muted-foreground">{formatMaluti(costsByVehicle[v.id].total)}</span>
                      )}
                      <VehicleHealthBadge score={v.healthScore} showScore={false} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useFleetVehicles } from '@/hooks/useFleetVehicles';
import { useFleetCosts } from '@/hooks/useFleetCosts';
import { useFleetServiceLogs } from '@/hooks/useFleetServiceLogs';
import { useFleetFuelLogs } from '@/hooks/useFleetFuelLogs';
import { useFleetIncidents } from '@/hooks/useFleetIncidents';
import { useFleetMaintenanceSchedules } from '@/hooks/useFleetMaintenanceSchedules';
import { useFleetDrivers } from '@/hooks/useFleetDrivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleHealthBadge } from '@/components/fleet/VehicleHealthBadge';
import { AlertTriangle, Car, TrendingUp, Wrench, Clock, Fuel } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function FleetDashboard() {
  const { vehicles } = useFleetVehicles();
  const { monthlyTotal } = useFleetCosts();
  const { serviceLogs } = useFleetServiceLogs();
  const { fuelLogs } = useFleetFuelLogs();
  const { incidents } = useFleetIncidents();
  const { overdue } = useFleetMaintenanceSchedules();
  const { expiringLicenses } = useFleetDrivers();

  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const criticalVehicles = vehicles.filter(v => (v.healthScore ?? 100) < 40);
  const monitorVehicles = vehicles.filter(v => {
    const score = v.healthScore ?? 100;
    return score >= 40 && score < 70;
  });

  // Build consolidated alerts
  const alerts: { message: string; severity: 'danger' | 'warning' }[] = [];
  overdue.forEach(s => {
    const v = vehicles.find(v => v.id === s.vehicleId);
    alerts.push({ message: `${v ? `${v.make} ${v.model}` : 'Vehicle'}: ${s.serviceType} overdue`, severity: 'danger' });
  });
  vehicles.forEach(v => {
    if (v.licenseExpiry) {
      const days = differenceInDays(parseISO(v.licenseExpiry), new Date());
      if (days < 0) alerts.push({ message: `${v.make} ${v.model}: License expired`, severity: 'danger' });
      else if (days <= 30) alerts.push({ message: `${v.make} ${v.model}: License expires in ${days}d`, severity: 'warning' });
    }
    if (v.insuranceExpiry) {
      const days = differenceInDays(parseISO(v.insuranceExpiry), new Date());
      if (days < 0) alerts.push({ message: `${v.make} ${v.model}: Insurance expired`, severity: 'danger' });
      else if (days <= 30) alerts.push({ message: `${v.make} ${v.model}: Insurance in ${days}d`, severity: 'warning' });
    }
  });
  expiringLicenses.forEach(d => alerts.push({ message: `${d.fullName}: Driver license expiring`, severity: 'warning' }));

  // Recent activity (last 10 items across all types)
  const activity = [
    ...serviceLogs.slice(0, 5).map(s => ({ type: 'service' as const, date: s.serviceDate, label: s.serviceType, cost: s.cost })),
    ...fuelLogs.slice(0, 5).map(f => ({ type: 'fuel' as const, date: f.date, label: `${f.litres}L fuel`, cost: f.cost })),
    ...incidents.slice(0, 5).map(i => ({ type: 'incident' as const, date: i.date, label: i.incidentType, cost: i.cost })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fleet Dashboard</h1>
            <p className="text-muted-foreground text-sm">{vehicles.length} vehicles · {activeVehicles.length} active</p>
          </div>
          <Link to="/fleet">
            <Button variant="outline" size="sm"><Car className="h-4 w-4 mr-2" />Manage Fleet</Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Car className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{vehicles.length}</p>
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{formatMaluti(monthlyTotal)}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{monitorVehicles.length}</p>
            <p className="text-xs text-muted-foreground">Need Attention</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" />
            <p className="text-2xl font-bold">{criticalVehicles.length}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Smart Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All clear — no alerts 🎉</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.slice(0, 8).map((a, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-sm ${
                      a.severity === 'danger' ? 'bg-destructive/5 border-destructive/20' : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${a.severity === 'danger' ? 'bg-destructive' : 'bg-amber-500'}`} />
                      <span>{a.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border text-sm">
                      <div className="flex items-center gap-2">
                        {a.type === 'service' && <Wrench className="h-3.5 w-3.5 text-primary" />}
                        {a.type === 'fuel' && <Fuel className="h-3.5 w-3.5 text-emerald-500" />}
                        {a.type === 'incident' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                        <div>
                          <p className="font-medium">{a.label}</p>
                          <p className="text-xs text-muted-foreground">{format(parseISO(a.date), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatMaluti(a.cost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vehicles needing attention */}
        {[...criticalVehicles, ...monitorVehicles].length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vehicles Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...criticalVehicles, ...monitorVehicles].slice(0, 5).map(v => (
                  <div key={v.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{v.make} {v.model} ({v.year})</span>
                    <VehicleHealthBadge score={v.healthScore ?? 50} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

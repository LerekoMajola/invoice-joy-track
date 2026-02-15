import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FleetStatsCards } from '@/components/fleet/FleetStatsCards';
import { FleetOverviewTab } from '@/components/fleet/FleetOverviewTab';
import { useFleetVehicles } from '@/hooks/useFleetVehicles';
import { useFleetCosts } from '@/hooks/useFleetCosts';
import { useFleetServiceLogs } from '@/hooks/useFleetServiceLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleHealthBadge } from '@/components/fleet/VehicleHealthBadge';
import { AlertTriangle, Car, Wrench, TrendingUp } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FleetDashboard() {
  const { vehicles, isLoading } = useFleetVehicles();
  const { monthlyTotal } = useFleetCosts();
  const { serviceLogs } = useFleetServiceLogs();

  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const criticalVehicles = vehicles.filter(v => (v.healthScore ?? 100) < 40);
  const monitorVehicles = vehicles.filter(v => {
    const score = v.healthScore ?? 100;
    return score >= 40 && score < 70;
  });

  const monthlyCost = monthlyTotal;

  const recentServices = serviceLogs.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fleet Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              {vehicles.length} vehicles · {activeVehicles.length} active
            </p>
          </div>
          <Link to="/fleet">
            <Button variant="outline" size="sm">
              <Car className="h-4 w-4 mr-2" />
              Manage Fleet
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{vehicles.length}</p>
              <p className="text-xs text-muted-foreground">Total Vehicles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
              <p className="text-2xl font-bold">{formatMaluti(monthlyCost)}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-2xl font-bold">{monitorVehicles.length}</p>
              <p className="text-xs text-muted-foreground">Need Attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold">{criticalVehicles.length}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Vehicles needing attention */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vehicles Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              {[...criticalVehicles, ...monitorVehicles].length === 0 ? (
                <p className="text-sm text-muted-foreground">All vehicles are healthy 🎉</p>
              ) : (
                <div className="space-y-3">
                  {[...criticalVehicles, ...monitorVehicles].slice(0, 5).map(v => (
                    <div key={v.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{v.make} {v.model} ({v.year})</span>
                      <VehicleHealthBadge score={v.healthScore ?? 50} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Services</CardTitle>
            </CardHeader>
            <CardContent>
              {recentServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No service records yet</p>
              ) : (
                <div className="space-y-3">
                  {recentServices.map(s => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{s.serviceType}</p>
                        <p className="text-xs text-muted-foreground">{s.serviceDate}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatMaluti(s.cost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetCostSummary } from '@/hooks/useFleetCosts';
import { VehicleHealthBadge } from './VehicleHealthBadge';
import { formatMaluti } from '@/lib/currency';
import { TrendingUp, DollarSign } from 'lucide-react';

interface CostsTabProps {
  vehicles: FleetVehicle[];
  costsByVehicle: Record<string, FleetCostSummary>;
}

export function CostsTab({ vehicles, costsByVehicle }: CostsTabProps) {
  // Sort vehicles by total cost descending
  const sorted = [...vehicles].sort((a, b) => {
    const costA = costsByVehicle[a.id]?.total || 0;
    const costB = costsByVehicle[b.id]?.total || 0;
    return costB - costA;
  });

  const totalFleetCost = Object.values(costsByVehicle).reduce((sum, c) => sum + c.total, 0);
  const totalFuel = Object.values(costsByVehicle).reduce((sum, c) => sum + c.fuel, 0);
  const totalMaintenance = Object.values(costsByVehicle).reduce((sum, c) => sum + c.maintenance, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Fleet Cost</p>
            <p className="text-xl font-bold mt-1">{formatMaluti(totalFleetCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Fuel</p>
            <p className="text-xl font-bold mt-1">{formatMaluti(totalFuel)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Maintenance & Repairs</p>
            <p className="text-xl font-bold mt-1">{formatMaluti(totalMaintenance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-vehicle cost breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Per Vehicle
          </CardTitle>
          <CardDescription>True cost of ownership ranked by total spend</CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Add vehicles and log costs to see intelligence here.</p>
          ) : (
            <div className="space-y-2">
              {sorted.map(v => {
                const c = costsByVehicle[v.id];
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{v.make} {v.model}</p>
                        <VehicleHealthBadge score={v.healthScore} showScore={false} />
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Fuel: {formatMaluti(c?.fuel || 0)}</span>
                        <span>Maint: {formatMaluti(c?.maintenance || 0)}</span>
                        <span>Incidents: {formatMaluti(c?.incidents || 0)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{formatMaluti(c?.total || 0)}</p>
                      {v.healthScore < 40 && (
                        <p className="text-[10px] text-red-500 font-medium">Consider Replacement</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

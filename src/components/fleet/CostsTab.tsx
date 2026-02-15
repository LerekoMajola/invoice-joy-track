import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetCostSummary } from '@/hooks/useFleetCosts';
import { useFleetCostEntries } from '@/hooks/useFleetCostEntries';
import { VehicleHealthBadge } from './VehicleHealthBadge';
import { AddCostEntryDialog } from './AddCostEntryDialog';
import { formatMaluti } from '@/lib/currency';
import { DollarSign, Plus, TrendingUp } from 'lucide-react';

interface CostsTabProps {
  vehicles: FleetVehicle[];
  costsByVehicle: Record<string, FleetCostSummary>;
}

export function CostsTab({ vehicles, costsByVehicle }: CostsTabProps) {
  const { entries, byCategory, totalEntries, createEntry } = useFleetCostEntries();
  const [showAdd, setShowAdd] = useState(false);

  // Sort vehicles by total cost descending
  const sorted = [...vehicles].sort((a, b) => {
    const costA = (costsByVehicle[a.id]?.total || 0) + entries.filter(e => e.vehicleId === a.id).reduce((s, e) => s + e.amount, 0);
    const costB = (costsByVehicle[b.id]?.total || 0) + entries.filter(e => e.vehicleId === b.id).reduce((s, e) => s + e.amount, 0);
    return costB - costA;
  });

  const totalFleetCost = Object.values(costsByVehicle).reduce((sum, c) => sum + c.total, 0) + totalEntries;
  const totalFuel = Object.values(costsByVehicle).reduce((sum, c) => sum + c.fuel, 0);
  const totalMaintenance = Object.values(costsByVehicle).reduce((sum, c) => sum + c.maintenance, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cost Intelligence</h3>
        <Button onClick={() => setShowAdd(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Add Cost</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Fleet Cost</p>
          <p className="text-xl font-bold mt-1">{formatMaluti(totalFleetCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Fuel</p>
          <p className="text-xl font-bold mt-1">{formatMaluti(totalFuel)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Maintenance</p>
          <p className="text-xl font-bold mt-1">{formatMaluti(totalMaintenance)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Insurance/Finance/Other</p>
          <p className="text-xl font-bold mt-1">{formatMaluti(totalEntries)}</p>
        </CardContent></Card>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Cost Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(byCategory).map(([cat, amount]) => (
                <div key={cat} className="p-2 rounded-lg border border-border text-center">
                  <p className="text-xs text-muted-foreground">{cat}</p>
                  <p className="font-semibold text-sm">{formatMaluti(amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                const extraCosts = entries.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
                const totalVehicleCost = (c?.total || 0) + extraCosts;
                const costPerKm = v.odometer > 0 ? totalVehicleCost / v.odometer : 0;

                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{v.make} {v.model}</p>
                        <VehicleHealthBadge score={v.healthScore} showScore={false} />
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>Fuel: {formatMaluti(c?.fuel || 0)}</span>
                        <span>Maint: {formatMaluti(c?.maintenance || 0)}</span>
                        {extraCosts > 0 && <span>Other: {formatMaluti(extraCosts)}</span>}
                        {costPerKm > 0 && <span className="font-medium text-foreground">M{costPerKm.toFixed(2)}/km</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{formatMaluti(totalVehicleCost)}</p>
                      {v.healthScore < 40 && (
                        <p className="text-[10px] text-destructive font-medium">Consider Replacement</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCostEntryDialog open={showAdd} onOpenChange={setShowAdd} vehicles={vehicles} onSubmit={createEntry} />
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { useFleetTyres } from '@/hooks/useFleetTyres';
import { AddTyreDialog } from './AddTyreDialog';
import { formatMaluti } from '@/lib/currency';
import { Plus, CircleDot, Trash2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TyresTabProps {
  vehicles: FleetVehicle[];
}

const POSITIONS: Record<string, string> = {
  front_left: 'Front Left', front_right: 'Front Right',
  rear_left: 'Rear Left', rear_right: 'Rear Right',
  spare: 'Spare',
};

export function TyresTab({ vehicles }: TyresTabProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const { tyres, needingReplacement, totalTyreCost, createTyre, deleteTyre } = useFleetTyres(selectedVehicle === 'all' ? undefined : selectedVehicle);
  const [showAdd, setShowAdd] = useState(false);

  const getVehicleLabel = (vid: string) => {
    const v = vehicles.find(v => v.id === vid);
    return v ? `${v.make} ${v.model}` : 'Unknown';
  };

  const getWearPercent = (current: number, expected: number) => Math.min(100, Math.round((current / expected) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All vehicles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAdd(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Add Tyre</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Tyres</p>
          <p className="text-xl font-bold mt-1">{tyres.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Need Replacement</p>
          <p className="text-xl font-bold mt-1 text-amber-600">{needingReplacement.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Tyre Cost</p>
          <p className="text-xl font-bold mt-1">{formatMaluti(totalTyreCost)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><CircleDot className="h-4 w-4" />Tyre Inventory</CardTitle>
          <CardDescription>Track tyre positions, wear, and replacement needs</CardDescription>
        </CardHeader>
        <CardContent>
          {tyres.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No tyres logged yet.</p>
          ) : (
            <div className="space-y-2">
              {tyres.map(t => {
                const wear = getWearPercent(t.currentKm, t.expectedKm);
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{POSITIONS[t.position] || t.position}</p>
                        {wear >= 80 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                        <Badge variant="outline" className="text-xs">{t.brand || 'Unknown'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{getVehicleLabel(t.vehicleId)} · {t.size || 'No size'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${wear >= 80 ? 'bg-red-500' : wear >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${wear}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{wear}% worn</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatMaluti(t.cost)}</span>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTyre(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTyreDialog open={showAdd} onOpenChange={setShowAdd} vehicles={vehicles} onSubmit={createTyre} />
    </div>
  );
}

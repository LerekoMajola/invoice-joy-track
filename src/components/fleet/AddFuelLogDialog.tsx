import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetFuelLogInsert } from '@/hooks/useFleetFuelLogs';

interface AddFuelLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  defaultVehicleId?: string;
  onSubmit: (log: FleetFuelLogInsert) => Promise<boolean>;
}

export function AddFuelLogDialog({ open, onOpenChange, vehicles, defaultVehicleId, onSubmit }: AddFuelLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: defaultVehicleId || '',
    date: new Date().toISOString().split('T')[0],
    litres: '',
    cost: '',
    odometer: '',
    station: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.litres || !form.cost) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId,
      date: form.date,
      litres: parseFloat(form.litres),
      cost: parseFloat(form.cost),
      odometer: form.odometer ? parseInt(form.odometer) : undefined,
      station: form.station || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: defaultVehicleId || '', date: new Date().toISOString().split('T')[0], litres: '', cost: '', odometer: '', station: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Fuel</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <Label>Litres *</Label>
              <Input type="number" step="0.01" value={form.litres} onChange={e => setForm(f => ({ ...f, litres: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cost *</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} required />
            </div>
            <div>
              <Label>Odometer</Label>
              <Input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Station</Label>
            <Input value={form.station} onChange={e => setForm(f => ({ ...f, station: e.target.value }))} placeholder="Fuel station name" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Log Fuel'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

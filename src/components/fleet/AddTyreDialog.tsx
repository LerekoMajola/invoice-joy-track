import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetTyreInsert } from '@/hooks/useFleetTyres';

interface AddTyreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  onSubmit: (t: FleetTyreInsert) => Promise<boolean>;
}

const POSITIONS = [
  { value: 'front_left', label: 'Front Left' },
  { value: 'front_right', label: 'Front Right' },
  { value: 'rear_left', label: 'Rear Left' },
  { value: 'rear_right', label: 'Rear Right' },
  { value: 'spare', label: 'Spare' },
];

export function AddTyreDialog({ open, onOpenChange, vehicles, onSubmit }: AddTyreDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '', position: 'front_left', brand: '', size: '',
    dateFitted: new Date().toISOString().split('T')[0], expectedKm: '40000', cost: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId, position: form.position,
      brand: form.brand || undefined, size: form.size || undefined,
      dateFitted: form.dateFitted, expectedKm: parseInt(form.expectedKm) || 40000,
      cost: form.cost ? parseFloat(form.cost) : 0,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: '', position: 'front_left', brand: '', size: '', dateFitted: new Date().toISOString().split('T')[0], expectedKm: '40000', cost: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Tyre</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Position *</Label>
              <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{POSITIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. Continental" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Size</Label>
              <Input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 265/65R17" />
            </div>
            <div>
              <Label>Cost</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date Fitted</Label>
              <Input type="date" value={form.dateFitted} onChange={e => setForm(f => ({ ...f, dateFitted: e.target.value }))} />
            </div>
            <div>
              <Label>Expected Life (km)</Label>
              <Input type="number" value={form.expectedKm} onChange={e => setForm(f => ({ ...f, expectedKm: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Tyre'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

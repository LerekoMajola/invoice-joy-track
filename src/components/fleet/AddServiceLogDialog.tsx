import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetServiceLogInsert } from '@/hooks/useFleetServiceLogs';

interface AddServiceLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  defaultVehicleId?: string;
  onSubmit: (log: FleetServiceLogInsert) => Promise<boolean>;
}

const SERVICE_TYPES = ['General Service', 'Oil Change', 'Brake Service', 'Tyre Replacement', 'Engine Repair', 'Transmission', 'Electrical', 'Body Work', 'Inspection', 'Other'];

export function AddServiceLogDialog({ open, onOpenChange, vehicles, defaultVehicleId, onSubmit }: AddServiceLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: defaultVehicleId || '',
    serviceType: 'General Service',
    serviceDate: new Date().toISOString().split('T')[0],
    provider: '',
    cost: '',
    partsReplaced: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.cost) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId,
      serviceType: form.serviceType,
      serviceDate: form.serviceDate,
      provider: form.provider || undefined,
      cost: parseFloat(form.cost),
      partsReplaced: form.partsReplaced || undefined,
      notes: form.notes || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: defaultVehicleId || '', serviceType: 'General Service', serviceDate: new Date().toISOString().split('T')[0], provider: '', cost: '', partsReplaced: '', notes: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Service</DialogTitle></DialogHeader>
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
              <Label>Service Type</Label>
              <Select value={form.serviceType} onValueChange={v => setForm(f => ({ ...f, serviceType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.serviceDate} onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cost *</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} required />
            </div>
            <div>
              <Label>Provider</Label>
              <Input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="Service provider" />
            </div>
          </div>
          <div>
            <Label>Parts Replaced</Label>
            <Input value={form.partsReplaced} onChange={e => setForm(f => ({ ...f, partsReplaced: e.target.value }))} placeholder="e.g. Oil filter, brake pads" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Log Service'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

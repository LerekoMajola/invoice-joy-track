import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetMaintenanceScheduleInsert } from '@/hooks/useFleetMaintenanceSchedules';

interface AddMaintenanceScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  onSubmit: (s: FleetMaintenanceScheduleInsert) => Promise<boolean>;
}

const SERVICE_TYPES = ['Oil Change', 'Full Service', 'Major Service', 'Brake Service', 'Tyre Rotation', 'Filter Replacement', 'Timing Belt', 'Transmission Service', 'Coolant Flush', 'Other'];

export function AddMaintenanceScheduleDialog({ open, onOpenChange, vehicles, onSubmit }: AddMaintenanceScheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '', serviceType: 'Oil Change', intervalKm: '', intervalMonths: '',
    lastCompletedDate: '', lastCompletedOdometer: '', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId, serviceType: form.serviceType,
      intervalKm: form.intervalKm ? parseInt(form.intervalKm) : undefined,
      intervalMonths: form.intervalMonths ? parseInt(form.intervalMonths) : undefined,
      lastCompletedDate: form.lastCompletedDate || undefined,
      lastCompletedOdometer: form.lastCompletedOdometer ? parseInt(form.lastCompletedOdometer) : undefined,
      notes: form.notes || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: '', serviceType: 'Oil Change', intervalKm: '', intervalMonths: '', lastCompletedDate: '', lastCompletedOdometer: '', notes: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Maintenance Schedule</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Service Type *</Label>
            <Select value={form.serviceType} onValueChange={v => setForm(f => ({ ...f, serviceType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Interval (km)</Label>
              <Input type="number" placeholder="e.g. 10000" value={form.intervalKm} onChange={e => setForm(f => ({ ...f, intervalKm: e.target.value }))} />
            </div>
            <div>
              <Label>Interval (months)</Label>
              <Input type="number" placeholder="e.g. 6" value={form.intervalMonths} onChange={e => setForm(f => ({ ...f, intervalMonths: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Last Completed</Label>
              <Input type="date" value={form.lastCompletedDate} onChange={e => setForm(f => ({ ...f, lastCompletedDate: e.target.value }))} />
            </div>
            <div>
              <Label>Odometer at Last</Label>
              <Input type="number" value={form.lastCompletedOdometer} onChange={e => setForm(f => ({ ...f, lastCompletedOdometer: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Schedule'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

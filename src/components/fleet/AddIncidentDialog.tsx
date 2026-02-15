import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetIncidentInsert } from '@/hooks/useFleetIncidents';

interface AddIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  onSubmit: (inc: FleetIncidentInsert) => Promise<boolean>;
}

const INCIDENT_TYPES = ['Fine', 'Accident', 'Damage', 'Theft', 'Complaint', 'Other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export function AddIncidentDialog({ open, onOpenChange, vehicles, onSubmit }: AddIncidentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '', driverName: '', incidentType: 'Fine',
    date: new Date().toISOString().split('T')[0], cost: '', description: '', severity: 'low',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId, driverName: form.driverName || undefined,
      incidentType: form.incidentType, date: form.date,
      cost: form.cost ? parseFloat(form.cost) : 0,
      description: form.description || undefined, severity: form.severity,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: '', driverName: '', incidentType: 'Fine', date: new Date().toISOString().split('T')[0], cost: '', description: '', severity: 'low' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Incident</DialogTitle></DialogHeader>
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
              <Label>Incident Type</Label>
              <Select value={form.incidentType} onValueChange={v => setForm(f => ({ ...f, incidentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <Label>Cost</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Driver Name</Label>
            <Input value={form.driverName} onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Log Incident'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

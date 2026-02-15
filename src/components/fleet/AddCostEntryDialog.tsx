import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetCostEntryInsert, COST_CATEGORIES } from '@/hooks/useFleetCostEntries';

interface AddCostEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  onSubmit: (entry: FleetCostEntryInsert) => Promise<boolean>;
}

export function AddCostEntryDialog({ open, onOpenChange, vehicles, onSubmit }: AddCostEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '', category: 'Insurance', amount: '',
    date: new Date().toISOString().split('T')[0], reference: '', vendor: '', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.amount) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId, category: form.category,
      amount: parseFloat(form.amount), date: form.date,
      reference: form.reference || undefined, vendor: form.vendor || undefined,
      notes: form.notes || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: '', category: 'Insurance', amount: '', date: new Date().toISOString().split('T')[0], reference: '', vendor: '', notes: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Cost Entry</DialogTitle></DialogHeader>
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
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COST_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount *</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <Label>Vendor</Label>
              <Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Old Mutual" />
            </div>
          </div>
          <div>
            <Label>Reference</Label>
            <Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Policy/Ref number" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Entry'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

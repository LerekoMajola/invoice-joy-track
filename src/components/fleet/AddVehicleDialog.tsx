import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FleetVehicleInsert } from '@/hooks/useFleetVehicles';

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vehicle: FleetVehicleInsert) => Promise<any>;
}

export function AddVehicleDialog({ open, onOpenChange, onSubmit }: AddVehicleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FleetVehicleInsert>({
    make: '', model: '', year: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model) return;
    setIsSubmitting(true);
    await onSubmit(form);
    setIsSubmitting(false);
    setForm({ make: '', model: '', year: new Date().getFullYear() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Make *</Label>
              <Input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="Toyota" required />
            </div>
            <div>
              <Label>Model *</Label>
              <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Hilux" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Year *</Label>
              <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} required />
            </div>
            <div>
              <Label>VIN</Label>
              <Input value={form.vin || ''} onChange={e => setForm(f => ({ ...f, vin: e.target.value }))} placeholder="Vehicle ID number" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>License Plate</Label>
              <Input value={form.licensePlate || ''} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))} />
            </div>
            <div>
              <Label>Odometer (km)</Label>
              <Input type="number" value={form.odometer || ''} onChange={e => setForm(f => ({ ...f, odometer: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>License Expiry</Label>
              <Input type="date" value={form.licenseExpiry || ''} onChange={e => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} />
            </div>
            <div>
              <Label>Insurance Expiry</Label>
              <Input type="date" value={form.insuranceExpiry || ''} onChange={e => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Assigned Driver</Label>
              <Input value={form.assignedDriver || ''} onChange={e => setForm(f => ({ ...f, assignedDriver: e.target.value }))} />
            </div>
            <div>
              <Label>Purchase Price</Label>
              <Input type="number" value={form.purchasePrice || ''} onChange={e => setForm(f => ({ ...f, purchasePrice: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div>
            <Label>Finance Details</Label>
            <Textarea value={form.financeDetails || ''} onChange={e => setForm(f => ({ ...f, financeDetails: e.target.value }))} placeholder="Optional finance/lease details" rows={2} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Vehicle'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

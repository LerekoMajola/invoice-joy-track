import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { FleetDriverInsert } from '@/hooks/useFleetDrivers';

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (d: FleetDriverInsert) => Promise<boolean>;
}

const LICENSE_TYPES = ['A', 'A1', 'B', 'C', 'C1', 'EB', 'EC', 'EC1'];

export function AddDriverDialog({ open, onOpenChange, onSubmit }: AddDriverDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', licenseNumber: '', licenseExpiry: '', licenseType: 'B', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      fullName: form.fullName, phone: form.phone || undefined,
      licenseNumber: form.licenseNumber || undefined,
      licenseExpiry: form.licenseExpiry || undefined,
      licenseType: form.licenseType, notes: form.notes || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ fullName: '', phone: '', licenseNumber: '', licenseExpiry: '', licenseType: 'B', notes: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Driver</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </div>
          <div>
            <Label>Phone</Label>
            <PhoneInput value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>License Number</Label>
              <Input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} />
            </div>
            <div>
              <Label>License Type</Label>
              <Select value={form.licenseType} onValueChange={v => setForm(f => ({ ...f, licenseType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LICENSE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>License Expiry</Label>
            <Input type="date" value={form.licenseExpiry} onChange={e => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Driver'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

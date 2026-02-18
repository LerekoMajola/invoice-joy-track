import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGymMembers, type GymMemberInsert } from '@/hooks/useGymMembers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({ open, onOpenChange }: Props) {
  const { createMember } = useGymMembers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<GymMemberInsert>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    healthConditions: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return;
    setIsSubmitting(true);
    const result = await createMember(form);
    setIsSubmitting(false);
    if (result) {
      setForm({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '', emergencyContactName: '', emergencyContactPhone: '', healthConditions: '', notes: '' });
      onOpenChange(false);
    }
  };

  const update = (field: keyof GymMemberInsert, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>Enter personal details, emergency contact and health declaration.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input value={form.firstName} onChange={e => update('firstName', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input value={form.lastName} onChange={e => update('lastName', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={form.address} onChange={e => update('address', e.target.value)} />
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium text-foreground mb-2">Emergency Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Name</Label>
                <Input value={form.emergencyContactName} onChange={e => update('emergencyContactName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact Phone</Label>
                <Input value={form.emergencyContactPhone} onChange={e => update('emergencyContactPhone', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium text-foreground mb-2">Health Declaration</p>
            <Textarea placeholder="Any known health conditions, allergies, or medical concerns..." value={form.healthConditions} onChange={e => update('healthConditions', e.target.value)} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Member'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

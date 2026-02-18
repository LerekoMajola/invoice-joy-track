import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGymMembershipPlans } from '@/hooks/useGymMembershipPlans';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { value: 'day_pass', label: 'Day Pass', days: 1 },
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'semi_annual', label: 'Semi-Annual', days: 180 },
  { value: 'annual', label: 'Annual', days: 365 },
  { value: 'custom', label: 'Custom', days: 30 },
];

export function AddMembershipPlanDialog({ open, onOpenChange }: Props) {
  const { createPlan } = useGymMembershipPlans();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('monthly');
  const [durationDays, setDurationDays] = useState(30);
  const [price, setPrice] = useState('');
  const [maxFreezes, setMaxFreezes] = useState('0');

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const found = CATEGORIES.find(c => c.value === cat);
    if (found && cat !== 'custom') setDurationDays(found.days);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setIsSubmitting(true);
    const ok = await createPlan({
      name,
      description,
      category,
      durationDays,
      price: parseFloat(price),
      maxFreezes: parseInt(maxFreezes) || 0,
    });
    setIsSubmitting(false);
    if (ok) {
      setName(''); setDescription(''); setCategory('monthly'); setDurationDays(30); setPrice(''); setMaxFreezes('0');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Membership Plan</DialogTitle>
          <DialogDescription>Define a new membership plan for your gym.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plan Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monthly Unlimited" required />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (days)</Label>
              <Input type="number" min={1} value={durationDays} onChange={e => setDurationDays(parseInt(e.target.value) || 1)} disabled={category !== 'custom'} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price *</Label>
              <Input type="number" min={0} step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Max Freezes</Label>
              <Input type="number" min={0} value={maxFreezes} onChange={e => setMaxFreezes(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Plan'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

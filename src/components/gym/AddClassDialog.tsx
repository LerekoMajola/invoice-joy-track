import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGymClasses } from '@/hooks/useGymClasses';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { value: 'general', label: 'General Fitness' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Strength' },
  { value: 'yoga', label: 'Yoga & Pilates' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'spin', label: 'Spin / Cycling' },
  { value: 'martial_arts', label: 'Martial Arts' },
  { value: 'dance', label: 'Dance' },
  { value: 'aqua', label: 'Aqua Fitness' },
  { value: 'other', label: 'Other' },
];

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
];

export function AddClassDialog({ open, onOpenChange }: Props) {
  const { createClass } = useGymClasses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState('general');
  const [maxCapacity, setMaxCapacity] = useState('20');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    const ok = await createClass({
      name, description, instructor, category,
      maxCapacity: parseInt(maxCapacity) || 20,
      durationMinutes: parseInt(durationMinutes) || 60,
      color,
    });
    setIsSubmitting(false);
    if (ok) {
      setName(''); setDescription(''); setInstructor(''); setCategory('general');
      setMaxCapacity('20'); setDurationMinutes('60'); setColor('#6366f1');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <DialogDescription>Define a new fitness class for your gym.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Class Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Yoga" required />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Instructor</Label>
              <Input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Trainer name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Max Capacity</Label>
              <Input type="number" min={1} value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min={5} step={5} value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Class'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

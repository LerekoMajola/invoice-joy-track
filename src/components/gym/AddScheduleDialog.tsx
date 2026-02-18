import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGymClasses, type GymClass } from '@/hooks/useGymClasses';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: GymClass[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AddScheduleDialog({ open, onOpenChange, classes }: Props) {
  const { createSchedule } = useGymClasses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classId, setClassId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:00');
  const [instructorOverride, setInstructorOverride] = useState('');

  const activeClasses = classes.filter(c => c.isActive);

  const handleClassChange = (id: string) => {
    setClassId(id);
    const cls = activeClasses.find(c => c.id === id);
    if (cls && startTime) {
      const [h, m] = startTime.split(':').map(Number);
      const endMin = h * 60 + m + cls.durationMinutes;
      const eh = Math.floor(endMin / 60) % 24;
      const em = endMin % 60;
      setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;
    setIsSubmitting(true);
    const ok = await createSchedule({
      classId,
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      instructorOverride: instructorOverride || undefined,
    });
    setIsSubmitting(false);
    if (ok) {
      setClassId(''); setDayOfWeek('1'); setStartTime('06:00'); setEndTime('07:00'); setInstructorOverride('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Schedule Slot</DialogTitle>
          <DialogDescription>Schedule a recurring weekly class session.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Class *</Label>
            <Select value={classId} onValueChange={handleClassChange}>
              <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
              <SelectContent>
                {activeClasses.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Day</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Instructor Override</Label>
            <Input value={instructorOverride} onChange={e => setInstructorOverride(e.target.value)} placeholder="Leave blank to use default" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !classId}>{isSubmitting ? 'Adding...' : 'Add Schedule'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

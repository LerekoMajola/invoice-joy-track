import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Subject, TimetableEntry } from '@/hooks/useTimetable';
import type { StaffMember } from '@/hooks/useStaff';

interface TimetableEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  staff: StaffMember[];
  dayOfWeek: number;
  dayName: string;
  periodName: string;
  existingEntry?: TimetableEntry | null;
  onSave: (data: { subjectId: string; teacherId?: string; room?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function TimetableEntryDialog({
  open,
  onOpenChange,
  subjects,
  staff,
  dayName,
  periodName,
  existingEntry,
  onSave,
  onDelete,
}: TimetableEntryDialogProps) {
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [room, setRoom] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activeSubjects = subjects.filter((s) => s.isActive);

  useEffect(() => {
    if (open) {
      if (existingEntry) {
        setSubjectId(existingEntry.subjectId);
        setTeacherId(existingEntry.teacherId || '');
        setRoom(existingEntry.room || '');
      } else {
        setSubjectId('');
        setTeacherId('');
        setRoom('');
      }
    }
  }, [open, existingEntry]);

  const handleSave = async () => {
    if (!subjectId) return;
    setIsSaving(true);
    try {
      await onSave({
        subjectId,
        teacherId: teacherId || undefined,
        room: room || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsSaving(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingEntry ? 'Edit' : 'Add'} — {dayName}, {periodName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {activeSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Teacher (optional)</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No teacher</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Room / Venue (optional)</Label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 101"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {existingEntry && onDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving} className="mr-auto">
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!subjectId || isSaving}>
            {isSaving ? 'Saving...' : existingEntry ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

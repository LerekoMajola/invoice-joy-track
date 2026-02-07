import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SchoolClass } from '@/hooks/useSchoolClasses';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<any>;
  classes: SchoolClass[];
}

export function AddStudentDialog({ open, onOpenChange, onSubmit, classes }: AddStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    classId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    address: '',
    medicalNotes: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelationship: '',
    secondaryGuardianName: '',
    secondaryGuardianPhone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setIsSubmitting(true);
    const result = await onSubmit({
      ...form,
      classId: form.classId || undefined,
    });
    setIsSubmitting(false);
    if (result) {
      setForm({
        firstName: '', lastName: '', dateOfBirth: '', gender: '', classId: '',
        enrollmentDate: new Date().toISOString().split('T')[0], address: '', medicalNotes: '',
        guardianName: '', guardianPhone: '', guardianEmail: '', guardianRelationship: '',
        secondaryGuardianName: '', secondaryGuardianPhone: '', notes: '',
      });
      onOpenChange(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Student Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required /></div>
                <div><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} /></div>
                <div>
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Class</Label>
                  <Select value={form.classId} onValueChange={(v) => update('classId', v)}>
                    <SelectTrigger><SelectValue placeholder="Assign class" /></SelectTrigger>
                    <SelectContent>
                      {classes.filter(c => c.isActive).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Enrollment Date</Label><Input type="date" value={form.enrollmentDate} onChange={(e) => update('enrollmentDate', e.target.value)} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
            </div>

            {/* Guardian Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primary Guardian</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} /></div>
                <div>
                  <Label>Relationship</Label>
                  <Select value={form.guardianRelationship} onValueChange={(v) => update('guardianRelationship', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={form.guardianPhone} onChange={(e) => update('guardianPhone', e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" value={form.guardianEmail} onChange={(e) => update('guardianEmail', e.target.value)} /></div>
              </div>
            </div>

            {/* Secondary Guardian */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Secondary Guardian (Optional)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.secondaryGuardianName} onChange={(e) => update('secondaryGuardianName', e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={form.secondaryGuardianPhone} onChange={(e) => update('secondaryGuardianPhone', e.target.value)} /></div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Additional</h3>
              <div><Label>Medical Notes</Label><Textarea value={form.medicalNotes} onChange={(e) => update('medicalNotes', e.target.value)} placeholder="Allergies, conditions..." rows={2} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any other notes..." rows={2} /></div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/hooks/useStudents';
import { AcademicTerm } from '@/hooks/useSchoolClasses';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  terms: AcademicTerm[];
  currentTermId: string | null;
  preSelectedStudentId?: string;
  onSubmit: (data: any) => Promise<any>;
}

export function RecordPaymentDialog({ open, onOpenChange, students, terms, currentTermId, preSelectedStudentId, onSubmit }: RecordPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentId: preSelectedStudentId || '',
    termId: currentTermId || '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    referenceNumber: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.termId || !form.amount) return;
    setIsSubmitting(true);
    const result = await onSubmit({
      studentId: form.studentId,
      termId: form.termId,
      amount: parseFloat(form.amount),
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod || undefined,
      referenceNumber: form.referenceNumber || undefined,
      notes: form.notes || undefined,
    });
    setIsSubmitting(false);
    if (result) {
      setForm({
        studentId: '', termId: currentTermId || '', amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '', referenceNumber: '', notes: '',
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Student *</Label>
            <Select value={form.studentId} onValueChange={(v) => setForm(p => ({ ...p, studentId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.filter(s => s.status === 'active').map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Term *</Label>
            <Select value={form.termId} onValueChange={(v) => setForm(p => ({ ...p, termId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
              <SelectContent>
                {terms.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Amount (M) *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
          <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={(e) => setForm(p => ({ ...p, paymentDate: e.target.value }))} /></div>
          <div>
            <Label>Payment Method</Label>
            <Select value={form.paymentMethod} onValueChange={(v) => setForm(p => ({ ...p, paymentMethod: v }))}>
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Reference Number</Label><Input value={form.referenceNumber} onChange={(e) => setForm(p => ({ ...p, referenceNumber: e.target.value }))} placeholder="Receipt/ref number" /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? 'Recording...' : 'Record Payment'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { type LegalTimeEntry } from '@/hooks/useLegalTimeEntries';
import { type LegalCase } from '@/hooks/useLegalCases';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const activityTypes = ['consultation', 'research', 'drafting', 'court_appearance', 'negotiation', 'review', 'meeting', 'travel', 'other'];

interface Props {
  entry: LegalTimeEntry | null;
  cases: LegalCase[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function TimeEntryEditDialog({ entry, cases, open, onOpenChange, onUpdate }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    caseId: '', date: '', hours: '', hourlyRate: '', description: '', activityType: 'consultation', isBillable: true,
  });

  useEffect(() => {
    if (entry) {
      setForm({
        caseId: entry.caseId, date: entry.date, hours: String(entry.hours),
        hourlyRate: String(entry.hourlyRate), description: entry.description,
        activityType: entry.activityType || 'consultation', isBillable: entry.isBillable,
      });
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = async () => {
    const { error } = await supabase.from('legal_time_entries').update({
      case_id: form.caseId, date: form.date, hours: parseFloat(form.hours),
      hourly_rate: parseFloat(form.hourlyRate), description: form.description,
      activity_type: form.activityType, is_billable: form.isBillable,
    }).eq('id', entry.id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success('Time entry updated');
    onOpenChange(false);
    onUpdate();
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('legal_time_entries').delete().eq('id', entry.id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Time entry deleted');
    onOpenChange(false);
    onUpdate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Time Entry</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Case</Label>
              <Select value={form.caseId} onValueChange={v => setForm(f => ({ ...f, caseId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.caseNumber} - {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><Label>Activity</Label>
                <Select value={form.activityType} onValueChange={v => setForm(f => ({ ...f, activityType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{activityTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hours</Label><Input type="number" step="0.25" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} /></div>
              <div><Label>Rate</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isBillable} onCheckedChange={v => setForm(f => ({ ...f, isBillable: !!v }))} id="edit-billable" />
              <Label htmlFor="edit-billable" className="text-sm">Billable</Label>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Time Entry"
        description="Are you sure you want to delete this time entry?" confirmLabel="Delete"
        variant="destructive" onConfirm={handleDelete} />
    </>
  );
}

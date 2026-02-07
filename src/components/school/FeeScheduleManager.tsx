import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { FeeSchedule } from '@/hooks/useSchoolFees';
import { AcademicTerm, SchoolClass } from '@/hooks/useSchoolClasses';
import { formatMaluti } from '@/lib/currency';

interface FeeScheduleManagerProps {
  feeSchedules: FeeSchedule[];
  terms: AcademicTerm[];
  classes: SchoolClass[];
  currentTermId: string | null;
  onCreate: (data: any) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
}

export function FeeScheduleManager({ feeSchedules, terms, classes, currentTermId, onCreate, onDelete }: FeeScheduleManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState(currentTermId || '');
  const [form, setForm] = useState({ termId: currentTermId || '', classId: '', feeType: '', amount: '', isOptional: false });

  const filteredSchedules = feeSchedules.filter((f) => f.termId === (selectedTermId || currentTermId));
  const totalRequired = filteredSchedules.filter(f => !f.isOptional).reduce((sum, f) => sum + f.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.feeType.trim() || !form.amount || !form.termId) return;
    await onCreate({
      termId: form.termId,
      classId: form.classId || undefined,
      feeType: form.feeType,
      amount: parseFloat(form.amount),
      isOptional: form.isOptional,
    });
    setForm({ termId: form.termId, classId: '', feeType: '', amount: '', isOptional: false });
    setDialogOpen(false);
  };

  const termName = (id: string) => terms.find((t) => t.id === id)?.name || '';
  const className = (id: string | null) => id ? classes.find((c) => c.id === id)?.name || 'Unknown' : 'All Classes';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Fee Schedules</h2>
        <Button size="sm" onClick={() => { setForm(p => ({ ...p, termId: selectedTermId || currentTermId || '' })); setDialogOpen(true); }} disabled={terms.length === 0}>
          <Plus className="h-4 w-4 mr-1" />Add Fee
        </Button>
      </div>

      {terms.length > 0 && (
        <Select value={selectedTermId || currentTermId || ''} onValueChange={setSelectedTermId}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select term" /></SelectTrigger>
          <SelectContent>
            {terms.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}{t.isCurrent ? ' (Current)' : ''}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {filteredSchedules.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <Wallet className="h-8 w-8 mx-auto mb-2" />
          <p>{terms.length === 0 ? 'Create an academic term first' : 'No fee types defined for this term'}</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {filteredSchedules.map((fee, i) => (
              <div key={fee.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fee.feeType}</span>
                    {fee.isOptional && <Badge variant="outline" className="text-xs">Optional</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{className(fee.classId)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMaluti(fee.amount)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(fee.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Total required per student: <span className="font-semibold text-foreground">{formatMaluti(totalRequired)}</span>
          </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Fee Type</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Term *</Label>
              <Select value={form.termId} onValueChange={(v) => setForm(p => ({ ...p, termId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  {terms.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Applies To</Label>
              <Select value={form.classId} onValueChange={(v) => setForm(p => ({ ...p, classId: v }))}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.filter(c => c.isActive).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Fee Type *</Label><Input value={form.feeType} onChange={(e) => setForm(p => ({ ...p, feeType: e.target.value }))} placeholder="e.g. Tuition, Transport" required /></div>
            <div><Label>Amount (M) *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
            <div className="flex items-center justify-between">
              <Label>Optional Fee</Label>
              <Switch checked={form.isOptional} onCheckedChange={(v) => setForm(p => ({ ...p, isOptional: v }))} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Fee</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

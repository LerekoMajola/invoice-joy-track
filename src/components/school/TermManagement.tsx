import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { AcademicTerm } from '@/hooks/useSchoolClasses';

interface TermManagementProps {
  terms: AcademicTerm[];
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function TermManagement({ terms, onCreate, onUpdate, onDelete }: TermManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });

  const openAdd = () => {
    setEditingTerm(null);
    setForm({ name: '', startDate: '', endDate: '', isCurrent: false });
    setDialogOpen(true);
  };

  const openEdit = (term: AcademicTerm) => {
    setEditingTerm(term);
    setForm({
      name: term.name,
      startDate: term.startDate,
      endDate: term.endDate,
      isCurrent: term.isCurrent,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) return;

    if (editingTerm) {
      await onUpdate(editingTerm.id, form);
    } else {
      await onCreate(form);
    }
    setDialogOpen(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Academic Terms</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Term</Button>
      </div>

      {terms.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <p>No terms yet. Create your first academic term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {terms.map((term) => (
            <div key={term.id} className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{term.name}</h3>
                  {term.isCurrent && <Badge className="bg-success/10 text-success border-success/20 text-xs">Current</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(term.startDate)} — {formatDate(term.endDate)}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(term)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(term.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingTerm ? 'Edit Term' : 'Add Term'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Term Name *</Label><Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Term 1 2026" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))} required /></div>
              <div><Label>End Date *</Label><Input type="date" value={form.endDate} onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))} required /></div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Current Term</Label>
              <Switch checked={form.isCurrent} onCheckedChange={(v) => setForm(p => ({ ...p, isCurrent: v }))} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">{editingTerm ? 'Save' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

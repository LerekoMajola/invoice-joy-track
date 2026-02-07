import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { SchoolClass } from '@/hooks/useSchoolClasses';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: string;
  name: string;
}

interface ClassManagementProps {
  classes: SchoolClass[];
  staff: StaffMember[];
  studentCounts: Record<string, number>;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function ClassManagement({ classes, staff, studentCounts, onCreate, onUpdate, onDelete }: ClassManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState({ name: '', gradeLevel: '', classTeacherId: '', capacity: '' });

  const openAdd = () => {
    setEditingClass(null);
    setForm({ name: '', gradeLevel: '', classTeacherId: '', capacity: '' });
    setDialogOpen(true);
  };

  const openEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setForm({
      name: cls.name,
      gradeLevel: cls.gradeLevel || '',
      classTeacherId: cls.classTeacherId || '',
      capacity: cls.capacity?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = {
      name: form.name,
      gradeLevel: form.gradeLevel || undefined,
      classTeacherId: form.classTeacherId || undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
    };

    if (editingClass) {
      await onUpdate(editingClass.id, data);
    } else {
      await onCreate(data);
    }
    setDialogOpen(false);
  };

  const teacherName = (id: string | null) => {
    if (!id) return null;
    return staff.find((s) => s.id === id)?.name || null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Classes</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Class</Button>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2" />
          <p>No classes yet. Add your first class to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((cls) => (
            <div key={cls.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{cls.name}</h3>
                  {cls.gradeLevel && <p className="text-xs text-muted-foreground">Grade: {cls.gradeLevel}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cls)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(cls.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{studentCounts[cls.id] || 0}{cls.capacity ? `/${cls.capacity}` : ''}</span>
                {teacherName(cls.classTeacherId) && <span>Teacher: {teacherName(cls.classTeacherId)}</span>}
              </div>
              {!cls.isActive && <Badge variant="outline" className="mt-2 text-xs">Inactive</Badge>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add Class'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Class Name *</Label><Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Grade 1A" /></div>
            <div><Label>Grade Level</Label><Input value={form.gradeLevel} onChange={(e) => setForm(p => ({ ...p, gradeLevel: e.target.value }))} placeholder="e.g. Grade 1" /></div>
            <div>
              <Label>Class Teacher</Label>
              <Select value={form.classTeacherId} onValueChange={(v) => setForm(p => ({ ...p, classTeacherId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm(p => ({ ...p, capacity: e.target.value }))} placeholder="Max students" /></div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">{editingClass ? 'Save' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

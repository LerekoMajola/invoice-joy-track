import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Subject } from '@/hooks/useTimetable';

interface SubjectManagementProps {
  subjects: Subject[];
  getSubjectEntryCount: (id: string) => number;
  onCreateSubject: (data: { name: string; shortCode?: string; color?: string }) => Promise<any>;
  onUpdateSubject: (id: string, updates: Partial<{ name: string; shortCode: string; color: string; isActive: boolean }>) => Promise<boolean>;
  onDeleteSubject: (id: string) => Promise<boolean>;
}

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export function SubjectManagement({
  subjects,
  getSubjectEntryCount,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
}: SubjectManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShortCode('');
    setColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
    setDialogOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setName(subject.name);
    setShortCode(subject.shortCode || '');
    setColor(subject.color);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      if (editing) {
        await onUpdateSubject(editing.id, { name: name.trim(), shortCode: shortCode.trim(), color });
      } else {
        await onCreateSubject({ name: name.trim(), shortCode: shortCode.trim() || undefined, color });
      }
      setDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Subjects</h3>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No subjects yet. Add your first subject to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {subjects.map((subject) => {
            const count = getSubjectEntryCount(subject.id);
            return (
              <Card key={subject.id} className="group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{subject.name}</p>
                      {subject.shortCode && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {subject.shortCode}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {count} slot{count !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(subject)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDeleteSubject(subject.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-2">
              <Label>Short Code</Label>
              <Input value={shortCode} onChange={(e) => setShortCode(e.target.value.toUpperCase())} placeholder="e.g. MATH" maxLength={8} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? 'hsl(var(--foreground))' : 'transparent',
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
              {isSaving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

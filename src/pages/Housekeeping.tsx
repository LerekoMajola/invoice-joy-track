import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { useHousekeeping } from '@/hooks/useHousekeeping';
import { useRooms } from '@/hooks/useRooms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  in_progress: 'bg-blue-500/10 text-blue-600',
  completed: 'bg-green-500/10 text-green-600',
};

export default function Housekeeping() {
  const { tasks, isLoading, createTask, updateTask } = useHousekeeping();
  const { rooms } = useRooms();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ room_id: '', task_type: 'cleaning', priority: 'normal', assigned_to: '', notes: '' });

  const handleSubmit = () => {
    if (!form.room_id) return;
    createTask.mutate({
      room_id: form.room_id,
      task_type: form.task_type,
      priority: form.priority,
      assigned_to: form.assigned_to || null,
      notes: form.notes || null,
      status: 'pending',
      completed_at: null,
    });
    setAddOpen(false);
    setForm({ room_id: '', task_type: 'cleaning', priority: 'normal', assigned_to: '', notes: '' });
  };

  const markComplete = (id: string) => {
    updateTask.mutate({ id, status: 'completed', completed_at: new Date().toISOString() });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Housekeeping</h1>
            <p className="text-muted-foreground text-sm">{tasks.filter(t => t.status !== 'completed').length} pending</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : tasks.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No housekeeping tasks.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{task.rooms ? `Room ${task.rooms.room_number}` : 'Room'}</p>
                      <Badge className={statusColors[task.status] || ''} variant="secondary">{task.status.replace('_', ' ')}</Badge>
                      <Badge variant="outline" className="capitalize text-xs">{task.task_type}</Badge>
                    </div>
                    {task.assigned_to && <p className="text-xs text-muted-foreground">Assigned: {task.assigned_to}</p>}
                    {task.notes && <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>}
                  </div>
                  {task.status !== 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => markComplete(task.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Done
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Housekeeping Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Room *</Label>
              <Select value={form.room_id} onValueChange={v => setForm(p => ({ ...p, room_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {rooms.map(r => (<SelectItem key={r.id} value={r.id}>Room {r.room_number} — {r.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.task_type} onValueChange={v => setForm(p => ({ ...p, task_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Input value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} placeholder="Staff name" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.room_id || createTask.isPending}>
              {createTask.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

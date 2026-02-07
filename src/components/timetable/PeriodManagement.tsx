import { useState } from 'react';
import { Plus, Pencil, Trash2, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Period } from '@/hooks/useTimetable';

interface PeriodManagementProps {
  periods: Period[];
  onCreatePeriod: (data: { name: string; startTime: string; endTime: string; isBreak?: boolean; sortOrder?: number }) => Promise<any>;
  onUpdatePeriod: (id: string, updates: Partial<{ name: string; startTime: string; endTime: string; isBreak: boolean; sortOrder: number }>) => Promise<boolean>;
  onDeletePeriod: (id: string) => Promise<boolean>;
}

export function PeriodManagement({
  periods,
  onCreatePeriod,
  onUpdatePeriod,
  onDeletePeriod,
}: PeriodManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Period | null>(null);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [isBreak, setIsBreak] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    const nextOrder = periods.length;
    setName(`Period ${nextOrder + 1}`);
    // Suggest next time slot based on last period
    if (periods.length > 0) {
      const lastPeriod = periods[periods.length - 1];
      setStartTime(lastPeriod.endTime.slice(0, 5));
      // Add 45 minutes
      const [h, m] = lastPeriod.endTime.split(':').map(Number);
      const endMinutes = h * 60 + m + 45;
      const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
      const endM = (endMinutes % 60).toString().padStart(2, '0');
      setEndTime(`${endH}:${endM}`);
    } else {
      setStartTime('08:00');
      setEndTime('08:45');
    }
    setIsBreak(false);
    setDialogOpen(true);
  };

  const openEdit = (period: Period) => {
    setEditing(period);
    setName(period.name);
    setStartTime(period.startTime.slice(0, 5));
    setEndTime(period.endTime.slice(0, 5));
    setIsBreak(period.isBreak);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !startTime || !endTime) return;
    setIsSaving(true);
    try {
      if (editing) {
        await onUpdatePeriod(editing.id, { name: name.trim(), startTime, endTime, isBreak });
      } else {
        await onCreatePeriod({ name: name.trim(), startTime, endTime, isBreak, sortOrder: periods.length });
      }
      setDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Periods</h3>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Period
        </Button>
      </div>

      {periods.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No periods defined. Add time slots to build your timetable.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {periods.map((period, index) => (
            <Card key={period.id} className={`group ${period.isBreak ? 'border-dashed bg-muted/30' : ''}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {period.isBreak ? <Coffee className="h-4 w-4 text-muted-foreground" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{period.name}</p>
                    {period.isBreak && (
                      <Badge variant="outline" className="text-xs">Break</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(period.startTime)} — {formatTime(period.endTime)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(period)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDeletePeriod(period.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Period' : 'Add Period'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Period 1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isBreak} onCheckedChange={setIsBreak} id="is-break" />
              <Label htmlFor="is-break" className="cursor-pointer">This is a break / lunch period</Label>
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

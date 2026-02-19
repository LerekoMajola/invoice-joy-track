import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const INCIDENT_TYPES = ['damage', 'breakdown', 'theft', 'loss'];
const SEVERITIES = ['minor', 'moderate', 'major'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentItemId: string;
  onSubmit: (data: {
    equipment_item_id: string;
    incident_type: string;
    date: string;
    severity: string;
    description?: string;
    cost: number;
  }) => void;
  isCreating: boolean;
}

export function AddEquipmentIncidentDialog({ open, onOpenChange, equipmentItemId, onSubmit, isCreating }: Props) {
  const [form, setForm] = useState({
    incident_type: 'damage',
    date: new Date().toISOString().split('T')[0],
    severity: 'minor',
    description: '',
    cost: 0,
  });

  const handleSubmit = () => {
    onSubmit({
      equipment_item_id: equipmentItemId,
      incident_type: form.incident_type,
      date: form.date,
      severity: form.severity,
      description: form.description || undefined,
      cost: form.cost,
    });
    onOpenChange(false);
    setForm({ incident_type: 'damage', date: new Date().toISOString().split('T')[0], severity: 'minor', description: '', cost: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Log Incident</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.incident_type} onValueChange={v => setForm(f => ({ ...f, incident_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cost</Label>
              <Input type="number" value={form.cost || ''} onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What happened..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Log Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

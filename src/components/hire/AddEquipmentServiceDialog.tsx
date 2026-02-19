import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const SERVICE_TYPES = ['repair', 'calibration', 'inspection', 'cleaning', 'replacement'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentItemId: string;
  onSubmit: (data: {
    equipment_item_id: string;
    service_date: string;
    service_type: string;
    provider?: string;
    cost: number;
    parts_replaced?: string;
    notes?: string;
  }) => void;
  isCreating: boolean;
}

export function AddEquipmentServiceDialog({ open, onOpenChange, equipmentItemId, onSubmit, isCreating }: Props) {
  const [form, setForm] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_type: 'repair',
    provider: '',
    cost: 0,
    parts_replaced: '',
    notes: '',
  });

  const handleSubmit = () => {
    onSubmit({
      equipment_item_id: equipmentItemId,
      service_date: form.service_date,
      service_type: form.service_type,
      provider: form.provider || undefined,
      cost: form.cost,
      parts_replaced: form.parts_replaced || undefined,
      notes: form.notes || undefined,
    });
    onOpenChange(false);
    setForm({ service_date: new Date().toISOString().split('T')[0], service_type: 'repair', provider: '', cost: 0, parts_replaced: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Service Log</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.service_date} onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="Service provider" />
            </div>
            <div className="space-y-2">
              <Label>Cost</Label>
              <Input type="number" value={form.cost || ''} onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Parts Replaced</Label>
            <Input value={form.parts_replaced} onChange={e => setForm(f => ({ ...f, parts_replaced: e.target.value }))} placeholder="e.g. Belt, bearings" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (room: any) => void;
  loading?: boolean;
}

export function AddRoomDialog({ open, onOpenChange, onSubmit, loading }: AddRoomDialogProps) {
  const [form, setForm] = useState({
    room_number: '',
    name: '',
    room_type: 'standard',
    capacity: '2',
    daily_rate: '',
    amenities: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!form.room_number || !form.name) return;
    onSubmit({
      room_number: form.room_number,
      name: form.name,
      room_type: form.room_type,
      capacity: parseInt(form.capacity) || 2,
      daily_rate: parseFloat(form.daily_rate) || 0,
      amenities: form.amenities || null,
      description: form.description || null,
      status: 'available',
    });
    setForm({ room_number: '', name: '', room_type: 'standard', capacity: '2', daily_rate: '', amenities: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Number *</Label>
              <Input placeholder="101" value={form.room_number} onChange={e => setForm(p => ({ ...p, room_number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={form.room_type} onValueChange={v => setForm(p => ({ ...p, room_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input placeholder="Mountain View Suite" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Daily Rate (M)</Label>
              <Input type="number" placeholder="0" value={form.daily_rate} onChange={e => setForm(p => ({ ...p, daily_rate: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Amenities</Label>
            <Input placeholder="WiFi, TV, AC, Mini bar" value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Room description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.room_number || !form.name}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

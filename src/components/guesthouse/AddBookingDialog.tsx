import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Room } from '@/hooks/useRooms';

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (booking: any) => void;
  rooms: Room[];
  loading?: boolean;
}

export function AddBookingDialog({ open, onOpenChange, onSubmit, rooms, loading }: AddBookingDialogProps) {
  const [form, setForm] = useState({
    room_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_id_number: '',
    num_guests: '1',
    check_in: '',
    check_out: '',
    total: '',
    deposit_paid: '0',
    meal_plan: 'none',
    special_requests: '',
    notes: '',
  });

  const availableRooms = rooms.filter(r => r.status === 'available');

  const handleSubmit = () => {
    if (!form.room_id || !form.guest_name || !form.check_in || !form.check_out) return;
    const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}`;
    onSubmit({
      room_id: form.room_id,
      booking_number: bookingNumber,
      guest_name: form.guest_name,
      guest_email: form.guest_email || null,
      guest_phone: form.guest_phone || null,
      guest_id_number: form.guest_id_number || null,
      num_guests: parseInt(form.num_guests) || 1,
      check_in: form.check_in,
      check_out: form.check_out,
      total: parseFloat(form.total) || 0,
      deposit_paid: parseFloat(form.deposit_paid) || 0,
      meal_plan: form.meal_plan,
      special_requests: form.special_requests || null,
      notes: form.notes || null,
      status: 'confirmed',
    });
    setForm({ room_id: '', guest_name: '', guest_email: '', guest_phone: '', guest_id_number: '', num_guests: '1', check_in: '', check_out: '', total: '', deposit_paid: '0', meal_plan: 'none', special_requests: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Room *</Label>
            <Select value={form.room_id} onValueChange={v => setForm(p => ({ ...p, room_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger>
              <SelectContent>
                {availableRooms.map(r => (
                  <SelectItem key={r.id} value={r.id}>Room {r.room_number} — {r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Guest Name *</Label>
            <Input placeholder="Full name" value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.guest_email} onChange={e => setForm(p => ({ ...p, guest_email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.guest_phone} onChange={e => setForm(p => ({ ...p, guest_phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID/Passport</Label>
              <Input value={form.guest_id_number} onChange={e => setForm(p => ({ ...p, guest_id_number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Guests</Label>
              <Input type="number" value={form.num_guests} onChange={e => setForm(p => ({ ...p, num_guests: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <Input type="date" value={form.check_in} onChange={e => setForm(p => ({ ...p, check_in: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Check-out *</Label>
              <Input type="date" value={form.check_out} onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total (M)</Label>
              <Input type="number" value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Deposit (M)</Label>
              <Input type="number" value={form.deposit_paid} onChange={e => setForm(p => ({ ...p, deposit_paid: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Meal Plan</Label>
              <Select value={form.meal_plan} onValueChange={v => setForm(p => ({ ...p, meal_plan: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="half_board">Half Board</SelectItem>
                  <SelectItem value="full_board">Full Board</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Special Requests</Label>
            <Textarea value={form.special_requests} onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.room_id || !form.guest_name || !form.check_in || !form.check_out}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

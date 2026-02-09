import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, LogIn, LogOut } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { formatMaluti } from '@/lib/currency';
import { format } from 'date-fns';
import { AddBookingDialog } from '@/components/guesthouse/AddBookingDialog';

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500/10 text-blue-600',
  checked_in: 'bg-green-500/10 text-green-600',
  checked_out: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  no_show: 'bg-amber-500/10 text-amber-600',
};

export default function Bookings() {
  const { bookings, isLoading, createBooking, checkIn, checkOut } = useBookings();
  const { rooms } = useRooms();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground text-sm">{bookings.length} bookings</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />New Booking</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : bookings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{booking.guest_name}</p>
                      <Badge className={statusColors[booking.status] || ''} variant="secondary">{booking.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.rooms ? `Room ${booking.rooms.room_number}` : booking.booking_number} · {format(new Date(booking.check_in), 'dd MMM')} → {format(new Date(booking.check_out), 'dd MMM yyyy')}
                    </p>
                    <p className="text-sm font-medium mt-1">{formatMaluti(booking.total)}{booking.meal_plan !== 'none' && ` · ${booking.meal_plan.replace('_', ' ')}`}</p>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'confirmed' && (
                      <Button size="sm" variant="outline" onClick={() => checkIn.mutate(booking.id)}>
                        <LogIn className="h-4 w-4 mr-1" />Check In
                      </Button>
                    )}
                    {booking.status === 'checked_in' && (
                      <Button size="sm" variant="outline" onClick={() => checkOut.mutate(booking.id)}>
                        <LogOut className="h-4 w-4 mr-1" />Check Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddBookingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(booking) => { createBooking.mutate(booking); setAddOpen(false); }}
        rooms={rooms}
        loading={createBooking.isPending}
      />
    </DashboardLayout>
  );
}

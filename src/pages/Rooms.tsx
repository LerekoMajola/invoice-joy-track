import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BedDouble, Users, Loader2 } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { formatMaluti } from '@/lib/currency';
import { AddRoomDialog } from '@/components/guesthouse/AddRoomDialog';

const statusColors: Record<string, string> = {
  available: 'bg-green-500/10 text-green-600',
  occupied: 'bg-rose-500/10 text-rose-600',
  maintenance: 'bg-amber-500/10 text-amber-600',
  blocked: 'bg-muted text-muted-foreground',
};

export default function Rooms() {
  const { rooms, isLoading, createRoom } = useRooms();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Rooms</h1>
            <p className="text-muted-foreground text-sm">{rooms.length} rooms</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Room</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : rooms.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No rooms yet. Add your first room to get started.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <Card key={room.id} className="hover:shadow-elevated transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">Room {room.room_number}</p>
                      <p className="text-sm text-muted-foreground">{room.name}</p>
                    </div>
                    <Badge className={statusColors[room.status] || ''} variant="secondary">{room.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{room.room_type}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{room.capacity} guests</span>
                  </div>
                  <p className="font-semibold text-primary">{formatMaluti(room.daily_rate)}<span className="text-xs text-muted-foreground font-normal">/night</span></p>
                  {room.amenities && <p className="text-xs text-muted-foreground mt-2">{room.amenities}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddRoomDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(room) => { createRoom.mutate(room); setAddOpen(false); }}
        loading={createRoom.isPending}
      />
    </DashboardLayout>
  );
}

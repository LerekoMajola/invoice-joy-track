import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hotel, BedDouble, CalendarCheck, Star, Sparkles } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { useBookings } from '@/hooks/useBookings';
import { useHousekeeping } from '@/hooks/useHousekeeping';
import { useGuestReviews } from '@/hooks/useGuestReviews';
import { formatMaluti } from '@/lib/currency';
import { format } from 'date-fns';

export default function GuestHouseDashboard() {
  const { rooms } = useRooms();
  const { bookings } = useBookings();
  const { tasks } = useHousekeeping();
  const { averageRating } = useGuestReviews();

  const today = format(new Date(), 'yyyy-MM-dd');
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const todayCheckIns = bookings.filter(b => b.check_in === today && b.status === 'confirmed').length;
  const todayCheckOuts = bookings.filter(b => b.check_out === today && b.status === 'checked_in').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const monthRevenue = bookings
    .filter(b => b.check_in?.startsWith(format(new Date(), 'yyyy-MM')))
    .reduce((sum, b) => sum + Number(b.total), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Hotel className="h-6 w-6 text-rose-500" />
            Guest House Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10"><BedDouble className="h-5 w-5 text-rose-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{occupancyRate}%</p>
                  <p className="text-xs text-muted-foreground">Occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10"><CalendarCheck className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{todayCheckIns}</p>
                  <p className="text-xs text-muted-foreground">Check-ins today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10"><Star className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{formatMaluti(monthRevenue)}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Today's Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-ins expected</span>
                  <Badge variant="secondary">{todayCheckIns}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-outs expected</span>
                  <Badge variant="secondary">{todayCheckOuts}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Housekeeping pending</span>
                  <Badge variant={pendingTasks > 0 ? 'destructive' : 'secondary'}>{pendingTasks}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Room Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <Badge className="bg-green-500/10 text-green-600">{rooms.filter(r => r.status === 'available').length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupied</span>
                  <Badge className="bg-rose-500/10 text-rose-600">{occupiedRooms}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Maintenance</span>
                  <Badge className="bg-amber-500/10 text-amber-600">{rooms.filter(r => r.status === 'maintenance').length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

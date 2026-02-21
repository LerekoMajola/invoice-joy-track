import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Users, CheckCircle2, XCircle, ChevronDown, ChevronUp, CalendarX } from 'lucide-react';
import { toast } from 'sonner';
import type { GymPortalMember } from '@/hooks/usePortalSession';

interface ClassSchedule {
  id: string;
  class_name: string;
  instructor_name: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  capacity: number | null;
  description: string | null;
  location: string | null;
}

interface Booking {
  id: string;
  schedule_id: string;
  status: string;
  booked_at: string;
  // joined
  class_name?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  instructor_name?: string | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface GymPortalScheduleProps {
  ownerId: string;
  member?: GymPortalMember | null;
}

export function GymPortalSchedule({ ownerId, member }: GymPortalScheduleProps) {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selected, setSelected] = useState<ClassSchedule | null>(null);

  // Booking state
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showMyBookings, setShowMyBookings] = useState(true);

  const memberId = member?.id ?? null;

  // Load schedule
  useEffect(() => {
    supabase
      .from('gym_class_schedules')
      .select('*, gym_classes(name, description, duration_minutes, capacity, instructor_name)')
      .eq('user_id', ownerId)
      .eq('is_active', true)
      .order('start_time')
      .then(({ data }) => {
        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          class_name: s.gym_classes?.name || 'Class',
          instructor_name: s.instructor_override || s.gym_classes?.instructor_name || null,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          duration_minutes: s.gym_classes?.duration_minutes || null,
          capacity: s.max_capacity_override || s.gym_classes?.capacity || null,
          description: s.gym_classes?.description || null,
          location: null,
        }));
        setClasses(mapped);
        setLoading(false);
      });
  }, [ownerId]);

  // Load booking counts per schedule (active bookings)
  const fetchBookingCounts = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('gym_class_bookings')
      .select('schedule_id')
      .eq('user_id', ownerId)
      .eq('status', 'booked');

    if (data) {
      const counts: Record<string, number> = {};
      for (const row of data) {
        counts[row.schedule_id] = (counts[row.schedule_id] ?? 0) + 1;
      }
      setBookingCounts(counts);
    }
  }, [ownerId]);

  // Load member's own bookings
  const fetchMyBookings = useCallback(async () => {
    if (!memberId) return;
    setBookingLoading(true);

    const { data } = await (supabase as any)
      .from('gym_class_bookings')
      .select('id, schedule_id, status, booked_at, gym_class_schedules(day_of_week, start_time, end_time, gym_classes(name, instructor_name))')
      .eq('member_id', memberId)
      .eq('status', 'booked')
      .order('booked_at', { ascending: false });

    if (data) {
      setMyBookings(data.map((b: any) => ({
        id: b.id,
        schedule_id: b.schedule_id,
        status: b.status,
        booked_at: b.booked_at,
        class_name: b.gym_class_schedules?.gym_classes?.name ?? 'Class',
        day_of_week: b.gym_class_schedules?.day_of_week,
        start_time: b.gym_class_schedules?.start_time,
        end_time: b.gym_class_schedules?.end_time,
        instructor_name: b.gym_class_schedules?.gym_classes?.instructor_name ?? null,
      })));
    }
    setBookingLoading(false);
  }, [memberId]);

  useEffect(() => {
    fetchBookingCounts();
    if (memberId) fetchMyBookings();
  }, [fetchBookingCounts, fetchMyBookings, memberId]);

  const myBookedScheduleIds = new Set(myBookings.map(b => b.schedule_id));

  const handleBook = async (cls: ClassSchedule) => {
    if (!memberId || !member) return;
    setActionLoading(cls.id);
    const { error } = await (supabase as any).from('gym_class_bookings').insert({
      schedule_id: cls.id,
      member_id: memberId,
      user_id: member.user_id,
      status: 'booked',
    });
    if (error) {
      toast.error('Could not book class. Please try again.');
    } else {
      toast.success(`Booked into ${cls.class_name}!`);
      await Promise.all([fetchMyBookings(), fetchBookingCounts()]);
      setSelected(null);
    }
    setActionLoading(null);
  };

  const handleCancel = async (bookingId: string, className?: string) => {
    setActionLoading(bookingId);
    const { error } = await (supabase as any)
      .from('gym_class_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    if (error) {
      toast.error('Could not cancel booking. Please try again.');
    } else {
      toast.success(`Booking for ${className ?? 'class'} cancelled.`);
      await Promise.all([fetchMyBookings(), fetchBookingCounts()]);
      setSelected(null);
    }
    setActionLoading(null);
  };

  const dayClasses = classes.filter(c => c.day_of_week === selectedDay);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedBooking = selected ? myBookings.find(b => b.schedule_id === selected.id) : null;
  const selectedBooked = selected ? myBookedScheduleIds.has(selected.id) : false;
  const selectedCount = selected ? (bookingCounts[selected.id] ?? 0) : 0;
  const selectedFull = selected?.capacity ? selectedCount >= selected.capacity : false;

  return (
    <div className="space-y-4 pb-6">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-foreground">Class Schedule</h2>
      </div>

      {/* Day Selector */}
      <div className="flex gap-1.5 px-4 overflow-x-auto pb-1 scrollbar-hide">
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors min-w-[44px]
              ${selectedDay === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Classes for Selected Day */}
      <div className="px-4 space-y-3">
        <p className="text-sm text-muted-foreground font-medium">{FULL_DAYS[selectedDay]}</p>
        {dayClasses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="text-sm">No classes scheduled for {FULL_DAYS[selectedDay]}.</p>
            </CardContent>
          </Card>
        ) : (
          dayClasses.map(cls => {
            const booked = myBookedScheduleIds.has(cls.id);
            const count = bookingCounts[cls.id] ?? 0;
            const full = cls.capacity ? count >= cls.capacity : false;

            return (
              <Card
                key={cls.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelected(cls)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{cls.class_name}</p>
                    {booked && (
                          <Badge variant="outline" className="text-xs text-primary border-primary/40 bg-primary/10">
                            Booked ✓
                          </Badge>
                        )}
                      </div>
                      {cls.instructor_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">with {cls.instructor_name}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {cls.start_time.slice(0, 5)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {cls.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{cls.duration_minutes} min
                      </span>
                    )}
                    {cls.capacity && (
                      <span className={`flex items-center gap-1 ${full ? 'text-destructive' : ''}`}>
                        <Users className="h-3 w-3" />
                        {count} / {cls.capacity} spots
                        {full && <span className="font-medium">· Full</span>}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* My Bookings Section */}
      {memberId && (
        <div className="px-4 space-y-3">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setShowMyBookings(p => !p)}
          >
            <p className="text-sm font-semibold text-foreground">My Bookings</p>
            {showMyBookings ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showMyBookings && (
            bookingLoading ? (
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : myBookings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CalendarX className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No upcoming bookings.</p>
                  <p className="text-xs mt-1">Tap a class above to book your spot.</p>
                </CardContent>
              </Card>
            ) : (
              myBookings.map(booking => (
                <Card key={booking.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground text-sm">{booking.class_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.day_of_week !== undefined ? FULL_DAYS[booking.day_of_week] : ''}
                          {booking.start_time ? ` · ${booking.start_time.slice(0, 5)}` : ''}
                        </p>
                        {booking.instructor_name && (
                          <p className="text-xs text-muted-foreground">with {booking.instructor_name}</p>
                        )}
                      </div>
                      <button
                        className="text-xs text-destructive flex items-center gap-1 shrink-0 mt-0.5"
                        onClick={() => handleCancel(booking.id, booking.class_name)}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Cancel
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      )}

      {/* Class Detail Bottom Sheet */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card rounded-t-2xl w-full max-w-md mx-auto p-5 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-2" />
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-foreground">{selected.class_name}</h3>
              <Badge variant="secondary">{selected.start_time.slice(0, 5)} — {selected.end_time.slice(0, 5)}</Badge>
            </div>
            {selected.instructor_name && <p className="text-sm text-muted-foreground">Instructor: {selected.instructor_name}</p>}
            {selected.location && <p className="text-sm text-muted-foreground">Location: {selected.location}</p>}
            {selected.duration_minutes && <p className="text-sm text-muted-foreground">Duration: {selected.duration_minutes} minutes</p>}
            {selected.capacity && (
              <p className={`text-sm ${selectedFull ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                Spots: {selectedCount} / {selected.capacity} filled
                {selectedFull && ' — Class Full'}
              </p>
            )}
            {selected.description && <p className="text-sm text-foreground">{selected.description}</p>}

            {/* Booking action */}
            {memberId && (
              <div className="pt-2">
                {selectedBooked ? (
                  <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">You're booked into this class!</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => selectedBooking && handleCancel(selectedBooking.id, selected.class_name)}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === selectedBooking?.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Cancel Booking
                    </Button>
                  </div>
                ) : selectedFull ? (
                  <Button className="w-full" disabled>
                    Class Full
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleBook(selected)}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Book Class
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

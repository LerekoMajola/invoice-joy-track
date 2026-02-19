import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Users } from 'lucide-react';

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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface GymPortalScheduleProps {
  ownerId: string;
}

export function GymPortalSchedule({ ownerId }: GymPortalScheduleProps) {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selected, setSelected] = useState<ClassSchedule | null>(null);

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

  const dayClasses = classes.filter(c => c.day_of_week === selectedDay);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          dayClasses.map(cls => (
            <Card
              key={cls.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelected(cls)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{cls.class_name}</p>
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
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />{cls.capacity} spots
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
            {selected.capacity && <p className="text-sm text-muted-foreground">Capacity: {selected.capacity} participants</p>}
            {selected.description && <p className="text-sm text-foreground">{selected.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

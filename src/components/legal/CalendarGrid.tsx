import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday as isTodayFn } from 'date-fns';
import { type LegalCalendarEvent } from '@/hooks/useLegalCalendar';

const eventTypeColors: Record<string, string> = {
  hearing: 'bg-destructive/80 text-white',
  deadline: 'bg-amber-500/80 text-white',
  meeting: 'bg-blue-500/80 text-white',
  filing: 'bg-purple-500/80 text-white',
  mediation: 'bg-emerald-500/80 text-white',
  other: 'bg-muted-foreground/60 text-white',
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  events: LegalCalendarEvent[];
  currentMonth: Date;
  onDayClick: (date: Date) => void;
}

export function CalendarGrid({ events, currentMonth, onDayClick }: Props) {
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    const startPad = getDay(start);
    return { allDays, startPad };
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, LegalCalendarEvent[]> = {};
    events.forEach(e => {
      const key = e.eventDate;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
        {dayNames.map(d => (
          <div key={d} className="bg-secondary/50 py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-b-lg overflow-hidden">
        {Array.from({ length: days.startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-card min-h-[80px] md:min-h-[100px]" />
        ))}
        {days.allDays.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[key] || [];
          const isToday = isTodayFn(day);
          return (
            <div
              key={key}
              className={cn('bg-card min-h-[80px] md:min-h-[100px] p-1 cursor-pointer hover:bg-muted/50 transition-colors', isToday && 'ring-2 ring-primary ring-inset')}
              onClick={() => onDayClick(day)}
            >
              <span className={cn('text-xs font-medium', isToday ? 'text-primary font-bold' : 'text-muted-foreground')}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map(e => (
                  <div key={e.id} className={cn('text-[10px] px-1 py-0.5 rounded truncate', e.isCompleted ? 'bg-muted line-through text-muted-foreground' : eventTypeColors[e.eventType] || eventTypeColors.other)}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

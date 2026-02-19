import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS_ORDER = ['period_1', 'period_2', 'period_3', 'period_4', 'period_5', 'period_6', 'period_7', 'period_8'];

interface TimetableEntry {
  id: string;
  day_of_week: string;
  period_id: string;
  subject_name: string;
  teacher_name: string | null;
  room: string | null;
}

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  period_type: string;
}

interface SchoolPortalTimetableProps {
  classId: string | null;
  ownerId: string;
}

export function SchoolPortalTimetable({ classId, ownerId }: SchoolPortalTimetableProps) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const db = supabase as any;
      const [{ data: periodsData }, { data: entriesData }] = await Promise.all([
        db.from('school_periods').select('*').eq('user_id', ownerId).order('sort_order'),
        classId
          ? db.from('timetable_entries')
              .select('*, school_subjects(name), school_periods(name, start_time, end_time)')
              .eq('class_id', classId)
              .eq('user_id', ownerId)
          : Promise.resolve({ data: [] }),
      ]);

      setPeriods((periodsData as Period[]) || []);
      const mapped = (entriesData || []).map((e: any) => ({
        id: e.id,
        day_of_week: e.day_of_week,
        period_id: e.period_id,
        subject_name: e.school_subjects?.name || e.subject_name || 'Subject',
        teacher_name: e.teacher_name || null,
        room: e.room || null,
      }));
      setEntries(mapped);
      setLoading(false);
    }
    load();
  }, [classId, ownerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">No class assigned yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEntry = (day: string, periodId: string) =>
    entries.find(e => e.day_of_week === day && e.period_id === periodId);

  const activePeriods = periods.filter(p => p.period_type !== 'break');

  return (
    <div className="space-y-4">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-foreground">Timetable</h2>
        <p className="text-xs text-muted-foreground">Read-only class schedule</p>
      </div>

      <div className="px-4 overflow-x-auto">
        <div className="min-w-[320px]">
          {/* Header */}
          <div className={`grid gap-1 mb-1`} style={{ gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)` }}>
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1 uppercase">{d.slice(0, 3)}</div>
            ))}
          </div>

          {/* Rows */}
          {activePeriods.map(period => (
            <div key={period.id} className={`grid gap-1 mb-1`} style={{ gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)` }}>
              {/* Period label */}
              <div className="flex flex-col justify-center pr-2">
                <p className="text-[10px] font-medium text-foreground leading-tight">{period.name}</p>
                <p className="text-[9px] text-muted-foreground">{period.start_time?.slice(0, 5)}</p>
              </div>
              {/* Day cells */}
              {DAYS.map(day => {
                const entry = getEntry(day, period.id);
                return (
                  <div
                    key={day}
                    className={cn(
                      'rounded-lg p-1.5 min-h-[44px] flex flex-col justify-center',
                      entry ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                    )}
                  >
                    {entry ? (
                      <>
                        <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">{entry.subject_name}</p>
                        {entry.teacher_name && <p className="text-[9px] text-muted-foreground leading-tight">{entry.teacher_name}</p>}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

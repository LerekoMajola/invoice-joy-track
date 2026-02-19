import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';
import { Plus, CalendarDays, Users, Clock, Trash2, Dumbbell } from 'lucide-react';
import { useGymClasses } from '@/hooks/useGymClasses';
import { AddClassDialog } from '@/components/gym/AddClassDialog';
import { AddScheduleDialog } from '@/components/gym/AddScheduleDialog';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function GymClasses() {
  const { classes, schedules, isLoading, updateClass, deleteClass, deleteSchedule } = useGymClasses();
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);

  const stats = useMemo(() => ({
    totalClasses: classes.length,
    activeClasses: classes.filter(c => c.isActive).length,
    weeklySlots: schedules.filter(s => s.isActive).length,
    totalCapacity: classes.reduce((sum, c) => sum + c.maxCapacity, 0),
  }), [classes, schedules]);

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped: Record<number, typeof schedules> = {};
    for (let i = 0; i < 7; i++) grouped[i] = [];
    schedules.forEach(s => {
      if (grouped[s.dayOfWeek]) grouped[s.dayOfWeek].push(s);
    });
    return grouped;
  }, [schedules]);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground text-sm mt-1">Schedule and manage fitness classes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAddScheduleOpen(true)}>
              <CalendarDays className="h-4 w-4 mr-1" />Schedule
            </Button>
            <Button onClick={() => setAddClassOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />Add Class
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Classes" value={String(stats.totalClasses)} icon={Dumbbell} />
          <StatCard title="Active" value={String(stats.activeClasses)} icon={CalendarDays} />
          <StatCard title="Weekly Slots" value={String(stats.weeklySlots)} icon={Clock} />
          <StatCard title="Total Capacity" value={String(stats.totalCapacity)} icon={Users} />
        </div>

        <Tabs defaultValue="schedule">
          <TabsList className="bg-muted/60 border border-border p-1 rounded-lg h-auto">
            <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium">Class Library</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
            ) : schedules.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No schedule yet</h3>
                <p className="text-muted-foreground text-sm mb-3">Create classes first, then add them to the weekly schedule.</p>
                <Button onClick={() => setAddScheduleOpen(true)}>Add Schedule Slot</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 0].map(day => {
                  const daySchedules = schedulesByDay[day] || [];
                  return (
                    <div key={day} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
                        <h3 className="font-semibold text-sm text-foreground">{DAYS[day]}</h3>
                      </div>
                      <div className="p-3 space-y-2 min-h-[100px]">
                        {daySchedules.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No classes</p>
                        ) : (
                          daySchedules.map(s => (
                            <div
                              key={s.id}
                              className="rounded-lg p-2.5 text-xs space-y-1 relative group"
                              style={{ backgroundColor: `${s.classColor || '#6366f1'}15`, borderLeft: `3px solid ${s.classColor || '#6366f1'}` }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{s.className}</span>
                                <button
                                  onClick={() => deleteSchedule(s.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-muted-foreground">
                                {formatTime(s.startTime)} — {formatTime(s.endTime)}
                              </div>
                              {(s.instructorOverride || s.classInstructor) && (
                                <div className="text-muted-foreground">
                                  {s.instructorOverride || s.classInstructor}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            {classes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No classes yet</h3>
                <p className="text-muted-foreground text-sm mb-3">Create your first fitness class.</p>
                <Button onClick={() => setAddClassOpen(true)}>Create Class</Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map(c => (
                  <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: c.color }} />
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{c.name}</h3>
                        {!c.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </div>
                      {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.durationMinutes}min</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />Max {c.maxCapacity}</span>
                        <Badge variant="secondary" className="text-[10px] capitalize">{c.category.replace('_', ' ')}</Badge>
                      </div>
                      {c.instructor && <p className="text-xs text-muted-foreground">Instructor: {c.instructor}</p>}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateClass(c.id, { isActive: !c.isActive })}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteClass(c.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddClassDialog open={addClassOpen} onOpenChange={setAddClassOpen} />
      <AddScheduleDialog open={addScheduleOpen} onOpenChange={setAddScheduleOpen} classes={classes} />
    </DashboardLayout>
  );
}

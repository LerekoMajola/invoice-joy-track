import { useState } from 'react';
import { Plus, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TimetableEntryDialog } from './TimetableEntryDialog';
import type { Subject, Period, TimetableEntry } from '@/hooks/useTimetable';
import type { SchoolClass } from '@/hooks/useSchoolClasses';
import type { StaffMember } from '@/hooks/useStaff';

interface TimetableGridProps {
  classes: SchoolClass[];
  subjects: Subject[];
  periods: Period[];
  entries: TimetableEntry[];
  staff: StaffMember[];
  dayNames: string[];
  getEntry: (classId: string, periodId: string, dayOfWeek: number) => TimetableEntry | null;
  onCreateEntry: (data: { classId: string; subjectId: string; periodId: string; teacherId?: string; dayOfWeek: number; room?: string }) => Promise<any>;
  onUpdateEntry: (id: string, updates: Partial<{ subjectId: string; teacherId: string | null; room: string | null }>) => Promise<boolean>;
  onDeleteEntry: (id: string) => Promise<boolean>;
}

export function TimetableGrid({
  classes,
  subjects,
  periods,
  staff,
  dayNames,
  getEntry,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
}: TimetableGridProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ periodId: string; dayOfWeek: number; entry: TimetableEntry | null } | null>(null);

  const activeClasses = classes.filter((c) => c.isActive);
  const selectedClass = activeClasses.find((c) => c.id === selectedClassId);

  // Auto-select first class
  if (!selectedClassId && activeClasses.length > 0) {
    setSelectedClassId(activeClasses[0].id);
  }

  const handleCellClick = (periodId: string, dayOfWeek: number) => {
    if (!selectedClassId) return;
    const entry = getEntry(selectedClassId, periodId, dayOfWeek);
    setSelectedSlot({ periodId, dayOfWeek, entry });
    setDialogOpen(true);
  };

  const handleSave = async (data: { subjectId: string; teacherId?: string; room?: string }) => {
    if (!selectedSlot || !selectedClassId) return;

    if (selectedSlot.entry) {
      await onUpdateEntry(selectedSlot.entry.id, {
        subjectId: data.subjectId,
        teacherId: data.teacherId === 'none' ? null : data.teacherId || null,
        room: data.room || null,
      });
    } else {
      await onCreateEntry({
        classId: selectedClassId,
        subjectId: data.subjectId,
        periodId: selectedSlot.periodId,
        teacherId: data.teacherId === 'none' ? undefined : data.teacherId,
        dayOfWeek: selectedSlot.dayOfWeek,
        room: data.room,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedSlot?.entry) return;
    await onDeleteEntry(selectedSlot.entry.id);
  };

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);
  const getTeacher = (teacherId: string | null) => (teacherId ? staff.find((s) => s.id === teacherId) : null);
  const getPeriod = (periodId: string) => periods.find((p) => p.id === periodId);

  const formatTime = (time: string) => time.slice(0, 5);

  if (activeClasses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No classes found. Create classes in School Admin first.
        </CardContent>
      </Card>
    );
  }

  if (periods.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No periods defined. Go to the Periods tab to set up your daily schedule.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Class selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Class:</span>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {activeClasses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{selectedClass?.name} — Weekly Timetable</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[700px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-2 w-[100px] border-b bg-muted/30 sticky left-0 z-10">
                      Time
                    </th>
                    {dayNames.map((day) => (
                      <th key={day} className="text-center text-xs font-medium text-muted-foreground p-2 border-b bg-muted/30">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    if (period.isBreak) {
                      return (
                        <tr key={period.id}>
                          <td
                            colSpan={dayNames.length + 1}
                            className="text-center py-2 px-3 bg-muted/50 border-b"
                          >
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Coffee className="h-3.5 w-3.5" />
                              <span className="font-medium">{period.name}</span>
                              <span>
                                {formatTime(period.startTime)} — {formatTime(period.endTime)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={period.id}>
                        <td className="p-2 border-b text-xs text-muted-foreground align-top sticky left-0 bg-background z-10">
                          <div className="font-medium">{formatTime(period.startTime)}</div>
                          <div>{formatTime(period.endTime)}</div>
                        </td>
                        {dayNames.map((_, dayIndex) => {
                          const dayOfWeek = dayIndex + 1;
                          const entry = selectedClassId ? getEntry(selectedClassId, period.id, dayOfWeek) : null;
                          const subject = entry ? getSubject(entry.subjectId) : null;
                          const teacher = entry ? getTeacher(entry.teacherId) : null;

                          return (
                            <td
                              key={dayOfWeek}
                              className="p-1 border-b border-l cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => handleCellClick(period.id, dayOfWeek)}
                            >
                              {entry && subject ? (
                                <div
                                  className="rounded-lg p-2 min-h-[52px] text-white"
                                  style={{ backgroundColor: subject.color }}
                                >
                                  <p className="text-xs font-semibold leading-tight">
                                    {subject.shortCode || subject.name}
                                  </p>
                                  {teacher && (
                                    <p className="text-[10px] opacity-80 leading-tight mt-0.5">
                                      {teacher.name}
                                    </p>
                                  )}
                                  {entry.room && (
                                    <p className="text-[10px] opacity-70 leading-tight">
                                      {entry.room}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 min-h-[52px] flex items-center justify-center">
                                  <Plus className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Entry dialog */}
      {selectedSlot && (
        <TimetableEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          subjects={subjects}
          staff={staff}
          dayOfWeek={selectedSlot.dayOfWeek}
          dayName={dayNames[selectedSlot.dayOfWeek - 1]}
          periodName={getPeriod(selectedSlot.periodId)?.name || ''}
          existingEntry={selectedSlot.entry}
          onSave={handleSave}
          onDelete={selectedSlot.entry ? handleDelete : undefined}
        />
      )}
    </div>
  );
}

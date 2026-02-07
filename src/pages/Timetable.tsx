import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import { useTimetable } from '@/hooks/useTimetable';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { useStaff } from '@/hooks/useStaff';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { SubjectManagement } from '@/components/timetable/SubjectManagement';
import { PeriodManagement } from '@/components/timetable/PeriodManagement';
import { Skeleton } from '@/components/ui/skeleton';

export default function Timetable() {
  const {
    subjects,
    periods,
    entries,
    isLoading,
    createSubject,
    updateSubject,
    deleteSubject,
    createPeriod,
    updatePeriod,
    deletePeriod,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getSubjectEntryCount,
    DAY_NAMES,
  } = useTimetable();

  const { classes, isLoading: classesLoading } = useSchoolClasses();
  const { staff, isLoading: staffLoading } = useStaff();

  const loading = isLoading || classesLoading || staffLoading;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Timetable</h1>
            <p className="text-muted-foreground text-sm">
              Manage your school's weekly class schedule
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="timetable">
              <TabsList>
                <TabsTrigger value="timetable" className="gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Timetable
                </TabsTrigger>
                <TabsTrigger value="subjects" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Subjects
                </TabsTrigger>
                <TabsTrigger value="periods" className="gap-1.5">
                  <Clock className="h-4 w-4" />
                  Periods
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timetable">
                <TimetableGrid
                  classes={classes}
                  subjects={subjects}
                  periods={periods}
                  entries={entries}
                  staff={staff}
                  dayNames={DAY_NAMES}
                  getEntry={getEntry}
                  onCreateEntry={createEntry}
                  onUpdateEntry={updateEntry}
                  onDeleteEntry={deleteEntry}
                />
              </TabsContent>

              <TabsContent value="subjects">
                <SubjectManagement
                  subjects={subjects}
                  getSubjectEntryCount={getSubjectEntryCount}
                  onCreateSubject={createSubject}
                  onUpdateSubject={updateSubject}
                  onDeleteSubject={deleteSubject}
                />
              </TabsContent>

              <TabsContent value="periods">
                <PeriodManagement
                  periods={periods}
                  onCreatePeriod={createPeriod}
                  onUpdatePeriod={updatePeriod}
                  onDeletePeriod={deletePeriod}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}

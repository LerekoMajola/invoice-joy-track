import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Megaphone, Trash2 } from 'lucide-react';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { useStudents } from '@/hooks/useStudents';
import { useStaff } from '@/hooks/useStaff';
import { ClassManagement } from '@/components/school/ClassManagement';
import { TermManagement } from '@/components/school/TermManagement';
import { AnnouncementDialog } from '@/components/school/AnnouncementDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Announcement {
  id: string;
  title: string;
  message: string;
  targetClassId: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function SchoolAdmin() {
  const { user } = useAuth();
  const { classes, terms, isLoading, createClass, updateClass, deleteClass, createTerm, updateTerm, deleteTerm, refetch } = useSchoolClasses();
  const { students } = useStudents();
  const { staff } = useStaff();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  // Student counts per class
  const studentCounts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.classId) {
      studentCounts[s.classId] = (studentCounts[s.classId] || 0) + 1;
    }
  });

  const staffList = staff.map((s) => ({ id: s.id, name: s.name }));

  // Fetch announcements
  const fetchAnnouncements = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('school_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAnnouncements(data.map((a: any) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        targetClassId: a.target_class_id,
        isPublished: a.is_published,
        publishedAt: a.published_at,
        createdAt: a.created_at,
      })));
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('school_announcements').delete().eq('id', id);
    if (!error) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const getClassName = (id: string | null) => id ? classes.find((c) => c.id === id)?.name || 'Unknown' : 'All Classes';

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="School Admin" subtitle="Classes, terms, and announcements" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="School Admin" subtitle="Classes, terms, and announcements" />

      <div className="p-4 md:p-6">
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <ClassManagement
              classes={classes}
              staff={staffList}
              studentCounts={studentCounts}
              onCreate={createClass}
              onUpdate={updateClass}
              onDelete={deleteClass}
            />
          </TabsContent>

          <TabsContent value="terms">
            <TermManagement terms={terms} onCreate={createTerm} onUpdate={updateTerm} onDelete={deleteTerm} />
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Announcements</h2>
                <Button size="sm" onClick={() => setAnnouncementDialogOpen(true)}>
                  <Megaphone className="h-4 w-4 mr-1" />New Announcement
                </Button>
              </div>

              {announcements.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2" />
                  <p>No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{a.title}</h3>
                            {a.isPublished ? (
                              <Badge className="bg-success/10 text-success border-success/20 text-xs">Published</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>To: {getClassName(a.targetClassId)}</span>
                            <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive flex-shrink-0" onClick={() => deleteAnnouncement(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AnnouncementDialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen} classes={classes} onCreated={fetchAnnouncements} />
    </DashboardLayout>
  );
}

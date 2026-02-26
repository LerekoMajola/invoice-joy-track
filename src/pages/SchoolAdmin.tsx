import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Megaphone, Trash2, Plus, FileText, X, GraduationCap } from 'lucide-react';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { useStudents } from '@/hooks/useStudents';
import { useStaff } from '@/hooks/useStaff';
import { ClassManagement } from '@/components/school/ClassManagement';
import { TermManagement } from '@/components/school/TermManagement';
import { AnnouncementDialog } from '@/components/school/AnnouncementDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  message: string;
  targetClassId: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface ReportCardRow {
  id: string;
  student_id: string;
  term_id: string;
  overall_grade: string | null;
  overall_percentage: number | null;
  teacher_comments: string | null;
  principal_comments: string | null;
  attendance_days: number | null;
  attendance_total: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  student_name?: string;
  term_name?: string;
}

interface SubjectGradeInput {
  subject_name: string;
  grade: string;
  percentage: string;
  teacher_comment: string;
}

export default function SchoolAdmin() {
  const { user } = useAuth();
  const { classes, terms, isLoading, createClass, updateClass, deleteClass, createTerm, updateTerm, deleteTerm, refetch } = useSchoolClasses();
  const { students } = useStudents();
  const { staff } = useStaff();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  // Report cards state
  const [reportCards, setReportCards] = useState<ReportCardRow[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [overallGrade, setOverallGrade] = useState('');
  const [overallPercentage, setOverallPercentage] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [principalComments, setPrincipalComments] = useState('');
  const [attendanceDays, setAttendanceDays] = useState('');
  const [attendanceTotal, setAttendanceTotal] = useState('');
  const [subjectGrades, setSubjectGrades] = useState<SubjectGradeInput[]>([
    { subject_name: '', grade: '', percentage: '', teacher_comment: '' },
  ]);

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

  // Fetch report cards
  const fetchReportCards = async () => {
    if (!user) return;
    const db = supabase as any;
    const { data } = await db
      .from('student_report_cards')
      .select('*, students(first_name, last_name), academic_terms(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setReportCards(data.map((r: any) => ({
        ...r,
        student_name: r.students ? `${r.students.first_name} ${r.students.last_name}` : 'Unknown',
        term_name: r.academic_terms?.name || 'Unknown',
      })));
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchReportCards();
  }, [user]);

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('school_announcements').delete().eq('id', id);
    if (!error) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const getClassName = (id: string | null) => id ? classes.find((c) => c.id === id)?.name || 'Unknown' : 'All Classes';

  // Report card CRUD
  const addSubjectRow = () => {
    setSubjectGrades([...subjectGrades, { subject_name: '', grade: '', percentage: '', teacher_comment: '' }]);
  };

  const removeSubjectRow = (idx: number) => {
    setSubjectGrades(subjectGrades.filter((_, i) => i !== idx));
  };

  const updateSubjectRow = (idx: number, field: keyof SubjectGradeInput, value: string) => {
    setSubjectGrades(subjectGrades.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const resetReportForm = () => {
    setSelectedStudentId('');
    setSelectedTermId('');
    setOverallGrade('');
    setOverallPercentage('');
    setTeacherComments('');
    setPrincipalComments('');
    setAttendanceDays('');
    setAttendanceTotal('');
    setSubjectGrades([{ subject_name: '', grade: '', percentage: '', teacher_comment: '' }]);
  };

  const handleCreateReport = async () => {
    if (!user || !selectedStudentId || !selectedTermId) {
      toast.error('Please select a student and term');
      return;
    }
    setReportLoading(true);
    const db = supabase as any;

    const { data: card, error } = await db.from('student_report_cards').insert({
      student_id: selectedStudentId,
      term_id: selectedTermId,
      user_id: user.id,
      overall_grade: overallGrade || null,
      overall_percentage: overallPercentage ? parseFloat(overallPercentage) : null,
      teacher_comments: teacherComments || null,
      principal_comments: principalComments || null,
      attendance_days: attendanceDays ? parseInt(attendanceDays) : null,
      attendance_total: attendanceTotal ? parseInt(attendanceTotal) : null,
      is_published: false,
    }).select().single();

    if (error || !card) {
      toast.error('Failed to create report card');
      setReportLoading(false);
      return;
    }

    // Insert subject grades
    const validSubjects = subjectGrades.filter(s => s.subject_name.trim());
    if (validSubjects.length > 0) {
      await db.from('student_subject_grades').insert(
        validSubjects.map(s => ({
          report_card_id: card.id,
          subject_name: s.subject_name.trim(),
          grade: s.grade || null,
          percentage: s.percentage ? parseFloat(s.percentage) : null,
          teacher_comment: s.teacher_comment || null,
        }))
      );
    }

    toast.success('Report card created');
    setReportDialogOpen(false);
    resetReportForm();
    fetchReportCards();
    setReportLoading(false);
  };

  const togglePublish = async (id: string, currentlyPublished: boolean) => {
    const db = supabase as any;
    await db.from('student_report_cards').update({
      is_published: !currentlyPublished,
      published_at: !currentlyPublished ? new Date().toISOString() : null,
    }).eq('id', id);
    toast.success(currentlyPublished ? 'Report unpublished' : 'Report published');
    fetchReportCards();
  };

  const deleteReportCard = async (id: string) => {
    const db = supabase as any;
    await db.from('student_report_cards').delete().eq('id', id);
    toast.success('Report card deleted');
    fetchReportCards();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="School Admin" subtitle="Classes, terms, announcements & reports" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="School Admin" subtitle="Classes, terms, announcements & reports" />

      <div className="p-4 md:p-6">
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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

          <TabsContent value="reports">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Report Cards</h2>
                <Button size="sm" onClick={() => setReportDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />New Report Card
                </Button>
              </div>

              {reportCards.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No report cards yet</p>
                  <p className="text-xs mt-1">Create report cards for students to view in the parent portal.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportCards.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="h-4.5 w-4.5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{r.student_name}</p>
                              <p className="text-xs text-muted-foreground">{r.term_name}</p>
                              {r.overall_grade && (
                                <Badge variant="outline" className="text-xs mt-1">{r.overall_grade}{r.overall_percentage ? ` (${r.overall_percentage}%)` : ''}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <Switch
                                checked={r.is_published}
                                onCheckedChange={() => togglePublish(r.id, r.is_published)}
                              />
                              <span className="text-xs text-muted-foreground">{r.is_published ? 'Published' : 'Draft'}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteReportCard(r.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AnnouncementDialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen} classes={classes} onCreated={fetchAnnouncements} />

      {/* Report Card Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Report Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Term</Label>
                <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                  <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    {terms.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Overall Grade</Label>
                <Input value={overallGrade} onChange={e => setOverallGrade(e.target.value)} placeholder="e.g. A, B+" />
              </div>
              <div className="space-y-1.5">
                <Label>Overall %</Label>
                <Input type="number" value={overallPercentage} onChange={e => setOverallPercentage(e.target.value)} placeholder="e.g. 85" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Attendance (days present)</Label>
                <Input type="number" value={attendanceDays} onChange={e => setAttendanceDays(e.target.value)} placeholder="e.g. 45" />
              </div>
              <div className="space-y-1.5">
                <Label>Total School Days</Label>
                <Input type="number" value={attendanceTotal} onChange={e => setAttendanceTotal(e.target.value)} placeholder="e.g. 50" />
              </div>
            </div>

            {/* Subject Grades */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Subject Grades</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubjectRow}>
                  <Plus className="h-3 w-3 mr-1" />Add Subject
                </Button>
              </div>
              {subjectGrades.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg border border-border p-2">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input placeholder="Subject" value={s.subject_name} onChange={e => updateSubjectRow(idx, 'subject_name', e.target.value)} className="text-sm" />
                    <Input placeholder="Grade" value={s.grade} onChange={e => updateSubjectRow(idx, 'grade', e.target.value)} className="text-sm" />
                    <Input placeholder="%" type="number" value={s.percentage} onChange={e => updateSubjectRow(idx, 'percentage', e.target.value)} className="text-sm" />
                  </div>
                  {subjectGrades.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeSubjectRow(idx)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Teacher Comments</Label>
              <Textarea value={teacherComments} onChange={e => setTeacherComments(e.target.value)} placeholder="Overall teacher remarks..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Principal Comments</Label>
              <Textarea value={principalComments} onChange={e => setPrincipalComments(e.target.value)} placeholder="Principal's remarks..." rows={2} />
            </div>

            <Button className="w-full" onClick={handleCreateReport} disabled={reportLoading}>
              {reportLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Report Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

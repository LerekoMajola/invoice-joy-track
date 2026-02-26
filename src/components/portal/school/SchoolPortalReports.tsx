import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, ChevronDown, ChevronUp, GraduationCap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalTheme } from '@/hooks/usePortalTheme';
import { format, parseISO } from 'date-fns';

interface SubjectGrade {
  id: string;
  subject_name: string;
  grade: string | null;
  percentage: number | null;
  teacher_comment: string | null;
}

interface ReportCard {
  id: string;
  term_id: string;
  overall_grade: string | null;
  overall_percentage: number | null;
  teacher_comments: string | null;
  principal_comments: string | null;
  attendance_days: number | null;
  attendance_total: number | null;
  published_at: string | null;
  created_at: string;
  term_name?: string;
  term_start?: string;
  term_end?: string;
  subjects: SubjectGrade[];
}

interface SchoolPortalReportsProps {
  studentId: string;
}

export function SchoolPortalReports({ studentId }: SchoolPortalReportsProps) {
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { pt } = usePortalTheme();

  useEffect(() => {
    async function load() {
      const db = supabase as any;

      const { data: cards } = await db
        .from('student_report_cards')
        .select('*, academic_terms(name, start_date, end_date)')
        .eq('student_id', studentId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!cards || cards.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      const cardIds = cards.map((c: any) => c.id);
      const { data: grades } = await db
        .from('student_subject_grades')
        .select('*')
        .in('report_card_id', cardIds)
        .order('subject_name', { ascending: true });

      const gradesByCard: Record<string, SubjectGrade[]> = {};
      (grades || []).forEach((g: any) => {
        if (!gradesByCard[g.report_card_id]) gradesByCard[g.report_card_id] = [];
        gradesByCard[g.report_card_id].push(g);
      });

      const mapped: ReportCard[] = cards.map((c: any) => ({
        id: c.id,
        term_id: c.term_id,
        overall_grade: c.overall_grade,
        overall_percentage: c.overall_percentage,
        teacher_comments: c.teacher_comments,
        principal_comments: c.principal_comments,
        attendance_days: c.attendance_days,
        attendance_total: c.attendance_total,
        published_at: c.published_at,
        created_at: c.created_at,
        term_name: c.academic_terms?.name,
        term_start: c.academic_terms?.start_date,
        term_end: c.academic_terms?.end_date,
        subjects: gradesByCard[c.id] || [],
      }));

      setReports(mapped);
      setLoading(false);
    }

    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-[#00E5A0]" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 px-4">
        <FileText className="h-10 w-10" style={{ color: 'var(--portal-text-dimmed)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--portal-text-dimmed)' }}>No report cards published yet</p>
        <p className="text-xs text-center" style={{ color: 'var(--portal-text-dimmed)' }}>
          Report cards will appear here once your school publishes them.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Award className="h-5 w-5 text-[#00E5A0]" />
        <h2 className="font-bold text-base" style={{ color: 'var(--portal-text-heading)' }}>Academic Reports</h2>
      </div>

      {reports.map((report) => {
        const isExpanded = expandedId === report.id;
        return (
          <Card
            key={report.id}
            className={cn('overflow-hidden border transition-colors', pt('bg-white/[0.03] border-white/[0.08]', 'bg-white border-gray-200'))}
          >
            <button
              className="w-full text-left p-4 flex items-center justify-between"
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
            >
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', pt('bg-[#00E5A0]/10', 'bg-emerald-50'))}>
                  <GraduationCap className="h-5 w-5 text-[#00E5A0]" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--portal-text-heading)' }}>
                    {report.term_name || 'Report Card'}
                  </p>
                  {report.term_start && report.term_end && (
                    <p className="text-xs" style={{ color: 'var(--portal-text-dimmed)' }}>
                      {format(parseISO(report.term_start), 'dd MMM')} – {format(parseISO(report.term_end), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.overall_grade && (
                  <Badge className="bg-[#00E5A0]/15 text-[#00E5A0] border-[#00E5A0]/20 text-xs font-bold">
                    {report.overall_grade}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" style={{ color: 'var(--portal-text-dimmed)' }} />
                ) : (
                  <ChevronDown className="h-4 w-4" style={{ color: 'var(--portal-text-dimmed)' }} />
                )}
              </div>
            </button>

            {isExpanded && (
              <CardContent className={cn('px-4 pb-4 pt-0 space-y-4', pt('border-t border-white/[0.06]', 'border-t border-gray-100'))}>
                {/* Overall Summary */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  {report.overall_percentage != null && (
                    <div className={cn('rounded-xl p-3 text-center', pt('bg-white/[0.04]', 'bg-gray-50'))}>
                      <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--portal-text-dimmed)' }}>Overall</p>
                      <p className="text-lg font-bold text-[#00E5A0]">{report.overall_percentage}%</p>
                    </div>
                  )}
                  {report.attendance_days != null && report.attendance_total != null && (
                    <div className={cn('rounded-xl p-3 text-center', pt('bg-white/[0.04]', 'bg-gray-50'))}>
                      <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--portal-text-dimmed)' }}>Attendance</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--portal-text-heading)' }}>
                        {report.attendance_days}/{report.attendance_total}
                      </p>
                    </div>
                  )}
                </div>

                {/* Subject Grades */}
                {report.subjects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--portal-text-dimmed)' }}>Subjects</p>
                    <div className="space-y-1.5">
                      {report.subjects.map((s) => (
                        <div
                          key={s.id}
                          className={cn('flex items-center justify-between px-3 py-2 rounded-lg', pt('bg-white/[0.03]', 'bg-gray-50'))}
                        >
                          <span className="text-sm" style={{ color: 'var(--portal-text-heading)' }}>{s.subject_name}</span>
                          <div className="flex items-center gap-2">
                            {s.percentage != null && (
                              <span className="text-xs" style={{ color: 'var(--portal-text-dimmed)' }}>{s.percentage}%</span>
                            )}
                            {s.grade && (
                              <Badge variant="outline" className="text-xs font-bold border-[#00E5A0]/30 text-[#00E5A0]">{s.grade}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {report.teacher_comments && (
                  <div className={cn('rounded-xl p-3', pt('bg-white/[0.03]', 'bg-gray-50'))}>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--portal-text-dimmed)' }}>Teacher's Comments</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--portal-text-heading)' }}>{report.teacher_comments}</p>
                  </div>
                )}
                {report.principal_comments && (
                  <div className={cn('rounded-xl p-3', pt('bg-white/[0.03]', 'bg-gray-50'))}>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--portal-text-dimmed)' }}>Principal's Comments</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--portal-text-heading)' }}>{report.principal_comments}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

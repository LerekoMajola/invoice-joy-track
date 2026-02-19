import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Calendar, User, Loader2, MessageCircle, CreditCard, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SchoolPortalStudent } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

interface SchoolParentPortalProps {
  student: SchoolPortalStudent;
  user: AuthUser;
}

interface SchoolClass {
  id: string;
  name: string;
  grade_level: string | null;
  teacher_name: string | null;
}

interface AcademicTerm {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface FeeBalance {
  totalOwed: number;
  totalPaid: number;
  balance: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-success/15 text-success border-success/20',
  graduated: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  withdrawn: 'bg-muted text-muted-foreground border-border',
  suspended: 'bg-destructive/15 text-destructive border-destructive/20',
};

export function SchoolParentPortal({ student }: SchoolParentPortalProps) {
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [currentTerm, setCurrentTerm] = useState<AcademicTerm | null>(null);
  const [feeBalance, setFeeBalance] = useState<FeeBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const db = supabase as any;
      const allPromises: Promise<any>[] = [];

      if (student.class_id) {
        allPromises.push(
          db.from('school_classes').select('*').eq('id', student.class_id).maybeSingle()
            .then(({ data }: any) => setSchoolClass(data))
        );
      }

      allPromises.push(
        db.from('academic_terms')
          .select('*')
          .eq('user_id', student.owner_user_id ?? student.user_id)
          .eq('is_current', true)
          .maybeSingle()
          .then(({ data }: any) => setCurrentTerm(data))
      );

      await Promise.all(allPromises);

      const { data: term } = await db
        .from('academic_terms')
        .select('id')
        .eq('user_id', student.owner_user_id ?? student.user_id)
        .eq('is_current', true)
        .maybeSingle();

      if (term) {
        const { data: fees } = await db
          .from('student_fee_payments')
          .select('amount, status')
          .eq('student_id', student.id)
          .eq('term_id', term.id);

        if (fees) {
          const totalOwed = fees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
          const totalPaid = fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
          setFeeBalance({ totalOwed, totalPaid, balance: totalOwed - totalPaid });
        }
      }

      setLoading(false);
    }

    load();
  }, [student.id, student.owner_user_id, student.user_id, student.class_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase();
  const paidPct = feeBalance && feeBalance.totalOwed > 0
    ? Math.round((feeBalance.totalPaid / feeBalance.totalOwed) * 100)
    : 0;

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-background px-4 pt-6 pb-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shrink-0">
            <span className="text-xl font-bold text-primary-foreground">{initials || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{student.admission_number}</p>
          </div>
          <Badge
            className={cn('capitalize shrink-0 border text-xs font-medium', statusColors[student.status] || 'bg-muted text-muted-foreground border-border')}
            variant="outline"
          >
            {student.status}
          </Badge>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* Class & Term Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <BookOpen className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Class</p>
              <p className="font-bold text-foreground text-sm">{schoolClass?.name || 'N/A'}</p>
              {schoolClass?.grade_level && (
                <p className="text-xs text-muted-foreground mt-0.5">{schoolClass.grade_level}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Calendar className="h-4.5 w-4.5 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Term</p>
              <p className="font-bold text-foreground text-sm">{currentTerm?.name || 'N/A'}</p>
              {currentTerm && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(parseISO(currentTerm.start_date), 'dd MMM')} – {format(parseISO(currentTerm.end_date), 'dd MMM')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fee Summary Card */}
        {feeBalance && (
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-5 text-white">
              <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mb-1">Fee Summary</p>
              <p className="text-xs text-white/70 mb-4">Current Term</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-white/60 uppercase mb-1">Total</p>
                  <p className="text-sm font-bold">{feeBalance.totalOwed.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-white/60 uppercase mb-1">Paid</p>
                  <p className="text-sm font-bold text-green-300">{feeBalance.totalPaid.toFixed(2)}</p>
                </div>
                <div className={cn('rounded-xl p-3 text-center', feeBalance.balance > 0 ? 'bg-white/10' : 'bg-white/10')}>
                  <p className="text-[10px] text-white/60 uppercase mb-1">Balance</p>
                  <p className={cn('text-sm font-bold', feeBalance.balance > 0 ? 'text-red-300' : 'text-green-300')}>
                    {feeBalance.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                  <span>Payment progress</span>
                  <span>{paidPct}% paid</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${paidPct}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: 'Timetable', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { icon: MessageCircle, label: 'Messages', color: 'text-green-500', bg: 'bg-green-500/10' },
            { icon: CreditCard, label: 'Fees', color: 'text-blue-600', bg: 'bg-blue-500/10' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <Card key={label} className="border-border/50">
              <CardContent className="p-3 flex flex-col items-center gap-2">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guardian Info */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Guardian</p>
            <div className="space-y-2.5">
              {student.guardian_name && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{student.guardian_name}</span>
                </div>
              )}
              {student.guardian_email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground text-xs">{student.guardian_email}</span>
                </div>
              )}
              {student.enrollment_date && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Enrolled: {format(parseISO(student.enrollment_date), 'dd MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

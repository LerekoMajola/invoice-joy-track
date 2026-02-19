import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Calendar, User, Loader2 } from 'lucide-react';
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
  active: 'bg-success/10 text-success',
  graduated: 'bg-info/10 text-info',
  withdrawn: 'bg-muted text-muted-foreground',
  suspended: 'bg-destructive/10 text-destructive',
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
          .eq('user_id', student.user_id)
          .eq('is_current', true)
          .maybeSingle()
          .then(({ data }: any) => setCurrentTerm(data))
      );

      await Promise.all(allPromises);

      const { data: term } = await db
        .from('academic_terms')
        .select('id')
        .eq('user_id', student.user_id)
        .eq('is_current', true)
        .maybeSingle();

      if (term) {
        const { data: fees } = await db
          .from('school_fee_payments')
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
  }, [student.id, student.user_id, student.class_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Header */}
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-xs text-muted-foreground">{student.admission_number}</p>
          </div>
          <Badge className={cn('ml-auto capitalize', statusColors[student.status] || 'bg-muted text-muted-foreground')} variant="secondary">
            {student.status}
          </Badge>
        </div>
      </div>

      {/* Class & Term Info */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium uppercase">Class</p>
            </div>
            <p className="font-semibold text-foreground">{schoolClass?.name || 'Not assigned'}</p>
            {schoolClass?.grade_level && <p className="text-xs text-muted-foreground">{schoolClass.grade_level}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium uppercase">Term</p>
            </div>
            <p className="font-semibold text-foreground">{currentTerm?.name || 'N/A'}</p>
            {currentTerm && (
              <p className="text-xs text-muted-foreground">
                {format(parseISO(currentTerm.start_date), 'dd MMM')} — {format(parseISO(currentTerm.end_date), 'dd MMM')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Summary */}
      {feeBalance && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Fee Summary (Current Term)</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-bold text-foreground">{feeBalance.totalOwed.toFixed(2)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-success/10">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-sm font-bold text-success">{feeBalance.totalPaid.toFixed(2)}</p>
              </div>
              <div className={cn('text-center p-2 rounded-lg', feeBalance.balance > 0 ? 'bg-destructive/10' : 'bg-success/10')}>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className={cn('text-sm font-bold', feeBalance.balance > 0 ? 'text-destructive' : 'text-success')}>
                  {feeBalance.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guardian Info */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Guardian</h3>
          {student.guardian_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>{student.guardian_name}</span>
            </div>
          )}
          {student.guardian_email && (
            <p className="text-xs text-muted-foreground">{student.guardian_email}</p>
          )}
          {student.enrollment_date && (
            <p className="text-xs text-muted-foreground">
              Enrolled: {format(parseISO(student.enrollment_date), 'dd MMM yyyy')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MapPin, Heart, GraduationCap, Trash2, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Student } from '@/hooks/useStudents';
import { SchoolClass } from '@/hooks/useSchoolClasses';
import { formatMaluti } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  graduated: 'bg-info/10 text-info border-info/20',
  withdrawn: 'bg-muted text-muted-foreground border-border',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface StudentDetailDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: SchoolClass[];
  onDelete?: (id: string) => void;
  feeBalance?: { totalOwed: number; totalPaid: number; balance: number };
}

export function StudentDetailDialog({ student, open, onOpenChange, classes, onDelete, feeBalance }: StudentDetailDialogProps) {
  const { toast } = useToast();
  const [sendingInvite, setSendingInvite] = useState(false);
  if (!student) return null;
  const className = classes.find((c) => c.id === student.classId)?.name || 'Unassigned';

  const handleCreatePortalAccess = async () => {
    const email = student.guardianEmail;
    if (!email) {
      toast({ title: 'No email', description: 'This guardian has no email address on file.', variant: 'destructive' });
      return;
    }
    setSendingInvite(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('create-portal-account', {
      body: {
        studentId: student.id,
        portalType: 'school',
        name: student.guardianName || `${student.firstName} ${student.lastName} Guardian`,
        email,
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    setSendingInvite(false);
    if (res.error || res.data?.error) {
      const msg = res.data?.error || res.error?.message || 'Failed to create portal access';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } else {
      toast({ title: 'Portal access created!', description: `Login credentials have been emailed to ${email}.` });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{student.firstName} {student.lastName}</DialogTitle>
            <Badge variant="outline" className={cn('capitalize', statusStyles[student.status])}>
              {student.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{student.admissionNumber}</p>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Student Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Student Info</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /><span>{className}</span></div>
                {student.gender && <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="capitalize">{student.gender}</span></div>}
                {student.dateOfBirth && <div><span className="text-muted-foreground">DOB:</span> {new Date(student.dateOfBirth).toLocaleDateString()}</div>}
                {student.enrollmentDate && <div><span className="text-muted-foreground">Enrolled:</span> {new Date(student.enrollmentDate).toLocaleDateString()}</div>}
              </div>
              {student.address && (
                <div className="flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /><span>{student.address}</span></div>
              )}
            </div>

            <Separator />

            {/* Guardian Info */}
            {student.guardianName && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primary Guardian</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{student.guardianName}</span>
                    {student.guardianRelationship && <Badge variant="outline" className="text-xs capitalize">{student.guardianRelationship}</Badge>}
                  </div>
                  {student.guardianPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><a href={`tel:${student.guardianPhone}`} className="text-primary">{student.guardianPhone}</a></div>}
                  {student.guardianEmail && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><a href={`mailto:${student.guardianEmail}`} className="text-primary">{student.guardianEmail}</a></div>}
                </div>
              </div>
            )}

            {student.secondaryGuardianName && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Secondary Guardian</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{student.secondaryGuardianName}</span></div>
                  {student.secondaryGuardianPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><a href={`tel:${student.secondaryGuardianPhone}`} className="text-primary">{student.secondaryGuardianPhone}</a></div>}
                </div>
              </div>
            )}

            {(student.guardianName || student.secondaryGuardianName) && <Separator />}

            {/* Fee Balance */}
            {feeBalance && (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fee Summary (Current Term)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground">Total Fees</p>
                      <p className="text-sm font-semibold">{formatMaluti(feeBalance.totalOwed)}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="text-sm font-semibold text-success">{formatMaluti(feeBalance.totalPaid)}</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className={cn('text-sm font-semibold', feeBalance.balance > 0 ? 'text-destructive' : 'text-success')}>
                        {formatMaluti(feeBalance.balance)}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Medical Notes */}
            {student.medicalNotes && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Medical Notes
                </h3>
                <p className="text-sm bg-destructive/5 border border-destructive/20 rounded-lg p-3">{student.medicalNotes}</p>
              </div>
            )}

            {student.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h3>
                <p className="text-sm text-muted-foreground">{student.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2">
              {student.guardianEmail && (
                <Button variant="outline" className="w-full" onClick={handleCreatePortalAccess} disabled={sendingInvite}>
                  <KeyRound className="h-4 w-4 mr-2" />{sendingInvite ? 'Sending…' : student.portalUserId ? 'Resend Portal Access' : 'Create Portal Access'}
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={() => onDelete(student.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Student
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

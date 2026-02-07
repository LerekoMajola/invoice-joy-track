import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { useStudents } from '@/hooks/useStudents';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { useSchoolFees } from '@/hooks/useSchoolFees';
import { FeeStatCards } from '@/components/school/FeeStatCards';
import { FeeScheduleManager } from '@/components/school/FeeScheduleManager';
import { RecordPaymentDialog } from '@/components/school/RecordPaymentDialog';

export default function SchoolFees() {
  const { students } = useStudents();
  const { classes, terms, currentTerm, isLoading: classLoading } = useSchoolClasses();
  const { feeSchedules, payments, isLoading: feesLoading, createFeeSchedule, deleteFeeSchedule, recordPayment, deletePayment, getTermStats, getStudentBalance } = useSchoolFees();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const isLoading = classLoading || feesLoading;
  const activeStudents = students.filter((s) => s.status === 'active');

  const termStats = currentTerm
    ? getTermStats(currentTerm.id, activeStudents.map((s) => ({ id: s.id, classId: s.classId })))
    : { totalExpected: 0, totalCollected: 0, totalOutstanding: 0, collectionRate: 0 };

  const currentTermPayments = currentTerm
    ? payments.filter((p) => p.termId === currentTerm.id)
    : [];

  const getStudentName = (id: string) => {
    const s = students.find((st) => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getClassName = (studentId: string) => {
    const s = students.find((st) => st.id === studentId);
    if (!s?.classId) return '';
    return classes.find((c) => c.id === s.classId)?.name || '';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="School Fees" subtitle="Fee management and payment tracking" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="School Fees" subtitle="Fee management and payment tracking"
        action={{ label: 'Record Payment', onClick: () => setPaymentDialogOpen(true) }} />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats */}
        <FeeStatCards
          totalStudents={activeStudents.length}
          totalExpected={termStats.totalExpected}
          totalCollected={termStats.totalCollected}
          totalOutstanding={termStats.totalOutstanding}
          collectionRate={termStats.collectionRate}
        />

        {/* Collection Rate */}
        {currentTerm && termStats.totalExpected > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Collection Rate — {currentTerm.name}</span>
              <span className="text-sm font-semibold">{termStats.collectionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-success rounded-full h-3 transition-all duration-500" style={{ width: `${Math.min(100, termStats.collectionRate)}%` }} />
            </div>
          </div>
        )}

        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedules">Fee Types</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
          </TabsList>

          <TabsContent value="schedules">
            <FeeScheduleManager
              feeSchedules={feeSchedules}
              terms={terms}
              classes={classes}
              currentTermId={currentTerm?.id || null}
              onCreate={createFeeSchedule}
              onDelete={deleteFeeSchedule}
            />
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Payments</h2>
                <Button size="sm" onClick={() => setPaymentDialogOpen(true)}><Wallet className="h-4 w-4 mr-1" />Record</Button>
              </div>

              {currentTermPayments.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <Wallet className="h-8 w-8 mx-auto mb-2" />
                  <p>No payments recorded{currentTerm ? ` for ${currentTerm.name}` : ''}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {currentTermPayments.map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                      <div>
                        <p className="font-medium text-sm">{getStudentName(p.studentId)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{new Date(p.paymentDate).toLocaleDateString()}</span>
                          {p.paymentMethod && <Badge variant="outline" className="text-xs capitalize">{p.paymentMethod.replace('_', ' ')}</Badge>}
                          {p.referenceNumber && <span>Ref: {p.referenceNumber}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-success">{formatMaluti(p.amount)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePayment(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="balances">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Student Balances{currentTerm ? ` — ${currentTerm.name}` : ''}</h2>
              
              {!currentTerm ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <p>Set a current term to see student balances</p>
                </div>
              ) : activeStudents.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <p>No active students</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {activeStudents.map((s, i) => {
                    const balance = getStudentBalance(s.id, currentTerm.id, s.classId);
                    return (
                      <div key={s.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                        <div>
                          <p className="font-medium text-sm">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-muted-foreground">{s.admissionNumber} · {classes.find(c => c.id === s.classId)?.name || 'Unassigned'}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn('font-semibold text-sm', balance.balance > 0 ? 'text-destructive' : 'text-success')}>
                            {balance.balance > 0 ? `${formatMaluti(balance.balance)} owing` : 'Paid up'}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatMaluti(balance.totalPaid)} / {formatMaluti(balance.totalOwed)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        students={students}
        terms={terms}
        currentTermId={currentTerm?.id || null}
        onSubmit={recordPayment}
      />
    </DashboardLayout>
  );
}

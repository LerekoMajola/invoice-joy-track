import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Receipt, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolPortalFeesProps {
  studentId: string;
  ownerId: string;
}

interface Term {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface FeePayment {
  id: string;
  term_id: string;
  amount: number;
  status: string;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  fee_type: string | null;
}

export function SchoolPortalFees({ studentId, ownerId }: SchoolPortalFeesProps) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const db = supabase as any;
      const [{ data: termsData }, { data: paymentsData }] = await Promise.all([
        db.from('academic_terms').select('*').eq('user_id', ownerId).order('start_date', { ascending: false }),
        db.from('school_fee_payments').select('*').eq('student_id', studentId),
      ]);
      setTerms((termsData as unknown as Term[]) || []);
      setPayments((paymentsData as unknown as FeePayment[]) || []);
      // Auto-expand current term
      const current = (termsData as unknown as Term[] || []).find(t => t.is_current);
      if (current) setExpandedTerm(current.id);
      setLoading(false);
    }
    load();
  }, [studentId, ownerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-foreground pt-2">Fees</h2>

      {terms.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">No fee records found.</p>
          </CardContent>
        </Card>
      ) : (
        terms.map(term => {
          const termPayments = payments.filter(p => p.term_id === term.id);
          const totalOwed = termPayments.reduce((s, p) => s + (p.amount || 0), 0);
          const totalPaid = termPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
          const balance = totalOwed - totalPaid;
          const isExpanded = expandedTerm === term.id;

          return (
            <Card key={term.id} className={term.is_current ? 'border-primary/40' : ''}>
              <CardContent className="p-0">
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setExpandedTerm(isExpanded ? null : term.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{term.name}</p>
                      {term.is_current && <Badge className="text-xs">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(term.start_date), 'dd MMM')} — {format(parseISO(term.end_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={cn('text-sm font-bold', balance > 0 ? 'text-destructive' : 'text-success')}>
                        {balance > 0 ? `Owes ${balance.toFixed(2)}` : 'Paid ✓'}
                      </p>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold">{totalOwed.toFixed(2)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-success/10">
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="text-sm font-bold text-success">{totalPaid.toFixed(2)}</p>
                      </div>
                      <div className={cn('p-2 rounded-lg', balance > 0 ? 'bg-destructive/10' : 'bg-success/10')}>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className={cn('text-sm font-bold', balance > 0 ? 'text-destructive' : 'text-success')}>
                          {balance.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {termPayments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payments</p>
                        {termPayments.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                              <div>
                                <p className="text-foreground">{p.fee_type || 'Fee'}</p>
                                {p.paid_date && <p className="text-xs text-muted-foreground">{format(parseISO(p.paid_date), 'dd MMM yyyy')}</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{p.amount.toFixed(2)}</p>
                              <Badge variant={p.status === 'paid' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                                {p.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, isBefore, isAfter, isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';

interface PaymentTrackerProps {
  subscriptionId: string;
  userId: string;
  planPrice: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type PaymentRecord = {
  id: string;
  month: string;
  amount: number;
  payment_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  status: string;
};

export function PaymentTracker({ subscriptionId, userId, planPrice }: PaymentTrackerProps) {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: planPrice.toString(),
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'bank_transfer',
    payment_reference: '',
  });

  const currentYear = new Date().getFullYear();
  const now = new Date();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['subscription-payments', subscriptionId, currentYear],
    queryFn: async () => {
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      const { data, error } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .gte('month', startDate)
        .lte('month', endDate);
      if (error) throw error;
      return (data || []) as PaymentRecord[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (monthIndex: number) => {
      const monthDate = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const existing = payments?.find(p => p.month === monthDate);

      if (existing) {
        const { error } = await supabase
          .from('subscription_payments')
          .update({
            amount: parseFloat(paymentForm.amount),
            payment_date: paymentForm.payment_date,
            payment_method: paymentForm.payment_method,
            payment_reference: paymentForm.payment_reference || null,
            status: 'paid',
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscription_payments')
          .insert({
            subscription_id: subscriptionId,
            user_id: userId,
            month: monthDate,
            amount: parseFloat(paymentForm.amount),
            payment_date: paymentForm.payment_date,
            payment_method: paymentForm.payment_method,
            payment_reference: paymentForm.payment_reference || null,
            status: 'paid',
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-payments', subscriptionId] });
      toast.success('Payment recorded');
      setSelectedMonth(null);
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    },
  });

  const getMonthStatus = (monthIndex: number): 'paid' | 'overdue' | 'due' | 'future' => {
    const monthDate = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const payment = payments?.find(p => p.month === monthDate);
    if (payment?.status === 'paid') return 'paid';

    const monthStart = new Date(currentYear, monthIndex, 1);
    if (isSameMonth(monthStart, now)) return 'due';
    if (isBefore(monthStart, now)) return 'overdue';
    return 'future';
  };

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'due': return 'bg-amber-500';
      default: return 'bg-muted-foreground/30';
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    const status = getMonthStatus(monthIndex);
    if (status === 'future') return;
    setSelectedMonth(monthIndex);
    const monthDate = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const existing = payments?.find(p => p.month === monthDate);
    setPaymentForm({
      amount: existing?.amount?.toString() || planPrice.toString(),
      payment_date: existing?.payment_date || format(new Date(), 'yyyy-MM-dd'),
      payment_method: existing?.payment_method || 'bank_transfer',
      payment_reference: existing?.payment_reference || '',
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground">{currentYear} Payment Tracker</div>
      
      <div className="grid grid-cols-6 gap-3">
        {MONTH_NAMES.map((name, i) => {
          const status = getMonthStatus(i);
          const monthDate = `${currentYear}-${String(i + 1).padStart(2, '0')}-01`;
          const payment = payments?.find(p => p.month === monthDate);
          const isFuture = status === 'future';

          return (
            <button
              key={i}
              onClick={() => handleMonthClick(i)}
              disabled={isFuture}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors ${
                selectedMonth === i
                  ? 'border-primary bg-primary/5'
                  : isFuture
                  ? 'border-transparent opacity-50 cursor-default'
                  : 'border-transparent hover:bg-muted cursor-pointer'
              }`}
            >
              <span className="text-xs font-medium">{name}</span>
              <div className={`h-3 w-3 rounded-full ${getIndicatorColor(status)} ${status === 'paid' ? 'ring-2 ring-green-200' : ''}`}>
                {status === 'paid' && <Check className="h-3 w-3 text-white" />}
              </div>
              {payment?.status === 'paid' && (
                <span className="text-[10px] text-muted-foreground">{formatMaluti(payment.amount)}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> Paid</div>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500" /> Overdue</div>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" /> Due</div>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Future</div>
      </div>

      {/* Record Payment Form */}
      {selectedMonth !== null && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="text-sm font-medium">
            Record Payment — {MONTH_NAMES[selectedMonth]} {currentYear}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Amount</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Payment Date</Label>
              <Input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm(f => ({ ...f, payment_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Method</Label>
              <Select value={paymentForm.payment_method} onValueChange={(v) => setPaymentForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reference</Label>
              <Input
                placeholder="Ref #"
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm(f => ({ ...f, payment_reference: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelectedMonth(null)}>Cancel</Button>
            <Button size="sm" onClick={() => upsertMutation.mutate(selectedMonth)} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Save Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

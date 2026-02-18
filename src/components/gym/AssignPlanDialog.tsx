import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGymMembershipPlans } from '@/hooks/useGymMembershipPlans';
import { useGymMemberSubscriptions } from '@/hooks/useGymMemberSubscriptions';
import { useCurrency } from '@/hooks/useCurrency';
import { addDays, format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

export function AssignPlanDialog({ open, onOpenChange, memberId, memberName }: Props) {
  const { plans } = useGymMembershipPlans();
  const { createSubscription } = useGymMemberSubscriptions(memberId);
  const { fc } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [amountPaid, setAmountPaid] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);

  const activePlans = plans.filter(p => p.isActive);
  const selectedPlan = activePlans.find(p => p.id === planId);

  const endDate = selectedPlan
    ? format(addDays(new Date(startDate), selectedPlan.durationDays), 'yyyy-MM-dd')
    : '';

  const handlePlanChange = (id: string) => {
    setPlanId(id);
    const plan = activePlans.find(p => p.id === id);
    if (plan) setAmountPaid(String(plan.price));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId || !startDate) return;
    setIsSubmitting(true);
    const ok = await createSubscription({
      memberId,
      planId,
      startDate,
      endDate,
      paymentStatus,
      amountPaid: parseFloat(amountPaid) || 0,
      autoRenew,
    });
    setIsSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Plan</DialogTitle>
          <DialogDescription>Assign a membership plan to {memberName}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Membership Plan *</Label>
            <Select value={planId} onValueChange={handlePlanChange}>
              <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
              <SelectContent>
                {activePlans.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} — {fc(p.price)} / {p.durationDays}d</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="date" value={endDate} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount Paid</Label>
              <Input type="number" min={0} step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="autoRenew" checked={autoRenew} onCheckedChange={v => setAutoRenew(!!v)} />
            <Label htmlFor="autoRenew" className="text-sm">Auto-renew this subscription</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !planId}>{isSubmitting ? 'Assigning...' : 'Assign Plan'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/hooks/useAdminTenants';
import { Loader2 } from 'lucide-react';

interface EditSubscriptionDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubscriptionDialog({ tenant, open, onOpenChange }: EditSubscriptionDialogProps) {
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState(tenant?.subscription?.plan || 'free_trial');
  const [status, setStatus] = useState(tenant?.subscription?.status || 'trialing');
  const [billingNote, setBillingNote] = useState(tenant?.subscription?.billing_note || '');

  const updateMutation = useMutation({
    mutationFn: async ({ userId, newPlan, newStatus }: { userId: string; newPlan: string; newStatus: string }) => {
      const updateData: Record<string, any> = { 
        plan: newPlan as 'free_trial' | 'basic' | 'standard' | 'pro' | 'custom',
        status: newStatus as 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired',
        billing_note: billingNote || null,
        updated_at: new Date().toISOString(),
      };

      // When activating from trial, set period dates
      if (newStatus === 'active') {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 30);
        updateData.current_period_start = now.toISOString();
        updateData.current_period_end = periodEnd.toISOString();
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Subscription updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    },
  });

  // Reset form when tenant changes
  useState(() => {
    if (tenant?.subscription) {
      setPlan(tenant.subscription.plan);
      setStatus(tenant.subscription.status);
    }
  });

  if (!tenant) return null;

  const handleSave = () => {
    updateMutation.mutate({
      userId: tenant.user_id,

      newPlan: plan,
      newStatus: status,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Subscription</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="text-sm text-muted-foreground mb-4">
            Editing subscription for <strong>{tenant.company_name}</strong>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free_trial">Free Trial</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="custom">Custom (Module-based)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_note">Billing Note</Label>
            <Textarea
              id="billing_note"
              placeholder="e.g. Pays M450/month via EFT"
              value={billingNote}
              onChange={(e) => setBillingNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

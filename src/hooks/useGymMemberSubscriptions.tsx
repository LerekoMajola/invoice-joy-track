import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface GymMemberSubscription {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'frozen' | 'expired' | 'cancelled';
  freezeStart: string | null;
  freezeEnd: string | null;
  freezesUsed: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  amountPaid: number;
  autoRenew: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // joined fields
  planName?: string;
  planPrice?: number;
}

export interface GymMemberSubscriptionInsert {
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  paymentStatus?: string;
  amountPaid?: number;
  autoRenew?: boolean;
  notes?: string;
}

export function useGymMemberSubscriptions(memberId?: string) {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [subscriptions, setSubscriptions] = useState<GymMemberSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async () => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.user ?? null;
  };

  const fetchSubscriptions = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) { setSubscriptions([]); setIsLoading(false); return; }

    try {
      let query = (supabase.from('gym_member_subscriptions') as any)
        .select('*, gym_membership_plans(name, price)')
        .order('created_at', { ascending: false });
      if (activeCompanyId) query = query.eq('company_profile_id', activeCompanyId);
      if (memberId) query = query.eq('member_id', memberId);
      const { data, error } = await query;
      if (error) throw error;

      setSubscriptions((data || []).map((s: any) => ({
        id: s.id,
        memberId: s.member_id,
        planId: s.plan_id,
        startDate: s.start_date,
        endDate: s.end_date,
        status: s.status,
        freezeStart: s.freeze_start,
        freezeEnd: s.freeze_end,
        freezesUsed: s.freezes_used,
        paymentStatus: s.payment_status,
        amountPaid: Number(s.amount_paid),
        autoRenew: s.auto_renew,
        notes: s.notes,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        planName: s.gym_membership_plans?.name,
        planPrice: s.gym_membership_plans ? Number(s.gym_membership_plans.price) : undefined,
      })));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, [user, activeCompanyId, memberId]);

  const createSubscription = async (sub: GymMemberSubscriptionInsert): Promise<boolean> => {
    const activeUser = await getActiveUser();
    if (!activeUser) { toast.error('You must be logged in'); return false; }

    try {
      const { error } = await (supabase.from('gym_member_subscriptions') as any).insert({
        user_id: activeUser.id,
        company_profile_id: activeCompanyId || null,
        member_id: sub.memberId,
        plan_id: sub.planId,
        start_date: sub.startDate,
        end_date: sub.endDate,
        payment_status: sub.paymentStatus || 'pending',
        amount_paid: sub.amountPaid ?? 0,
        auto_renew: sub.autoRenew ?? false,
        notes: sub.notes || null,
      });
      if (error) throw error;

      // Also set member status to active
      await (supabase.from('gym_members') as any).update({ status: 'active' }).eq('id', sub.memberId);

      await fetchSubscriptions();
      toast.success('Plan assigned successfully');
      return true;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to assign plan');
      return false;
    }
  };

  const freezeSubscription = async (id: string, freezeEnd: string): Promise<boolean> => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub) return false;

      const { error } = await (supabase.from('gym_member_subscriptions') as any).update({
        status: 'frozen',
        freeze_start: new Date().toISOString().split('T')[0],
        freeze_end: freezeEnd,
        freezes_used: sub.freezesUsed + 1,
      }).eq('id', id);
      if (error) throw error;

      // Update member status
      await (supabase.from('gym_members') as any).update({ status: 'frozen' }).eq('id', sub.memberId);

      await fetchSubscriptions();
      toast.success('Membership frozen');
      return true;
    } catch (error) {
      console.error('Error freezing subscription:', error);
      toast.error('Failed to freeze membership');
      return false;
    }
  };

  const unfreezeSubscription = async (id: string): Promise<boolean> => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub) return false;

      const { error } = await (supabase.from('gym_member_subscriptions') as any).update({
        status: 'active',
        freeze_start: null,
        freeze_end: null,
      }).eq('id', id);
      if (error) throw error;

      await (supabase.from('gym_members') as any).update({ status: 'active' }).eq('id', sub.memberId);

      await fetchSubscriptions();
      toast.success('Membership unfrozen');
      return true;
    } catch (error) {
      console.error('Error unfreezing:', error);
      toast.error('Failed to unfreeze');
      return false;
    }
  };

  const cancelSubscription = async (id: string): Promise<boolean> => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      if (!sub) return false;

      const { error } = await (supabase.from('gym_member_subscriptions') as any).update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;

      await (supabase.from('gym_members') as any).update({ status: 'cancelled' }).eq('id', sub.memberId);

      await fetchSubscriptions();
      toast.success('Membership cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error('Failed to cancel');
      return false;
    }
  };

  return { subscriptions, isLoading, createSubscription, freezeSubscription, unfreezeSubscription, cancelSubscription, refetch: fetchSubscriptions };
}

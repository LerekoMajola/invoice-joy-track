import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type SubscriptionPlan = 'free_trial' | 'basic' | 'standard' | 'pro';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';

interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

interface UsageTracking {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  clients_count: number;
  quotes_count: number;
  invoices_count: number;
  created_at: string;
  updated_at: string;
}

// Plan limits configuration
const PLAN_LIMITS = {
  free_trial: {
    clients: 10,
    quotes_per_month: 20,
    invoices_per_month: 10,
  },
  basic: {
    clients: 50,
    quotes_per_month: 100,
    invoices_per_month: 50,
  },
  standard: {
    clients: 200,
    quotes_per_month: Infinity,
    invoices_per_month: Infinity,
  },
  pro: {
    clients: Infinity,
    quotes_per_month: Infinity,
    invoices_per_month: Infinity,
  },
} as const;

export type SystemType = 'business' | 'workshop' | 'school' | 'legal' | 'hire' | 'guesthouse';

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as (Subscription & { system_type?: string }) | null;
    },
    enabled: !!user,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage_tracking', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get current period usage
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .lte('period_start', today)
        .gte('period_end', today)
        .maybeSingle();
      
      if (error) throw error;
      return data as UsageTracking | null;
    },
    enabled: !!user,
  });

  const incrementUsage = useMutation({
    mutationFn: async (field: 'clients_count' | 'quotes_count' | 'invoices_count') => {
      if (!user || !usage) return;

      const { error } = await supabase
        .from('usage_tracking')
        .update({ [field]: (usage[field] || 0) + 1 })
        .eq('id', usage.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage_tracking'] });
    },
  });

  // Get current plan limits
  const currentPlan = subscription?.plan || 'free_trial';
  const limits = PLAN_LIMITS[currentPlan];

  // Check if action is allowed
  const canCreateClient = () => {
    if (!usage || limits.clients === Infinity) return true;
    return (usage.clients_count || 0) < limits.clients;
  };

  const canCreateQuote = () => {
    if (!usage || limits.quotes_per_month === Infinity) return true;
    return (usage.quotes_count || 0) < limits.quotes_per_month;
  };

  const canCreateInvoice = () => {
    if (!usage || limits.invoices_per_month === Infinity) return true;
    return (usage.invoices_count || 0) < limits.invoices_per_month;
  };

  // Check subscription status
  const isTrialing = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';
  const isExpired = subscription?.status === 'expired' || subscription?.status === 'cancelled';
  
  const trialDaysRemaining = isTrialing && subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialExpired = isTrialing && trialDaysRemaining <= 0;

  // Determines if user needs to pay — trial expired and not active
  const needsPayment = isTrialExpired && !isActive;

  // Generate payment reference from user ID
  const paymentReference = user ? `REF-${user.id.slice(0, 8).toUpperCase()}` : '';

  // System type from subscription
  const systemType: SystemType = (subscription as any)?.system_type || 'business';

  return {
    subscription,
    usage,
    isLoading: subscriptionLoading || usageLoading,
    currentPlan,
    limits,
    canCreateClient,
    canCreateQuote,
    canCreateInvoice,
    incrementUsage: incrementUsage.mutate,
    isTrialing,
    isActive,
    isExpired,
    isTrialExpired,
    trialDaysRemaining,
    needsPayment,
    paymentReference,
    systemType,
  };
}

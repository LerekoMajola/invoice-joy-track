import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';

export interface Tenant {
  id: string;
  user_id: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
  } | null;
  usage?: {
    clients_count: number;
    quotes_count: number;
    invoices_count: number;
  } | null;
}

export function useAdminTenants() {
  const { isAdmin } = useAdminRole();

  return useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      // Fetch all company profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
      }

      // Fetch all usage tracking
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*');

      if (usageError) {
        console.error('Error fetching usage:', usageError);
      }

      // Map data together
      const tenants: Tenant[] = (profiles || []).map((profile) => {
        const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
        const usage = usageData?.find(u => u.user_id === profile.user_id);

        return {
          id: profile.id,
          user_id: profile.user_id,
          company_name: profile.company_name,
          email: profile.email,
          phone: profile.phone,
          created_at: profile.created_at,
          subscription: subscription ? {
            plan: subscription.plan,
            status: subscription.status,
            trial_ends_at: subscription.trial_ends_at,
            current_period_end: subscription.current_period_end,
          } : null,
          usage: usage ? {
            clients_count: usage.clients_count || 0,
            quotes_count: usage.quotes_count || 0,
            invoices_count: usage.invoices_count || 0,
          } : null,
        };
      });

      return tenants;
    },
    enabled: isAdmin,
  });
}

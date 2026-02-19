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
    id: string;
    plan: string;
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    system_type: string;
    billing_note: string | null;
  } | null;
  usage?: {
    clients_count: number;
    quotes_count: number;
    invoices_count: number;
  } | null;
  module_total: number;
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
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .is('deleted_at', null);

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

      // Fetch all user modules with prices
      const { data: userModulesData, error: modulesError } = await supabase
        .from('user_modules')
        .select('user_id, is_active, module:platform_modules(monthly_price)')
        .eq('is_active', true);

      if (modulesError) {
        console.error('Error fetching user modules:', modulesError);
      }

      // Calculate module totals per user
      const moduleTotals: Record<string, number> = {};
      (userModulesData || []).forEach((um: any) => {
        const price = um.module?.monthly_price || 0;
        moduleTotals[um.user_id] = (moduleTotals[um.user_id] || 0) + price;
      });

      // Group profiles by user_id to deduplicate multi-company entries
      const profilesByUser: Record<string, typeof profiles> = {};
      (profiles || []).forEach((profile) => {
        if (!profilesByUser[profile.user_id]) {
          profilesByUser[profile.user_id] = [];
        }
        profilesByUser[profile.user_id].push(profile);
      });

      // For each user_id, pick the primary/onboarded profile
      const tenants: Tenant[] = Object.entries(profilesByUser)
        .map(([userId, userProfiles]) => {
          const subscription = subscriptions?.find(s => s.user_id === userId);
          // Skip users without subscriptions — not billing customers
          if (!subscription) return null;

          // Pick the best profile: earliest created (the onboarded one), skipping "My Company" if possible
          const sorted = [...userProfiles].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const primaryProfile = sorted.find(p => p.company_name !== 'My Company') || sorted[0];

          const usage = usageData?.find(u => u.user_id === userId);

          return {
            id: primaryProfile.id,
            user_id: userId,
            company_name: primaryProfile.company_name,
            email: primaryProfile.email,
            phone: primaryProfile.phone,
            created_at: primaryProfile.created_at,
            subscription: {
              id: subscription.id,
              plan: subscription.plan,
              status: subscription.status,
              trial_ends_at: subscription.trial_ends_at,
              current_period_end: subscription.current_period_end,
              system_type: subscription.system_type || 'business',
              billing_note: (subscription as any).billing_note || null,
            },
            usage: usage ? {
              clients_count: usage.clients_count || 0,
              quotes_count: usage.quotes_count || 0,
              invoices_count: usage.invoices_count || 0,
            } : null,
            module_total: moduleTotals[userId] || 0,
          } as Tenant;
        })
        .filter((t): t is Tenant => t !== null);

      return tenants;
    },
    enabled: isAdmin,
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdminRole } from './useAdminRole';

export interface AdminSignup {
  id: string;
  email: string;
  system_type: string;
  onboarded: boolean;
  company_name: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  created_at: string;
}

export function useAdminSignups() {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();

  return useQuery({
    queryKey: ['admin-signups'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-signups');
      if (error) throw error;
      return data as AdminSignup[];
    },
    enabled: !!user && isAdmin,
  });
}

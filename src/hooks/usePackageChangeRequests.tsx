import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PackageChangeRequest {
  id: string;
  user_id: string;
  company_name: string;
  current_tier_id: string | null;
  requested_tier_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export function usePackageChangeRequests(adminMode = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['package-change-requests', adminMode ? 'admin' : user?.id],
    queryFn: async () => {
      let query = supabase
        .from('package_change_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!adminMode) {
        query = query.eq('user_id', user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as PackageChangeRequest[];
    },
    enabled: !!user,
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const hasPendingRequest = pendingRequests.length > 0;

  const submitRequest = useMutation({
    mutationFn: async (params: { companyName: string; currentTierId: string | null; requestedTierId: string }) => {
      const { error } = await supabase.from('package_change_requests' as any).insert({
        user_id: user!.id,
        company_name: params.companyName,
        current_tier_id: params.currentTierId,
        requested_tier_id: params.requestedTierId,
        status: 'pending',
      } as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['package-change-requests'] }),
  });

  const updateRequest = useMutation({
    mutationFn: async (params: { id: string; status: 'approved' | 'rejected'; adminNote?: string }) => {
      const { error } = await supabase
        .from('package_change_requests' as any)
        .update({ status: params.status, admin_note: params.adminNote || null } as any)
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['package-change-requests'] }),
  });

  return { requests, pendingRequests, hasPendingRequest, isLoading, submitRequest, updateRequest };
}

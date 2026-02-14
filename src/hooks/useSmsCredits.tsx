import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useSmsCredits(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = targetUserId || user?.id;
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const { data: credits, isLoading } = useQuery({
    queryKey: ['sms-credits', userId, currentMonth],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('sms_credits')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: smsLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['sms-logs', userId, currentMonth],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('sms_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', currentMonth)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const updateCredits = useMutation({
    mutationFn: async ({ allocatedCredits }: { allocatedCredits: number }) => {
      if (!userId) throw new Error('No user');
      
      // Upsert credits for current month
      const { error } = await supabase
        .from('sms_credits')
        .upsert(
          { user_id: userId, month: currentMonth, credits_allocated: allocatedCredits, credits_used: credits?.credits_used || 0 },
          { onConflict: 'user_id,month' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-credits', userId] });
    },
  });

  return {
    credits,
    isLoading,
    smsLogs,
    logsLoading,
    creditsRemaining: (credits?.credits_allocated || 0) - (credits?.credits_used || 0),
    creditsAllocated: credits?.credits_allocated || 0,
    creditsUsed: credits?.credits_used || 0,
    updateCredits,
  };
}

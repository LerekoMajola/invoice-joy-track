import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';

export interface AdminLeadStats {
  totalLeads: number;
  wonCount: number;
  lostCount: number;
  activeCount: number;
  totalPipelineValue: number;
  conversionRate: number;
}

export function useAdminLeadStats() {
  const { isAdmin } = useAdminRole();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-lead-stats'],
    queryFn: async (): Promise<AdminLeadStats> => {
      const { data, error } = await supabase
        .from('leads')
        .select('status, estimated_value');

      if (error) {
        console.error('Error fetching lead stats:', error);
        return { totalLeads: 0, wonCount: 0, lostCount: 0, activeCount: 0, totalPipelineValue: 0, conversionRate: 0 };
      }

      const leads = data || [];
      const totalLeads = leads.length;
      const wonCount = leads.filter(l => l.status === 'won').length;
      const lostCount = leads.filter(l => l.status === 'lost').length;
      const active = leads.filter(l => l.status !== 'won' && l.status !== 'lost');
      const activeCount = active.length;
      const totalPipelineValue = active.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
      const conversionRate = wonCount + lostCount > 0
        ? (wonCount / (wonCount + lostCount)) * 100
        : 0;

      return { totalLeads, wonCount, lostCount, activeCount, totalPipelineValue, conversionRate };
    },
    enabled: isAdmin,
  });

  return {
    stats: stats ?? { totalLeads: 0, wonCount: 0, lostCount: 0, activeCount: 0, totalPipelineValue: 0, conversionRate: 0 },
    loading: isLoading,
  };
}

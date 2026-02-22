import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantUsage {
  userId: string;
  companyName: string;
  systemType: string;
  invoices: number;
  quotes: number;
  clients: number;
  tasks: number;
  leads: number;
  staff: number;
  jobCards: number;
  legalCases: number;
  gymMembers: number;
  lastActive: string | null;
  engagementScore: number;
  engagement: 'high' | 'medium' | 'low' | 'inactive';
}

export interface UsageAnalyticsData {
  tenantUsage: TenantUsage[];
  featurePopularity: Record<string, number>;
  monthlyActivity: { month: string; count: number }[];
  moduleAdoption: Record<string, number>;
  summary: {
    totalRecords: number;
    totalTenants: number;
    activeTenants: number;
  };
}

export function useAdminUsageAnalytics() {
  return useQuery<UsageAnalyticsData>({
    queryKey: ['admin-usage-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-usage-analytics');
      if (error) throw error;
      return data as UsageAnalyticsData;
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';

const PLAN_PRICES: Record<string, number> = {
  free_trial: 0,
  basic: 300,
  standard: 500,
  pro: 800,
};

export interface SystemBreakdown {
  system_type: string;
  total: number;
  active: number;
  trialing: number;
  expired: number;
}

export interface AdminStats {
  totalTenants: number;
  mrr: number;
  activeTrials: number;
  activeSubscriptions: number;
  trialConversionRate: number;
  totalInvoices: number;
  totalRevenue: number;
  recentSignups: number;
  signupsByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  systemBreakdown: SystemBreakdown[];
}

export function useAdminStats() {
  const { isAdmin } = useAdminRole();

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch all company profiles for tenant count
      const { data: profiles, error: profilesError } = await supabase
        .from('company_profiles')
        .select('id, created_at');

      if (profilesError) throw profilesError;

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Fetch all invoices for revenue
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, total, created_at, status');

      if (invoicesError) throw invoicesError;

      // Calculate stats
      const totalTenants = profiles?.length || 0;
      
      const activeTrials = subscriptions?.filter(s => s.status === 'trialing').length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
      
      // Calculate MRR from active subscriptions
      const mrr = subscriptions
        ?.filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (PLAN_PRICES[s.plan] || 0), 0) || 0;

      // Trial conversion rate
      const totalPastTrials = subscriptions?.filter(s => 
        s.status === 'active' || s.status === 'cancelled' || s.status === 'expired'
      ).length || 0;
      const trialConversionRate = totalPastTrials > 0 
        ? (activeSubscriptions / totalPastTrials) * 100 
        : 0;

      // Total invoices and revenue
      const totalInvoices = invoices?.length || 0;
      const totalRevenue = invoices
        ?.filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

      // Recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = profiles?.filter(p => 
        new Date(p.created_at) >= thirtyDaysAgo
      ).length || 0;

      // Signups by month (last 6 months)
      const signupsByMonth = getMonthlyData(profiles || [], 'created_at', 6);

      // Revenue by month (last 6 months)
      const revenueByMonth = getMonthlyRevenue(invoices || [], 6);

      // System type breakdown
      const systemMap = new Map<string, { total: number; active: number; trialing: number; expired: number }>();
      for (const sub of subscriptions || []) {
        const st = (sub as any).system_type || 'business';
        if (!systemMap.has(st)) systemMap.set(st, { total: 0, active: 0, trialing: 0, expired: 0 });
        const entry = systemMap.get(st)!;
        entry.total++;
        if (sub.status === 'active') entry.active++;
        else if (sub.status === 'trialing') entry.trialing++;
        else entry.expired++;
      }
      const systemBreakdown: SystemBreakdown[] = Array.from(systemMap.entries())
        .map(([system_type, counts]) => ({ system_type, ...counts }))
        .sort((a, b) => b.total - a.total);

      return {
        totalTenants,
        mrr,
        activeTrials,
        activeSubscriptions,
        trialConversionRate,
        totalInvoices,
        totalRevenue,
        recentSignups,
        signupsByMonth,
        revenueByMonth,
        systemBreakdown,
      };
    },
    enabled: isAdmin,
  });
}

function getMonthlyData(
  items: { created_at: string }[], 
  dateField: string, 
  months: number
): { month: string; count: number }[] {
  const result: { month: string; count: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    const count = items.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate.getMonth() === date.getMonth() && 
             itemDate.getFullYear() === date.getFullYear();
    }).length;

    result.push({ month: monthStr, count });
  }

  return result;
}

function getMonthlyRevenue(
  invoices: { created_at: string; total: number | null; status: string | null }[], 
  months: number
): { month: string; revenue: number }[] {
  const result: { month: string; revenue: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    const revenue = invoices
      .filter(inv => {
        if (inv.status !== 'paid') return false;
        const invDate = new Date(inv.created_at);
        return invDate.getMonth() === date.getMonth() && 
               invDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    result.push({ month: monthStr, revenue });
  }

  return result;
}

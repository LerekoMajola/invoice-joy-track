import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';

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
  totalSubscriptions: number;
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
      // Fetch all data in parallel
      const [profilesRes, subsRes, userModulesRes] = await Promise.all([
        supabase.from('company_profiles').select('id, created_at'),
        supabase.from('subscriptions').select('*'),
        supabase.from('user_modules')
          .select('user_id, is_active, module:platform_modules(monthly_price)')
          .eq('is_active', true),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (subsRes.error) throw subsRes.error;
      if (userModulesRes.error) throw userModulesRes.error;

      const profiles = profilesRes.data || [];
      const subscriptions = subsRes.data || [];
      const userModulesData = userModulesRes.data || [];

      // Build user_id -> monthly_total map from active modules
      const moduleTotals: Record<string, number> = {};
      for (const um of userModulesData) {
        const price = (um.module as any)?.monthly_price || 0;
        moduleTotals[um.user_id] = (moduleTotals[um.user_id] || 0) + price;
      }

      const totalTenants = profiles.length;
      const activeTrials = subscriptions.filter(s => s.status === 'trialing').length;
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

      // MRR: sum module totals for active subscriptions
      const mrr = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (moduleTotals[s.user_id] || 0), 0);

      // Trial conversion: of all subs whose trial has ended, how many are now active
      const now = new Date();
      const trialEnded = subscriptions.filter(s => 
        s.trial_ends_at && new Date(s.trial_ends_at) < now
      );
      const convertedFromTrial = trialEnded.filter(s => s.status === 'active').length;
      const trialConversionRate = trialEnded.length > 0 
        ? (convertedFromTrial / trialEnded.length) * 100 
        : 0;

      // Total revenue: each tenant's module total × months active
      const paidSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'cancelled' || s.status === 'expired');
      const totalSubscriptions = paidSubs.length;

      const totalRevenue = paidSubs.reduce((sum, sub) => {
        const monthlyPrice = moduleTotals[sub.user_id] || 0;
        if (monthlyPrice === 0) return sum;
        const start = sub.current_period_start ? new Date(sub.current_period_start) : new Date(sub.created_at);
        const end = sub.status === 'active' ? now : (sub.current_period_end ? new Date(sub.current_period_end) : now);
        const monthsActive = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        return sum + (monthlyPrice * monthsActive);
      }, 0);

      // Recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = profiles.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;

      // Signups by month (last 6 months)
      const signupsByMonth = getMonthlyData(profiles, 6);

      // Revenue by month (last 6 months)
      const revenueByMonth = getMonthlySubscriptionRevenue(subscriptions, moduleTotals, 6);

      // System type breakdown
      const systemMap = new Map<string, { total: number; active: number; trialing: number; expired: number }>();
      for (const sub of subscriptions) {
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
        totalSubscriptions,
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
  months: number
): { month: string; count: number }[] {
  const result: { month: string; count: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const count = items.filter(item => {
      const d = new Date(item.created_at);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    result.push({ month: monthStr, count });
  }
  return result;
}

function getMonthlySubscriptionRevenue(
  subscriptions: any[],
  moduleTotals: Record<string, number>,
  months: number
): { month: string; revenue: number }[] {
  const result: { month: string; revenue: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthStr = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const revenue = subscriptions.reduce((sum, sub) => {
      const price = moduleTotals[sub.user_id] || 0;
      if (price === 0) return sum;
      const subStart = sub.current_period_start ? new Date(sub.current_period_start) : new Date(sub.created_at);
      const subEnd = sub.status === 'active' ? now : (sub.current_period_end ? new Date(sub.current_period_end) : now);
      if (subStart <= monthEnd && subEnd >= monthStart) {
        return sum + price;
      }
      return sum;
    }, 0);

    result.push({ month: monthStr, revenue });
  }
  return result;
}

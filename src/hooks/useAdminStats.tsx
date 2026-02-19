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
      const [profilesRes, subsRes, userModulesRes, subPaymentsRes, adminInvoicesRes] = await Promise.all([
        supabase.from('company_profiles').select('id, user_id, created_at').is('deleted_at', null),
        supabase.from('subscriptions').select('*').is('deleted_at', null),
        supabase.from('user_modules')
          .select('user_id, is_active, module:platform_modules(monthly_price)')
          .eq('is_active', true),
        supabase.from('subscription_payments').select('amount, status, month'),
        supabase.from('admin_invoices').select('total, status, payment_date').eq('status', 'paid'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (subsRes.error) throw subsRes.error;
      if (userModulesRes.error) throw userModulesRes.error;

      const profiles = profilesRes.data || [];
      const subscriptions = subsRes.data || [];
      const userModulesData = userModulesRes.data || [];
      const subPayments = subPaymentsRes.data || [];
      const adminInvoices = adminInvoicesRes.data || [];

      // Deduplicate profiles by user_id (keep earliest created_at per user)
      const uniqueUserProfiles = new Map<string, { user_id: string; created_at: string }>();
      for (const p of profiles) {
        const existing = uniqueUserProfiles.get(p.user_id);
        if (!existing || new Date(p.created_at) < new Date(existing.created_at)) {
          uniqueUserProfiles.set(p.user_id, p);
        }
      }
      const uniqueProfiles = Array.from(uniqueUserProfiles.values());

      // Build user_id -> monthly_total map from active modules
      const moduleTotals: Record<string, number> = {};
      for (const um of userModulesData) {
        const price = (um.module as any)?.monthly_price || 0;
        moduleTotals[um.user_id] = (moduleTotals[um.user_id] || 0) + price;
      }

      const totalTenants = uniqueProfiles.length;
      const activeTrials = subscriptions.filter(s => s.status === 'trialing').length;
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

      // MRR: actual collected payments for the current month from subscription_payments
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const mrr = subPayments
        .filter(p => p.status === 'paid' && p.month === currentMonthStr)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Trial conversion: of all subs whose trial has ended, how many are now active
      const trialEnded = subscriptions.filter(s =>
        s.trial_ends_at && new Date(s.trial_ends_at) < now
      );
      const convertedFromTrial = trialEnded.filter(s => s.status === 'active').length;
      const trialConversionRate = trialEnded.length > 0
        ? (convertedFromTrial / trialEnded.length) * 100
        : 0;

      const paidSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'cancelled' || s.status === 'expired');
      const totalSubscriptions = paidSubs.length;

      // Total (Platform) Revenue: only actual confirmed payments from admin_invoices (paid) + subscription_payments (paid)
      const adminInvoiceRevenue = adminInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const subPaymentRevenue = subPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalRevenue = adminInvoiceRevenue + subPaymentRevenue;

      // Recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = uniqueProfiles.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;

      // Signups by month (last 6 months) — using deduplicated profiles
      const signupsByMonth = getMonthlyData(uniqueProfiles, 6);

      // Revenue by month (last 6 months) — from actual payments only
      const revenueByMonth = getMonthlyActualRevenue(subPayments, adminInvoices, 6);

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

function getMonthlyActualRevenue(
  subPayments: { amount: number; status: string; month: string }[],
  adminInvoices: { total: number; status: string; payment_date: string | null }[],
  months: number
): { month: string; revenue: number }[] {
  const result: { month: string; revenue: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

    // Confirmed subscription payments for this month
    const subRev = subPayments
      .filter(p => p.status === 'paid' && p.month === monthKey)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Paid admin invoices for this month
    const invRev = adminInvoices
      .filter(inv => {
        if (!inv.payment_date) return false;
        const d = new Date(inv.payment_date);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    result.push({ month: monthStr, revenue: subRev + invRev });
  }
  return result;
}

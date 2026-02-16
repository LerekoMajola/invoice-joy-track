import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { useExpenses } from './useExpenses';
import { useBankAccounts } from './useBankAccounts';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface AccountingStats {
  totalRevenue: number;
  totalExpenses: number;
  payrollCosts: number;
  netCashFlow: number;
  cashOnHand: number;
  outstandingInvoices: number;
}

export function useAccountingStats(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const { paidExpenses, totalPaid: expensesPaid } = useExpenses();
  const { totalBalance } = useBankAccounts();

  // Default to current month
  const periodStart = startDate || startOfMonth(new Date());
  const periodEnd = endDate || endOfMonth(new Date());
  const startStr = format(periodStart, 'yyyy-MM-dd');
  const endStr = format(periodEnd, 'yyyy-MM-dd');

  // Fetch paid invoices for the period
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-for-stats', user?.id, activeCompanyId, startStr, endStr],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const filters: Record<string, string> = { user_id: user.id };
      if (activeCompanyId) filters.company_profile_id = activeCompanyId;

      const { data, error } = await supabase
        .from('invoices')
        .select('id, total, status, date')
        .match(filters)
        .gte('date', startStr)
        .lte('date', endStr);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch paid payslips for the period
  const { data: payslips = [] } = useQuery({
    queryKey: ['payslips-for-stats', user?.id, activeCompanyId, startStr, endStr],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const filters: Record<string, string> = { owner_user_id: user.id };
      if (activeCompanyId) filters.company_profile_id = activeCompanyId;

      const { data, error } = await supabase
        .from('payslips')
        .select('id, net_pay, status, payment_date')
        .match(filters)
        .gte('payment_date', startStr)
        .lte('payment_date', endStr);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const stats = useMemo<AccountingStats>(() => {
    // Revenue from paid invoices
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    
    // Outstanding invoices
    const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
    const outstandingInvoices = unpaidInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    
    // Payroll costs
    const paidPayslips = payslips.filter(p => p.status === 'paid');
    const payrollCosts = paidPayslips.reduce((sum, p) => sum + Number(p.net_pay || 0), 0);
    
    // Filter expenses in period
    const periodExpenses = paidExpenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate >= periodStart && expDate <= periodEnd;
    });
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Net cash flow
    const netCashFlow = totalRevenue - totalExpenses - payrollCosts;
    
    return {
      totalRevenue,
      totalExpenses,
      payrollCosts,
      netCashFlow,
      cashOnHand: totalBalance,
      outstandingInvoices,
    };
  }, [invoices, payslips, paidExpenses, totalBalance, periodStart, periodEnd]);

  // Expense breakdown by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, { name: string; total: number; color: string }>();
    
    paidExpenses.forEach(expense => {
      const categoryName = expense.category?.name || 'Uncategorized';
      const color = expense.category?.color || 'gray';
      const existing = categoryMap.get(categoryName);
      
      if (existing) {
        existing.total += Number(expense.amount);
      } else {
        categoryMap.set(categoryName, { name: categoryName, total: Number(expense.amount), color });
      }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }, [paidExpenses]);

  return {
    stats,
    expensesByCategory,
    periodStart,
    periodEnd,
  };
}

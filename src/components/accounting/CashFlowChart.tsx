import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { formatMaluti } from '@/lib/currency';

export function CashFlowChart() {
  const { user } = useAuth();

  // Get last 6 months of data
  const months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      result.push({
        month: format(date, 'MMM'),
        start: format(startOfMonth(date), 'yyyy-MM-dd'),
        end: format(endOfMonth(date), 'yyyy-MM-dd'),
      });
    }
    return result;
  }, []);

  const { data: invoiceData = [] } = useQuery({
    queryKey: ['invoice-cash-flow', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const sixMonthsAgo = format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('invoices')
        .select('total, status, date')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('date', sixMonthsAgo);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: expenseData = [] } = useQuery({
    queryKey: ['expense-cash-flow', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const sixMonthsAgo = format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, status, date')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('date', sixMonthsAgo);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const chartData = useMemo(() => {
    return months.map((m) => {
      const monthInvoices = invoiceData.filter(
        (i) => i.date >= m.start && i.date <= m.end
      );
      const monthExpenses = expenseData.filter(
        (e) => e.date >= m.start && e.date <= m.end
      );
      
      const income = monthInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
      const expenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      
      return {
        month: m.month,
        income,
        expenses,
      };
    });
  }, [months, invoiceData, expenseData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis 
          className="text-xs"
          tickFormatter={(value) => `M${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatMaluti(value),
            name === 'income' ? 'Income' : 'Expenses',
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

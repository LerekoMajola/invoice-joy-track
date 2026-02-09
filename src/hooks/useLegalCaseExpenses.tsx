import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface LegalCaseExpense {
  id: string;
  caseId: string;
  date: string;
  amount: number;
  description: string;
  expenseType: string;
  isBillable: boolean;
  isInvoiced: boolean;
  invoiceId: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export function useLegalCaseExpenses(caseId?: string) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<LegalCaseExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = async () => {
    if (!user) { setExpenses([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('legal_case_expenses').select('*').order('date', { ascending: false });
      if (caseId) query = query.eq('case_id', caseId);
      const { data, error } = await query;
      if (error) throw error;
      setExpenses((data || []).map(e => ({
        id: e.id,
        caseId: e.case_id,
        date: e.date,
        amount: Number(e.amount),
        description: e.description,
        expenseType: e.expense_type,
        isBillable: e.is_billable ?? true,
        isInvoiced: e.is_invoiced ?? false,
        invoiceId: e.invoice_id,
        receiptUrl: e.receipt_url,
        createdAt: e.created_at,
      })));
    } catch (error) {
      console.error('Error fetching case expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [user, caseId]);

  const createExpense = async (expense: Omit<LegalCaseExpense, 'id' | 'createdAt' | 'isInvoiced' | 'invoiceId'>) => {
    if (!user) return false;
    const { error } = await supabase.from('legal_case_expenses').insert({
      user_id: user.id,
      case_id: expense.caseId,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      expense_type: expense.expenseType,
      is_billable: expense.isBillable,
      receipt_url: expense.receiptUrl,
    });
    if (error) { toast.error('Failed to add expense'); return false; }
    toast.success('Expense added');
    fetchExpenses();
    return true;
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('legal_case_expenses').delete().eq('id', id);
    if (error) { toast.error('Failed to delete expense'); return false; }
    toast.success('Expense deleted');
    fetchExpenses();
    return true;
  };

  return { expenses, isLoading, refetch: fetchExpenses, createExpense, deleteExpense };
}

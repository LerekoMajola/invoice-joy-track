import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';

export interface AccountingTransaction {
  id: string;
  user_id: string;
  bank_account_id: string | null;
  transaction_type: string;
  reference_type: string | null;
  reference_id: string | null;
  date: string;
  amount: number;
  running_balance: number | null;
  description: string | null;
  is_reconciled: boolean;
  reconciled_at: string | null;
  created_at: string;
  bank_account?: {
    account_name: string;
    bank_name: string | null;
  } | null;
}

export interface CreateTransactionData {
  bank_account_id?: string | null;
  transaction_type: string;
  reference_type?: string | null;
  reference_id?: string | null;
  date: string;
  amount: number;
  description?: string | null;
  is_reconciled?: boolean;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  transactionType?: string;
  bankAccountId?: string;
  isReconciled?: boolean | null;
  search?: string;
}

export function useAccountingTransactions() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionFilters>({});

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['accounting-transactions', user?.id, activeCompanyId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('accounting_transactions')
        .select(`
          *,
          bank_account:bank_accounts(account_name, bank_name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map((t) => ({
        ...t,
        amount: Number(t.amount),
        running_balance: t.running_balance ? Number(t.running_balance) : null,
        is_reconciled: t.is_reconciled ?? false,
      })) as AccountingTransaction[];
    },
    enabled: !!user?.id,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.dateFrom && t.date < filters.dateFrom) return false;
      if (filters.dateTo && t.date > filters.dateTo) return false;
      if (filters.transactionType && filters.transactionType !== 'all' && t.transaction_type !== filters.transactionType) return false;
      if (filters.bankAccountId && filters.bankAccountId !== 'all' && t.bank_account_id !== filters.bankAccountId) return false;
      if (filters.isReconciled !== null && filters.isReconciled !== undefined) {
        if (t.is_reconciled !== filters.isReconciled) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchRef = t.reference_id?.toLowerCase().includes(q);
        const matchBank = t.bank_account?.account_name?.toLowerCase().includes(q);
        if (!matchDesc && !matchRef && !matchBank) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const totalInflows = useMemo(
    () => filteredTransactions.filter((t) => t.transaction_type === 'income').reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  const totalOutflows = useMemo(
    () => filteredTransactions.filter((t) => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  const netFlow = totalInflows - totalOutflows;

  const createTransaction = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: txn, error } = await supabase
        .from('accounting_transactions')
        .insert({ ...data, user_id: user.id, company_profile_id: activeCompanyId || null })
        .select()
        .single();

      if (error) throw error;

      // Update bank account balance if linked
      if (data.bank_account_id) {
        const { data: bankAccount } = await supabase
          .from('bank_accounts')
          .select('current_balance')
          .eq('id', data.bank_account_id)
          .single();

        if (bankAccount) {
          const currentBalance = Number(bankAccount.current_balance) || 0;
          const newBalance =
            data.transaction_type === 'income'
              ? currentBalance + data.amount
              : currentBalance - data.amount;

          await supabase
            .from('bank_accounts')
            .update({ current_balance: newBalance })
            .eq('id', data.bank_account_id);
        }
      }

      return txn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({ title: 'Transaction recorded' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error recording transaction', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      // Get the transaction first to reverse the balance
      const txn = transactions.find((t) => t.id === id);

      const { error } = await supabase
        .from('accounting_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reverse the bank account balance
      if (txn?.bank_account_id) {
        const { data: bankAccount } = await supabase
          .from('bank_accounts')
          .select('current_balance')
          .eq('id', txn.bank_account_id)
          .single();

        if (bankAccount) {
          const currentBalance = Number(bankAccount.current_balance) || 0;
          const newBalance =
            txn.transaction_type === 'income'
              ? currentBalance - txn.amount
              : currentBalance + txn.amount;

          await supabase
            .from('bank_accounts')
            .update({ current_balance: newBalance })
            .eq('id', txn.bank_account_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({ title: 'Transaction deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting transaction', description: error.message, variant: 'destructive' });
    },
  });

  const toggleReconciled = useMutation({
    mutationFn: async ({ id, reconciled }: { id: string; reconciled: boolean }) => {
      const { error } = await supabase
        .from('accounting_transactions')
        .update({
          is_reconciled: reconciled,
          reconciled_at: reconciled ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-transactions'] });
      toast({ title: 'Reconciliation updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating reconciliation', description: error.message, variant: 'destructive' });
    },
  });

  const bulkReconcile = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('accounting_transactions')
        .update({
          is_reconciled: true,
          reconciled_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-transactions'] });
      toast({ title: 'Transactions reconciled' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error reconciling transactions', description: error.message, variant: 'destructive' });
    },
  });

  return {
    transactions,
    filteredTransactions,
    isLoading,
    filters,
    setFilters,
    totalInflows,
    totalOutflows,
    netFlow,
    createTransaction,
    deleteTransaction,
    toggleReconciled,
    bulkReconcile,
  };
}

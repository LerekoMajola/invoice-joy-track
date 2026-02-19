import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from '@/hooks/use-toast';

export interface BankAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_number: string | null;
  bank_name: string | null;
  account_type: string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountData {
  account_name: string;
  account_number?: string | null;
  bank_name?: string | null;
  account_type?: string;
  currency?: string;
  opening_balance?: number;
  current_balance?: number;
  is_primary?: boolean;
  is_active?: boolean;
}

export function useBankAccounts() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bank-accounts', user?.id, activeCompanyId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('account_name');

      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user?.id,
  });

  const createAccount = useMutation({
    mutationFn: async (data: CreateBankAccountData) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // If this is primary, unset other primary accounts
      if (data.is_primary) {
        await supabase
          .from('bank_accounts')
          .update({ is_primary: false })
          .eq('user_id', user.id);
      }
      
      const { data: account, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...data,
          user_id: user.id,
          company_profile_id: activeCompanyId || null,
          current_balance: data.opening_balance || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({ title: 'Bank account added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding account', description: error.message, variant: 'destructive' });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateBankAccountData> & { id: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // If setting as primary, unset other primary accounts
      if (data.is_primary) {
        await supabase
          .from('bank_accounts')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }
      
      const { data: account, error } = await supabase
        .from('bank_accounts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({ title: 'Bank account updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating account', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({ title: 'Bank account deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting account', description: error.message, variant: 'destructive' });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('bank-accounts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bank_accounts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const activeAccounts = accounts.filter(a => a.is_active);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
  const primaryAccount = accounts.find(a => a.is_primary);

  return {
    accounts,
    activeAccounts,
    totalBalance,
    primaryAccount,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}

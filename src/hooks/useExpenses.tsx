import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_system: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  bank_account_id: string | null;
  date: string;
  amount: number;
  currency: string;
  vendor_name: string | null;
  description: string;
  reference_number: string | null;
  receipt_url: string | null;
  is_recurring: boolean;
  recurring_frequency: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface CreateExpenseData {
  category_id?: string | null;
  bank_account_id?: string | null;
  date: string;
  amount: number;
  vendor_name?: string | null;
  description: string;
  reference_number?: string | null;
  receipt_url?: string | null;
  is_recurring?: boolean;
  recurring_frequency?: string | null;
  payment_method?: string | null;
  status?: string;
}

const DEFAULT_CATEGORIES = [
  { name: 'Office Supplies', icon: 'package', color: 'blue' },
  { name: 'Travel', icon: 'plane', color: 'purple' },
  { name: 'Utilities', icon: 'zap', color: 'yellow' },
  { name: 'Marketing', icon: 'megaphone', color: 'pink' },
  { name: 'Professional Services', icon: 'briefcase', color: 'indigo' },
  { name: 'Equipment', icon: 'monitor', color: 'gray' },
  { name: 'Rent', icon: 'building', color: 'amber' },
  { name: 'Insurance', icon: 'shield', color: 'green' },
  { name: 'Maintenance', icon: 'wrench', color: 'orange' },
  { name: 'Payroll', icon: 'users', color: 'sky', is_system: true },
  { name: 'Miscellaneous', icon: 'folder', color: 'slate' },
];

export function useExpenseCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['expense-categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      // If no categories exist, seed defaults
      if (data.length === 0) {
        const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
          user_id: user.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          is_system: cat.is_system || false,
        }));
        
        const { data: seeded, error: seedError } = await supabase
          .from('expense_categories')
          .insert(categoriesToInsert)
          .select();
        
        if (seedError) throw seedError;
        return seeded as ExpenseCategory[];
      }
      
      return data as ExpenseCategory[];
    },
    enabled: !!user?.id,
  });

  const createCategory = useMutation({
    mutationFn: async (data: { name: string; icon?: string; color?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: category, error } = await supabase
        .from('expense_categories')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast({ title: 'Category created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
    },
  });

  return { categories, isLoading, createCategory };
}

export function useExpenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user?.id,
  });

  const createExpense = useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: expense, error } = await supabase
        .from('expenses')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Expense created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating expense', description: error.message, variant: 'destructive' });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateExpenseData> & { id: string }) => {
      const { data: expense, error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Expense updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating expense', description: error.message, variant: 'destructive' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Expense deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting expense', description: error.message, variant: 'destructive' });
    },
  });

  const paidExpenses = expenses.filter(e => e.status === 'paid');
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const totalPaid = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPending = pendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    expenses,
    paidExpenses,
    pendingExpenses,
    totalPaid,
    totalPending,
    isLoading,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}

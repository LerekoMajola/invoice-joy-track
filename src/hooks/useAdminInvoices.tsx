import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';
import { toast } from 'sonner';

export interface AdminInvoice {
  id: string;
  tenant_user_id: string;
  company_profile_id: string | null;
  invoice_number: string;
  company_name: string;
  tenant_email: string | null;
  line_items: { description: string; quantity: number; unit_price: number }[];
  subtotal: number;
  tax_rate: number;
  total: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  payment_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  email_sent_at?: string | null;
  email_sent_to?: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminInvoices() {
  const { isAdmin } = useAdminRole();
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AdminInvoice[];
    },
    enabled: isAdmin,
  });

  const generateNextNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('admin_invoices')
      .select('invoice_number')
      .order('invoice_number', { ascending: false })
      .limit(1);

    let nextNum = 1001;
    if (data && data.length > 0) {
      const match = data[0].invoice_number.match(/ORN-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    return `ORN-${nextNum}`;
  };

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<AdminInvoice, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('admin_invoices')
        .insert(invoice as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AdminInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Invoice created');
    },
    onError: (err) => {
      console.error('Create invoice error:', err);
      toast.error('Failed to create invoice');
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminInvoice> & { id: string }) => {
      const { error } = await supabase
        .from('admin_invoices')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Invoice updated');
    },
    onError: (err) => {
      console.error('Update invoice error:', err);
      toast.error('Failed to update invoice');
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Invoice deleted');
    },
    onError: (err) => {
      console.error('Delete invoice error:', err);
      toast.error('Failed to delete invoice');
    },
  });

  const recordPayment = useMutation({
    mutationFn: async ({ id, payment_date, payment_method, payment_reference }: {
      id: string; payment_date: string; payment_method: string; payment_reference?: string;
    }) => {
      const { error } = await supabase
        .from('admin_invoices')
        .update({
          status: 'paid',
          payment_date,
          payment_method,
          payment_reference: payment_reference || null,
        } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Payment recorded');
    },
    onError: (err) => {
      console.error('Record payment error:', err);
      toast.error('Failed to record payment');
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    generateNextNumber,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
  };
}

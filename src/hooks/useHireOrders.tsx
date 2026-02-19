import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface HireOrder {
  id: string;
  user_id: string;
  order_number: string;
  client_id: string | null;
  client_name: string;
  client_phone: string | null;
  hire_start: string;
  hire_end: string;
  actual_return_date: string | null;
  status: string;
  deposit_paid: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HireOrderItem {
  id: string;
  hire_order_id: string;
  equipment_item_id: string | null;
  equipment_name: string;
  daily_rate: number;
  quantity: number;
  subtotal: number;
  condition_out: string | null;
  condition_in: string | null;
  damage_notes: string | null;
  damage_charge: number;
  created_at: string;
}

export interface CreateHireOrderInput {
  client_name: string;
  client_id?: string;
  client_phone?: string;
  hire_start: string;
  hire_end: string;
  deposit_paid?: number;
  total?: number;
  notes?: string;
  items: {
    equipment_item_id?: string;
    equipment_name: string;
    daily_rate: number;
    quantity: number;
    subtotal: number;
    condition_out?: string;
  }[];
}

export interface ProcessReturnInput {
  orderId: string;
  actualReturnDate: string;
  items: {
    id: string;
    condition_in: string;
    damage_notes: string | null;
    damage_charge: number;
  }[];
  adjustedTotal: number;
}

export function useHireOrders() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['hire-orders', user?.id, activeCompanyId],
    queryFn: async () => {
      let query = supabase.from('hire_orders').select('*').order('created_at', { ascending: false });
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as HireOrder[];
    },
    enabled: !!user,
  });

  // Fetch all order items (for calendar view)
  const { data: allOrderItems = [] } = useQuery({
    queryKey: ['hire-order-items-all', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hire_order_items')
        .select('*');
      if (error) throw error;
      return data as HireOrderItem[];
    },
    enabled: !!user,
  });

  const getOrderItems = async (orderId: string): Promise<HireOrderItem[]> => {
    const { data, error } = await supabase
      .from('hire_order_items')
      .select('*')
      .eq('hire_order_id', orderId);
    if (error) throw error;
    return data as HireOrderItem[];
  };

  const createOrder = useMutation({
    mutationFn: async (input: CreateHireOrderInput) => {
      if (!user) throw new Error('Not authenticated');

      const count = orders.length + 1;
      const orderNumber = `HO-${String(count).padStart(3, '0')}`;

      const { data: order, error } = await supabase
        .from('hire_orders')
        .insert({
          user_id: user.id,
          company_profile_id: activeCompanyId || null,
          order_number: orderNumber,
          client_name: input.client_name,
          client_id: input.client_id || null,
          client_phone: input.client_phone || null,
          hire_start: input.hire_start,
          hire_end: input.hire_end,
          deposit_paid: input.deposit_paid || 0,
          total: input.total || 0,
          notes: input.notes || null,
          status: 'active',
        })
        .select()
        .single();
      if (error) throw error;

      if (input.items.length > 0) {
        const { error: itemsError } = await supabase.from('hire_order_items').insert(
          input.items.map((item) => ({
            hire_order_id: order.id,
            equipment_item_id: item.equipment_item_id || null,
            equipment_name: item.equipment_name,
            daily_rate: item.daily_rate,
            quantity: item.quantity,
            subtotal: item.subtotal,
            condition_out: item.condition_out || null,
          }))
        );
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hire-orders'] });
      queryClient.invalidateQueries({ queryKey: ['hire-order-items-all'] });
      toast.success('Hire order created');
    },
    onError: () => toast.error('Failed to create hire order'),
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HireOrder> & { id: string }) => {
      const { error } = await supabase
        .from('hire_orders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hire-orders'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to update order'),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hire_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hire-orders'] });
      queryClient.invalidateQueries({ queryKey: ['hire-order-items-all'] });
      toast.success('Order deleted');
    },
    onError: () => toast.error('Failed to delete order'),
  });

  const processReturn = useMutation({
    mutationFn: async (input: ProcessReturnInput) => {
      // Update order status and return date
      const { error: orderError } = await supabase
        .from('hire_orders')
        .update({
          status: 'returned',
          actual_return_date: input.actualReturnDate,
          total: input.adjustedTotal,
        })
        .eq('id', input.orderId);
      if (orderError) throw orderError;

      // Update each item's condition and damage info
      for (const item of input.items) {
        const { error: itemError } = await supabase
          .from('hire_order_items')
          .update({
            condition_in: item.condition_in,
            damage_notes: item.damage_notes,
            damage_charge: item.damage_charge,
          })
          .eq('id', item.id);
        if (itemError) throw itemError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hire-orders'] });
      queryClient.invalidateQueries({ queryKey: ['hire-order-items-all'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Return processed successfully');
    },
    onError: () => toast.error('Failed to process return'),
  });

  useEffect(() => {
    const channel = supabase
      .channel('hire-orders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hire_orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hire-orders'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return {
    orders,
    isLoading,
    allOrderItems,
    getOrderItems,
    createOrder: createOrder.mutate,
    updateOrder: updateOrder.mutate,
    deleteOrder: deleteOrder.mutate,
    processReturn: processReturn.mutate,
    isCreating: createOrder.isPending,
    isProcessingReturn: processReturn.isPending,
  };
}

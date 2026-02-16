import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface EquipmentItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string | null;
  serial_number: string | null;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  deposit_amount: number;
  condition: string;
  status: string;
  image_url: string | null;
  notes: string | null;
  quantity_total: number;
  available_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEquipmentInput {
  name: string;
  category: string;
  description?: string;
  serial_number?: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  deposit_amount?: number;
  condition?: string;
  status?: string;
  image_url?: string;
  notes?: string;
  quantity_total?: number;
}

export function useEquipment() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', user?.id, activeCompanyId],
    queryFn: async () => {
      let query = supabase.from('equipment_items').select('*').order('name');
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;

      // Fetch on-hire counts
      const { data: hireCounts, error: hireError } = await supabase
        .from('hire_order_items')
        .select('equipment_item_id, quantity, hire_order_id');
      
      let onHireMap: Record<string, number> = {};
      if (!hireError && hireCounts) {
        // Get active order IDs
        const { data: activeOrders } = await supabase
          .from('hire_orders')
          .select('id')
          .eq('status', 'active');
        
        const activeIds = new Set((activeOrders || []).map(o => o.id));
        
        for (const item of hireCounts) {
          if (item.equipment_item_id && activeIds.has(item.hire_order_id)) {
            onHireMap[item.equipment_item_id] = (onHireMap[item.equipment_item_id] || 0) + item.quantity;
          }
        }
      }

      return (data as any[]).map(item => ({
        ...item,
        available_quantity: (item.quantity_total || 1) - (onHireMap[item.id] || 0),
      })) as EquipmentItem[];
    },
    enabled: !!user,
  });

  const createEquipment = useMutation({
    mutationFn: async (input: CreateEquipmentInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('equipment_items').insert({
        ...input,
        user_id: user.id,
        company_profile_id: activeCompanyId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment added');
    },
    onError: () => toast.error('Failed to add equipment'),
  });

  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EquipmentItem> & { id: string }) => {
      const { error } = await supabase
        .from('equipment_items')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment updated');
    },
    onError: () => toast.error('Failed to update equipment'),
  });

  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment deleted');
    },
    onError: () => toast.error('Failed to delete equipment'),
  });

  return {
    equipment,
    isLoading,
    createEquipment: createEquipment.mutate,
    updateEquipment: updateEquipment.mutate,
    deleteEquipment: deleteEquipment.mutate,
    isCreating: createEquipment.isPending,
  };
}

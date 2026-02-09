import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
}

export function useEquipment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_items')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as EquipmentItem[];
    },
    enabled: !!user,
  });

  const createEquipment = useMutation({
    mutationFn: async (input: CreateEquipmentInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('equipment_items').insert({
        ...input,
        user_id: user.id,
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

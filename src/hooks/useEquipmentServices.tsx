import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface EquipmentServiceLog {
  id: string;
  user_id: string;
  equipment_item_id: string;
  company_profile_id: string | null;
  service_date: string;
  service_type: string;
  provider: string | null;
  cost: number;
  parts_replaced: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateServiceLogInput {
  equipment_item_id: string;
  service_date: string;
  service_type: string;
  provider?: string;
  cost: number;
  parts_replaced?: string;
  notes?: string;
}

export function useEquipmentServices(equipmentItemId?: string) {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['equipment-services', equipmentItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_service_logs')
        .select('*')
        .eq('equipment_item_id', equipmentItemId!)
        .order('service_date', { ascending: false });
      if (error) throw error;
      return data as EquipmentServiceLog[];
    },
    enabled: !!user && !!equipmentItemId,
  });

  const createService = useMutation({
    mutationFn: async (input: CreateServiceLogInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('equipment_service_logs').insert({
        ...input,
        user_id: user.id,
        company_profile_id: activeCompanyId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-services'] });
      toast.success('Service log added');
    },
    onError: () => toast.error('Failed to add service log'),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment_service_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-services'] });
      toast.success('Service log deleted');
    },
    onError: () => toast.error('Failed to delete service log'),
  });

  return {
    services,
    isLoading,
    createService: createService.mutate,
    deleteService: deleteService.mutate,
    isCreating: createService.isPending,
  };
}

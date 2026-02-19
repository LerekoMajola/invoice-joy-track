import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface EquipmentIncident {
  id: string;
  user_id: string;
  equipment_item_id: string;
  company_profile_id: string | null;
  incident_type: string;
  date: string;
  severity: string;
  description: string | null;
  cost: number;
  resolved: boolean;
  photo_urls: string[] | null;
  created_at: string;
}

export interface CreateIncidentInput {
  equipment_item_id: string;
  incident_type: string;
  date: string;
  severity: string;
  description?: string;
  cost: number;
}

export function useEquipmentIncidents(equipmentItemId?: string) {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['equipment-incidents', equipmentItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_incidents')
        .select('*')
        .eq('equipment_item_id', equipmentItemId!)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as EquipmentIncident[];
    },
    enabled: !!user && !!equipmentItemId,
  });

  const createIncident = useMutation({
    mutationFn: async (input: CreateIncidentInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('equipment_incidents').insert({
        ...input,
        user_id: user.id,
        company_profile_id: activeCompanyId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-incidents'] });
      toast.success('Incident logged');
    },
    onError: () => toast.error('Failed to log incident'),
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase
        .from('equipment_incidents')
        .update({ resolved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-incidents'] });
      toast.success('Incident updated');
    },
    onError: () => toast.error('Failed to update incident'),
  });

  const deleteIncident = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment_incidents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-incidents'] });
      toast.success('Incident deleted');
    },
    onError: () => toast.error('Failed to delete incident'),
  });

  return {
    incidents,
    isLoading,
    createIncident: createIncident.mutate,
    toggleResolved: toggleResolved.mutate,
    deleteIncident: deleteIncident.mutate,
    isCreating: createIncident.isPending,
  };
}

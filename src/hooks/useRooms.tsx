import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface Room {
  id: string;
  user_id: string;
  room_number: string;
  room_type: string;
  name: string;
  capacity: number;
  daily_rate: number;
  amenities: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

export function useRooms() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms', user?.id, activeCompanyId],
    queryFn: async () => {
      let query = supabase.from('rooms').select('*').order('room_number');
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Room[];
    },
    enabled: !!user,
  });

  const createRoom = useMutation({
    mutationFn: async (room: Omit<Room, 'id' | 'user_id' | 'created_at'>) => {
      const { error } = await supabase
        .from('rooms')
        .insert({ ...room, user_id: user!.id, company_profile_id: activeCompanyId || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room added');
    },
    onError: () => toast.error('Failed to add room'),
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Room> & { id: string }) => {
      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated');
    },
    onError: () => toast.error('Failed to update room'),
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  return { rooms, isLoading, createRoom, updateRoom, deleteRoom };
}

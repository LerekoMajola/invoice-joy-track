import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface HousekeepingTask {
  id: string;
  user_id: string;
  room_id: string;
  task_type: string;
  status: string;
  assigned_to: string | null;
  priority: string;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  rooms?: { room_number: string; name: string };
}

export function useHousekeeping() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['housekeeping', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*, rooms(room_number, name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HousekeepingTask[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<HousekeepingTask, 'id' | 'user_id' | 'created_at' | 'rooms'>) => {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .insert({ ...task, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
      toast.success('Task created');
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HousekeepingTask> & { id: string }) => {
      const { rooms: _, ...clean } = updates as any;
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update(clean)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('housekeeping_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  return { tasks, isLoading, createTask, updateTask, deleteTask };
}

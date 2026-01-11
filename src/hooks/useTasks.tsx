import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  sort_order?: number;
}

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Get max sort_order
      const maxOrder = tasks.reduce((max, t) => Math.max(max, t.sort_order), -1);

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          due_date: input.due_date || null,
          priority: input.priority || 'medium',
          status: input.status || 'todo',
          sort_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task added');
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error(error);
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error(error);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete task');
      console.error(error);
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: TaskStatus }) => {
      const newStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.status === 'done') {
        toast.success('Task completed! 🎉');
      }
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error(error);
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  };
}

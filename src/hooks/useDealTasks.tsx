 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { useToast } from './use-toast';
 
 export interface DealTask {
   id: string;
   user_id: string;
   deal_id: string;
   title: string;
   description: string | null;
   due_date: string | null;
   is_completed: boolean;
   completed_at: string | null;
   priority: string;
   created_at: string;
   updated_at: string;
 }
 
 export interface DealTaskInsert {
   deal_id: string;
   title: string;
   description?: string | null;
   due_date?: string | null;
   priority?: string;
 }
 
 export function useDealTasks(dealId?: string) {
   const [tasks, setTasks] = useState<DealTask[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
   const { toast } = useToast();
 
   const fetchTasks = async () => {
     if (!user || !dealId) return;
     
     setIsLoading(true);
     try {
       const { data, error } = await supabase
         .from('deal_tasks')
         .select('*')
         .eq('deal_id', dealId)
         .order('is_completed', { ascending: true })
         .order('due_date', { ascending: true, nullsFirst: false })
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setTasks(data || []);
     } catch (error: any) {
       console.error('Error fetching deal tasks:', error);
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     if (dealId) {
       fetchTasks();
     }
   }, [user, dealId]);
 
   const createTask = async (task: DealTaskInsert) => {
     if (!user) return null;
 
     try {
       const { data, error } = await supabase
         .from('deal_tasks')
         .insert({
           ...task,
           user_id: user.id,
         })
         .select()
         .single();
 
       if (error) throw error;
 
       setTasks(prev => [data, ...prev]);
       toast({
         title: 'Task created',
         description: task.title,
       });
       return data;
     } catch (error: any) {
       toast({
         title: 'Error creating task',
         description: error.message,
         variant: 'destructive',
       });
       return null;
     }
   };
 
   const toggleTask = async (taskId: string, isCompleted: boolean) => {
     try {
       const { data, error } = await supabase
         .from('deal_tasks')
         .update({
           is_completed: isCompleted,
           completed_at: isCompleted ? new Date().toISOString() : null,
         })
         .eq('id', taskId)
         .select()
         .single();
 
       if (error) throw error;
 
       setTasks(prev => prev.map(t => t.id === taskId ? data : t));
       return data;
     } catch (error: any) {
       toast({
         title: 'Error updating task',
         description: error.message,
         variant: 'destructive',
       });
       return null;
     }
   };
 
   const deleteTask = async (taskId: string) => {
     try {
       const { error } = await supabase
         .from('deal_tasks')
         .delete()
         .eq('id', taskId);
 
       if (error) throw error;
 
       setTasks(prev => prev.filter(t => t.id !== taskId));
       return true;
     } catch (error: any) {
       toast({
         title: 'Error deleting task',
         description: error.message,
         variant: 'destructive',
       });
       return false;
     }
   };
 
   return {
     tasks,
     isLoading,
     createTask,
     toggleTask,
     deleteTask,
     refetch: fetchTasks,
   };
 }
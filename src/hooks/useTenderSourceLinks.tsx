import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TenderSourceLink {
  id: string;
  user_id: string;
  name: string;
  url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  last_visited_at: string | null;
}

export interface TenderSourceLinkInput {
  name: string;
  url: string;
  description?: string;
}

export function useTenderSourceLinks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['tender-source-links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tender_source_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TenderSourceLink[];
    },
    enabled: !!user,
  });

  const createLink = useMutation({
    mutationFn: async (input: TenderSourceLinkInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tender_source_links')
        .insert({
          user_id: user.id,
          name: input.name,
          url: input.url,
          description: input.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-source-links'] });
      toast.success('Link added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add link: ' + error.message);
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...input }: TenderSourceLinkInput & { id: string }) => {
      const { data, error } = await supabase
        .from('tender_source_links')
        .update({
          name: input.name,
          url: input.url,
          description: input.description || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-source-links'] });
      toast.success('Link updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update link: ' + error.message);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tender_source_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-source-links'] });
      toast.success('Link deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete link: ' + error.message);
    },
  });

  const visitLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tender_source_links')
        .update({ last_visited_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-source-links'] });
    },
  });

  return {
    links,
    isLoading,
    createLink,
    updateLink,
    deleteLink,
    visitLink,
  };
}

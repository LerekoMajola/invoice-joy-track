import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TaxClearanceDocument {
  id: string;
  user_id: string;
  activity_name: string;
  document_url: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface TaxClearanceInput {
  activity_name: string;
  document_url: string;
  expiry_date: string;
}

export function useTaxClearances() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: taxClearances = [], isLoading, error } = useQuery({
    queryKey: ['tax-clearances', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tax_clearance_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaxClearanceDocument[];
    },
    enabled: !!user?.id,
  });

  const addTaxClearance = useMutation({
    mutationFn: async (input: TaxClearanceInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_clearance_documents')
        .insert({
          user_id: user.id,
          activity_name: input.activity_name,
          document_url: input.document_url,
          expiry_date: input.expiry_date,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-clearances', user?.id] });
      toast({
        title: 'Success',
        description: 'Tax clearance document added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add tax clearance document.',
        variant: 'destructive',
      });
      console.error('Add tax clearance error:', error);
    },
  });

  const updateTaxClearance = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TaxClearanceInput>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_clearance_documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-clearances', user?.id] });
      toast({
        title: 'Success',
        description: 'Tax clearance document updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update tax clearance document.',
        variant: 'destructive',
      });
      console.error('Update tax clearance error:', error);
    },
  });

  const deleteTaxClearance = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tax_clearance_documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-clearances', user?.id] });
      toast({
        title: 'Success',
        description: 'Tax clearance document deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete tax clearance document.',
        variant: 'destructive',
      });
      console.error('Delete tax clearance error:', error);
    },
  });

  const uploadDocument = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/tax-clearance-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file.',
        variant: 'destructive',
      });
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('company-assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  return {
    taxClearances,
    isLoading,
    error,
    addTaxClearance: addTaxClearance.mutate,
    updateTaxClearance: updateTaxClearance.mutate,
    deleteTaxClearance: deleteTaxClearance.mutate,
    isAdding: addTaxClearance.isPending,
    isUpdating: updateTaxClearance.isPending,
    isDeleting: deleteTaxClearance.isPending,
    uploadDocument,
  };
}

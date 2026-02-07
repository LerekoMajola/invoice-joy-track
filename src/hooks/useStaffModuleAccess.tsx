import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useStaffModuleAccess(staffMemberId?: string) {
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchModuleAccess = useCallback(async () => {
    if (!staffMemberId || !user) {
      setModuleIds([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_module_access')
        .select('module_id')
        .eq('staff_member_id', staffMemberId)
        .eq('is_active', true);

      if (error) throw error;
      setModuleIds(data?.map((r) => r.module_id) || []);
    } catch (error) {
      console.error('Error fetching staff module access:', error);
    } finally {
      setIsLoading(false);
    }
  }, [staffMemberId, user]);

  useEffect(() => {
    fetchModuleAccess();
  }, [fetchModuleAccess]);

  const saveModuleAccess = async (staffId: string, selectedModuleIds: string[]) => {
    if (!user) return false;

    try {
      // Delete existing access rows for this staff member
      const { error: deleteError } = await supabase
        .from('staff_module_access')
        .delete()
        .eq('staff_member_id', staffId);

      if (deleteError) throw deleteError;

      // Insert new access rows
      if (selectedModuleIds.length > 0) {
        const rows = selectedModuleIds.map((moduleId) => ({
          staff_member_id: staffId,
          module_id: moduleId,
          is_active: true,
        }));

        const { error: insertError } = await supabase
          .from('staff_module_access')
          .insert(rows);

        if (insertError) throw insertError;
      }

      setModuleIds(selectedModuleIds);
      return true;
    } catch (error: any) {
      console.error('Error saving staff module access:', error);
      toast({
        title: 'Error',
        description: 'Failed to update module access',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    moduleIds,
    isLoading,
    saveModuleAccess,
    refetch: fetchModuleAccess,
  };
}

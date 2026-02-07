import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PlatformModule {
  id: string;
  name: string;
  key: string;
  description: string | null;
  monthly_price: number;
  icon: string;
  is_core: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface UserModule {
  id: string;
  user_id: string;
  module_id: string;
  is_active: boolean;
  activated_at: string;
  module?: PlatformModule;
}

export function useModules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available platform modules
  const { data: platformModules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['platform-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as PlatformModule[];
    },
  });

  // Fetch user's subscribed modules
  const { data: userModules = [], isLoading: userModulesLoading } = useQuery({
    queryKey: ['user-modules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_modules')
        .select('*, module:platform_modules(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (error) throw error;
      return (data || []).map((um: any) => ({
        ...um,
        module: um.module as PlatformModule,
      })) as UserModule[];
    },
    enabled: !!user,
  });

  // Check if user has a specific module by key
  const hasModule = (moduleKey: string): boolean => {
    if (!userModules.length) return false;
    return userModules.some(
      (um) => um.module?.key === moduleKey && um.is_active
    );
  };

  // Get the user's active module keys
  const getActiveModuleKeys = (): string[] => {
    return userModules
      .filter((um) => um.is_active && um.module)
      .map((um) => um.module!.key);
  };

  // Calculate monthly total from active modules
  const getMonthlyTotal = (): number => {
    return userModules
      .filter((um) => um.is_active && um.module)
      .reduce((sum, um) => sum + (um.module?.monthly_price || 0), 0);
  };

  // Save modules for a user (used during signup)
  const saveUserModules = async (userId: string, moduleIds: string[]) => {
    const rows = moduleIds.map((moduleId) => ({
      user_id: userId,
      module_id: moduleId,
      is_active: true,
    }));

    const { error } = await supabase.from('user_modules').insert(rows);
    if (error) throw error;
  };

  // Toggle a module on/off for the current user
  const toggleModule = useMutation({
    mutationFn: async ({ moduleId, activate }: { moduleId: string; activate: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (activate) {
        const { error } = await supabase.from('user_modules').upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            is_active: true,
          },
          { onConflict: 'user_id,module_id' }
        );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_modules')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('module_id', moduleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-modules'] });
      toast.success('Module updated');
    },
    onError: () => {
      toast.error('Failed to update module');
    },
  });

  // Filter platform modules by system type
  const getModulesForSystem = (systemType: string): PlatformModule[] => {
    return platformModules.filter(
      (m) => !(m as any).system_type || (m as any).system_type === 'shared' || (m as any).system_type === systemType
    );
  };

  return {
    platformModules,
    userModules,
    isLoading: modulesLoading || userModulesLoading,
    hasModule,
    getActiveModuleKeys,
    getMonthlyTotal,
    saveUserModules,
    toggleModule,
    getModulesForSystem,
  };
}

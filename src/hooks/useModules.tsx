import { useEffect, useState } from 'react';
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

  // Detect if user is a staff member and get owner info
  const { data: staffInfo } = useQuery({
    queryKey: ['staff-info', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('staff_members')
        .select('id, owner_user_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isStaff = !!staffInfo;
  const effectiveUserId = isStaff ? staffInfo!.owner_user_id : user?.id;

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

  // Fetch staff module access restrictions (only for staff)
  const { data: staffModuleIds } = useQuery({
    queryKey: ['staff-module-access-ids', staffInfo?.id],
    queryFn: async () => {
      if (!staffInfo) return null;
      const { data, error } = await supabase
        .from('staff_module_access')
        .select('module_id')
        .eq('staff_member_id', staffInfo.id)
        .eq('is_active', true);
      if (error) throw error;
      return data?.map((r) => r.module_id) || [];
    },
    enabled: !!staffInfo,
  });

  // Fetch user's (or owner's) subscribed modules
  const { data: userModules = [], isLoading: userModulesLoading } = useQuery({
    queryKey: ['user-modules', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from('user_modules')
        .select('*, module:platform_modules(*)')
        .eq('user_id', effectiveUserId)
        .eq('is_active', true);
      if (error) throw error;
      let modules = (data || []).map((um: any) => ({
        ...um,
        module: um.module as PlatformModule,
      })) as UserModule[];

      // If staff, filter to only modules they have access to
      if (staffModuleIds && staffModuleIds.length > 0) {
        modules = modules.filter(
          (um) => um.module?.is_core || staffModuleIds.includes(um.module_id)
        );
      }

      return modules;
    },
    enabled: !!effectiveUserId,
  });

  useEffect(() => {
    const channel = supabase
      .channel('user-modules-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_modules' }, () => {
        queryClient.invalidateQueries({ queryKey: ['user-modules'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const hasModule = (moduleKey: string): boolean => {
    if (!userModules.length) return false;
    return userModules.some(
      (um) => um.module?.key === moduleKey && um.is_active
    );
  };

  const getActiveModuleKeys = (): string[] => {
    return userModules
      .filter((um) => um.is_active && um.module)
      .map((um) => um.module!.key);
  };

  const getMonthlyTotal = (): number => {
    return userModules
      .filter((um) => um.is_active && um.module)
      .reduce((sum, um) => sum + (um.module?.monthly_price || 0), 0);
  };

  const saveUserModules = async (userId: string, moduleIds: string[]) => {
    const rows = moduleIds.map((moduleId) => ({
      user_id: userId,
      module_id: moduleId,
      is_active: true,
    }));
    const { error } = await supabase.from('user_modules').insert(rows);
    if (error) throw error;
  };

  const toggleModule = useMutation({
    mutationFn: async ({ moduleId, activate }: { moduleId: string; activate: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      const targetUserId = effectiveUserId || user.id;

      if (activate) {
        const { error } = await supabase.from('user_modules').upsert(
          { user_id: targetUserId, module_id: moduleId, is_active: true },
          { onConflict: 'user_id,module_id' }
        );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_modules')
          .update({ is_active: false })
          .eq('user_id', targetUserId)
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
    isStaff,
  };
}

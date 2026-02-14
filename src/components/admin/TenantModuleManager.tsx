import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatMaluti } from '@/lib/currency';
import { Package } from 'lucide-react';

interface TenantModuleManagerProps {
  userId: string;
  systemType: string;
}

interface PlatformModule {
  id: string;
  name: string;
  key: string;
  description: string | null;
  monthly_price: number;
  icon: string;
  is_core: boolean;
  system_type: string;
}

export function TenantModuleManager({ userId, systemType }: TenantModuleManagerProps) {
  const queryClient = useQueryClient();

  const { data: platformModules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['platform-modules-admin'],
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

  const { data: userModuleIds = [], isLoading: userModulesLoading } = useQuery({
    queryKey: ['admin-user-modules', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_modules')
        .select('module_id')
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      return (data || []).map((um: any) => um.module_id as string);
    },
  });

  const filteredModules = platformModules.filter(
    (m) => m.system_type === 'shared' || m.system_type === systemType
  );

  const toggleMutation = useMutation({
    mutationFn: async ({ moduleId, activate }: { moduleId: string; activate: boolean }) => {
      if (activate) {
        const { error } = await supabase.from('user_modules').upsert(
          { user_id: userId, module_id: moduleId, is_active: true },
          { onConflict: 'user_id,module_id' }
        );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_modules')
          .delete()
          .eq('user_id', userId)
          .eq('module_id', moduleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-modules', userId] });
      toast.success('Module updated');
    },
    onError: () => {
      toast.error('Failed to update module');
    },
  });

  const isLoading = modulesLoading || userModulesLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (filteredModules.length === 0) {
    return <p className="text-sm text-muted-foreground">No modules available for this system type.</p>;
  }

  return (
    <div className="space-y-2">
      {filteredModules.map((mod) => {
        const isActive = userModuleIds.includes(mod.id);
        return (
          <div
            key={mod.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{mod.name}</div>
                {mod.description && (
                  <div className="text-xs text-muted-foreground truncate">{mod.description}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground">
                {formatMaluti(mod.monthly_price)}/mo
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ moduleId: mod.id, activate: checked })
                }
                disabled={toggleMutation.isPending}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

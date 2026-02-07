import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function usePlatformSetting(key: string) {
  const queryClient = useQueryClient();

  const { data: value, isLoading } = useQuery({
    queryKey: ['platform-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ${key}:`, error);
        return null;
      }
      return data?.value ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });

  const updateValue = useMutation({
    mutationFn: async (url: string | null) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ value: url, updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key, value: url });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });

  return { value: value ?? null, isLoading, updateValue };
}

export function usePlatformSettings() {
  const logo = usePlatformSetting('platform_logo_url');
  const favicon = usePlatformSetting('platform_favicon_url');
  const appIcon = usePlatformSetting('platform_app_icon_url');

  return {
    logoUrl: logo.value,
    isLoading: logo.isLoading,
    updateLogoUrl: logo.updateValue,
    faviconUrl: favicon.value,
    isFaviconLoading: favicon.isLoading,
    updateFaviconUrl: favicon.updateValue,
    appIconUrl: appIcon.value,
    isAppIconLoading: appIcon.isLoading,
    updateAppIconUrl: appIcon.updateValue,
  };
}

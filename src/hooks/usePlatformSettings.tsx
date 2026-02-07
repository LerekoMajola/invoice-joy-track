import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePlatformSettings() {
  const queryClient = useQueryClient();

  const { data: logoUrl, isLoading } = useQuery({
    queryKey: ['platform-settings', 'platform_logo_url'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'platform_logo_url')
        .maybeSingle();

      if (error) {
        console.error('Error fetching platform logo:', error);
        return null;
      }
      return data?.value ?? null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - logo rarely changes
  });

  const updateLogoUrl = useMutation({
    mutationFn: async (url: string | null) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', 'platform_logo_url')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ value: url, updated_at: new Date().toISOString() })
          .eq('key', 'platform_logo_url');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key: 'platform_logo_url', value: url });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });

  return { logoUrl: logoUrl ?? null, isLoading, updateLogoUrl };
}

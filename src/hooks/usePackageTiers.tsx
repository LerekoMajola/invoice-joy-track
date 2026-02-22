import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PackageTier {
  id: string;
  system_type: string;
  name: string;
  display_name: string;
  description: string | null;
  bundle_price: number;
  module_keys: string[];
  features: { name: string; included: boolean }[];
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
}

export function usePackageTiers(systemType?: string) {
  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ['package-tiers', systemType],
    queryFn: async () => {
      let query = supabase
        .from('package_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (systemType) {
        query = query.eq('system_type', systemType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        bundle_price: Number(t.bundle_price),
        features: (t.features || []) as { name: string; included: boolean }[],
        module_keys: (t.module_keys || []) as string[],
      })) as PackageTier[];
    },
  });

  const getTiersForSystem = (sysType: string) =>
    tiers.filter((t) => t.system_type === sysType);

  const getTierById = (id: string) =>
    tiers.find((t) => t.id === id) || null;

  return { tiers, isLoading, getTiersForSystem, getTierById };
}

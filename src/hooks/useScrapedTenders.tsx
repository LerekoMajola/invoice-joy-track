import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ScrapedTender {
  id: string;
  user_id: string;
  company_profile_id: string | null;
  title: string;
  organization: string;
  description: string;
  closing_date: string | null;
  reference_number: string | null;
  source_url: string;
  source_name: string;
  estimated_value: string | null;
  category: string | null;
  is_saved: boolean;
  is_dismissed: boolean;
  scraped_at: string;
  raw_content: string | null;
  created_at: string;
}

export function useScrapedTenders(companyProfileId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ['scraped-tenders', user?.id, companyProfileId],
    queryFn: async () => {
      let query = supabase
        .from('scraped_tenders')
        .select('*')
        .eq('is_dismissed', false)
        .order('scraped_at', { ascending: false });

      if (companyProfileId) {
        query = query.eq('company_profile_id', companyProfileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScrapedTender[];
    },
    enabled: !!user,
  });

  const scanForTenders = async () => {
    if (!user) return;
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-tenders', {
        body: { company_profile_id: companyProfileId },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Found ${data.count} new tenders from ${data.sources_scraped} sources`);
        queryClient.invalidateQueries({ queryKey: ['scraped-tenders'] });
      } else {
        toast.error(data?.error || 'Scan failed');
      }
    } catch (e: any) {
      console.error('Scan error:', e);
      toast.error('Failed to scan for tenders');
    } finally {
      setIsScanning(false);
    }
  };

  const dismissTender = useMutation({
    mutationFn: async (tenderId: string) => {
      const { error } = await supabase
        .from('scraped_tenders')
        .update({ is_dismissed: true })
        .eq('id', tenderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-tenders'] });
    },
  });

  const saveTender = useMutation({
    mutationFn: async (tenderId: string) => {
      const { error } = await supabase
        .from('scraped_tenders')
        .update({ is_saved: true })
        .eq('id', tenderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tender saved to your list');
      queryClient.invalidateQueries({ queryKey: ['scraped-tenders'] });
    },
  });

  return {
    tenders,
    isLoading,
    isScanning,
    scanForTenders,
    dismissTender,
    saveTender,
  };
}

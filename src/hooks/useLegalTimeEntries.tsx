import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface LegalTimeEntry {
  id: string;
  caseId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description: string;
  activityType: string | null;
  isBillable: boolean;
  isInvoiced: boolean;
  invoiceId: string | null;
  createdAt: string;
}

export function useLegalTimeEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LegalTimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) { setEntries([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('legal_time_entries')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setEntries((data || []).map(e => ({
        id: e.id,
        caseId: e.case_id,
        date: e.date,
        hours: Number(e.hours),
        hourlyRate: Number(e.hourly_rate),
        description: e.description,
        activityType: e.activity_type,
        isBillable: e.is_billable ?? true,
        isInvoiced: e.is_invoiced ?? false,
        invoiceId: e.invoice_id,
        createdAt: e.created_at,
      })));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, [user]);

  return { entries, isLoading, refetch: fetchEntries };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RecurringDocument {
  id: string;
  userId: string;
  sourceType: 'invoice' | 'quote';
  sourceId: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRunDate: string;
  isActive: boolean;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type Frequency = RecurringDocument['frequency'];

function computeNextRunDate(frequency: Frequency, from?: Date): string {
  const d = from ? new Date(from) : new Date();
  switch (frequency) {
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

export function useRecurringDocuments() {
  const { user } = useAuth();
  const [recurringDocs, setRecurringDocs] = useState<RecurringDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecurringDocs = useCallback(async () => {
    if (!user) { setRecurringDocs([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('recurring_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecurringDocs(
        (data || []).map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          sourceType: r.source_type,
          sourceId: r.source_id,
          frequency: r.frequency,
          nextRunDate: r.next_run_date,
          isActive: r.is_active,
          lastGeneratedAt: r.last_generated_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching recurring documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRecurringDocs(); }, [fetchRecurringDocs]);

  const setRecurring = async (sourceType: 'invoice' | 'quote', sourceId: string, frequency: Frequency) => {
    if (!user) return null;
    // Check if already exists
    const existing = recurringDocs.find(r => r.sourceType === sourceType && r.sourceId === sourceId);
    if (existing) {
      const { error } = await supabase
        .from('recurring_documents')
        .update({ frequency, next_run_date: computeNextRunDate(frequency), is_active: true } as any)
        .eq('id', existing.id);
      if (error) { toast.error('Failed to update recurrence'); return null; }
      toast.success('Recurrence updated');
    } else {
      const { error } = await supabase
        .from('recurring_documents')
        .insert({
          user_id: user.id,
          source_type: sourceType,
          source_id: sourceId,
          frequency,
          next_run_date: computeNextRunDate(frequency),
          is_active: true,
        } as any);
      if (error) { toast.error('Failed to set recurrence'); return null; }
      toast.success('Recurrence set');
    }
    await fetchRecurringDocs();
  };

  const stopRecurring = async (id: string) => {
    const { error } = await supabase
      .from('recurring_documents')
      .update({ is_active: false } as any)
      .eq('id', id);
    if (error) { toast.error('Failed to stop recurrence'); return; }
    toast.success('Recurrence stopped');
    await fetchRecurringDocs();
  };

  const getRecurringBySource = (sourceType: 'invoice' | 'quote', sourceId: string) => {
    return recurringDocs.find(r => r.sourceType === sourceType && r.sourceId === sourceId) || null;
  };

  return { recurringDocs, isLoading, setRecurring, stopRecurring, getRecurringBySource, refetch: fetchRecurringDocs, computeNextRunDate };
}

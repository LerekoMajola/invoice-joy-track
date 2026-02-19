import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ProspectStatus = 'lead' | 'contacted' | 'demo' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type ProspectPriority = 'low' | 'medium' | 'high';
export type ActivityType = 'note' | 'call' | 'email' | 'demo' | 'meeting';

export interface AdminProspect {
  id: string;
  created_at: string;
  updated_at: string;
  contact_name: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  status: ProspectStatus;
  priority: ProspectPriority;
  estimated_value: number;
  expected_close_date: string | null;
  win_probability: number;
  source: string | null;
  notes: string | null;
  next_follow_up: string | null;
  stage_entered_at: string | null;
  loss_reason: string | null;
  interested_plan: string | null;
  interested_system: string | null;
}

export interface ProspectActivity {
  id: string;
  created_at: string;
  prospect_id: string;
  type: ActivityType;
  title: string;
  description: string | null;
}

export function useAdminProspects() {
  const [prospects, setProspects] = useState<AdminProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_prospects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading prospects', description: error.message, variant: 'destructive' });
    } else {
      setProspects((data as AdminProspect[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProspects();

    const channel = supabase
      .channel('admin-prospects-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_prospects' }, () => {
        fetchProspects();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProspects]);

  const createProspect = async (values: Omit<AdminProspect, 'id' | 'created_at' | 'updated_at' | 'stage_entered_at'>) => {
    const { data, error } = await supabase
      .from('admin_prospects')
      .insert([values])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating prospect', description: error.message, variant: 'destructive' });
      return null;
    }
    const newProspect = data as AdminProspect;
    setProspects(prev => [newProspect, ...prev]);
    toast({ title: 'Prospect added', description: `${values.company_name} added to pipeline.` });
    return newProspect;
  };

  const updateProspect = async (id: string, updates: Partial<AdminProspect>) => {
    // Optimistic update
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    const { data, error } = await supabase
      .from('admin_prospects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error updating prospect', description: error.message, variant: 'destructive' });
      fetchProspects(); // rollback
      return null;
    }
    setProspects(prev => prev.map(p => p.id === id ? (data as AdminProspect) : p));
    return data as AdminProspect;
  };

  const deleteProspect = async (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('admin_prospects').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting prospect', description: error.message, variant: 'destructive' });
      fetchProspects();
    } else {
      toast({ title: 'Prospect deleted' });
    }
  };

  const moveProspect = async (id: string, newStatus: ProspectStatus) => {
    const defaultWinProbability: Record<ProspectStatus, number> = {
      lead: 5, contacted: 15, demo: 35, proposal: 55, negotiation: 75, won: 100, lost: 0,
    };
    await updateProspect(id, { status: newStatus, win_probability: defaultWinProbability[newStatus] });
  };

  // Activities
  const fetchActivities = async (prospectId: string): Promise<ProspectActivity[]> => {
    const { data, error } = await supabase
      .from('admin_prospect_activities')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading activities', description: error.message, variant: 'destructive' });
      return [];
    }
    return (data as ProspectActivity[]) || [];
  };

  const addActivity = async (prospectId: string, activity: Omit<ProspectActivity, 'id' | 'created_at' | 'prospect_id'>) => {
    const { data, error } = await supabase
      .from('admin_prospect_activities')
      .insert([{ ...activity, prospect_id: prospectId }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding activity', description: error.message, variant: 'destructive' });
      return null;
    }
    return data as ProspectActivity;
  };

  // Computed stats
  const stats = {
    totalPipelineValue: prospects
      .filter(p => !['won', 'lost'].includes(p.status))
      .reduce((sum, p) => sum + (p.estimated_value || 0), 0),
    weightedValue: prospects
      .filter(p => !['won', 'lost'].includes(p.status))
      .reduce((sum, p) => sum + ((p.estimated_value || 0) * (p.win_probability || 0) / 100), 0),
    activeCount: prospects.filter(p => !['won', 'lost'].includes(p.status)).length,
    followUpsDueToday: prospects.filter(p => {
      if (!p.next_follow_up) return false;
      const today = new Date().toISOString().split('T')[0];
      return p.next_follow_up <= today && !['won', 'lost'].includes(p.status);
    }).length,
  };

  return {
    prospects,
    loading,
    stats,
    fetchProspects,
    createProspect,
    updateProspect,
    deleteProspect,
    moveProspect,
    fetchActivities,
    addActivity,
  };
}

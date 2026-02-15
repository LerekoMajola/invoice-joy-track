import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FleetCostEntry {
  id: string;
  vehicleId: string;
  category: string;
  amount: number;
  date: string;
  reference: string | null;
  vendor: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FleetCostEntryInsert {
  vehicleId: string;
  category: string;
  amount: number;
  date?: string;
  reference?: string;
  vendor?: string;
  notes?: string;
}

export const COST_CATEGORIES = ['Insurance', 'Finance', 'Licensing', 'Tolls', 'Parking', 'Other'];

function mapRow(row: any): FleetCostEntry {
  return {
    id: row.id, vehicleId: row.vehicle_id, category: row.category,
    amount: Number(row.amount), date: row.date, reference: row.reference,
    vendor: row.vendor, notes: row.notes, createdAt: row.created_at,
  };
}

export function useFleetCostEntries(vehicleId?: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FleetCostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) { setEntries([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_cost_entries').select('*').order('date', { ascending: false });
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setEntries((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching cost entries:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, [user, vehicleId]);

  const createEntry = async (entry: FleetCostEntryInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('fleet_cost_entries').insert({
        user_id: user.id, vehicle_id: entry.vehicleId, category: entry.category,
        amount: entry.amount, date: entry.date || new Date().toISOString().split('T')[0],
        reference: entry.reference || null, vendor: entry.vendor || null,
        notes: entry.notes || null,
      });
      if (error) throw error;
      await fetchEntries();
      toast.success('Cost entry added');
      return true;
    } catch (e) {
      toast.error('Failed to add cost entry');
      return false;
    }
  };

  const deleteEntry = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_cost_entries').delete().eq('id', id);
      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Cost entry deleted');
      return true;
    } catch (e) {
      toast.error('Failed to delete cost entry');
      return false;
    }
  };

  // Aggregate by category
  const byCategory = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const totalEntries = entries.reduce((sum, e) => sum + e.amount, 0);

  return { entries, byCategory, totalEntries, isLoading, createEntry, deleteEntry, refetch: fetchEntries };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FleetTyre {
  id: string;
  vehicleId: string;
  position: string;
  brand: string | null;
  size: string | null;
  status: string;
  dateFitted: string | null;
  expectedKm: number;
  currentKm: number;
  cost: number;
  rotationCount: number;
  lastRotationDate: string | null;
  replacementDate: string | null;
  createdAt: string;
}

export interface FleetTyreInsert {
  vehicleId: string;
  position: string;
  brand?: string;
  size?: string;
  dateFitted?: string;
  expectedKm?: number;
  currentKm?: number;
  cost?: number;
}

function mapRow(row: any): FleetTyre {
  return {
    id: row.id, vehicleId: row.vehicle_id, position: row.position,
    brand: row.brand, size: row.size, status: row.status || 'good',
    dateFitted: row.date_fitted, expectedKm: Number(row.expected_km || 40000),
    currentKm: Number(row.current_km || 0), cost: Number(row.cost || 0),
    rotationCount: Number(row.rotation_count || 0),
    lastRotationDate: row.last_rotation_date, replacementDate: row.replacement_date,
    createdAt: row.created_at,
  };
}

export function useFleetTyres(vehicleId?: string) {
  const { user } = useAuth();
  const [tyres, setTyres] = useState<FleetTyre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTyres = async () => {
    if (!user) { setTyres([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_tyres').select('*').order('position');
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setTyres((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching tyres:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTyres(); }, [user, vehicleId]);

  const createTyre = async (t: FleetTyreInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('fleet_tyres').insert({
        user_id: user.id, vehicle_id: t.vehicleId, position: t.position,
        brand: t.brand || null, size: t.size || null,
        date_fitted: t.dateFitted || new Date().toISOString().split('T')[0],
        expected_km: t.expectedKm || 40000, current_km: t.currentKm || 0,
        cost: t.cost || 0,
      });
      if (error) throw error;
      await fetchTyres();
      toast.success('Tyre added');
      return true;
    } catch (e) {
      toast.error('Failed to add tyre');
      return false;
    }
  };

  const deleteTyre = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_tyres').delete().eq('id', id);
      if (error) throw error;
      setTyres(prev => prev.filter(t => t.id !== id));
      toast.success('Tyre removed');
      return true;
    } catch (e) {
      toast.error('Failed to remove tyre');
      return false;
    }
  };

  // Tyres nearing replacement
  const needingReplacement = tyres.filter(t => t.currentKm >= t.expectedKm * 0.8);
  const totalTyreCost = tyres.reduce((sum, t) => sum + t.cost, 0);

  return { tyres, needingReplacement, totalTyreCost, isLoading, createTyre, deleteTyre, refetch: fetchTyres };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FleetFuelLog {
  id: string;
  vehicleId: string;
  date: string;
  litres: number;
  cost: number;
  odometer: number | null;
  station: string | null;
  createdAt: string;
}

export interface FleetFuelLogInsert {
  vehicleId: string;
  date?: string;
  litres: number;
  cost: number;
  odometer?: number;
  station?: string;
}

export function useFleetFuelLogs(vehicleId?: string) {
  const { user } = useAuth();
  const [fuelLogs, setFuelLogs] = useState<FleetFuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user) { setFuelLogs([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_fuel_logs').select('*').order('date', { ascending: false });
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setFuelLogs((data || []).map(r => ({
        id: r.id, vehicleId: r.vehicle_id, date: r.date,
        litres: Number(r.litres), cost: Number(r.cost),
        odometer: r.odometer, station: r.station, createdAt: r.created_at,
      })));
    } catch (e) {
      console.error('Error fetching fuel logs:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [user, vehicleId]);

  const createLog = async (log: FleetFuelLogInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('fleet_fuel_logs').insert({
        user_id: user.id, vehicle_id: log.vehicleId,
        date: log.date || new Date().toISOString().split('T')[0],
        litres: log.litres, cost: log.cost,
        odometer: log.odometer || null, station: log.station || null,
      });
      if (error) throw error;
      await fetchLogs();
      toast.success('Fuel log added');
      return true;
    } catch (e) {
      toast.error('Failed to add fuel log');
      return false;
    }
  };

  const deleteLog = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_fuel_logs').delete().eq('id', id);
      if (error) throw error;
      setFuelLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Fuel log deleted');
      return true;
    } catch (e) {
      toast.error('Failed to delete fuel log');
      return false;
    }
  };

  return { fuelLogs, isLoading, createLog, deleteLog, refetch: fetchLogs };
}

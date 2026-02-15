import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FleetServiceLog {
  id: string;
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  provider: string | null;
  cost: number;
  partsReplaced: string | null;
  invoiceUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FleetServiceLogInsert {
  vehicleId: string;
  serviceDate?: string;
  serviceType: string;
  provider?: string;
  cost: number;
  partsReplaced?: string;
  invoiceUrl?: string;
  notes?: string;
}

export function useFleetServiceLogs(vehicleId?: string) {
  const { user } = useAuth();
  const [serviceLogs, setServiceLogs] = useState<FleetServiceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    if (!user) { setServiceLogs([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_service_logs').select('*').order('service_date', { ascending: false });
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setServiceLogs((data || []).map(r => ({
        id: r.id, vehicleId: r.vehicle_id, serviceDate: r.service_date,
        serviceType: r.service_type, provider: r.provider, cost: Number(r.cost),
        partsReplaced: r.parts_replaced, invoiceUrl: r.invoice_url, notes: r.notes, createdAt: r.created_at,
      })));
    } catch (e) {
      console.error('Error fetching service logs:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [user, vehicleId]);

  const createLog = async (log: FleetServiceLogInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('fleet_service_logs').insert({
        user_id: user.id, vehicle_id: log.vehicleId,
        service_date: log.serviceDate || new Date().toISOString().split('T')[0],
        service_type: log.serviceType, provider: log.provider || null,
        cost: log.cost, parts_replaced: log.partsReplaced || null,
        invoice_url: log.invoiceUrl || null, notes: log.notes || null,
      });
      if (error) throw error;
      await fetchLogs();
      toast.success('Service log added');
      return true;
    } catch (e) {
      console.error('Error creating service log:', e);
      toast.error('Failed to add service log');
      return false;
    }
  };

  const deleteLog = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_service_logs').delete().eq('id', id);
      if (error) throw error;
      setServiceLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Service log deleted');
      return true;
    } catch (e) {
      toast.error('Failed to delete service log');
      return false;
    }
  };

  return { serviceLogs, isLoading, createLog, deleteLog, refetch: fetchLogs };
}

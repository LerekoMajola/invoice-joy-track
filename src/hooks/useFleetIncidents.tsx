import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FleetIncident {
  id: string;
  vehicleId: string;
  driverName: string | null;
  incidentType: string;
  date: string;
  cost: number;
  description: string | null;
  severity: string;
  createdAt: string;
}

export interface FleetIncidentInsert {
  vehicleId: string;
  driverName?: string;
  incidentType: string;
  date?: string;
  cost?: number;
  description?: string;
  severity?: string;
}

export function useFleetIncidents(vehicleId?: string) {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<FleetIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncidents = async () => {
    if (!user) { setIncidents([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_incidents').select('*').order('date', { ascending: false });
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setIncidents((data || []).map(r => ({
        id: r.id, vehicleId: r.vehicle_id, driverName: r.driver_name,
        incidentType: r.incident_type, date: r.date, cost: Number(r.cost || 0),
        description: r.description, severity: r.severity, createdAt: r.created_at,
      })));
    } catch (e) {
      console.error('Error fetching incidents:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, [user, vehicleId]);

  const createIncident = async (inc: FleetIncidentInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('fleet_incidents').insert({
        user_id: user.id, vehicle_id: inc.vehicleId,
        driver_name: inc.driverName || null, incident_type: inc.incidentType,
        date: inc.date || new Date().toISOString().split('T')[0],
        cost: inc.cost || 0, description: inc.description || null,
        severity: inc.severity || 'low',
      });
      if (error) throw error;
      await fetchIncidents();
      toast.success('Incident logged');
      return true;
    } catch (e) {
      toast.error('Failed to log incident');
      return false;
    }
  };

  return { incidents, isLoading, createIncident, refetch: fetchIncidents };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FleetCostSummary {
  vehicleId: string;
  fuel: number;
  maintenance: number;
  incidents: number;
  total: number;
}

export function useFleetCosts() {
  const { user } = useAuth();
  const [costsByVehicle, setCostsByVehicle] = useState<Record<string, FleetCostSummary>>({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCosts = async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

      const [fuelRes, serviceRes, incidentRes] = await Promise.all([
        supabase.from('fleet_fuel_logs').select('vehicle_id, cost, date'),
        supabase.from('fleet_service_logs').select('vehicle_id, cost, service_date'),
        supabase.from('fleet_incidents').select('vehicle_id, cost, date'),
      ]);

      const costs: Record<string, FleetCostSummary> = {};
      const ensure = (vid: string) => {
        if (!costs[vid]) costs[vid] = { vehicleId: vid, fuel: 0, maintenance: 0, incidents: 0, total: 0 };
      };

      let mTotal = 0;

      (fuelRes.data || []).forEach(r => {
        ensure(r.vehicle_id);
        costs[r.vehicle_id].fuel += Number(r.cost);
        costs[r.vehicle_id].total += Number(r.cost);
        if (r.date >= monthStart) mTotal += Number(r.cost);
      });

      (serviceRes.data || []).forEach(r => {
        ensure(r.vehicle_id);
        costs[r.vehicle_id].maintenance += Number(r.cost);
        costs[r.vehicle_id].total += Number(r.cost);
        if (r.service_date >= monthStart) mTotal += Number(r.cost);
      });

      (incidentRes.data || []).forEach(r => {
        ensure(r.vehicle_id);
        costs[r.vehicle_id].incidents += Number(r.cost || 0);
        costs[r.vehicle_id].total += Number(r.cost || 0);
        if (r.date >= monthStart) mTotal += Number(r.cost || 0);
      });

      setCostsByVehicle(costs);
      setMonthlyTotal(mTotal);
    } catch (e) {
      console.error('Error fetching fleet costs:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCosts(); }, [user]);

  return { costsByVehicle, monthlyTotal, isLoading, refetch: fetchCosts };
}

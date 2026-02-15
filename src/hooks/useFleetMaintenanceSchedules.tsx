import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { addMonths, format } from 'date-fns';

export interface FleetMaintenanceSchedule {
  id: string;
  vehicleId: string;
  serviceType: string;
  intervalKm: number | null;
  intervalMonths: number | null;
  lastCompletedDate: string | null;
  lastCompletedOdometer: number | null;
  nextDueDate: string | null;
  nextDueOdometer: number | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

export interface FleetMaintenanceScheduleInsert {
  vehicleId: string;
  serviceType: string;
  intervalKm?: number;
  intervalMonths?: number;
  lastCompletedDate?: string;
  lastCompletedOdometer?: number;
  nextDueDate?: string;
  nextDueOdometer?: number;
  notes?: string;
}

function mapRow(row: any): FleetMaintenanceSchedule {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    serviceType: row.service_type,
    intervalKm: row.interval_km,
    intervalMonths: row.interval_months,
    lastCompletedDate: row.last_completed_date,
    lastCompletedOdometer: row.last_completed_odometer,
    nextDueDate: row.next_due_date,
    nextDueOdometer: row.next_due_odometer,
    isActive: row.is_active,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function useFleetMaintenanceSchedules(vehicleId?: string) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<FleetMaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = async () => {
    if (!user) { setSchedules([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_maintenance_schedules').select('*').order('next_due_date', { ascending: true });
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setSchedules((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching maintenance schedules:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSchedules(); }, [user, vehicleId]);

  const createSchedule = async (s: FleetMaintenanceScheduleInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      // Auto-calculate next due if not provided
      let nextDueDate = s.nextDueDate;
      let nextDueOdometer = s.nextDueOdometer;

      if (!nextDueDate && s.intervalMonths) {
        const base = s.lastCompletedDate ? new Date(s.lastCompletedDate) : new Date();
        nextDueDate = format(addMonths(base, s.intervalMonths), 'yyyy-MM-dd');
      }
      if (!nextDueOdometer && s.intervalKm && s.lastCompletedOdometer) {
        nextDueOdometer = s.lastCompletedOdometer + s.intervalKm;
      }

      const { error } = await supabase.from('fleet_maintenance_schedules').insert({
        user_id: user.id,
        vehicle_id: s.vehicleId,
        service_type: s.serviceType,
        interval_km: s.intervalKm || null,
        interval_months: s.intervalMonths || null,
        last_completed_date: s.lastCompletedDate || null,
        last_completed_odometer: s.lastCompletedOdometer || null,
        next_due_date: nextDueDate || null,
        next_due_odometer: nextDueOdometer || null,
        notes: s.notes || null,
      });
      if (error) throw error;
      await fetchSchedules();
      toast.success('Maintenance schedule created');
      return true;
    } catch (e) {
      console.error('Error creating schedule:', e);
      toast.error('Failed to create schedule');
      return false;
    }
  };

  const markCompleted = async (id: string, odometer: number): Promise<boolean> => {
    try {
      const schedule = schedules.find(s => s.id === id);
      if (!schedule) return false;

      const today = format(new Date(), 'yyyy-MM-dd');
      let nextDueDate: string | null = null;
      let nextDueOdometer: number | null = null;

      if (schedule.intervalMonths) {
        nextDueDate = format(addMonths(new Date(), schedule.intervalMonths), 'yyyy-MM-dd');
      }
      if (schedule.intervalKm) {
        nextDueOdometer = odometer + schedule.intervalKm;
      }

      const { error } = await supabase.from('fleet_maintenance_schedules').update({
        last_completed_date: today,
        last_completed_odometer: odometer,
        next_due_date: nextDueDate,
        next_due_odometer: nextDueOdometer,
      }).eq('id', id);

      if (error) throw error;
      await fetchSchedules();
      toast.success('Service marked as completed');
      return true;
    } catch (e) {
      toast.error('Failed to update schedule');
      return false;
    }
  };

  const deleteSchedule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_maintenance_schedules').delete().eq('id', id);
      if (error) throw error;
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success('Schedule deleted');
      return true;
    } catch (e) {
      toast.error('Failed to delete schedule');
      return false;
    }
  };

  // Compute overdue schedules
  const today = new Date().toISOString().split('T')[0];
  const overdue = schedules.filter(s => s.isActive && s.nextDueDate && s.nextDueDate < today);
  const upcoming = schedules.filter(s => s.isActive && s.nextDueDate && s.nextDueDate >= today);

  return { schedules, overdue, upcoming, isLoading, createSchedule, markCompleted, deleteSchedule, refetch: fetchSchedules };
}

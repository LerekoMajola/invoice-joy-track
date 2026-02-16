import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  licensePlate: string | null;
  licenseExpiry: string | null;
  insuranceExpiry: string | null;
  odometer: number;
  assignedDriver: string | null;
  purchasePrice: number;
  financeDetails: string | null;
  status: string;
  healthScore: number;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FleetVehicleInsert {
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  licenseExpiry?: string;
  insuranceExpiry?: string;
  odometer?: number;
  assignedDriver?: string;
  purchasePrice?: number;
  financeDetails?: string;
  status?: string;
  notes?: string;
}

export function computeHealthScore(vehicle: FleetVehicle, serviceCount: number, monthlyCostTrend: number): number {
  let score = 100;
  
  // Age penalty: lose 3 points per year over 5 years
  const age = new Date().getFullYear() - vehicle.year;
  if (age > 5) score -= (age - 5) * 3;
  
  // Mileage penalty: lose 1 point per 10,000 km over 50,000
  if (vehicle.odometer > 50000) score -= Math.floor((vehicle.odometer - 50000) / 10000);
  
  // Repair frequency: lose 5 points per service in last 12 months over 3
  if (serviceCount > 3) score -= (serviceCount - 3) * 5;
  
  // Cost trend: if rising, lose points
  if (monthlyCostTrend > 0) score -= Math.min(monthlyCostTrend * 2, 15);
  
  return Math.max(0, Math.min(100, score));
}

export function getHealthLabel(score: number): { label: string; color: 'green' | 'amber' | 'red' } {
  if (score >= 70) return { label: 'Healthy', color: 'green' };
  if (score >= 40) return { label: 'Monitor', color: 'amber' };
  return { label: 'Replace Soon', color: 'red' };
}

function mapRow(row: any): FleetVehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    vin: row.vin,
    licensePlate: row.license_plate,
    licenseExpiry: row.license_expiry,
    insuranceExpiry: row.insurance_expiry,
    odometer: Number(row.odometer || 0),
    assignedDriver: row.assigned_driver,
    purchasePrice: Number(row.purchase_price || 0),
    financeDetails: row.finance_details,
    status: row.status,
    healthScore: Number(row.health_score || 100),
    notes: row.notes,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useFleetVehicles() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicles = async () => {
    if (!user) { setVehicles([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_vehicles').select('*').order('created_at', { ascending: false });
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setVehicles((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching fleet vehicles:', e);
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [user, activeCompanyId]);

  const createVehicle = async (v: FleetVehicleInsert): Promise<FleetVehicle | null> => {
    if (!user) { toast.error('You must be logged in'); return null; }
    try {
      const { data, error } = await supabase
        .from('fleet_vehicles')
        .insert({
          user_id: user.id,
          company_profile_id: activeCompanyId || null,
          make: v.make,
          model: v.model,
          year: v.year,
          vin: v.vin || null,
          license_plate: v.licensePlate || null,
          license_expiry: v.licenseExpiry || null,
          insurance_expiry: v.insuranceExpiry || null,
          odometer: v.odometer || 0,
          assigned_driver: v.assignedDriver || null,
          purchase_price: v.purchasePrice || 0,
          finance_details: v.financeDetails || null,
          status: v.status || 'active',
          notes: v.notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      const newVehicle = mapRow(data);
      setVehicles(prev => [newVehicle, ...prev]);
      toast.success('Vehicle added successfully');
      return newVehicle;
    } catch (e) {
      console.error('Error creating vehicle:', e);
      toast.error('Failed to add vehicle');
      return null;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<FleetVehicleInsert>): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.make !== undefined) dbUpdates.make = updates.make;
      if (updates.model !== undefined) dbUpdates.model = updates.model;
      if (updates.year !== undefined) dbUpdates.year = updates.year;
      if (updates.vin !== undefined) dbUpdates.vin = updates.vin;
      if (updates.licensePlate !== undefined) dbUpdates.license_plate = updates.licensePlate;
      if (updates.licenseExpiry !== undefined) dbUpdates.license_expiry = updates.licenseExpiry;
      if (updates.insuranceExpiry !== undefined) dbUpdates.insurance_expiry = updates.insuranceExpiry;
      if (updates.odometer !== undefined) dbUpdates.odometer = updates.odometer;
      if (updates.assignedDriver !== undefined) dbUpdates.assigned_driver = updates.assignedDriver;
      if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
      if (updates.financeDetails !== undefined) dbUpdates.finance_details = updates.financeDetails;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase.from('fleet_vehicles').update(dbUpdates).eq('id', id);
      if (error) throw error;
      await fetchVehicles();
      toast.success('Vehicle updated');
      return true;
    } catch (e) {
      console.error('Error updating vehicle:', e);
      toast.error('Failed to update vehicle');
      return false;
    }
  };

  const deleteVehicle = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_vehicles').delete().eq('id', id);
      if (error) throw error;
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Vehicle deleted');
      return true;
    } catch (e) {
      console.error('Error deleting vehicle:', e);
      toast.error('Failed to delete vehicle');
      return false;
    }
  };

  return { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle, refetch: fetchVehicles };
}

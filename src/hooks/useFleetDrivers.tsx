import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface FleetDriver {
  id: string;
  fullName: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseType: string;
  riskScore: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface FleetDriverInsert {
  fullName: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseType?: string;
  notes?: string;
}

function mapRow(row: any): FleetDriver {
  return {
    id: row.id, fullName: row.full_name, phone: row.phone,
    licenseNumber: row.license_number, licenseExpiry: row.license_expiry,
    licenseType: row.license_type || 'B', riskScore: Number(row.risk_score || 100),
    status: row.status, notes: row.notes, createdAt: row.created_at,
  };
}

export function useFleetDrivers() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrivers = async () => {
    if (!user) { setDrivers([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_drivers').select('*').order('full_name');
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setDrivers((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching drivers:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchDrivers();

    const channel = supabase
      .channel('fleet-drivers-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet_drivers' }, () => {
        fetchDrivers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCompanyId]);

  const createDriver = async (d: FleetDriverInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('fleet_drivers').insert({
        user_id: user.id, company_profile_id: activeCompanyId || null,
        full_name: d.fullName, phone: d.phone || null,
        license_number: d.licenseNumber || null, license_expiry: d.licenseExpiry || null,
        license_type: d.licenseType || 'B', notes: d.notes || null,
      });
      if (error) throw error;
      await fetchDrivers();
      toast.success('Driver added');
      return true;
    } catch (e) {
      toast.error('Failed to add driver');
      return false;
    }
  };

  const updateDriver = async (id: string, updates: Partial<FleetDriverInsert>): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.licenseNumber !== undefined) dbUpdates.license_number = updates.licenseNumber;
      if (updates.licenseExpiry !== undefined) dbUpdates.license_expiry = updates.licenseExpiry;
      if (updates.licenseType !== undefined) dbUpdates.license_type = updates.licenseType;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase.from('fleet_drivers').update(dbUpdates).eq('id', id);
      if (error) throw error;
      await fetchDrivers();
      toast.success('Driver updated');
      return true;
    } catch (e) {
      toast.error('Failed to update driver');
      return false;
    }
  };

  const deleteDriver = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_drivers').delete().eq('id', id);
      if (error) throw error;
      setDrivers(prev => prev.filter(d => d.id !== id));
      toast.success('Driver removed');
      return true;
    } catch (e) {
      toast.error('Failed to remove driver');
      return false;
    }
  };

  // License expiry alerts
  const today = new Date().toISOString().split('T')[0];
  const expiringLicenses = drivers.filter(d => d.licenseExpiry && d.licenseExpiry <= new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

  return { drivers, expiringLicenses, isLoading, createDriver, updateDriver, deleteDriver, refetch: fetchDrivers };
}

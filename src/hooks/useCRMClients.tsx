import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface CRMClient {
  id: string;
  company: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: string | null;
  sourceLeadId: string | null;
  totalRevenue: number;
  lastActivityAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientInsert {
  company: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  sourceLeadId?: string;
  status?: string;
}

interface ClientUpdate extends Partial<ClientInsert> {
  id: string;
}

export const CLIENT_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-500' },
  { value: 'churned', label: 'Churned', color: 'bg-red-500' },
] as const;

export function useCRMClients() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;

      if (error) throw error;

      setClients(
        (data || []).map((c) => ({
          id: c.id,
          company: c.company,
          contactPerson: c.contact_person,
          email: c.email,
          phone: c.phone,
          address: c.address,
          source: c.source,
          sourceLeadId: c.source_lead_id,
          totalRevenue: c.total_revenue || 0,
          lastActivityAt: c.last_activity_at,
          status: c.status || 'active',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user, activeCompanyId]);

  const createClient = async (client: ClientInsert): Promise<CRMClient | null> => {
    if (!user) {
      toast.error('You must be logged in to create a client');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          company_profile_id: activeCompanyId || null,
          company: client.company,
          contact_person: client.contactPerson || null,
          email: client.email || null,
          phone: client.phone || null,
          address: client.address || null,
          source: client.source || null,
          source_lead_id: client.sourceLeadId || null,
          status: client.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const newClient: CRMClient = {
        id: data.id,
        company: data.company,
        contactPerson: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        source: data.source,
        sourceLeadId: data.source_lead_id,
        totalRevenue: data.total_revenue || 0,
        lastActivityAt: data.last_activity_at,
        status: data.status || 'active',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setClients((prev) => [newClient, ...prev]);
      toast.success('Client created successfully');
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
      return null;
    }
  };

  const updateClient = async ({ id, ...updates }: ClientUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company: updates.company,
          contact_person: updates.contactPerson,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          source: updates.source,
          source_lead_id: updates.sourceLeadId,
          status: updates.status,
        })
        .eq('id', id);

      if (error) throw error;

      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                company: updates.company ?? c.company,
                contactPerson: updates.contactPerson ?? c.contactPerson,
                email: updates.email ?? c.email,
                phone: updates.phone ?? c.phone,
                address: updates.address ?? c.address,
                source: updates.source ?? c.source,
                sourceLeadId: updates.sourceLeadId ?? c.sourceLeadId,
                status: updates.status ?? c.status,
              }
            : c
        )
      );
      toast.success('Client updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) throw error;

      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success('Client deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  };

  return {
    clients,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}

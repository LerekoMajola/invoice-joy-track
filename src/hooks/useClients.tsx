import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface Client {
  id: string;
  company: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClientInsert {
  company: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export function useClients() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
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

    const channel = supabase
      .channel('clients-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCompanyId]);

  const createClient = async (client: ClientInsert): Promise<Client | null> => {
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
        })
        .select()
        .single();

      if (error) throw error;

      const newClient: Client = {
        id: data.id,
        company: data.company,
        contactPerson: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
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

  const updateClient = async (id: string, updates: Partial<ClientInsert>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company: updates.company,
          contact_person: updates.contactPerson,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
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

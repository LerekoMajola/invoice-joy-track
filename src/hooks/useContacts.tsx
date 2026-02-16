import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { useToast } from './use-toast';

export interface Contact {
  id: string;
  user_id: string;
  client_id: string | null;
  lead_id: string | null;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInsert {
  client_id?: string | null;
  lead_id?: string | null;
  name: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
  notes?: string | null;
}

export interface ContactUpdate extends Partial<ContactInsert> {
  id: string;
}

export function useContacts(clientId?: string, leadId?: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase.from('contacts').select('*');

      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      if (clientId) {
        query = query.eq('client_id', clientId);
      } else if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query.order('is_primary', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching contacts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user, clientId, leadId, activeCompanyId]);

  const createContact = async (contact: ContactInsert) => {
    if (!user) return null;

    try {
      // If this is the primary contact, unset other primaries first
      if (contact.is_primary && (contact.client_id || contact.lead_id)) {
        const updateQuery = supabase
          .from('contacts')
          .update({ is_primary: false });

        if (contact.client_id) {
          await updateQuery.eq('client_id', contact.client_id);
        } else if (contact.lead_id) {
          await updateQuery.eq('lead_id', contact.lead_id);
        }
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contact,
          user_id: user.id,
          company_profile_id: activeCompanyId || null,
        })
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => [data, ...prev]);
      toast({
        title: 'Contact added',
        description: `${contact.name} has been added.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error adding contact',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateContact = async ({ id, ...updates }: ContactUpdate) => {
    try {
      // If setting as primary, unset other primaries first
      if (updates.is_primary) {
        const existingContact = contacts.find(c => c.id === id);
        if (existingContact) {
          const updateQuery = supabase
            .from('contacts')
            .update({ is_primary: false });

          if (existingContact.client_id) {
            await updateQuery.eq('client_id', existingContact.client_id).neq('id', id);
          } else if (existingContact.lead_id) {
            await updateQuery.eq('lead_id', existingContact.lead_id).neq('id', id);
          }
        }
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContacts(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: 'Contact updated',
        description: 'Contact has been updated.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating contact',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Contact deleted',
        description: 'Contact has been removed.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error deleting contact',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const setPrimaryContact = async (id: string) => {
    return updateContact({ id, is_primary: true });
  };

  return {
    contacts,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    refetch: fetchContacts,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  estimated_value: number | null;
  status: string;
  priority: string | null;
  next_follow_up: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInsert {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  estimated_value?: number | null;
  status?: string;
  priority?: string | null;
  next_follow_up?: string | null;
  notes?: string | null;
}

export interface LeadUpdate extends Partial<LeadInsert> {
  id: string;
}

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-orange-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-amber-500' },
  { value: 'won', label: 'Won', color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
] as const;

export const LEAD_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export const LEAD_SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'tender', label: 'Tender' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'networking', label: 'Networking' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'other', label: 'Other' },
] as const;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkForDuplicate = async (lead: LeadInsert, excludeId?: string) => {
    if (!user) return null;

    // Check by email
    if (lead.email?.trim()) {
      let query = supabase
        .from('leads')
        .select('id, name')
        .ilike('email', lead.email.trim());
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data } = await query.maybeSingle();
      if (data) return { field: 'email', existingLead: data };
    }

    // Check by phone
    if (lead.phone?.trim()) {
      let query = supabase
        .from('leads')
        .select('id, name')
        .eq('phone', lead.phone.trim());
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data } = await query.maybeSingle();
      if (data) return { field: 'phone', existingLead: data };
    }

    return null;
  };

  const fetchLeads = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching leads',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const createLead = async (lead: LeadInsert) => {
    if (!user) return null;

    try {
      // Check for duplicates before inserting
      const duplicateCheck = await checkForDuplicate(lead);
      if (duplicateCheck) {
        toast({
          title: 'Duplicate Lead Found',
          description: `A lead with this ${duplicateCheck.field} already exists: ${duplicateCheck.existingLead.name}`,
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => [data, ...prev]);
      toast({
        title: 'Lead created',
        description: `${lead.name} has been added to your leads.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating lead',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLead = async ({ id, ...updates }: LeadUpdate) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => prev.map(l => l.id === id ? data : l));
      toast({
        title: 'Lead updated',
        description: 'Lead has been updated successfully.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating lead',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.filter(l => l.id !== id));
      toast({
        title: 'Lead deleted',
        description: 'Lead has been removed.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error deleting lead',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const convertToClient = async (lead: Lead) => {
    if (!user) return null;

    try {
      // Create client from lead with source tracking
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          company: lead.company || lead.name,
          contact_person: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          source_lead_id: lead.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Update lead status to won
      await updateLead({ id: lead.id, status: 'won' });

      toast({
        title: 'Lead converted',
        description: `${lead.name} has been converted to a client.`,
      });
      return client;
    } catch (error: any) {
      toast({
        title: 'Error converting lead',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    convertToClient,
    refetch: fetchLeads,
  };
}

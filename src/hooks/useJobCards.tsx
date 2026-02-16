import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface JobCardLineItem {
  id: string;
  itemType: 'parts' | 'labour';
  description: string;
  partNumber: string | null;
  quantity: number;
  unitPrice: number;
}

export type JobCardStatus =
  | 'received'
  | 'diagnosing'
  | 'diagnosed'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'awaiting_parts'
  | 'quality_check'
  | 'completed'
  | 'invoiced'
  | 'collected';

export interface JobCard {
  id: string;
  jobCardNumber: string;
  clientId: string | null;
  clientName: string;
  vehicleReg: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: string | null;
  vehicleVin: string | null;
  vehicleMileage: string | null;
  vehicleColor: string | null;
  reportedIssue: string | null;
  diagnosis: string | null;
  recommendedWork: string | null;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
  sourceQuoteId: string | null;
  invoiceId: string | null;
  priority: string;
  status: JobCardStatus;
  estimatedCompletion: string | null;
  completedAt: string | null;
  taxRate: number;
  total: number;
  notes: string | null;
  lineItems: JobCardLineItem[];
  createdAt: string;
  updatedAt: string;
}

interface JobCardInsert {
  clientId?: string;
  clientName: string;
  vehicleReg?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleVin?: string;
  vehicleMileage?: string;
  vehicleColor?: string;
  reportedIssue?: string;
  priority?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  estimatedCompletion?: string;
  notes?: string;
}

export function useJobCards() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async (): Promise<User | null> => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (sessionUser) return sessionUser;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  };

  const fetchJobCards = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      setJobCards([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('job_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }

      const { data: jobCardsData, error: jobCardsError } = await query;

      const ids = (jobCardsData || []).map((jc) => jc.id);
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('job_card_line_items')
        .select('*')
        .in('job_card_id', ids.length > 0 ? ids : ['']);

      if (lineItemsError) throw lineItemsError;

      const lineItemsByJobCard: Record<string, JobCardLineItem[]> = {};
      (lineItemsData || []).forEach((item) => {
        if (!lineItemsByJobCard[item.job_card_id]) {
          lineItemsByJobCard[item.job_card_id] = [];
        }
        lineItemsByJobCard[item.job_card_id].push({
          id: item.id,
          itemType: item.item_type as 'parts' | 'labour',
          description: item.description,
          partNumber: item.part_number,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
        });
      });

      setJobCards(
        (jobCardsData || []).map((jc) => ({
          id: jc.id,
          jobCardNumber: jc.job_card_number,
          clientId: jc.client_id,
          clientName: jc.client_name,
          vehicleReg: jc.vehicle_reg,
          vehicleMake: jc.vehicle_make,
          vehicleModel: jc.vehicle_model,
          vehicleYear: jc.vehicle_year,
          vehicleVin: jc.vehicle_vin,
          vehicleMileage: jc.vehicle_mileage,
          vehicleColor: jc.vehicle_color,
          reportedIssue: jc.reported_issue,
          diagnosis: jc.diagnosis,
          recommendedWork: jc.recommended_work,
          assignedTechnicianId: jc.assigned_technician_id,
          assignedTechnicianName: jc.assigned_technician_name,
          sourceQuoteId: jc.source_quote_id,
          invoiceId: jc.invoice_id,
          priority: jc.priority,
          status: jc.status as JobCardStatus,
          estimatedCompletion: jc.estimated_completion,
          completedAt: jc.completed_at,
          taxRate: Number(jc.tax_rate),
          total: Number(jc.total),
          notes: jc.notes,
          lineItems: lineItemsByJobCard[jc.id] || [],
          createdAt: jc.created_at,
          updatedAt: jc.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching job cards:', error);
      toast.error('Failed to load job cards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [user, activeCompanyId]);

  const generateJobCardNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('job_cards')
      .select('job_card_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (data && data.length > 0) {
      const match = data[0].job_card_number.match(/JC-(\d+)/);
      if (match) lastNum = parseInt(match[1], 10);
    }
    return `JC-${String(lastNum + 1).padStart(4, '0')}`;
  };

  const createJobCard = async (jobCard: JobCardInsert): Promise<JobCard | null> => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      toast.error('You must be logged in to create a job card');
      return null;
    }

    try {
      const jobCardNumber = await generateJobCardNumber();

      const { data, error } = await supabase
        .from('job_cards')
        .insert({
          user_id: activeUser.id,
          company_profile_id: activeCompanyId || null,
          job_card_number: jobCardNumber,
          client_id: jobCard.clientId || null,
          client_name: jobCard.clientName,
          vehicle_reg: jobCard.vehicleReg || null,
          vehicle_make: jobCard.vehicleMake || null,
          vehicle_model: jobCard.vehicleModel || null,
          vehicle_year: jobCard.vehicleYear || null,
          vehicle_vin: jobCard.vehicleVin || null,
          vehicle_mileage: jobCard.vehicleMileage || null,
          vehicle_color: jobCard.vehicleColor || null,
          reported_issue: jobCard.reportedIssue || null,
          priority: jobCard.priority || 'medium',
          assigned_technician_id: jobCard.assignedTechnicianId || null,
          assigned_technician_name: jobCard.assignedTechnicianName || null,
          estimated_completion: jobCard.estimatedCompletion || null,
          notes: jobCard.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newJobCard: JobCard = {
        id: data.id,
        jobCardNumber: data.job_card_number,
        clientId: data.client_id,
        clientName: data.client_name,
        vehicleReg: data.vehicle_reg,
        vehicleMake: data.vehicle_make,
        vehicleModel: data.vehicle_model,
        vehicleYear: data.vehicle_year,
        vehicleVin: data.vehicle_vin,
        vehicleMileage: data.vehicle_mileage,
        vehicleColor: data.vehicle_color,
        reportedIssue: data.reported_issue,
        diagnosis: data.diagnosis,
        recommendedWork: data.recommended_work,
        assignedTechnicianId: data.assigned_technician_id,
        assignedTechnicianName: data.assigned_technician_name,
        sourceQuoteId: data.source_quote_id,
        invoiceId: data.invoice_id,
        priority: data.priority,
        status: data.status as JobCardStatus,
        estimatedCompletion: data.estimated_completion,
        completedAt: data.completed_at,
        taxRate: Number(data.tax_rate),
        total: Number(data.total),
        notes: data.notes,
        lineItems: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setJobCards((prev) => [newJobCard, ...prev]);
      toast.success('Job card created successfully');
      return newJobCard;
    } catch (error) {
      console.error('Error creating job card:', error);
      toast.error('Failed to create job card');
      return null;
    }
  };

  const updateJobCard = async (
    id: string,
    updates: Record<string, any>
  ): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
      if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
      if (updates.vehicleReg !== undefined) dbUpdates.vehicle_reg = updates.vehicleReg;
      if (updates.vehicleMake !== undefined) dbUpdates.vehicle_make = updates.vehicleMake;
      if (updates.vehicleModel !== undefined) dbUpdates.vehicle_model = updates.vehicleModel;
      if (updates.vehicleYear !== undefined) dbUpdates.vehicle_year = updates.vehicleYear;
      if (updates.vehicleVin !== undefined) dbUpdates.vehicle_vin = updates.vehicleVin;
      if (updates.vehicleMileage !== undefined) dbUpdates.vehicle_mileage = updates.vehicleMileage;
      if (updates.vehicleColor !== undefined) dbUpdates.vehicle_color = updates.vehicleColor;
      if (updates.reportedIssue !== undefined) dbUpdates.reported_issue = updates.reportedIssue;
      if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis;
      if (updates.recommendedWork !== undefined) dbUpdates.recommended_work = updates.recommendedWork;
      if (updates.assignedTechnicianId !== undefined) dbUpdates.assigned_technician_id = updates.assignedTechnicianId;
      if (updates.assignedTechnicianName !== undefined) dbUpdates.assigned_technician_name = updates.assignedTechnicianName;
      if (updates.sourceQuoteId !== undefined) dbUpdates.source_quote_id = updates.sourceQuoteId;
      if (updates.invoiceId !== undefined) dbUpdates.invoice_id = updates.invoiceId;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.estimatedCompletion !== undefined) dbUpdates.estimated_completion = updates.estimatedCompletion;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.taxRate !== undefined) dbUpdates.tax_rate = updates.taxRate;
      if (updates.total !== undefined) dbUpdates.total = updates.total;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('job_cards')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      await fetchJobCards();
      return true;
    } catch (error) {
      console.error('Error updating job card:', error);
      toast.error('Failed to update job card');
      return false;
    }
  };

  const updateStatus = async (id: string, status: JobCardStatus): Promise<boolean> => {
    const updates: Record<string, any> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    const success = await updateJobCard(id, updates);
    if (success) toast.success(`Job card marked as ${status.replace('_', ' ')}`);
    return success;
  };

  const addLineItem = async (
    jobCardId: string,
    item: Omit<JobCardLineItem, 'id'>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from('job_card_line_items').insert({
        job_card_id: jobCardId,
        item_type: item.itemType,
        description: item.description,
        part_number: item.partNumber || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      });

      if (error) throw error;

      // Recalculate total
      await recalculateTotal(jobCardId);
      await fetchJobCards();
      return true;
    } catch (error) {
      console.error('Error adding line item:', error);
      toast.error('Failed to add line item');
      return false;
    }
  };

  const removeLineItem = async (jobCardId: string, lineItemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_card_line_items')
        .delete()
        .eq('id', lineItemId);

      if (error) throw error;

      await recalculateTotal(jobCardId);
      await fetchJobCards();
      return true;
    } catch (error) {
      console.error('Error removing line item:', error);
      toast.error('Failed to remove line item');
      return false;
    }
  };

  const recalculateTotal = async (jobCardId: string) => {
    const { data: items } = await supabase
      .from('job_card_line_items')
      .select('quantity, unit_price')
      .eq('job_card_id', jobCardId);

    const subtotal = (items || []).reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.unit_price),
      0
    );

    const jobCard = jobCards.find((jc) => jc.id === jobCardId);
    const taxRate = jobCard?.taxRate ?? 15;
    const total = subtotal * (1 + taxRate / 100);

    await supabase
      .from('job_cards')
      .update({ total })
      .eq('id', jobCardId);
  };

  const deleteJobCard = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('job_cards').delete().eq('id', id);
      if (error) throw error;

      setJobCards((prev) => prev.filter((jc) => jc.id !== id));
      toast.success('Job card deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting job card:', error);
      toast.error('Failed to delete job card');
      return false;
    }
  };

  return {
    jobCards,
    isLoading,
    createJobCard,
    updateJobCard,
    updateStatus,
    addLineItem,
    removeLineItem,
    deleteJobCard,
    refetch: fetchJobCards,
  };
}

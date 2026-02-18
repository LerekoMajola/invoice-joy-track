import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface GymMembershipPlan {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  price: number;
  category: string;
  maxFreezes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GymMembershipPlanInsert {
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  category?: string;
  maxFreezes?: number;
  isActive?: boolean;
}

export function useGymMembershipPlans() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async () => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.user ?? null;
  };

  const fetchPlans = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) { setPlans([]); setIsLoading(false); return; }

    try {
      let query = (supabase.from('gym_membership_plans') as any).select('*').order('price', { ascending: true });
      if (activeCompanyId) query = query.eq('company_profile_id', activeCompanyId);
      const { data, error } = await query;
      if (error) throw error;

      setPlans((data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        durationDays: p.duration_days,
        price: Number(p.price),
        category: p.category,
        maxFreezes: p.max_freezes,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load membership plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, [user, activeCompanyId]);

  const createPlan = async (plan: GymMembershipPlanInsert): Promise<boolean> => {
    const activeUser = await getActiveUser();
    if (!activeUser) { toast.error('You must be logged in'); return false; }

    try {
      const { error } = await (supabase.from('gym_membership_plans') as any).insert({
        user_id: activeUser.id,
        company_profile_id: activeCompanyId || null,
        name: plan.name,
        description: plan.description || null,
        duration_days: plan.durationDays,
        price: plan.price,
        category: plan.category || 'monthly',
        max_freezes: plan.maxFreezes ?? 0,
        is_active: plan.isActive ?? true,
      });
      if (error) throw error;
      await fetchPlans();
      toast.success('Plan created');
      return true;
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create plan');
      return false;
    }
  };

  const updatePlan = async (id: string, updates: Partial<GymMembershipPlanInsert>): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.maxFreezes !== undefined) dbUpdates.max_freezes = updates.maxFreezes;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await (supabase.from('gym_membership_plans') as any).update(dbUpdates).eq('id', id);
      if (error) throw error;
      await fetchPlans();
      toast.success('Plan updated');
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
      return false;
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase.from('gym_membership_plans') as any).delete().eq('id', id);
      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan removed');
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to remove plan');
      return false;
    }
  };

  return { plans, isLoading, createPlan, updatePlan, deletePlan, refetch: fetchPlans };
}

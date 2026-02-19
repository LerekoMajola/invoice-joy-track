 import { useState, useEffect, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { useToast } from './use-toast';
 import { differenceInDays, parseISO, isPast } from 'date-fns';
 
 export interface Deal {
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
   expected_close_date: string | null;
   win_probability: number | null;
   stage_entered_at: string | null;
   last_contacted_at: string | null;
   loss_reason: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface DealInsert {
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
   expected_close_date?: string | null;
   win_probability?: number | null;
   loss_reason?: string | null;
 }
 
 export interface DealUpdate extends Partial<DealInsert> {
   id: string;
   last_contacted_at?: string | null;
 }
 
 export const DEAL_STAGES = [
   { value: 'new', label: 'New', color: 'bg-blue-500', defaultProbability: 10 },
   { value: 'contacted', label: 'Contacted', color: 'bg-purple-500', defaultProbability: 20 },
   { value: 'qualified', label: 'Qualified', color: 'bg-orange-500', defaultProbability: 40 },
   { value: 'proposal', label: 'Proposal', color: 'bg-yellow-500', defaultProbability: 60 },
   { value: 'negotiation', label: 'Negotiation', color: 'bg-amber-500', defaultProbability: 80 },
   { value: 'won', label: 'Won', color: 'bg-green-500', defaultProbability: 100 },
   { value: 'lost', label: 'Lost', color: 'bg-red-500', defaultProbability: 0 },
 ] as const;
 
 export const DEAL_PRIORITIES = [
   { value: 'low', label: 'Low', color: 'text-muted-foreground' },
   { value: 'medium', label: 'Medium', color: 'text-warning' },
   { value: 'high', label: 'High', color: 'text-destructive' },
 ] as const;
 
 export interface DealHealthScore {
   score: number; // 0-100
   level: 'healthy' | 'warning' | 'critical';
   reasons: string[];
 }
 
 export function calculateDealHealth(deal: Deal): DealHealthScore {
   let score = 100;
   const reasons: string[] = [];
 
   // Check days since last activity
   const lastActivityDate = deal.last_contacted_at || deal.updated_at;
   const daysSinceActivity = differenceInDays(new Date(), parseISO(lastActivityDate));
   
   if (daysSinceActivity > 14) {
     score -= 30;
     reasons.push(`No activity for ${daysSinceActivity} days`);
   } else if (daysSinceActivity > 7) {
     score -= 15;
     reasons.push(`${daysSinceActivity} days since last activity`);
   }
 
   // Check if follow-up is overdue
   if (deal.next_follow_up && isPast(parseISO(deal.next_follow_up))) {
     score -= 25;
     const daysOverdue = differenceInDays(new Date(), parseISO(deal.next_follow_up));
     reasons.push(`Follow-up ${daysOverdue} days overdue`);
   }
 
   // Check expected close date
   if (deal.expected_close_date) {
     if (isPast(parseISO(deal.expected_close_date))) {
       score -= 20;
       reasons.push('Expected close date passed');
     }
   } else {
     score -= 10;
     reasons.push('No expected close date set');
   }
 
   // Boost for high probability
   if (deal.win_probability && deal.win_probability >= 70) {
     score = Math.min(100, score + 10);
   }
 
   // Penalize low probability in late stages
   if (['proposal', 'negotiation'].includes(deal.status) && (deal.win_probability || 50) < 50) {
     score -= 15;
     reasons.push('Low probability in late stage');
   }
 
   // Determine level
   let level: DealHealthScore['level'] = 'healthy';
   if (score < 50) level = 'critical';
   else if (score < 75) level = 'warning';
 
   return { score: Math.max(0, Math.min(100, score)), level, reasons };
 }
 
 export function useDeals() {
   const [deals, setDeals] = useState<Deal[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();
   const { toast } = useToast();
 
   const fetchDeals = async () => {
     if (!user) return;
     
     try {
       const { data, error } = await supabase
         .from('leads')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setDeals((data as Deal[]) || []);
     } catch (error: any) {
       toast({
         title: 'Error fetching deals',
         description: error.message,
         variant: 'destructive',
       });
     } finally {
       setIsLoading(false);
     }
   };
 
  useEffect(() => {
    fetchDeals();

    const channel = supabase
      .channel('deals-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchDeals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);
 
   const createDeal = async (deal: DealInsert) => {
     if (!user) return null;
 
     try {
       // Set default probability based on stage
       const stage = DEAL_STAGES.find(s => s.value === (deal.status || 'new'));
       const probability = deal.win_probability ?? stage?.defaultProbability ?? 50;
 
       const { data, error } = await supabase
         .from('leads')
         .insert({
           ...deal,
           user_id: user.id,
           win_probability: probability,
           stage_entered_at: new Date().toISOString(),
         })
         .select()
         .single();
 
       if (error) throw error;
 
       setDeals(prev => [data as Deal, ...prev]);
       toast({
         title: 'Deal created',
         description: `${deal.name} has been added to your pipeline.`,
       });
       return data as Deal;
     } catch (error: any) {
       toast({
         title: 'Error creating deal',
         description: error.message,
         variant: 'destructive',
       });
       return null;
     }
   };
 
   const updateDeal = async ({ id, ...updates }: DealUpdate) => {
     try {
       const { data, error } = await supabase
         .from('leads')
         .update(updates)
         .eq('id', id)
         .select()
         .single();
 
       if (error) throw error;
 
       setDeals(prev => prev.map(d => d.id === id ? (data as Deal) : d));
       return data as Deal;
     } catch (error: any) {
       toast({
         title: 'Error updating deal',
         description: error.message,
         variant: 'destructive',
       });
       return null;
     }
   };
 
   const deleteDeal = async (id: string) => {
     try {
       const { error } = await supabase
         .from('leads')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
 
       setDeals(prev => prev.filter(d => d.id !== id));
       toast({
         title: 'Deal deleted',
         description: 'Deal has been removed.',
       });
       return true;
     } catch (error: any) {
       toast({
         title: 'Error deleting deal',
         description: error.message,
         variant: 'destructive',
       });
       return false;
     }
   };
 
   const convertToClient = async (deal: Deal) => {
     if (!user) return null;
 
     try {
       const { data: client, error } = await supabase
         .from('clients')
         .insert({
           user_id: user.id,
           company: deal.company || deal.name,
           contact_person: deal.name,
           email: deal.email,
           phone: deal.phone,
           source: deal.source,
           source_lead_id: deal.id,
           status: 'active',
         })
         .select()
         .single();
 
       if (error) throw error;
 
       await updateDeal({ id: deal.id, status: 'won', win_probability: 100 });
 
       toast({
         title: 'Deal won! 🎉',
         description: `${deal.name} has been converted to a client.`,
       });
       return client;
     } catch (error: any) {
       toast({
         title: 'Error converting deal',
         description: error.message,
         variant: 'destructive',
       });
       return null;
     }
   };
 
   // Computed metrics
   const metrics = useMemo(() => {
     const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.status));
     const wonDeals = deals.filter(d => d.status === 'won');
     const lostDeals = deals.filter(d => d.status === 'lost');
 
     const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
     const weightedPipelineValue = activeDeals.reduce((sum, d) => {
       const value = d.estimated_value || 0;
       const probability = (d.win_probability || 50) / 100;
       return sum + (value * probability);
     }, 0);
 
     const wonValue = wonDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
     const lostValue = lostDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
 
     const winRate = wonDeals.length + lostDeals.length > 0
       ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
       : 0;
 
     const avgDealSize = activeDeals.length > 0
       ? totalPipelineValue / activeDeals.length
       : 0;
 
     // Deals needing attention
     const dealsAtRisk = activeDeals.filter(d => {
       const health = calculateDealHealth(d);
       return health.level === 'critical' || health.level === 'warning';
     });
 
     const overdueFollowups = activeDeals.filter(d => 
       d.next_follow_up && isPast(parseISO(d.next_follow_up))
     );
 
     return {
       totalDeals: deals.length,
       activeDeals: activeDeals.length,
       wonDeals: wonDeals.length,
       lostDeals: lostDeals.length,
       totalPipelineValue,
       weightedPipelineValue,
       wonValue,
       lostValue,
       winRate,
       avgDealSize,
       dealsAtRisk: dealsAtRisk.length,
       overdueFollowups: overdueFollowups.length,
     };
   }, [deals]);
 
   // Group deals by stage
   const dealsByStage = useMemo(() => {
     return DEAL_STAGES.reduce((acc, stage) => {
       acc[stage.value] = deals.filter(d => d.status === stage.value);
       return acc;
     }, {} as Record<string, Deal[]>);
   }, [deals]);
 
   return {
     deals,
     dealsByStage,
     metrics,
     isLoading,
     createDeal,
     updateDeal,
     deleteDeal,
     convertToClient,
     refetch: fetchDeals,
   };
 }
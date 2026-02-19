import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  caseType: string;
  status: string;
  priority: string;
  clientId: string | null;
  courtName: string | null;
  courtCaseNumber: string | null;
  opposingParty: string | null;
  opposingCounsel: string | null;
  judgeName: string | null;
  assignedLawyer: string | null;
  filingDate: string | null;
  nextHearingDate: string | null;
  estimatedValue: number;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useLegalCases() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = async () => {
    if (!user) { setCases([]); setIsLoading(false); return; }
    try {
      let query = supabase
        .from('legal_cases')
        .select('*')
        .order('updated_at', { ascending: false });
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setCases((data || []).map(c => ({
        id: c.id,
        caseNumber: c.case_number,
        title: c.title,
        caseType: c.case_type,
        status: c.status,
        priority: c.priority || 'medium',
        clientId: c.client_id,
        courtName: c.court_name,
        courtCaseNumber: c.court_case_number,
        opposingParty: c.opposing_party,
        opposingCounsel: c.opposing_counsel,
        judgeName: c.judge_name,
        assignedLawyer: c.assigned_lawyer,
        filingDate: c.filing_date,
        nextHearingDate: c.next_hearing_date,
        estimatedValue: Number(c.estimated_value) || 0,
        description: c.description,
        notes: c.notes,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching legal cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();

    const channel = supabase
      .channel('legal-cases-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'legal_cases' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCompanyId]);

  return { cases, isLoading, refetch: fetchCases };
}

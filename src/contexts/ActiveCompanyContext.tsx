import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CompanyProfile } from '@/hooks/useCompanyProfile';

interface ActiveCompanyContextType {
  companies: CompanyProfile[];
  activeCompany: CompanyProfile | null;
  activeCompanyId: string | null;
  currency: string;
  isLoading: boolean;
  switchCompany: (companyId: string) => Promise<void>;
  addCompany: (name: string) => Promise<CompanyProfile | null>;
  canAddMore: boolean;
  refetchCompanies: () => Promise<void>;
}

const ActiveCompanyContext = createContext<ActiveCompanyContextType | undefined>(undefined);

const MAX_COMPANIES = 5;

export function ActiveCompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    if (!user?.id) {
      setCompanies([]);
      setActiveCompanyId(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all company profiles for this user
      const { data: profiles, error: profilesError } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (profilesError) throw profilesError;

      const typedProfiles = (profiles || []) as CompanyProfile[];
      setCompanies(typedProfiles);

      // Fetch user preferences for active company
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('active_company_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prefsError) throw prefsError;

      if (prefs?.active_company_id && typedProfiles.some(p => p.id === prefs.active_company_id)) {
        setActiveCompanyId(prefs.active_company_id);
      } else if (typedProfiles.length > 0) {
        // Default to first company
        setActiveCompanyId(typedProfiles[0].id);
        // Upsert preference
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          active_company_id: typedProfiles[0].id,
        }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const switchCompany = useCallback(async (companyId: string) => {
    if (!user?.id) return;
    
    setActiveCompanyId(companyId);

    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      active_company_id: companyId,
    }, { onConflict: 'user_id' });

    // Invalidate all data queries so they refetch with new company context
    queryClient.invalidateQueries();
  }, [user?.id, queryClient]);

  const addCompany = useCallback(async (name: string): Promise<CompanyProfile | null> => {
    if (!user?.id) return null;
    if (companies.length >= MAX_COMPANIES) {
      toast.error(`Maximum of ${MAX_COMPANIES} companies allowed per subscription`);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .insert({
          user_id: user.id,
          company_name: name,
        })
        .select()
        .single();

      if (error) throw error;

      const newProfile = data as CompanyProfile;
      setCompanies(prev => [...prev, newProfile]);
      
      // Switch to the new company
      await switchCompany(newProfile.id);
      
      toast.success(`Company "${name}" created successfully`);
      return newProfile;
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to create company');
      return null;
    }
  }, [user?.id, companies.length, switchCompany]);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || null;
  const currency = activeCompany?.currency || 'LSL';

  return (
    <ActiveCompanyContext.Provider value={{
      companies,
      activeCompany,
      activeCompanyId,
      currency,
      isLoading,
      switchCompany,
      addCompany,
      canAddMore: companies.length < MAX_COMPANIES,
      refetchCompanies: fetchCompanies,
    }}>
      {children}
    </ActiveCompanyContext.Provider>
  );
}

export function useActiveCompany() {
  const context = useContext(ActiveCompanyContext);
  if (!context) {
    throw new Error('useActiveCompany must be used within an ActiveCompanyProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CompanyProfile } from '@/hooks/useCompanyProfile';
import { useSubscription } from '@/hooks/useSubscription';

interface ActiveCompanyContextType {
  companies: CompanyProfile[];
  activeCompany: CompanyProfile | null;
  activeCompanyId: string | null;
  currency: string;
  isLoading: boolean;
  isStaff: boolean;
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
  const { multiCompanyEnabled } = useSubscription();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  const fetchCompanies = useCallback(async () => {
    if (!user?.id) {
      setCompanies([]);
      setActiveCompanyId(null);
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is a staff member FIRST
      const { data: staffRecord } = await supabase
        .from('staff_members')
        .select('owner_user_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      const isStaffUser = !!staffRecord;
      setIsStaff(isStaffUser);

      // Determine which user_id to load company profiles for
      const profileOwnerId = isStaffUser ? staffRecord!.owner_user_id : user.id;

      const { data: profiles, error: profilesError } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', profileOwnerId)
        .is('deleted_at', null)
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
        setActiveCompanyId(typedProfiles[0].id);
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

    queryClient.invalidateQueries();
  }, [user?.id, queryClient]);

  const addCompany = useCallback(async (name: string): Promise<CompanyProfile | null> => {
    if (!user?.id) return null;
    if (isStaff) {
      toast.error('Staff members cannot create companies');
      return null;
    }
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
      
      await switchCompany(newProfile.id);
      
      toast.success(`Company "${name}" created successfully`);
      return newProfile;
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to create company');
      return null;
    }
  }, [user?.id, companies.length, switchCompany, isStaff]);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || null;
  const currency = activeCompany?.currency || 'LSL';

  return (
    <ActiveCompanyContext.Provider value={{
      companies,
      activeCompany,
      activeCompanyId,
      currency,
      isLoading,
      isStaff,
      switchCompany,
      addCompany,
      canAddMore: !isStaff && multiCompanyEnabled && companies.length < MAX_COMPANIES,
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

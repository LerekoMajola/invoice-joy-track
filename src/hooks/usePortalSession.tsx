import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type PortalType = 'gym' | 'school' | null;

export interface GymPortalMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  member_number: string;
  status: string;
  user_id: string;
  owner_user_id: string | null;
  portal_user_id: string | null;
  join_date: string | null;
  date_of_birth: string | null;
  phone: string | null;
  gender: string | null;
  health_conditions: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  company_profile_id: string | null;
}

export interface SchoolPortalStudent {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_id: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  status: string;
  user_id: string;
  owner_user_id: string | null;
  portal_user_id: string | null;
  company_profile_id: string | null;
  date_of_birth: string | null;
  enrollment_date: string | null;
}

export interface PortalSession {
  user: User | null;
  portalType: PortalType;
  gymMember: GymPortalMember | null;
  schoolStudent: SchoolPortalStudent | null;
  loading: boolean;
  error: string | null;
}

export function usePortalSession(): PortalSession {
  const [user, setUser] = useState<User | null>(null);
  const [portalType, setPortalType] = useState<PortalType>(null);
  const [gymMember, setGymMember] = useState<GymPortalMember | null>(null);
  const [schoolStudent, setSchoolStudent] = useState<SchoolPortalStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!currentUser || !currentUser.email) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setUser(currentUser);

      // Determine portal type hint from URL or localStorage (used only as hint, not strict filter)
      const urlParams = new URLSearchParams(window.location.search);
      const urlType = urlParams.get('type') as PortalType;

      let resolvedType: PortalType = null;
      let foundGymMember: GymPortalMember | null = null;
      let foundStudent: SchoolPortalStudent | null = null;

      // Always check gym first (or if URL hint says gym)
      if (!urlType || urlType === 'gym') {
        const { data: member } = await supabase
          .from('gym_members')
          .select('*')
          .eq('portal_user_id', currentUser.id)
          .maybeSingle();

        if (member) {
          foundGymMember = member as unknown as GymPortalMember;
          resolvedType = 'gym';
        }
      }

      // Check school if not found yet (or if URL hint says school)
      if (!foundGymMember && (!urlType || urlType === 'school')) {
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('portal_user_id', currentUser.id)
          .maybeSingle();

        if (student) {
          foundStudent = student as unknown as SchoolPortalStudent;
          resolvedType = 'school';
        }
      }

      // If URL hinted at school but we only found gym record, still use it
      if (!resolvedType && urlType === 'school') {
        const { data: member } = await supabase
          .from('gym_members')
          .select('*')
          .eq('portal_user_id', currentUser.id)
          .maybeSingle();
        if (member) {
          foundGymMember = member as unknown as GymPortalMember;
          resolvedType = 'gym';
        }
      }

      if (!cancelled) {
        setGymMember(foundGymMember);
        setSchoolStudent(foundStudent);
        if (resolvedType) {
          localStorage.setItem('portal_type', resolvedType);
        } else {
          localStorage.removeItem('portal_type');
        }
        setPortalType(resolvedType);
        setLoading(false);
      }
    }

    resolveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        resolveSession();
      } else {
        if (!cancelled) {
          setUser(null);
          setGymMember(null);
          setSchoolStudent(null);
          setPortalType(null);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, portalType, gymMember, schoolStudent, loading, error };
}

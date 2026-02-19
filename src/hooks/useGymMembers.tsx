import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface GymMember {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  healthConditions: string | null;
  photoUrl: string | null;
  joinDate: string;
  status: 'prospect' | 'active' | 'frozen' | 'expired' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GymMemberInsert {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthConditions?: string;
  joinDate?: string;
  status?: GymMember['status'];
  notes?: string;
}

export function useGymMembers() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [members, setMembers] = useState<GymMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async () => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (sessionUser) return sessionUser;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  };

  const fetchMembers = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) { setMembers([]); setIsLoading(false); return; }

    try {
      let query = (supabase.from('gym_members') as any).select('*').order('created_at', { ascending: false });
      if (activeCompanyId) query = query.eq('company_profile_id', activeCompanyId);
      const { data, error } = await query;
      if (error) throw error;

      setMembers((data || []).map((m: any) => ({
        id: m.id,
        memberNumber: m.member_number,
        firstName: m.first_name,
        lastName: m.last_name,
        email: m.email,
        phone: m.phone,
        dateOfBirth: m.date_of_birth,
        gender: m.gender,
        address: m.address,
        emergencyContactName: m.emergency_contact_name,
        emergencyContactPhone: m.emergency_contact_phone,
        healthConditions: m.health_conditions,
        photoUrl: m.photo_url,
        joinDate: m.join_date,
        status: m.status as GymMember['status'],
        notes: m.notes,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching gym members:', error);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel('gym-members-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_members' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCompanyId]);

  const generateMemberNumber = async (): Promise<string> => {
    const { data } = await (supabase.from('gym_members') as any)
      .select('member_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (data && data.length > 0) {
      const match = data[0].member_number.match(/MEM-(\d+)/);
      if (match) lastNum = parseInt(match[1], 10);
    }
    return `MEM-${String(lastNum + 1).padStart(4, '0')}`;
  };

  const createMember = async (member: GymMemberInsert): Promise<GymMember | null> => {
    const activeUser = await getActiveUser();
    if (!activeUser) { toast.error('You must be logged in'); return null; }

    try {
      const memberNumber = await generateMemberNumber();
      const { data, error } = await (supabase.from('gym_members') as any)
        .insert({
          user_id: activeUser.id,
          company_profile_id: activeCompanyId || null,
          member_number: memberNumber,
          first_name: member.firstName,
          last_name: member.lastName,
          email: member.email || null,
          phone: member.phone || null,
          date_of_birth: member.dateOfBirth || null,
          gender: member.gender || null,
          address: member.address || null,
          emergency_contact_name: member.emergencyContactName || null,
          emergency_contact_phone: member.emergencyContactPhone || null,
          health_conditions: member.healthConditions || null,
          join_date: member.joinDate || new Date().toISOString().split('T')[0],
          status: member.status || 'prospect',
          notes: member.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchMembers();
      toast.success('Member added successfully');
      return data;
    } catch (error) {
      console.error('Error creating member:', error);
      toast.error('Failed to add member');
      return null;
    }
  };

  const updateMember = async (id: string, updates: Partial<GymMemberInsert>): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.email !== undefined) dbUpdates.email = updates.email || null;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
      if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth || null;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender || null;
      if (updates.address !== undefined) dbUpdates.address = updates.address || null;
      if (updates.emergencyContactName !== undefined) dbUpdates.emergency_contact_name = updates.emergencyContactName || null;
      if (updates.emergencyContactPhone !== undefined) dbUpdates.emergency_contact_phone = updates.emergencyContactPhone || null;
      if (updates.healthConditions !== undefined) dbUpdates.health_conditions = updates.healthConditions || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

      const { error } = await (supabase.from('gym_members') as any).update(dbUpdates).eq('id', id);
      if (error) throw error;

      await fetchMembers();
      toast.success('Member updated');
      return true;
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
      return false;
    }
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase.from('gym_members') as any).delete().eq('id', id);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Member removed');
      return true;
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to remove member');
      return false;
    }
  };

  return { members, isLoading, createMember, updateMember, deleteMember, refetch: fetchMembers };
}

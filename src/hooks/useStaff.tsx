import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { useToast } from '@/hooks/use-toast';

export type StaffRole = 'admin' | 'manager' | 'staff' | 'viewer';
export type StaffStatus = 'invited' | 'active' | 'inactive';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  status: StaffStatus;
  role: StaffRole;
  notes: string | null;
  employeeNumber: string | null;
  invitedAt: string;
  joinedAt: string | null;
  userId: string | null;
}

export interface CreateStaffData {
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  role: StaffRole;
  employeeNumber?: string;
  notes?: string;
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  status?: StaffStatus;
  employeeNumber?: string;
  notes?: string;
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const { toast } = useToast();

  const fetchStaff = useCallback(async () => {
    if (!user) {
      setStaff([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('staff_members')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }

      const { data: staffData, error: staffError } = await query;
      if (staffError) throw staffError;

      if (!staffData || staffData.length === 0) {
        setStaff([]);
        setIsLoading(false);
        return;
      }

      const staffIds = staffData.map(s => s.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('staff_roles')
        .select('*')
        .in('staff_member_id', staffIds);

      if (rolesError) throw rolesError;

      const roleMap = new Map(rolesData?.map(r => [r.staff_member_id, r.role]) || []);

      const mappedStaff: StaffMember[] = staffData.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        jobTitle: s.job_title,
        department: s.department,
        status: s.status as StaffStatus,
        role: (roleMap.get(s.id) as StaffRole) || 'viewer',
        notes: s.notes,
        employeeNumber: (s as any).employee_number || null,
        invitedAt: s.invited_at || s.created_at,
        joinedAt: s.joined_at,
        userId: s.user_id,
      }));

      setStaff(mappedStaff);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeCompanyId, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const createStaff = async (data: CreateStaffData): Promise<StaffMember | null> => {
    if (!user) return null;

    if (staff.length >= 5) {
      toast({ title: 'Staff limit reached', description: 'Maximum 5 staff members allowed.', variant: 'destructive' });
      return null;
    }

    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .insert({
          owner_user_id: user.id,
          company_profile_id: activeCompanyId || null,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          job_title: data.jobTitle || null,
          department: data.department || null,
          notes: data.notes || null,
          employee_number: data.employeeNumber || null,
          status: 'invited',
        })
        .select()
        .single();

      if (staffError) throw staffError;

      const { error: roleError } = await supabase
        .from('staff_roles')
        .insert({ staff_member_id: staffData.id, role: data.role });

      if (roleError) throw roleError;

      const newStaff: StaffMember = {
        id: staffData.id, name: staffData.name, email: staffData.email,
        phone: staffData.phone, jobTitle: staffData.job_title, department: staffData.department,
        status: staffData.status as StaffStatus, role: data.role, notes: staffData.notes,
        employeeNumber: (staffData as any).employee_number || null,
        invitedAt: staffData.invited_at || staffData.created_at, joinedAt: staffData.joined_at,
        userId: staffData.user_id,
      };

      setStaff(prev => [newStaff, ...prev]);
      toast({ title: 'Success', description: 'Staff member added successfully' });
      return newStaff;
    } catch (error: any) {
      console.error('Error creating staff:', error);
      if (error.code === '23505') {
        toast({ title: 'Error', description: 'A staff member with this email already exists', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to add staff member', variant: 'destructive' });
      }
      return null;
    }
  };

  const updateStaff = async (id: string, data: UpdateStaffData): Promise<boolean> => {
    if (!user) return false;
    try {
      const updateData: Record<string, any> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone || null;
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle || null;
      if (data.department !== undefined) updateData.department = data.department || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      if (data.employeeNumber !== undefined) updateData.employee_number = data.employeeNumber || null;

      const { error } = await supabase
        .from('staff_members')
        .update(updateData)
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      toast({ title: 'Success', description: 'Staff member updated successfully' });
      return true;
    } catch (error: any) {
      console.error('Error updating staff:', error);
      toast({ title: 'Error', description: 'Failed to update staff member', variant: 'destructive' });
      return false;
    }
  };

  const updateStaffRole = async (id: string, role: StaffRole): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error: deleteError } = await supabase.from('staff_roles').delete().eq('staff_member_id', id);
      if (deleteError) throw deleteError;
      const { error: insertError } = await supabase.from('staff_roles').insert({ staff_member_id: id, role });
      if (insertError) throw insertError;
      setStaff(prev => prev.map(s => s.id === id ? { ...s, role } : s));
      toast({ title: 'Success', description: 'Staff role updated successfully' });
      return true;
    } catch (error: any) {
      console.error('Error updating staff role:', error);
      toast({ title: 'Error', description: 'Failed to update staff role', variant: 'destructive' });
      return false;
    }
  };

  const deleteStaff = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('staff_members').delete().eq('id', id).eq('owner_user_id', user.id);
      if (error) throw error;
      setStaff(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Success', description: 'Staff member removed successfully' });
      return true;
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast({ title: 'Error', description: 'Failed to remove staff member', variant: 'destructive' });
      return false;
    }
  };

  return { staff, isLoading, createStaff, updateStaff, updateStaffRole, deleteStaff, refetch: fetchStaff };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';
import { startOfDay, endOfDay, startOfWeek, startOfMonth } from 'date-fns';

export interface GymAttendanceRecord {
  id: string;
  user_id: string;
  company_profile_id: string | null;
  member_id: string;
  check_in: string;
  check_out: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  gym_members?: {
    first_name: string;
    last_name: string;
    member_number: string;
    photo_url: string | null;
  };
}

export function useGymAttendance(selectedDate?: Date) {
  const { user } = useAuth();
  const { activeCompany } = useActiveCompany();
  const queryClient = useQueryClient();
  const viewDate = selectedDate || new Date();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['gym_attendance', user?.id, activeCompany?.id, viewDate.toDateString()],
    queryFn: async () => {
      if (!user) return [];
      const dayStart = startOfDay(viewDate).toISOString();
      const dayEnd = endOfDay(viewDate).toISOString();

      let query = supabase
        .from('gym_attendance')
        .select('*, gym_members(first_name, last_name, member_number, photo_url)')
        .eq('user_id', user.id)
        .gte('check_in', dayStart)
        .lte('check_in', dayEnd)
        .order('check_in', { ascending: false });

      if (activeCompany?.id) {
        query = query.eq('company_profile_id', activeCompany.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as GymAttendanceRecord[];
    },
    enabled: !!user,
  });

  // Weekly count
  const { data: weeklyCount = 0 } = useQuery({
    queryKey: ['gym_attendance_weekly', user?.id, activeCompany?.id],
    queryFn: async () => {
      if (!user) return 0;
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

      let query = supabase
        .from('gym_attendance')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('check_in', weekStart);

      if (activeCompany?.id) query = query.eq('company_profile_id', activeCompany.id);

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Monthly count
  const { data: monthlyCount = 0 } = useQuery({
    queryKey: ['gym_attendance_monthly', user?.id, activeCompany?.id],
    queryFn: async () => {
      if (!user) return 0;
      const monthStart = startOfMonth(new Date()).toISOString();

      let query = supabase
        .from('gym_attendance')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('check_in', monthStart);

      if (activeCompany?.id) query = query.eq('company_profile_id', activeCompany.id);

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const todayCheckins = attendance.length;
  const currentlyInGym = attendance.filter(a => !a.check_out).length;

  const checkIn = useMutation({
    mutationFn: async (memberId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('gym_attendance').insert({
        user_id: user.id,
        company_profile_id: activeCompany?.id || null,
        member_id: memberId,
        check_in: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_attendance'] });
      queryClient.invalidateQueries({ queryKey: ['gym_attendance_weekly'] });
      queryClient.invalidateQueries({ queryKey: ['gym_attendance_monthly'] });
      toast.success('Member checked in');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const checkOut = useMutation({
    mutationFn: async (attendanceId: string) => {
      const { error } = await supabase
        .from('gym_attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', attendanceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_attendance'] });
      toast.success('Member checked out');
    },
    onError: (err: any) => toast.error(err.message),
  });

  return {
    attendance,
    isLoading,
    todayCheckins,
    currentlyInGym,
    weeklyCount,
    monthlyCount,
    checkIn: checkIn.mutate,
    checkOut: checkOut.mutate,
    isCheckingIn: checkIn.isPending,
  };
}

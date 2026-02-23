import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, addHours, differenceInMilliseconds } from 'date-fns';

const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour

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

/** Returns true if check_out equals check_in + exactly 1 hour (auto-checkout) */
export function isAutoCheckout(record: GymAttendanceRecord): boolean {
  if (!record.check_out) return false;
  const expected = addHours(new Date(record.check_in), 1).getTime();
  return Math.abs(new Date(record.check_out).getTime() - expected) < 2000; // 2s tolerance
}

/** Auto-close any active sessions older than 1 hour */
async function autoCheckoutStaleSessions(records: GymAttendanceRecord[]) {
  const now = Date.now();
  const stale = records.filter(r => !r.check_out && now - new Date(r.check_in).getTime() >= SESSION_DURATION_MS);
  if (stale.length === 0) return;

  await Promise.all(
    stale.map(r =>
      supabase.from('gym_attendance').update({
        check_out: addHours(new Date(r.check_in), 1).toISOString(),
      }).eq('id', r.id)
    )
  );
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
      const records = (data || []) as GymAttendanceRecord[];

      // Auto-checkout stale sessions then refetch
      const stale = records.filter(r => !r.check_out && Date.now() - new Date(r.check_in).getTime() >= SESSION_DURATION_MS);
      if (stale.length > 0) {
        await autoCheckoutStaleSessions(stale);
        // Refetch after auto-checkout
        const { data: refreshed } = await query;
        return (refreshed || []) as GymAttendanceRecord[];
      }

      return records;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const channel = supabase
      .channel('gym-attendance-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_attendance' }, () => {
        queryClient.invalidateQueries({ queryKey: ['gym_attendance'] });
        queryClient.invalidateQueries({ queryKey: ['gym_attendance_weekly'] });
        queryClient.invalidateQueries({ queryKey: ['gym_attendance_monthly'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

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
  // Only count sessions with no check_out AND less than 1 hour old as "currently in gym"
  const currentlyInGym = attendance.filter(a => !a.check_out && Date.now() - new Date(a.check_in).getTime() < SESSION_DURATION_MS).length;

  const checkIn = useMutation({
    mutationFn: async (memberId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Cooldown check: get member's latest check-in
      const { data: latest } = await supabase
        .from('gym_attendance')
        .select('check_in')
        .eq('member_id', memberId)
        .order('check_in', { ascending: false })
        .limit(1)
        .single();

      if (latest) {
        const elapsed = Date.now() - new Date(latest.check_in).getTime();
        if (elapsed < SESSION_DURATION_MS) {
          const remaining = Math.ceil((SESSION_DURATION_MS - elapsed) / 60000);
          throw new Error(`Please wait ${remaining} minute${remaining !== 1 ? 's' : ''} before checking in again`);
        }
      }

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

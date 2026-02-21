import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, startOfMonth, parseISO, subDays } from 'date-fns';
import { Zap, Flame, Trophy, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

interface GymPortalAttendanceProps {
  member: GymPortalMember;
  user: AuthUser;
}

interface AttendanceRecord { id: string; check_in: string; check_out: string | null; }

export function GymPortalAttendance({ member }: GymPortalAttendanceProps) {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const ownerUserId = member.owner_user_id ?? member.user_id;

  const fetchData = async () => {
    const todayStart = startOfDay(new Date()).toISOString();
    const monthStart = startOfMonth(new Date()).toISOString();

    const [todayRes, monthRes, historyRes] = await Promise.all([
      supabase.from('gym_attendance').select('id, check_in, check_out').eq('member_id', member.id).gte('check_in', todayStart).maybeSingle(),
      supabase.from('gym_attendance').select('id', { count: 'exact', head: true }).eq('member_id', member.id).gte('check_in', monthStart),
      supabase.from('gym_attendance').select('check_in').eq('member_id', member.id).gte('check_in', subDays(new Date(), 30).toISOString()).order('check_in', { ascending: false }),
    ]);

    if (todayRes.data) setTodayRecord(todayRes.data as AttendanceRecord);
    if (monthRes.count !== null) setMonthlyCount(monthRes.count);

    if (historyRes.data && historyRes.data.length > 0) {
      const uniqueDays = new Set(historyRes.data.map(r => format(parseISO(r.check_in), 'yyyy-MM-dd')));
      let s = 0; let checkDay = new Date();
      while (uniqueDays.has(format(checkDay, 'yyyy-MM-dd'))) { s++; checkDay = subDays(checkDay, 1); }
      setStreak(s);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [member.id]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const { data, error } = await supabase.from('gym_attendance').insert({
        member_id: member.id, user_id: ownerUserId, company_profile_id: member.company_profile_id,
        check_in: new Date().toISOString(),
      }).select('id, check_in, check_out').single();
      if (error) throw error;
      setTodayRecord(data as AttendanceRecord);
      setMonthlyCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      toast.success('Checked in! 💪');
    } catch (err: any) { toast.error(err.message || 'Failed to check in'); }
    finally { setCheckingIn(false); }
  };

  const checkInTime = todayRecord ? format(parseISO(todayRecord.check_in), 'hh:mm a') : null;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#00E5A0]" /></div>;
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-6 text-white">

      {/* Check-in button or confirmed */}
      {!todayRecord ? (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-white">Ready to train?</p>
            <p className="text-sm text-white/40">Tap the button to check in for today</p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className={cn(
              'relative h-36 w-36 rounded-full flex flex-col items-center justify-center gap-2',
              'bg-gradient-to-br from-[#00E5A0] to-[#00C4FF]',
              'shadow-[0_0_60px_rgba(0,229,160,0.35)]',
              'text-black transition-all duration-200',
              'active:scale-95 disabled:opacity-70',
              !checkingIn && 'animate-pulse-slow'
            )}
          >
            {checkingIn ? <Loader2 className="h-10 w-10 animate-spin" /> : (
              <>
                <Zap className="h-10 w-10 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Check In</span>
              </>
            )}
            <div className="absolute inset-0 rounded-full border-2 border-[#00E5A0]/30 scale-110" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#00E5A0]/10 border-2 border-[#00E5A0]/30">
            <CheckCircle2 className="h-8 w-8 text-[#00E5A0]" />
          </div>
          <div className="text-center">
            <p className="font-bold text-white">You're checked in! 💪</p>
            <p className="text-sm text-white/40">Today at {checkInTime}</p>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, color: '#00E5A0', value: monthlyCount, label: 'visits this\nmonth' },
          { icon: Flame, color: '#FF6B35', value: streak, label: 'day\nstreak' },
          { icon: Trophy, color: '#FFD700', value: `#${monthlyCount}`, label: "today's\nrank" },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 text-center">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: `${color}15` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[10px] text-white/30 leading-tight whitespace-pre-line">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

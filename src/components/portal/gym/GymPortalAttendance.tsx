import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, startOfMonth, parseISO, subDays } from 'date-fns';
import { Zap, Share2, Camera, Flame, Trophy, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

interface GymPortalAttendanceProps {
  member: GymPortalMember;
  user: AuthUser;
}

interface AttendanceRecord { id: string; check_in: string; check_out: string | null; }
interface GymInfo { company_name: string; }

export function GymPortalAttendance({ member }: GymPortalAttendanceProps) {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const ownerUserId = member.owner_user_id ?? member.user_id;

  const fetchData = async () => {
    const todayStart = startOfDay(new Date()).toISOString();
    const monthStart = startOfMonth(new Date()).toISOString();

    const [todayRes, monthRes, historyRes, gymRes] = await Promise.all([
      supabase.from('gym_attendance').select('id, check_in, check_out').eq('member_id', member.id).gte('check_in', todayStart).maybeSingle(),
      supabase.from('gym_attendance').select('id', { count: 'exact', head: true }).eq('member_id', member.id).gte('check_in', monthStart),
      supabase.from('gym_attendance').select('check_in').eq('member_id', member.id).gte('check_in', subDays(new Date(), 30).toISOString()).order('check_in', { ascending: false }),
      supabase.from('company_profiles').select('company_name').eq('user_id', ownerUserId).maybeSingle(),
    ]);

    if (todayRes.data) setTodayRecord(todayRes.data as AttendanceRecord);
    if (monthRes.count !== null) setMonthlyCount(monthRes.count);
    if (gymRes.data) setGymInfo(gymRes.data);

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
      setJustCheckedIn(true);
      setStreak(prev => prev + 1);
      toast.success('Checked in! 💪');
    } catch (err: any) { toast.error(err.message || 'Failed to check in'); }
    finally { setCheckingIn(false); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: '🏋️ I just worked out!', text: `Just checked in at ${gymInfo?.company_name || 'the gym'}! Visit #${monthlyCount} this month 💪🔥` }); }
      catch { /* dismissed */ }
    } else { toast.info('Long-press the card to save as image 📸'); }
  };

  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();
  const checkInTime = todayRecord ? format(parseISO(todayRecord.check_in), 'hh:mm a') : null;
  const today = new Date();

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

      {/* Stats strip — frosted glass */}
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

      {/* Shareable Workout Card */}
      {todayRecord && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider text-center">📸 Screenshot & share on socials</p>
          <div ref={cardRef} className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #00E5A0 0%, #00C4FF 50%, #0a0a0f 100%)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 11px)' }} />
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Workout Unlocked 🔥</div>
                <div className="text-2xl">🏋️</div>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-xl bg-black/15 backdrop-blur flex items-center justify-center shrink-0 border border-black/10">
                  <span className="text-xl font-black text-black/70">{initials}</span>
                </div>
                <div>
                  <p className="text-xl font-black leading-tight text-black">{member.first_name} {member.last_name}</p>
                  <p className="text-[11px] text-black/40 font-mono">{member.member_number}</p>
                  {gymInfo && <p className="text-xs text-black/60 font-medium mt-0.5">{gymInfo.company_name}</p>}
                </div>
              </div>
              <div className="h-px bg-black/10 mb-4" />
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-black/30 mb-0.5">TODAY</p>
                <p className="text-sm font-bold text-black/80">{format(today, 'EEEE, d MMMM yyyy')}</p>
                <p className="text-xs text-black/50">Checked in at {checkInTime}</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-black/10 rounded-full px-3 py-1.5 border border-black/10">
                  <Zap className="h-3 w-3 fill-black/50 text-black/50" />
                  <span className="text-xs font-bold text-black/60">Visit #{monthlyCount} this month</span>
                </div>
                {streak >= 2 && (
                  <div className="flex items-center gap-1.5 bg-black/10 rounded-full px-3 py-1.5 border border-black/10">
                    <Flame className="h-3 w-3 text-black/50" />
                    <span className="text-xs font-bold text-black/60">{streak}-day streak</span>
                  </div>
                )}
              </div>
              <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between">
                <p className="text-[9px] text-black/20 tracking-wider uppercase">powered by OrionBiz</p>
                <p className="text-[9px] text-black/20 tracking-wider uppercase">orionbiz.app</p>
              </div>
            </div>
          </div>
          <Button onClick={handleShare} className="w-full gap-2 bg-white/[0.06] border border-white/[0.08] text-white/70 hover:bg-white/[0.1] hover:text-white" variant="outline">
            <Share2 className="h-4 w-4" /> Share on socials
          </Button>
        </div>
      )}

      {!todayRecord && (
        <div className="border border-dashed border-white/10 rounded-2xl p-5 text-center space-y-2">
          <Camera className="h-8 w-8 text-white/15 mx-auto" />
          <p className="text-sm font-medium text-white/40">Check in first</p>
          <p className="text-xs text-white/20">Your shareable workout card will appear here after you check in today.</p>
        </div>
      )}
    </div>
  );
}

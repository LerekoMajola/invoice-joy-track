import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, startOfMonth, parseISO, differenceInCalendarDays, subDays } from 'date-fns';
import { Zap, Share2, Camera, Flame, Trophy, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

interface GymPortalAttendanceProps {
  member: GymPortalMember;
  user: AuthUser;
}

interface AttendanceRecord {
  id: string;
  check_in: string;
  check_out: string | null;
}

interface GymInfo {
  company_name: string;
}

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
      // Today's check-in
      supabase
        .from('gym_attendance')
        .select('id, check_in, check_out')
        .eq('member_id', member.id)
        .gte('check_in', todayStart)
        .maybeSingle(),
      // Monthly count
      supabase
        .from('gym_attendance')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .gte('check_in', monthStart),
      // Last 30 days for streak calculation
      supabase
        .from('gym_attendance')
        .select('check_in')
        .eq('member_id', member.id)
        .gte('check_in', subDays(new Date(), 30).toISOString())
        .order('check_in', { ascending: false }),
      // Gym info
      supabase
        .from('company_profiles')
        .select('company_name')
        .eq('user_id', ownerUserId)
        .maybeSingle(),
    ]);

    if (todayRes.data) setTodayRecord(todayRes.data as AttendanceRecord);
    if (monthRes.count !== null) setMonthlyCount(monthRes.count);
    if (gymRes.data) setGymInfo(gymRes.data);

    // Calculate streak
    if (historyRes.data && historyRes.data.length > 0) {
      const uniqueDays = new Set(
        historyRes.data.map(r => format(parseISO(r.check_in), 'yyyy-MM-dd'))
      );
      let s = 0;
      let checkDay = new Date();
      while (true) {
        const dayStr = format(checkDay, 'yyyy-MM-dd');
        if (uniqueDays.has(dayStr)) {
          s++;
          checkDay = subDays(checkDay, 1);
        } else {
          break;
        }
      }
      setStreak(s);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [member.id]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const { data, error } = await supabase
        .from('gym_attendance')
        .insert({
          member_id: member.id,
          user_id: ownerUserId,
          company_profile_id: member.company_profile_id,
          check_in: new Date().toISOString(),
        })
        .select('id, check_in, check_out')
        .single();

      if (error) throw error;

      setTodayRecord(data as AttendanceRecord);
      setMonthlyCount(prev => prev + 1);
      setJustCheckedIn(true);
      // Recalculate streak
      setStreak(prev => prev + 1);
      toast.success('Checked in! 💪');
    } catch (err: any) {
      toast.error(err.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🏋️ I just worked out!',
          text: `Just checked in at ${gymInfo?.company_name || 'the gym'}! Visit #${monthlyCount} this month 💪🔥`,
        });
      } catch {
        // dismissed — do nothing
      }
    } else {
      toast.info('Long-press the card to save as image 📸');
    }
  };

  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();
  const checkInTime = todayRecord ? format(parseISO(todayRecord.check_in), 'hh:mm a') : null;
  const today = new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">

      {/* Already checked in / Check-in button */}
      {!todayRecord ? (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-foreground">Ready to train?</p>
            <p className="text-sm text-muted-foreground">Tap the button to check in for today</p>
          </div>

          {/* Big animated check-in button */}
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className={cn(
              'relative h-36 w-36 rounded-full flex flex-col items-center justify-center gap-2',
              'bg-gradient-to-br from-primary to-primary/70',
              'shadow-[0_0_40px_hsl(var(--primary)/0.4)]',
              'text-primary-foreground transition-all duration-200',
              'active:scale-95 disabled:opacity-70',
              !checkingIn && 'animate-pulse-slow'
            )}
          >
            {checkingIn ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <>
                <Zap className="h-10 w-10 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Check In</span>
              </>
            )}
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 scale-110" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className={cn(
            'h-16 w-16 rounded-full flex items-center justify-center',
            'bg-success/15 border-2 border-success/30'
          )}>
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <div className="text-center">
            <p className="font-bold text-foreground">You're checked in! 💪</p>
            <p className="text-sm text-muted-foreground">Today at {checkInTime}</p>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{monthlyCount}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">visits this<br/>month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">day<br/>streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center mx-auto mb-1.5">
              <Trophy className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xl font-bold text-foreground">#{monthlyCount}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">today's<br/>rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Shareable Workout Card — shown after check-in or if already checked in */}
      {todayRecord && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            📸 Screenshot & share on socials
          </p>

          {/* THE CARD — designed to look great as a screenshot */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 50%, hsl(var(--primary)/0.4) 100%)',
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)',
              }}
            />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />

            <div className="relative p-6 text-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                  Workout Unlocked 🔥
                </div>
                <div className="text-2xl">🏋️</div>
              </div>

              {/* Member identity */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 border border-white/30">
                  <span className="text-xl font-black text-white">{initials}</span>
                </div>
                <div>
                  <p className="text-xl font-black leading-tight">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-[11px] opacity-60 font-mono">{member.member_number}</p>
                  {gymInfo && (
                    <p className="text-xs opacity-80 font-medium mt-0.5">{gymInfo.company_name}</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/20 mb-4" />

              {/* Check-in details */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">TODAY</p>
                <p className="text-sm font-bold">{format(today, 'EEEE, d MMMM yyyy')}</p>
                <p className="text-xs opacity-80">Checked in at {checkInTime}</p>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 border border-white/20">
                  <Zap className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                  <span className="text-xs font-bold">Visit #{monthlyCount} this month</span>
                </div>
                {streak >= 2 && (
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 border border-white/20">
                    <Flame className="h-3 w-3 text-orange-300" />
                    <span className="text-xs font-bold">{streak}-day streak</span>
                  </div>
                )}
              </div>

              {/* Footer watermark */}
              <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
                <p className="text-[9px] opacity-40 tracking-wider uppercase">powered by OrionBiz</p>
                <p className="text-[9px] opacity-40 tracking-wider uppercase">orionbiz.app</p>
              </div>
            </div>
          </div>

          {/* Share button */}
          <Button
            onClick={handleShare}
            className="w-full gap-2"
            variant="outline"
          >
            <Share2 className="h-4 w-4" />
            Share on socials
          </Button>

          {!('share' in navigator) && (
            <p className="text-[11px] text-muted-foreground text-center">
              💡 Long-press the card above to save as an image
            </p>
          )}
        </div>
      )}

      {/* Prompt to check in if not yet */}
      {!todayRecord && (
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="p-5 text-center space-y-2">
            <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">Check in first</p>
            <p className="text-xs text-muted-foreground/60">
              Your shareable workout card will appear here after you check in today.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  format, parseISO, startOfDay, startOfMonth, subDays,
  differenceInDays, getDayOfYear,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Flame, Zap, Trophy, CheckCircle2, Loader2, Share2,
  Sun, Sunset, Moon, Sunrise, Calendar, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

// ── QUOTES ──────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  { text: "Train insane or remain the same.", author: "Unknown" },
  { text: "No pain, no gain. Shut up and train.", author: "Unknown" },
  { text: "The difference between try and triumph is just a little umph!", author: "Marvin Phillips" },
  { text: "Success starts with self-discipline.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Wake up. Work out. Look hot. Kick ass.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Strength does not come from the body. It comes from the will.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "A one-hour workout is 4% of your day. No excuses.", author: "Unknown" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
  { text: "The hard days are the best because that's when champions are made.", author: "Gabby Douglas" },
  { text: "You are one workout away from a good mood.", author: "Unknown" },
  { text: "Be stronger than your strongest excuse.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "It never gets easier. You just get stronger.", author: "Unknown" },
  { text: "Champions aren't made in gyms. Champions are made from something they have deep inside.", author: "Muhammad Ali" },
  { text: "Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.", author: "JFK" },
  { text: "The clock is ticking. Are you becoming the person you want to be?", author: "Greg Plitt" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
  { text: "Discipline is doing what needs to be done, even when you don't want to.", author: "Unknown" },
  { text: "Your body can do it. It's time to convince your mind.", author: "Unknown" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "The only bad workout is the one you didn't do.", author: "Unknown" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "Work hard in silence. Let your results be your noise.", author: "Frank Ocean" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function getGreeting(name: string): { text: string; icon: React.ElementType; emoji: string } {
  const h = new Date().getHours();
  if (h < 5)  return { text: `Hey, ${name}`, icon: Moon, emoji: '🌙' };
  if (h < 12) return { text: `Good Morning, ${name}`, icon: Sunrise, emoji: '☀️' };
  if (h < 17) return { text: `Good Afternoon, ${name}`, icon: Sun, emoji: '🌤️' };
  if (h < 21) return { text: `Good Evening, ${name}`, icon: Sunset, emoji: '🌆' };
  return { text: `Hey Night Owl, ${name}`, icon: Moon, emoji: '🌙' };
}

const statusColors: Record<string, string> = {
  active: 'bg-success/15 text-success border-success/20',
  frozen: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  expired: 'bg-warning/15 text-warning border-warning/20',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/20',
  prospect: 'bg-muted text-muted-foreground border-border',
};

// ── TYPES ────────────────────────────────────────────────────────────────────
interface HomeData {
  todayRecord: { id: string; check_in: string } | null;
  monthlyCount: number;
  allTimeCount: number;
  streak: number;
  lastVisit: string | null;
  gymName: string;
  planName: string | null;
  planEnd: string | null;
}

interface GymMemberPortalProps {
  member: GymPortalMember;
  user: AuthUser;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export function GymMemberPortal({ member }: GymMemberPortalProps) {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  const ownerUserId = member.owner_user_id ?? member.user_id;

  useEffect(() => {
    const load = async () => {
      const todayStart = startOfDay(new Date()).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const [todayRes, monthRes, allTimeRes, historyRes, gymRes, subRes] = await Promise.all([
        supabase.from('gym_attendance').select('id, check_in').eq('member_id', member.id).gte('check_in', todayStart).maybeSingle(),
        supabase.from('gym_attendance').select('id', { count: 'exact', head: true }).eq('member_id', member.id).gte('check_in', monthStart),
        supabase.from('gym_attendance').select('id', { count: 'exact', head: true }).eq('member_id', member.id),
        supabase.from('gym_attendance').select('check_in').eq('member_id', member.id).gte('check_in', thirtyDaysAgo).order('check_in', { ascending: false }),
        supabase.from('company_profiles').select('company_name').eq('user_id', ownerUserId).maybeSingle(),
        supabase.from('gym_member_subscriptions').select('plan_name, end_date').eq('member_id', member.id).in('status', ['active', 'frozen']).maybeSingle(),
      ]);

      // Streak calculation
      let streak = 0;
      if (historyRes.data && historyRes.data.length > 0) {
        const uniqueDays = new Set(historyRes.data.map(r => format(parseISO(r.check_in), 'yyyy-MM-dd')));
        let checkDay = new Date();
        while (true) {
          const dayStr = format(checkDay, 'yyyy-MM-dd');
          if (uniqueDays.has(dayStr)) { streak++; checkDay = subDays(checkDay, 1); }
          else break;
        }
      }

      // Last visit
      const lastVisit = historyRes.data && historyRes.data.length > 0
        ? historyRes.data[0].check_in
        : null;

      setData({
        todayRecord: todayRes.data as { id: string; check_in: string } | null,
        monthlyCount: monthRes.count ?? 0,
        allTimeCount: allTimeRes.count ?? 0,
        streak,
        lastVisit,
        gymName: gymRes.data?.company_name ?? 'Your Gym',
        planName: (subRes.data as any)?.plan_name ?? null,
        planEnd: (subRes.data as any)?.end_date ?? null,
      });
      setLoading(false);
    };
    load();
  }, [member.id, ownerUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading your stats…</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const greeting = getGreeting(member.first_name ?? 'there');
  const quote = QUOTES[getDayOfYear(today) % QUOTES.length];
  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();
  const checkInTime = data?.todayRecord ? format(parseISO(data.todayRecord.check_in), 'h:mm a') : null;
  const daysLeft = data?.planEnd ? Math.max(differenceInDays(parseISO(data.planEnd), today), 0) : null;

  const handleShare = async () => {
    const text = `${data?.todayRecord ? '✅ Checked in today!' : '💪 Staying committed!'}\n🔥 ${data?.streak}-day streak · ⚡ ${data?.monthlyCount} visits this month · 🏆 ${data?.allTimeCount} total\n\n"${quote.text}"\n— ${quote.author}\n\n@${data?.gymName}`;
    if (navigator.share) {
      try { await navigator.share({ title: '🏋️ My Fitness Progress', text }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
      // toast handled by the portal itself
    }
  };

  return (
    <div className="space-y-0 pb-6">

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <div
        className="relative px-4 pt-6 pb-10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)/0.18) 0%, hsl(var(--primary)/0.06) 60%, transparent 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-10"
          style={{ background: 'hsl(var(--primary))' }} />
        <div className="absolute top-4 -right-2 h-16 w-16 rounded-full opacity-8"
          style={{ background: 'hsl(var(--primary))' }} />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5 font-medium">
              {format(today, 'EEEE · d MMM')}
            </p>
            <h1 className="text-2xl font-black text-foreground leading-tight">
              {greeting.text} {greeting.emoji}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{data?.gymName}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
            <Badge
              className={cn('capitalize border text-xs font-semibold px-2.5 py-0.5', statusColors[member.status])}
              variant="outline"
            >
              {member.status}
            </Badge>
            {/* Avatar */}
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-sm font-black text-primary-foreground">{initials || '?'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">

        {/* ── TODAY STRIP ─────────────────────────────────────────────── */}
        <div className={cn(
          'rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all',
          data?.todayRecord
            ? 'bg-success/8 border-success/25'
            : 'bg-muted/40 border-border/50'
        )}>
          {data?.todayRecord ? (
            <>
              <div className="h-9 w-9 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Checked in today 💪</p>
                <p className="text-xs text-muted-foreground">at {checkInTime}</p>
              </div>
              <span className="text-lg">🎯</span>
            </>
          ) : (
            <>
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Not checked in yet</p>
                <p className="text-xs text-muted-foreground">Head to the Check In tab 👆</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>

        {/* ── STATS BAR ───────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.75) 100%)',
          }}
        >
          <div className="grid grid-cols-3 divide-x divide-white/15">
            {/* Streak */}
            <div className="flex flex-col items-center py-5 px-2 gap-1">
              <span className="text-2xl">🔥</span>
              <p className="text-3xl font-black text-white leading-none">{data?.streak ?? 0}</p>
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider text-center leading-tight">Day<br/>Streak</p>
            </div>
            {/* This Month */}
            <div className="flex flex-col items-center py-5 px-2 gap-1">
              <span className="text-2xl">⚡</span>
              <p className="text-3xl font-black text-white leading-none">{data?.monthlyCount ?? 0}</p>
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider text-center leading-tight">This<br/>Month</p>
            </div>
            {/* All Time */}
            <div className="flex flex-col items-center py-5 px-2 gap-1">
              <span className="text-2xl">🏆</span>
              <p className="text-3xl font-black text-white leading-none">{data?.allTimeCount ?? 0}</p>
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider text-center leading-tight">All<br/>Time</p>
            </div>
          </div>
          {data?.lastVisit && (
            <div className="px-4 py-2 bg-black/10 border-t border-white/10">
              <p className="text-[10px] text-white/50 text-center">
                Last visit: {format(parseISO(data.lastVisit), 'EEEE, d MMM')}
              </p>
            </div>
          )}
        </div>

        {/* ── DAILY MOTIVATION ────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/60">
          <CardContent className="p-0">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                ✨ Daily Motivation
              </p>
              <blockquote className="text-base font-semibold text-foreground leading-snug mb-2">
                "{quote.text}"
              </blockquote>
              <p className="text-xs text-muted-foreground mb-4">— {quote.author}</p>
            </div>
          </CardContent>
        </Card>

        {/* ── SHAREABLE CARD ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
            📸 Share Your Progress
          </p>

          {/* Card designed to look beautiful as a screenshot */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 55%, hsl(var(--primary)/0.35) 100%)',
            }}
          >
            {/* Diagonal stripe texture */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)',
              }}
            />
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/40" />
            {/* Glow orbs */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/8 blur-xl" />

            <div className="relative px-5 py-6 text-white">
              {/* Gym + date header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50 mb-0.5">
                    Powered by OrionBiz
                  </p>
                  <p className="text-sm font-bold text-white/90">{data?.gymName}</p>
                </div>
                <p className="text-[10px] text-white/40 font-mono">
                  {format(today, 'dd.MM.yyyy')}
                </p>
              </div>

              {/* Member identity */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center shrink-0">
                  <span className="text-2xl font-black">{initials}</span>
                </div>
                <div>
                  <p className="text-xl font-black leading-tight">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-[10px] text-white/50 font-mono mt-0.5">{member.member_number}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="bg-white/10 rounded-xl px-4 py-3 mb-4 border border-white/15">
                <p className="text-sm font-medium leading-snug text-white/90 italic">
                  "{quote.text}"
                </p>
                <p className="text-[10px] text-white/50 mt-1.5">— {quote.author}</p>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs font-bold">{data?.streak ?? 0}-day streak</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
                  <span className="text-sm">⚡</span>
                  <span className="text-xs font-bold">{data?.monthlyCount ?? 0} this month</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
                  <span className="text-sm">🏆</span>
                  <span className="text-xs font-bold">{data?.allTimeCount ?? 0} total</span>
                </div>
                {data?.todayRecord && (
                  <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1.5">
                    <span className="text-sm">✅</span>
                    <span className="text-xs font-bold">Trained today!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleShare} className="w-full gap-2" variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            Share Your Progress
          </Button>
          {!('share' in navigator) && (
            <p className="text-[10px] text-muted-foreground/60 text-center">
              💡 Long-press the card above to save as an image
            </p>
          )}
        </div>

        {/* ── MY PLAN (compact strip) ──────────────────────────────────── */}
        {data?.planName && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    My Plan
                  </p>
                  <p className="text-sm font-bold text-foreground">{data.planName}</p>
                </div>
                <div className="text-right">
                  {daysLeft !== null && (
                    <p className={cn(
                      'text-xs font-semibold',
                      daysLeft <= 7 ? 'text-destructive' : daysLeft <= 14 ? 'text-warning' : 'text-muted-foreground'
                    )}>
                      {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                    </p>
                  )}
                  {data.planEnd && (
                    <p className="text-[10px] text-muted-foreground/60">
                      Expires {format(parseISO(data.planEnd), 'd MMM yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

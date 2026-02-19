import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfDay, startOfMonth, subDays, differenceInDays, getDayOfYear } from 'date-fns';
import { Share2, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  { text: "Train insane or remain the same.", author: "Unknown" },
  { text: "Champions aren't made in gyms. They are made of stuff they have deep inside.", author: "Muhammad Ali" },
  { text: "No pain, no gain. Shut up and train.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "A one-hour workout is 4% of your day. No excuses.", author: "Unknown" },
  { text: "The hard days are the best because that's when champions are made.", author: "Gabby Douglas" },
  { text: "You are one workout away from a good mood.", author: "Unknown" },
  { text: "Be stronger than your strongest excuse.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "It never gets easier. You just get stronger.", author: "Unknown" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
  { text: "Discipline is doing what needs to be done, even when you don't want to.", author: "Unknown" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Work hard in silence. Let your results be your noise.", author: "Unknown" },
  { text: "Success starts with self-discipline.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.", author: "JFK" },
  { text: "Strength does not come from the body. It comes from the will.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "The clock is ticking. Are you becoming the person you want to be?", author: "Greg Plitt" },
  { text: "Your body can do it. It's time to convince your mind.", author: "Unknown" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
  { text: "Wake up. Work out. Look hot. Kick ass.", author: "Unknown" },
  { text: "The difference between try and triumph is just a little umph!", author: "Marvin Phillips" },
  { text: "Today's soreness is tomorrow's strength.", author: "Unknown" },
];

function getGreeting(): { word: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 5)  return { word: 'Night Owl', emoji: '🌙' };
  if (h < 12) return { word: 'Morning', emoji: '☀️' };
  if (h < 17) return { word: 'Afternoon', emoji: '🌤️' };
  if (h < 21) return { word: 'Evening', emoji: '🌆' };
  return { word: 'Night', emoji: '🌙' };
}

interface HomeData {
  todayRecord: { id: string; check_in: string } | null;
  monthlyCount: number;
  allTimeCount: number;
  streak: number;
  gymName: string;
  planName: string | null;
  planEnd: string | null;
}

interface GymMemberPortalProps {
  member: GymPortalMember;
  user: AuthUser;
}

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

      let streak = 0;
      if (historyRes.data?.length) {
        const uniqueDays = new Set(historyRes.data.map(r => format(parseISO(r.check_in), 'yyyy-MM-dd')));
        let d = new Date();
        while (uniqueDays.has(format(d, 'yyyy-MM-dd'))) { streak++; d = subDays(d, 1); }
      }

      setData({
        todayRecord: todayRes.data as { id: string; check_in: string } | null,
        monthlyCount: monthRes.count ?? 0,
        allTimeCount: allTimeRes.count ?? 0,
        streak,
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
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const today = new Date();
  const greeting = getGreeting();
  const quote = QUOTES[getDayOfYear(today) % QUOTES.length];
  const checkInTime = data?.todayRecord ? format(parseISO(data.todayRecord.check_in), 'h:mm a') : null;
  const daysLeft = data?.planEnd ? Math.max(differenceInDays(parseISO(data.planEnd), today), 0) : null;
  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();

  const handleShare = async () => {
    const text = `Good ${greeting.word}! ${greeting.emoji}\n\n🔥 ${data?.streak}-day streak · ⚡ ${data?.monthlyCount} visits this month · 🏆 ${data?.allTimeCount} total${data?.todayRecord ? ' · ✅ Trained today!' : ''}\n\n"${quote.text}"\n— ${quote.author}\n\n📍 ${data?.gymName}`;
    if (navigator.share) {
      try { await navigator.share({ title: '💪 My Fitness Progress', text }); } catch { /* dismissed */ }
    } else {
      try { await navigator.clipboard.writeText(text); } catch { /* not available */ }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden animate-fade-in">

      {/* ── TOP HERO ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 px-5 pt-5 pb-6"
        style={{ background: 'linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.75) 100%)' }}
      >
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Greeting row */}
        <div className="relative flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            Good {greeting.word} {greeting.emoji}
          </p>
          <div className={cn(
            'text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
            member.status === 'active'
              ? 'bg-white/15 border-white/25 text-white/90'
              : 'bg-white/10 border-white/15 text-white/60'
          )}>
            {member.status}
          </div>
        </div>

        {/* Name */}
        <h1 className="relative text-[1.75rem] font-black text-white leading-none tracking-tight mb-3">
          {member.first_name} {member.last_name}
        </h1>

        {/* Today status pill */}
        {data?.todayRecord ? (
          <div className="relative flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3.5 py-2.5 w-fit">
            <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="text-xs font-semibold text-white">Checked in at {checkInTime}</span>
          </div>
        ) : (
          <div className="relative flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3.5 py-2.5 w-fit">
            <div className="h-2 w-2 rounded-full bg-white/30 shrink-0" />
            <span className="text-xs font-medium text-white/60">Not checked in yet — go to Check In</span>
          </div>
        )}
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 grid grid-cols-3 border-b border-border/60">
        {[
          { emoji: '🔥', value: data?.streak ?? 0, label: 'Day Streak' },
          { emoji: '⚡', value: data?.monthlyCount ?? 0, label: 'This Month' },
          { emoji: '🏆', value: data?.allTimeCount ?? 0, label: 'All Time' },
        ].map(({ emoji, value, label }, i) => (
          <div
            key={label}
            className={cn(
              'flex flex-col items-center py-5 gap-0.5',
              i < 2 && 'border-r border-border/60'
            )}
          >
            <span className="text-xl mb-1 leading-none">{emoji}</span>
            <p className="text-3xl font-black text-foreground leading-none">{value}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── QUOTE ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-5 py-5 min-h-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
          Today's Motivation
        </p>
        <blockquote className="text-[1.05rem] font-bold text-foreground leading-snug tracking-tight mb-2">
          "{quote.text}"
        </blockquote>
        <p className="text-xs text-muted-foreground">— {quote.author}</p>
      </div>

      {/* ── BOTTOM BAR ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3 space-y-2 border-t border-border/40">
        {/* Plan strip */}
        {data?.planName && daysLeft !== null && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-xs font-semibold text-foreground">{data.planName}</span>
            </div>
            <span className={cn(
              'text-xs font-bold',
              daysLeft <= 7 ? 'text-destructive' : daysLeft <= 14 ? 'text-warning' : 'text-muted-foreground'
            )}>
              {daysLeft}d left
            </span>
          </div>
        )}

        {/* Share CTA */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
        >
          <Share2 className="h-4 w-4" />
          Share My Progress
        </button>
      </div>
    </div>
  );
}

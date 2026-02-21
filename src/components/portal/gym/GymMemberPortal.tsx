import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfDay, startOfMonth, subDays, differenceInDays, getDayOfYear } from 'date-fns';
import { Loader2, Zap, Flame } from 'lucide-react';
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
  { text: "Today's soreness is tomorrow's strength.", author: "Unknown" },
  { text: "The difference between try and triumph is just a little umph!", author: "Marvin Phillips" },
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
  streak: number;
  gymName: string;
  planName: string | null;
  planEnd: string | null;
}

interface GymMemberPortalProps {
  member: GymPortalMember;
  user: AuthUser;
}

/* ── Circular Progress Ring ──────────────────────────────────────── */
function ProgressRing({ value, max, color, size = 88 }: { value: number; max: number; color: string; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
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

      const [todayRes, monthRes, historyRes, gymRes, subRes] = await Promise.all([
        supabase.from('gym_attendance').select('id, check_in').eq('member_id', member.id).gte('check_in', todayStart).maybeSingle(),
        supabase.from('gym_attendance').select('id', { count: 'exact', head: true }).eq('member_id', member.id).gte('check_in', monthStart),
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
        <Loader2 className="h-7 w-7 animate-spin text-[#00E5A0]" />
      </div>
    );
  }

  const today = new Date();
  const greeting = getGreeting();
  const quote = QUOTES[getDayOfYear(today) % QUOTES.length];
  const checkInTime = data?.todayRecord ? format(parseISO(data.todayRecord.check_in), 'h:mm a') : null;
  const daysLeft = data?.planEnd ? Math.max(differenceInDays(parseISO(data.planEnd), today), 0) : null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden animate-fade-in text-white">

      {/* ── TOP HERO ──────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 px-5 pt-5 pb-6"
        style={{ background: 'linear-gradient(160deg, #00E5A0 0%, #00C4FF 50%, #0a0a0f 100%)' }}
      >
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        {/* Greeting row */}
        <div className="relative flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
            Good {greeting.word} {greeting.emoji}
          </p>
          <div className={cn(
            'text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
            member.status === 'active'
              ? 'bg-black/15 border-black/20 text-black/70'
              : 'bg-black/10 border-black/10 text-black/50'
          )}>
            {member.status}
          </div>
        </div>

        {/* Name */}
        <h1 className="relative text-[1.75rem] font-black text-black leading-none tracking-tight mb-3">
          {member.first_name} {member.last_name}
        </h1>

        {/* Today status pill */}
        {data?.todayRecord ? (
          <div className="relative flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-black/10 rounded-xl px-3.5 py-2.5 w-fit">
            <span className="text-sm leading-none">✅</span>
            <span className="text-xs font-semibold text-black/80">Checked in at {checkInTime}</span>
          </div>
        ) : (
          <div className="relative flex items-center gap-2 bg-black/15 backdrop-blur-sm border border-black/10 rounded-xl px-3.5 py-2.5 w-fit">
            <div className="h-2 w-2 rounded-full bg-black/30 shrink-0" />
            <span className="text-xs font-medium text-black/50">Not checked in yet — go to Check In</span>
          </div>
        )}
      </div>

      {/* ── STATS CARDS — frosted glass ───────────────────────────── */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3 px-4 py-4">
        {[
          {
            color: '#00E5A0',
            icon: Zap,
            value: data?.monthlyCount ?? 0,
            max: 30,
            label: 'visits this\nmonth',
          },
          {
            color: '#FF6B35',
            icon: Flame,
            value: data?.streak ?? 0,
            max: 30,
            label: 'day\nstreak',
          },
        ].map(({ color, icon: Icon, value, max, label }) => (
          <div key={label} className="relative bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] shadow-lg flex flex-col items-center pt-5 pb-4 px-2 gap-1.5">
            <div className="relative h-[96px] w-[96px] flex items-center justify-center">
              <ProgressRing value={value} max={max} color={color} size={96} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon className="h-4 w-4 mb-0.5" style={{ color }} strokeWidth={0} fill={color} />
                <p className="text-2xl font-black text-white leading-none">{value}</p>
              </div>
            </div>
            <p className="text-[11px] font-medium text-white/40 text-center leading-tight whitespace-pre-line">{label}</p>
          </div>
        ))}
      </div>

      {/* ── QUOTE ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-5 min-h-0 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 mb-3">
          Today's Motivation
        </p>
        <blockquote className="text-[1.05rem] font-bold text-white/90 leading-snug tracking-tight mb-2">
          "{quote.text}"
        </blockquote>
        <p className="text-xs text-white/40">— {quote.author}</p>
      </div>

      {/* ── BOTTOM ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3 border-t border-white/[0.06]">
        {data?.planName && daysLeft !== null && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#00E5A0] shadow-[0_0_6px_rgba(0,229,160,0.5)]" />
              <span className="text-xs font-semibold text-white/80">{data.planName}</span>
            </div>
            <span className={cn(
              'text-xs font-bold',
              daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-white/40'
            )}>
              {daysLeft}d left
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, startOfMonth, parseISO, subDays } from 'date-fns';
import { Zap, Flame, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePortalTheme } from '@/hooks/usePortalTheme';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

interface GymPortalAttendanceProps {
  member: GymPortalMember;
  user: AuthUser;
}

interface AttendanceRecord { id: string; check_in: string; check_out: string | null; }

/* ── Particle burst component ─────────────────────────────────── */
function ParticleBurst() {
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360;
    const distance = 80 + Math.random() * 60;
    const size = 4 + Math.random() * 6;
    const duration = 0.6 + Math.random() * 0.4;
    const delay = Math.random() * 0.15;
    const colors = ['#00E5A0', '#00C4FF', '#FFD700', '#FF6B35', '#00E5A0', '#00C4FF'];
    const color = colors[i % colors.length];
    return { angle, distance, size, duration, delay, color };
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `particleFly ${p.duration}s ease-out ${p.delay}s forwards`,
            '--fly-x': `${Math.cos((p.angle * Math.PI) / 180) * p.distance}px`,
            '--fly-y': `${Math.sin((p.angle * Math.PI) / 180) * p.distance}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── Ring pulse effect ────────────────────────────────────────── */
function RingPulse() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-[#00E5A0]"
          style={{
            width: 144,
            height: 144,
            animation: `ringExpand 1s ease-out ${delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function GymPortalAttendance({ member }: GymPortalAttendanceProps) {
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [animPhase, setAnimPhase] = useState<'idle' | 'charging' | 'explode' | 'done'>('idle');
  const { pt } = usePortalTheme();

  const ownerUserId = member.owner_user_id ?? member.user_id;

  const fetchData = useCallback(async () => {
    const todayStart = startOfDay(new Date()).toISOString();
    const monthStart = startOfMonth(new Date()).toISOString();

    const [todayRes, monthRes, historyRes] = await Promise.all([
      supabase.from('gym_attendance').select('id, check_in, check_out').eq('member_id', member.id).gte('check_in', todayStart).order('check_in', { ascending: true }),
      supabase.from('gym_attendance').select('id', { count: 'exact', head: true }).eq('member_id', member.id).gte('check_in', monthStart),
      supabase.from('gym_attendance').select('check_in').eq('member_id', member.id).gte('check_in', subDays(new Date(), 30).toISOString()).order('check_in', { ascending: false }),
    ]);

    if (todayRes.data) setTodayRecords(todayRes.data as AttendanceRecord[]);
    if (monthRes.count !== null) setMonthlyCount(monthRes.count);

    if (historyRes.data && historyRes.data.length > 0) {
      const uniqueDays = new Set(historyRes.data.map(r => format(parseISO(r.check_in), 'yyyy-MM-dd')));
      let s = 0; let checkDay = new Date();
      while (uniqueDays.has(format(checkDay, 'yyyy-MM-dd'))) { s++; checkDay = subDays(checkDay, 1); }
      setStreak(s);
    }
    setLoading(false);
  }, [member.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setAnimPhase('charging');

    await new Promise(r => setTimeout(r, 400));

    try {
      const { data, error } = await supabase.from('gym_attendance').insert({
        member_id: member.id, user_id: ownerUserId, company_profile_id: member.company_profile_id,
        check_in: new Date().toISOString(),
      }).select('id, check_in, check_out').single();
      if (error) throw error;

      setAnimPhase('explode');
      setCheckingIn(false);

      setTimeout(() => {
        setTodayRecords(prev => [...prev, data as AttendanceRecord]);
        setMonthlyCount(prev => prev + 1);
        if (todayRecords.length === 0) setStreak(prev => prev + 1);
        setAnimPhase('done');
        toast.success('Checked in! 💪');
      }, 900);

      setTimeout(() => setAnimPhase('idle'), 3500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to check in');
      setAnimPhase('idle');
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#00E5A0]" /></div>;
  }

  const showButton = animPhase !== 'done';

  return (
    <div className={cn("px-4 pt-6 pb-8 space-y-6", pt('text-white', 'text-gray-900'))}>

      {/* Check-in area */}
      <div className="flex flex-col items-center gap-5 py-6 relative">
        {animPhase === 'done' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-[#00E5A0]/8 blur-3xl checkin-glow-in" />
            <div className="relative h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00E5A0]/20 to-[#00C4FF]/10 border-2 border-[#00E5A0]/40 checkin-slam">
              <CheckCircle2 className="h-12 w-12 text-[#00E5A0] drop-shadow-[0_0_8px_rgba(0,229,160,0.5)]" />
            </div>
            <p className="font-black text-xl mt-4 checkin-text-pop" style={{ color: 'rgb(var(--portal-text))' }}>LET'S GO! 💪🔥</p>
            <p className="text-sm mt-1" style={{ color: 'var(--portal-text-muted)' }}>
              Checked in at {todayRecords.length > 0 ? format(parseISO(todayRecords[todayRecords.length - 1].check_in), 'hh:mm a') : ''}
            </p>
          </div>
        )}

        <div className={cn('flex flex-col items-center gap-5', animPhase === 'done' && 'opacity-0')}>
          <div className="text-center space-y-1">
            <p className={cn(
              'text-lg font-bold transition-all duration-300',
              animPhase === 'charging' && 'scale-110 text-[#00E5A0]'
            )} style={animPhase !== 'charging' ? { color: 'rgb(var(--portal-text))' } : undefined}>
              {animPhase === 'charging' ? 'Powering up...' : todayRecords.length > 0 ? 'Go again?' : 'Ready to train?'}
            </p>
            <p className="text-sm" style={{ color: 'var(--portal-text-muted)' }}>
              {animPhase === 'charging' ? '' : todayRecords.length > 0 ? 'Tap to log another session' : 'Tap the button to check in'}
            </p>
          </div>

          {showButton && (
            <div className="relative flex items-center justify-center h-52 w-52">
              <svg className="absolute inset-0 power-ring-spin" viewBox="0 0 208 208">
                <circle cx="104" cy="104" r="100" fill="none" stroke="rgba(0,229,160,0.12)" strokeWidth="1.5" strokeDasharray="8 12" strokeLinecap="round" />
              </svg>
              <div className={cn(
                'absolute rounded-full transition-all duration-500',
                animPhase === 'charging'
                  ? 'h-48 w-48 border-2 border-[#00E5A0]/60 shadow-[0_0_40px_rgba(0,229,160,0.4)]'
                  : 'h-44 w-44 border border-[#00E5A0]/15 checkin-breathe'
              )} />
              {animPhase === 'explode' && (
                <>
                  <ParticleBurst />
                  <RingPulse />
                  <div className="absolute inset-0 rounded-full bg-[#00E5A0]/30 checkin-flash" />
                </>
              )}
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className={cn(
                  'relative z-10 h-36 w-36 rounded-full flex flex-col items-center justify-center gap-2',
                  'bg-gradient-to-br from-[#00E5A0] to-[#00C4FF]',
                  'text-black transition-all duration-300',
                  'active:scale-90 disabled:pointer-events-none',
                  animPhase === 'idle' && 'shadow-[0_0_50px_rgba(0,229,160,0.3)]',
                  animPhase === 'charging' && 'scale-95 shadow-[0_0_80px_rgba(0,229,160,0.6)] checkin-shake',
                  animPhase === 'explode' && 'scale-0 opacity-0',
                )}
              >
                {checkingIn ? (
                  <div className="flex flex-col items-center gap-1">
                    <Zap className="h-10 w-10 fill-current checkin-charge-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Hold on...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="h-10 w-10 fill-current" />
                    <span className="text-xs font-bold uppercase tracking-wider">Check In</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className={cn(
        'grid grid-cols-2 gap-3',
        animPhase === 'done' && 'checkin-stats-reveal'
      )}>
        {[
          { icon: Zap, color: '#00E5A0', value: monthlyCount, label: 'visits this\nmonth' },
          { icon: Flame, color: '#FF6B35', value: streak, label: 'day\nstreak' },
        ].map(({ icon: Icon, color, value, label }) => (
          <div
            key={label}
            className={cn(
              "backdrop-blur-sm border rounded-2xl p-4 text-center",
              pt('bg-white/[0.04] border-white/[0.06]', 'bg-white border-gray-200 shadow-sm')
            )}
          >
            <div className="h-9 w-9 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${color}15` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: 'rgb(var(--portal-text))' }}>{value}</p>
            <p className="text-[10px] leading-tight whitespace-pre-line mt-1" style={{ color: 'var(--portal-text-dimmed)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Today's sessions list */}
      {todayRecords.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] px-1" style={{ color: 'var(--portal-text-dimmed)' }}>
            Today's Sessions
          </p>
          <div className="space-y-1.5">
            {todayRecords.map((record, idx) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center gap-3 border rounded-xl px-4 py-2.5",
                  pt('bg-white/[0.04] border-white/[0.06]', 'bg-white border-gray-200')
                )}
              >
                <div className="h-7 w-7 rounded-lg bg-[#00E5A0]/10 flex items-center justify-center shrink-0">
                  <Clock className="h-3.5 w-3.5 text-[#00E5A0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--portal-text-heading)' }}>Session {idx + 1}</p>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--portal-text-muted)' }}>{format(parseISO(record.check_in), 'hh:mm a')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Plus, Award, Flame, Target, Trophy, Scale, Ruler, Heart, Dumbbell, ArrowUpDown, Zap, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GymPortalProgressProps {
  member: any;
}

interface Vital {
  id: string;
  member_id: string;
  user_id: string;
  logged_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  notes: string | null;
}

function calcBMI(weight?: number | null, height?: number | null) {
  if (!weight || !height || height === 0) return null;
  return weight / Math.pow(height / 100, 2);
}

function fatZoneColor(pct: number | null) {
  if (pct == null) return '#ffffff30';
  if (pct < 20) return '#00E5A0';
  if (pct < 30) return '#FFB800';
  return '#FF4D6A';
}

function TrendIcon({ current, previous }: { current: number | null; previous: number | null }) {
  if (current == null || previous == null) return <Minus className="h-3 w-3 text-white/20" />;
  if (current > previous) return <TrendingUp className="h-3 w-3 text-[#00E5A0]" />;
  if (current < previous) return <TrendingDown className="h-3 w-3 text-[#FF4D6A]" />;
  return <Minus className="h-3 w-3 text-white/30" />;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatCard({ label, value, unit, icon: Icon, trend, color }: {
  label: string; value: string | number | null; unit?: string; icon: any; trend?: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        {trend}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-white/40 mt-2 font-medium">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white tabular-nums">{value ?? '—'}</span>
        {unit && <span className="text-xs text-white/30">{unit}</span>}
      </div>
    </div>
  );
}

function MilestoneBadge({ label, icon: Icon, unlocked, color }: {
  label: string; icon: any; unlocked: boolean; color: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 transition-all ${unlocked ? '' : 'opacity-25 grayscale'}`}>
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center border"
        style={{
          backgroundColor: unlocked ? `${color}15` : 'rgba(255,255,255,0.03)',
          borderColor: unlocked ? `${color}40` : 'rgba(255,255,255,0.06)',
          boxShadow: unlocked ? `0 0 20px ${color}25` : 'none',
        }}
      >
        <Icon className="h-5 w-5" style={{ color: unlocked ? color : 'rgba(255,255,255,0.2)' }} />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 text-center leading-tight">{label}</span>
    </div>
  );
}

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Strength', 'Endurance', 'Flexibility'] as const;

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

interface WorkoutPlan {
  id: string;
  title: string;
  duration_minutes: number;
  difficulty: string;
  exercises: WorkoutExercise[];
  generated_at: string;
  goal: string;
}

export function GymPortalProgress({ member }: GymPortalProgressProps) {
  const queryClient = useQueryClient();
  const [logOpen, setLogOpen] = useState(false);
  const [form, setForm] = useState({
    weight_kg: '', height_cm: '', body_fat_pct: '', muscle_mass_kg: '',
    waist_cm: '', chest_cm: '', arm_cm: '', hip_cm: '', thigh_cm: '', notes: '',
  });
  const [selectedGoal, setSelectedGoal] = useState<string>(member.fitness_goal || '');

  const { data: vitals = [], isLoading } = useQuery({
    queryKey: ['gym-vitals', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_member_vitals' as any)
        .select('*')
        .eq('member_id', member.id)
        .order('logged_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Vital[];
    },
  });

  // Today's workout plan query
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayPlan, isLoading: planLoading } = useQuery({
    queryKey: ['gym-workout-plan', member.id, todayStart.toISOString().slice(0, 10)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_workout_plans' as any)
        .select('*')
        .eq('member_id', member.id)
        .gte('generated_at', todayStart.toISOString())
        .order('generated_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as unknown as WorkoutPlan) ?? null;
    },
    enabled: true,
  });

  // Save goal to member profile
  const goalMutation = useMutation({
    mutationFn: async (goal: string) => {
      const { error } = await supabase
        .from('gym_members' as any)
        .update({ fitness_goal: goal } as any)
        .eq('id', member.id);
      if (error) throw error;
    },
  });

  // Generate workout mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const latest = vitals[0] ?? null;
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          member_id: member.id,
          goal: selectedGoal,
          vitals: latest ? {
            weight_kg: latest.weight_kg,
            body_fat_pct: latest.body_fat_pct,
            muscle_mass_kg: latest.muscle_mass_kg,
          } : null,
          gender: member.gender,
          date_of_birth: member.date_of_birth,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-workout-plan', member.id] });
      toast.success('Workout generated! 🏋️');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to generate workout'),
  });

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    goalMutation.mutate(goal);
    // If no plan for today, auto-generate
    if (!todayPlan) {
      setTimeout(() => generateMutation.mutate(), 300);
    }
  };

  const insertMutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const ownerUserId = member.owner_user_id ?? member.user_id;
      const { error } = await supabase
        .from('gym_member_vitals' as any)
        .insert({
          member_id: member.id,
          user_id: ownerUserId,
          ...values,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-vitals', member.id] });
      setLogOpen(false);
      setForm({ weight_kg: '', height_cm: '', body_fat_pct: '', muscle_mass_kg: '', waist_cm: '', chest_cm: '', arm_cm: '', hip_cm: '', thigh_cm: '', notes: '' });
      toast.success('Stats logged! 💪');
    },
    onError: () => toast.error('Failed to save stats'),
  });

  const handleSubmit = () => {
    const values: Record<string, any> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'notes') { if (v) values[k] = v; }
      else if (v !== '') values[k] = parseFloat(v);
    });
    if (Object.keys(values).length === 0) {
      toast.error('Enter at least one measurement');
      return;
    }
    insertMutation.mutate(values);
  };

  const latest = vitals[0] ?? null;
  const previous = vitals[1] ?? null;
  const oldest = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const bmi = latest ? calcBMI(latest.weight_kg, latest.height_cm) : null;

  const weightHistory = useMemo(() => [...vitals].reverse().map(v => v.weight_kg).filter((v): v is number => v != null), [vitals]);
  const fatHistory = useMemo(() => [...vitals].reverse().map(v => v.body_fat_pct).filter((v): v is number => v != null), [vitals]);
  const muscleHistory = useMemo(() => [...vitals].reverse().map(v => v.muscle_mass_kg).filter((v): v is number => v != null), [vitals]);

  const milestones = useMemo(() => {
    const hasFirst = vitals.length >= 1;
    const totalLogs = vitals.length;
    let streak = 0;
    if (vitals.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = vitals.map(v => { const d = new Date(v.logged_at); d.setHours(0, 0, 0, 0); return d.getTime(); });
      const unique = [...new Set(dates)].sort((a, b) => b - a);
      for (let i = 0; i < unique.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        expected.setHours(0, 0, 0, 0);
        if (unique[i] === expected.getTime()) streak++;
        else break;
      }
    }
    let weightLost = 0;
    if (oldest && latest && oldest.weight_kg && latest.weight_kg) {
      weightLost = oldest.weight_kg - latest.weight_kg;
    }
    return { firstLog: hasFirst, streak7: streak >= 7, kg5Down: weightLost >= 5, consistency: totalLogs >= 30, streakCount: streak };
  }, [vitals, latest, oldest]);

  const beforeAfter = useMemo(() => {
    if (!oldest || !latest || oldest.id === latest.id) return null;
    const pctChange = (curr: number | null, prev: number | null) => {
      if (curr == null || prev == null || prev === 0) return null;
      return ((curr - prev) / prev) * 100;
    };
    return {
      weight: pctChange(latest.weight_kg, oldest.weight_kg),
      fat: pctChange(latest.body_fat_pct, oldest.body_fat_pct),
      muscle: pctChange(latest.muscle_mass_kg, oldest.muscle_mass_kg),
    };
  }, [oldest, latest]);

  const inputFields = [
    { key: 'weight_kg', label: 'Weight', unit: 'kg', icon: Scale },
    { key: 'height_cm', label: 'Height', unit: 'cm', icon: Ruler },
    { key: 'body_fat_pct', label: 'Body Fat', unit: '%', icon: Heart },
    { key: 'muscle_mass_kg', label: 'Muscle Mass', unit: 'kg', icon: Dumbbell },
    { key: 'waist_cm', label: 'Waist', unit: 'cm', icon: ArrowUpDown },
    { key: 'chest_cm', label: 'Chest', unit: 'cm', icon: ArrowUpDown },
    { key: 'arm_cm', label: 'Arms', unit: 'cm', icon: ArrowUpDown },
    { key: 'hip_cm', label: 'Hips', unit: 'cm', icon: ArrowUpDown },
    { key: 'thigh_cm', label: 'Thighs', unit: 'cm', icon: ArrowUpDown },
  ];

  useEffect(() => {
    if (latest?.height_cm && !form.height_cm) {
      setForm(f => ({ ...f, height_cm: String(latest.height_cm) }));
    }
  }, [latest]);

  // Auto-populate selected goal from existing plan
  useEffect(() => {
    if (todayPlan && !selectedGoal) {
      setSelectedGoal(todayPlan.goal);
    }
  }, [todayPlan]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#00E5A0]/30 border-t-[#00E5A0] animate-spin" />
      </div>
    );
  }

  const difficultyColor = (d: string) => {
    if (d === 'Beginner') return '#00E5A0';
    if (d === 'Intermediate') return '#FFB800';
    return '#FF4D6A';
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Progress</h1>
        <p className="text-xs text-white/40 mt-0.5">
          {vitals.length > 0 ? `${vitals.length} logs • ${milestones.streakCount} day streak 🔥` : 'Start tracking your transformation'}
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Weight" value={latest?.weight_kg?.toFixed(1) ?? null} unit="kg" icon={Scale} color="#00E5A0" trend={<TrendIcon current={latest?.weight_kg ?? null} previous={previous?.weight_kg ?? null} />} />
        <StatCard label="Body Fat" value={latest?.body_fat_pct?.toFixed(1) ?? null} unit="%" icon={Heart} color={fatZoneColor(latest?.body_fat_pct ?? null)} trend={<TrendIcon current={latest?.body_fat_pct ?? null} previous={previous?.body_fat_pct ?? null} />} />
        <StatCard label="BMI" value={bmi?.toFixed(1) ?? null} icon={Target} color="#00C4FF" trend={null} />
        <StatCard label="Muscle" value={latest?.muscle_mass_kg?.toFixed(1) ?? null} unit="kg" icon={Dumbbell} color="#A855F7" trend={<TrendIcon current={latest?.muscle_mass_kg ?? null} previous={previous?.muscle_mass_kg ?? null} />} />
        <StatCard label="Height" value={latest?.height_cm?.toFixed(0) ?? null} unit="cm" icon={Ruler} color="#FFB800" trend={null} />
        <StatCard label="Waist" value={latest?.waist_cm?.toFixed(1) ?? null} unit="cm" icon={ArrowUpDown} color="#FF6B6B" trend={<TrendIcon current={latest?.waist_cm ?? null} previous={previous?.waist_cm ?? null} />} />
      </div>

      {/* Sparkline Charts */}
      {(weightHistory.length >= 2 || fatHistory.length >= 2) && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Trends</h2>
          {weightHistory.length >= 2 && (
            <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">Weight</p>
              <MiniSparkline data={weightHistory} color="#00E5A0" />
            </div>
          )}
          {fatHistory.length >= 2 && (
            <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">Body Fat %</p>
              <MiniSparkline data={fatHistory} color="#FFB800" />
            </div>
          )}
          {muscleHistory.length >= 2 && (
            <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">Muscle Mass</p>
              <MiniSparkline data={muscleHistory} color="#A855F7" />
            </div>
          )}
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Milestones</h2>
        <div className="grid grid-cols-4 gap-3">
          <MilestoneBadge label="First Log" icon={Award} unlocked={milestones.firstLog} color="#00E5A0" />
          <MilestoneBadge label="7-Day Streak" icon={Flame} unlocked={milestones.streak7} color="#FFB800" />
          <MilestoneBadge label="5kg Down" icon={Target} unlocked={milestones.kg5Down} color="#00C4FF" />
          <MilestoneBadge label="30+ Logs" icon={Trophy} unlocked={milestones.consistency} color="#A855F7" />
        </div>
      </div>

      {/* Before / After */}
      {beforeAfter && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Your Journey</h2>
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/30 font-medium">
              <span>First Log</span>
              <span>Latest</span>
            </div>
            {[
              { label: 'Weight', first: oldest?.weight_kg, last: latest?.weight_kg, pct: beforeAfter.weight, unit: 'kg', flip: true },
              { label: 'Body Fat', first: oldest?.body_fat_pct, last: latest?.body_fat_pct, pct: beforeAfter.fat, unit: '%', flip: true },
              { label: 'Muscle', first: oldest?.muscle_mass_kg, last: latest?.muscle_mass_kg, pct: beforeAfter.muscle, unit: 'kg', flip: false },
            ].map(row => row.first != null && row.last != null && (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-white/60">{row.first?.toFixed(1)}{row.unit}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold" style={{
                    color: row.pct == null ? '#ffffff40'
                      : (row.flip ? (row.pct < 0 ? '#00E5A0' : '#FF4D6A') : (row.pct > 0 ? '#00E5A0' : '#FF4D6A'))
                  }}>
                    {row.pct != null ? `${row.pct > 0 ? '+' : ''}${row.pct.toFixed(1)}%` : '—'}
                  </span>
                  <span className="text-[10px] text-white/30">{row.label}</span>
                </div>
                <span className="text-sm font-bold text-white">{row.last?.toFixed(1)}{row.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Button */}
      <Button
        onClick={() => setLogOpen(true)}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00E5A0] to-[#00C4FF] text-black font-bold text-base shadow-[0_0_30px_rgba(0,229,160,0.3)] hover:shadow-[0_0_40px_rgba(0,229,160,0.5)] transition-all"
      >
        <Plus className="h-5 w-5 mr-2" />
        Log Today's Stats
      </Button>

      {/* ===== AI WORKOUT SECTION ===== */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#FFB800]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Today's Workout</h2>
        </div>

        {/* Goal Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {FITNESS_GOALS.map(goal => (
            <button
              key={goal}
              onClick={() => handleGoalSelect(goal)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedGoal === goal
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 shadow-[0_0_12px_rgba(0,229,160,0.2)]'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        {/* Workout Card */}
        {selectedGoal && (
          <>
            {(planLoading || generateMutation.isPending) ? (
              <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-[#00E5A0] animate-spin" />
                <p className="text-sm text-white/40 font-medium">
                  {generateMutation.isPending ? 'Generating your workout...' : 'Loading plan...'}
                </p>
              </div>
            ) : todayPlan ? (
              <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Plan Header */}
                <div className="p-4 border-b border-white/[0.06]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">{todayPlan.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-white/40">
                          <Clock className="h-3 w-3" /> {todayPlan.duration_minutes} min
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${difficultyColor(todayPlan.difficulty)}15`,
                            color: difficultyColor(todayPlan.difficulty),
                          }}
                        >
                          {todayPlan.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="divide-y divide-white/[0.04]">
                  {(todayPlan.exercises as unknown as WorkoutExercise[]).map((ex, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-[#00E5A0]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-[#00E5A0]">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{ex.name}</p>
                        <p className="text-[10px] text-white/40">
                          {ex.sets} × {ex.reps} • {ex.rest_seconds}s rest
                          {ex.notes ? ` • ${ex.notes}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Regenerate */}
                <div className="p-3 border-t border-white/[0.06]">
                  <Button
                    variant="ghost"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="w-full text-white/40 hover:text-white/60 text-xs font-medium"
                  >
                    <RotateCcw className="h-3 w-3 mr-1.5" />
                    Generate New Workout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center gap-3">
                <Dumbbell className="h-8 w-8 text-white/20" />
                <p className="text-sm text-white/40 text-center">No workout for today yet</p>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="bg-[#00E5A0]/20 text-[#00E5A0] hover:bg-[#00E5A0]/30 border border-[#00E5A0]/30 rounded-xl text-xs font-bold"
                >
                  <Zap className="h-3 w-3 mr-1.5" />
                  Generate Workout
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Drawer */}
      <Drawer open={logOpen} onOpenChange={setLogOpen}>
        <DrawerContent className="bg-[#12121a] border-white/[0.06] max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="text-white font-black text-lg">Log Your Stats</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-3 overflow-y-auto max-h-[55vh]">
            {inputFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                  <field.icon className="h-4 w-4 text-white/40" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      placeholder="—"
                      value={(form as any)[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full bg-transparent border-b border-white/[0.08] text-white text-lg font-bold py-1 outline-none focus:border-[#00E5A0] transition-colors placeholder:text-white/10"
                    />
                    <span className="text-xs text-white/30 shrink-0">{field.unit}</span>
                  </div>
                </div>
              </div>
            ))}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Notes</label>
              <input
                type="text"
                placeholder="How are you feeling?"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-transparent border-b border-white/[0.08] text-white text-sm py-2 outline-none focus:border-[#00E5A0] transition-colors placeholder:text-white/20"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={insertMutation.isPending}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#00E5A0] to-[#00C4FF] text-black font-bold"
            >
              {insertMutation.isPending ? 'Saving...' : 'Save Stats 💪'}
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="text-white/40">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

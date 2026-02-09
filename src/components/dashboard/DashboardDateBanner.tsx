import { useState, useEffect } from 'react';
import { format, getDayOfYear } from 'date-fns';
import { CalendarDays, Sparkles, Clock } from 'lucide-react';

interface DashboardDateBannerProps {
  quotes: string[];
  theme: 'business' | 'legal';
}

const themeConfig = {
  business: {
    containerGradient: 'from-indigo-600 via-violet-600 to-purple-700',
    borderColor: 'border-indigo-400/30',
    orbColors: ['bg-white/10', 'bg-pink-400/20', 'bg-indigo-300/15'],
    clockGradient: 'from-white via-indigo-100 to-white',
    colonColor: 'text-indigo-200',
    dayBadgeGradient: 'from-white/20 to-white/10',
    calendarIconColor: 'text-indigo-200',
    sparkleColor: 'text-yellow-300',
    quoteBarGradient: 'from-pink-400 via-yellow-300 to-indigo-300',
    quoteBorderGradient: 'from-white/20 via-white/10 to-white/20',
    quoteMarkColor: 'text-white/20',
    textColor: 'text-white',
    subtextColor: 'text-indigo-100',
  },
  legal: {
    containerGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    borderColor: 'border-emerald-400/30',
    orbColors: ['bg-white/10', 'bg-cyan-400/20', 'bg-emerald-300/15'],
    clockGradient: 'from-white via-emerald-100 to-white',
    colonColor: 'text-emerald-200',
    dayBadgeGradient: 'from-white/20 to-white/10',
    calendarIconColor: 'text-emerald-200',
    sparkleColor: 'text-yellow-300',
    quoteBarGradient: 'from-cyan-300 via-yellow-300 to-emerald-300',
    quoteBorderGradient: 'from-white/20 via-white/10 to-white/20',
    quoteMarkColor: 'text-white/20',
    textColor: 'text-white',
    subtextColor: 'text-emerald-100',
  },
};

export function DashboardDateBanner({ quotes, theme }: DashboardDateBannerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const t = themeConfig[theme];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const dayIndex = getDayOfYear(today);
  const dailyQuote = quotes[dayIndex % quotes.length];

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${t.borderColor} bg-gradient-to-r ${t.containerGradient} backdrop-blur-sm p-5 md:p-6 animate-fade-in`}
    >
      {/* Decorative floating orbs */}
      <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full ${t.orbColors[0]} blur-2xl animate-float`} />
      <div className={`absolute -bottom-8 -left-8 h-32 w-32 rounded-full ${t.orbColors[1]} blur-3xl animate-float`} style={{ animationDelay: '1s' }} />
      <div className={`absolute top-1/2 right-1/4 h-16 w-16 rounded-full ${t.orbColors[2]} blur-2xl animate-float`} style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top row: Date + Clock */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Date section */}
          <div className="flex flex-col gap-1.5 animate-slide-up-fade">
            <span
              className={`inline-flex w-fit items-center rounded-full bg-gradient-to-r ${t.dayBadgeGradient} px-3 py-0.5 text-xs font-bold text-white tracking-wide uppercase shadow-lg`}
            >
              {format(today, 'EEEE')}
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className={`h-5 w-5 ${t.calendarIconColor}`} />
              <span className={`text-lg font-bold ${t.textColor}`}>{format(today, 'd MMMM yyyy')}</span>
            </div>
          </div>

          {/* Live clock */}
          <div className="flex items-center gap-1 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Clock className={`h-4 w-4 ${t.colonColor} mr-1.5`} />
            <span className={`text-3xl md:text-4xl font-mono font-extrabold bg-gradient-to-r ${t.clockGradient} bg-clip-text text-transparent tabular-nums tracking-tight`}>
              {hours}
            </span>
            <span className={`text-3xl md:text-4xl font-mono font-extrabold ${t.colonColor} animate-pulse`}>:</span>
            <span className={`text-3xl md:text-4xl font-mono font-extrabold bg-gradient-to-r ${t.clockGradient} bg-clip-text text-transparent tabular-nums tracking-tight`}>
              {minutes}
            </span>
            <span className={`text-3xl md:text-4xl font-mono font-extrabold ${t.colonColor} animate-pulse`}>:</span>
            <span className={`text-3xl md:text-4xl font-mono font-extrabold bg-gradient-to-r ${t.clockGradient} bg-clip-text text-transparent tabular-nums tracking-tight`}>
              {seconds}
            </span>
          </div>
        </div>

        {/* Motivational quote – glassmorphism card */}
        <div
          className={`relative rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5 md:p-4 animate-slide-up-fade`}
          style={{ animationDelay: '0.4s' }}
        >
          {/* Gradient accent bar on left */}
          <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b ${t.quoteBarGradient}`} />

          {/* Large decorative quote mark */}
          <span className={`absolute -top-2 left-3 text-5xl font-serif leading-none ${t.quoteMarkColor} select-none`}>"</span>

          <div className="flex items-start gap-2.5 pl-4">
            <Sparkles className={`h-4 w-4 ${t.sparkleColor} mt-0.5 flex-shrink-0`} style={{ animation: 'spin 4s linear infinite' }} />
            <p className={`text-sm italic ${t.subtextColor} leading-relaxed`}>
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

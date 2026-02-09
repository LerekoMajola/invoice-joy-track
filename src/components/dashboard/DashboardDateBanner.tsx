import { useState, useEffect } from 'react';
import { format, getDayOfYear } from 'date-fns';
import { CalendarDays, Sparkles, Clock } from 'lucide-react';

interface DashboardDateBannerProps {
  quotes: string[];
  theme: 'business' | 'legal';
}

const themeConfig = {
  business: {
    containerGradient: 'from-indigo-500/10 via-violet-500/5 to-pink-500/10',
    borderColor: 'border-indigo-500/20',
    orbColors: ['bg-indigo-500/20', 'bg-violet-500/15', 'bg-pink-500/10'],
    clockGradient: 'from-indigo-500 via-violet-500 to-purple-500',
    colonColor: 'text-violet-400',
    dayBadgeGradient: 'from-indigo-500 to-violet-500',
    calendarIconColor: 'text-indigo-500',
    sparkleColor: 'text-violet-400',
    quoteBarGradient: 'from-indigo-500 via-violet-500 to-pink-500',
    quoteBorderGradient: 'from-indigo-500/30 via-violet-500/20 to-pink-500/30',
    quoteMarkColor: 'text-indigo-300/30',
  },
  legal: {
    containerGradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
    borderColor: 'border-emerald-500/20',
    orbColors: ['bg-emerald-500/20', 'bg-teal-500/15', 'bg-cyan-500/10'],
    clockGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    colonColor: 'text-teal-400',
    dayBadgeGradient: 'from-emerald-500 to-teal-500',
    calendarIconColor: 'text-emerald-500',
    sparkleColor: 'text-teal-400',
    quoteBarGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    quoteBorderGradient: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30',
    quoteMarkColor: 'text-emerald-300/30',
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
              <span className="text-lg font-bold text-foreground">{format(today, 'd MMMM yyyy')}</span>
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
          className={`relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3.5 md:p-4 animate-slide-up-fade`}
          style={{ animationDelay: '0.4s' }}
        >
          {/* Gradient accent bar on left */}
          <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b ${t.quoteBarGradient}`} />

          {/* Large decorative quote mark */}
          <span className={`absolute -top-2 left-3 text-5xl font-serif leading-none ${t.quoteMarkColor} select-none`}>"</span>

          <div className="flex items-start gap-2.5 pl-4">
            <Sparkles className={`h-4 w-4 ${t.sparkleColor} mt-0.5 flex-shrink-0`} style={{ animation: 'spin 4s linear infinite' }} />
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

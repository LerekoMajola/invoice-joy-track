import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

// Animated number counter hook
function useAnimatedNumber(target: number, duration: number = 600) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (isNaN(target)) {
      setValue(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [target, duration]);

  return value;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  gradient?: 'primary' | 'success' | 'coral' | 'violet';
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
}: StatCardProps) {
  const { user } = useAuth();
  const { profile } = useCompanyProfile();
  const displayName = profile?.contact_person || profile?.company_name || user?.email?.split('@')[0] || '';

  const valueString = String(value);
  
  const numericMatch = valueString.match(/[\d,]+/);
  const numericValue = numericMatch ? parseInt(numericMatch[0].replace(/,/g, '')) : 0;
  const animatedNumber = useAnimatedNumber(numericValue);
  
  const formattedValue = numericMatch 
    ? valueString.replace(numericMatch[0], animatedNumber.toLocaleString())
    : valueString;

  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <div className="group rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 md:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-white/80">{title}</p>
          <p
            className="mt-1 md:mt-2 font-display font-bold text-white truncate text-xl md:text-2xl lg:text-3xl"
            title={valueString}
          >
            {formattedValue}
          </p>
          {change && (
            <div className={cn(
              'mt-1 md:mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              isPositive && 'bg-white/20 text-emerald-200',
              isNegative && 'bg-white/20 text-red-200',
              changeType === 'neutral' && 'bg-white/15 text-white/70'
            )}>
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="rounded-xl p-2.5 md:p-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 bg-white/20 shadow-lg">
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </div>
      </div>
      {displayName && (
        <p className="mt-3 text-xs text-white/60 truncate">{displayName}</p>
      )}
    </div>
  );
}

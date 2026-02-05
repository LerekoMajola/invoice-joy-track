import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

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
      
      // Easing function for smooth animation
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

const gradientClasses = {
  primary: 'from-primary to-violet',
  success: 'from-success to-cyan',
  coral: 'from-coral to-warning',
  violet: 'from-violet to-primary',
};

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'bg-gradient-to-br from-primary to-violet text-white',
  gradient = 'primary'
}: StatCardProps) {
  const valueString = String(value);
  
  // Extract numeric value for animation
  const numericMatch = valueString.match(/[\d,]+/);
  const numericValue = numericMatch ? parseInt(numericMatch[0].replace(/,/g, '')) : 0;
  const animatedNumber = useAnimatedNumber(numericValue);
  
  // Format the animated number back with the original format
  const formattedValue = numericMatch 
    ? valueString.replace(numericMatch[0], animatedNumber.toLocaleString())
    : valueString;

  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <div className="group rounded-xl border border-border bg-card p-4 md:p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-slide-up relative overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
        gradientClasses[gradient]
      )} />
      
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className="mt-1 md:mt-2 font-display font-bold text-card-foreground truncate text-xl md:text-2xl lg:text-3xl"
            title={valueString}
          >
            {formattedValue}
          </p>
          {change && (
            <div className={cn(
              'mt-1 md:mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              isPositive && 'bg-success/10 text-success',
              isNegative && 'bg-destructive/10 text-destructive',
              changeType === 'neutral' && 'bg-muted text-muted-foreground'
            )}>
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={cn(
          'rounded-xl p-2.5 md:p-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-lg',
          iconColor
        )}>
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </div>
  );
}

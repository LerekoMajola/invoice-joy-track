import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

const getValueSizeClass = (value: string | number): string => {
  const length = String(value).length;
  if (length <= 8) return 'text-3xl';
  if (length <= 12) return 'text-2xl';
  if (length <= 16) return 'text-xl';
  return 'text-lg';
};

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'bg-primary/10 text-primary'
}: StatCardProps) {
  const valueString = String(value);
  
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-card transition-all duration-200 hover:shadow-elevated animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
          <p 
            className={cn(
              'mt-1 md:mt-2 font-display font-semibold text-card-foreground truncate text-xl md:text-2xl lg:text-3xl',
            )}
            title={valueString}
          >
            {value}
          </p>
          {change && (
            <p className={cn(
              'mt-0.5 md:mt-1 text-xs md:text-sm font-medium truncate',
              changeType === 'positive' && 'text-success',
              changeType === 'negative' && 'text-destructive',
              changeType === 'neutral' && 'text-muted-foreground'
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-2 md:p-3 flex-shrink-0', iconColor)}>
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </div>
  );
}

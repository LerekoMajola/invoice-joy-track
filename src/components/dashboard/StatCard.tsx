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
    <div className="group rounded-xl border border-border bg-card p-4 md:p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p 
            className="mt-2 font-display font-semibold text-card-foreground truncate text-xl md:text-2xl"
            title={valueString}
          >
            {value}
          </p>
          {change && (
            <p className={cn(
              'mt-1 text-xs font-medium truncate',
              changeType === 'positive' && 'text-success',
              changeType === 'negative' && 'text-destructive',
              changeType === 'neutral' && 'text-muted-foreground'
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-2.5 flex-shrink-0 transition-colors duration-300',
          iconColor
        )}>
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfitMarginBadgeProps {
  margin: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  showValue?: boolean;
}

const statusStyles = {
  excellent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  good: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  poor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const statusLabels = {
  excellent: 'Excellent',
  good: 'Good',
  warning: 'Warning',
  poor: 'Low',
};

export function ProfitMarginBadge({ margin, status, showValue = true }: ProfitMarginBadgeProps) {
  return (
    <Badge variant="outline" className={cn('capitalize font-medium', statusStyles[status])}>
      {showValue ? `${margin.toFixed(1)}%` : statusLabels[status]}
    </Badge>
  );
}

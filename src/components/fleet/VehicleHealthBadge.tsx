import { Badge } from '@/components/ui/badge';
import { getHealthLabel } from '@/hooks/useFleetVehicles';
import { cn } from '@/lib/utils';

interface VehicleHealthBadgeProps {
  score: number;
  showScore?: boolean;
  className?: string;
}

export function VehicleHealthBadge({ score, showScore = true, className }: VehicleHealthBadgeProps) {
  const { label, color } = getHealthLabel(score);

  const colorClasses = {
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    red: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const dotClasses = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', colorClasses[color], className)}>
      <span className={cn('h-2 w-2 rounded-full', dotClasses[color])} />
      {label}
      {showScore && <span className="text-xs opacity-70">({score})</span>}
    </Badge>
  );
}

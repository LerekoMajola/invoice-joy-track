import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  className?: string;
}

export function UsageMeter({ className }: UsageMeterProps) {
  const { usage, limits, currentPlan, trialDaysRemaining, isTrialing } = useSubscription();

  if (!usage) return null;

  const clientsPercentage = limits.clients === Infinity 
    ? 0 
    : Math.min(100, ((usage.clients_count || 0) / limits.clients) * 100);
  
  const quotesPercentage = limits.quotes_per_month === Infinity 
    ? 0 
    : Math.min(100, ((usage.quotes_count || 0) / limits.quotes_per_month) * 100);
  
  const invoicesPercentage = limits.invoices_per_month === Infinity 
    ? 0 
    : Math.min(100, ((usage.invoices_count || 0) / limits.invoices_per_month) * 100);

  const formatLimit = (count: number, limit: number) => {
    if (limit === Infinity) return `${count} (Unlimited)`;
    return `${count} / ${limit}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className={cn("space-y-4 p-4 rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Usage</h3>
        <Badge variant={isTrialing ? "secondary" : "default"}>
          {currentPlan.replace('_', ' ').toUpperCase()}
          {isTrialing && ` (${trialDaysRemaining} days left)`}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Clients */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Clients</span>
            <span className="font-medium text-foreground">
              {formatLimit(usage.clients_count || 0, limits.clients)}
            </span>
          </div>
          {limits.clients !== Infinity && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn("h-full transition-all", getProgressColor(clientsPercentage))}
                style={{ width: `${clientsPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Quotes */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quotes (this month)</span>
            <span className="font-medium text-foreground">
              {formatLimit(usage.quotes_count || 0, limits.quotes_per_month)}
            </span>
          </div>
          {limits.quotes_per_month !== Infinity && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn("h-full transition-all", getProgressColor(quotesPercentage))}
                style={{ width: `${quotesPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoices (this month)</span>
            <span className="font-medium text-foreground">
              {formatLimit(usage.invoices_count || 0, limits.invoices_per_month)}
            </span>
          </div>
          {limits.invoices_per_month !== Infinity && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn("h-full transition-all", getProgressColor(invoicesPercentage))}
                style={{ width: `${invoicesPercentage}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

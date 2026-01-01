import { Users, TrendingUp } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { ClientProfitability } from '@/hooks/useJobProfitability';

interface ClientProfitabilityCardProps {
  clients: ClientProfitability[];
}

export function ClientProfitabilityCard({ clients }: ClientProfitabilityCardProps) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Top Clients by Profit</h3>
      </div>
      <div className="space-y-4">
        {clients.slice(0, 5).map((client, index) => {
          const marginColor = 
            client.averageMargin >= 30 ? 'text-emerald-500' :
            client.averageMargin >= 15 ? 'text-sky-500' :
            client.averageMargin >= 5 ? 'text-amber-500' : 'text-rose-500';

          return (
            <div key={client.clientName} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  index === 0 ? 'bg-amber-500/10 text-amber-500' :
                  index === 1 ? 'bg-slate-400/10 text-slate-400' :
                  index === 2 ? 'bg-orange-600/10 text-orange-600' :
                  'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{client.clientName}</p>
                  <p className="text-xs text-muted-foreground">{client.jobCount} jobs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">{formatMaluti(client.grossProfit)}</p>
                <p className={cn('text-xs font-medium', marginColor)}>
                  {client.averageMargin.toFixed(1)}% margin
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

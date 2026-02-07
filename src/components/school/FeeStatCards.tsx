import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { Users, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

interface FeeStatCardsProps {
  totalStudents: number;
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

export function FeeStatCards({ totalStudents, totalExpected, totalCollected, totalOutstanding, collectionRate }: FeeStatCardsProps) {
  const stats = [
    { label: 'Active Students', value: totalStudents.toString(), icon: Users, color: 'text-primary' },
    { label: 'Fees Expected', value: formatMaluti(totalExpected), icon: Wallet, color: 'text-info' },
    { label: 'Collected', value: formatMaluti(totalCollected), icon: TrendingUp, color: 'text-success' },
    { label: 'Outstanding', value: formatMaluti(totalOutstanding), icon: AlertCircle, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-card animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className={cn('h-4 w-4', stat.color)} />
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
          <p className={cn('text-lg md:text-2xl font-display font-semibold', stat.color)}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

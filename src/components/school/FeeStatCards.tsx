import { formatMaluti } from '@/lib/currency';
import { Users, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface FeeStatCardsProps {
  totalStudents: number;
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

export function FeeStatCards({ totalStudents, totalExpected, totalCollected, totalOutstanding }: FeeStatCardsProps) {
  const { user } = useAuth();
  const { profile } = useCompanyProfile();
  const displayName = profile?.contact_person || profile?.company_name || user?.email?.split('@')[0] || '';

  const stats = [
    { label: 'Active Students', value: totalStudents.toString(), icon: Users },
    { label: 'Fees Expected', value: formatMaluti(totalExpected), icon: Wallet },
    { label: 'Collected', value: formatMaluti(totalCollected), icon: TrendingUp },
    { label: 'Outstanding', value: formatMaluti(totalOutstanding), icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 md:p-4 shadow-lg animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-white/20">
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-white/80">{stat.label}</p>
          </div>
          <p className="text-lg md:text-2xl font-display font-semibold text-white">
            {stat.value}
          </p>
          {displayName && (
            <p className="mt-2 text-xs text-white/60 truncate">{displayName}</p>
          )}
        </div>
      ))}
    </div>
  );
}

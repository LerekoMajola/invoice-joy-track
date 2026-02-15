import { Car, AlertTriangle, Fuel, Wrench } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatMaluti } from '@/lib/currency';
import { FleetVehicle } from '@/hooks/useFleetVehicles';

interface FleetStatsCardsProps {
  vehicles: FleetVehicle[];
  monthlyTotal: number;
}

export function FleetStatsCards({ vehicles, monthlyTotal }: FleetStatsCardsProps) {
  const active = vehicles.filter(v => v.status === 'active').length;
  const needingService = vehicles.filter(v => v.healthScore < 70).length;
  const critical = vehicles.filter(v => v.healthScore < 40).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard
        title="Total Vehicles"
        value={vehicles.length}
        change={`${active} active`}
        changeType="neutral"
        icon={Car}
        gradient="primary"
      />
      <StatCard
        title="Need Attention"
        value={needingService}
        change={`${critical} critical`}
        changeType={critical > 0 ? 'negative' : 'neutral'}
        icon={AlertTriangle}
        gradient="coral"
        iconColor="bg-gradient-to-br from-amber-500 to-red-500 text-white"
      />
      <StatCard
        title="Monthly Cost"
        value={formatMaluti(monthlyTotal)}
        icon={Fuel}
        gradient="success"
        iconColor="bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
      />
      <StatCard
        title="Avg Cost/Vehicle"
        value={vehicles.length > 0 ? formatMaluti(monthlyTotal / vehicles.length) : formatMaluti(0)}
        icon={Wrench}
        gradient="violet"
      />
    </div>
  );
}

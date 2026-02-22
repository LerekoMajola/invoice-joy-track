import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Minus, Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Truck, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeoPricing, formatGeoPrice } from '@/hooks/useGeoPricing';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackageTiers, type PackageTier } from '@/hooks/usePackageTiers';

interface SystemTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  subtitle: string;
}

const systemTabs: SystemTab[] = [
  { key: 'business', label: 'BizPro', icon: <Briefcase className="h-4 w-4" />, gradient: 'from-primary to-violet', subtitle: 'For companies & professionals' },
  { key: 'workshop', label: 'ShopPro', icon: <Wrench className="h-4 w-4" />, gradient: 'from-coral to-warning', subtitle: 'For auto shops & service centres' },
  { key: 'school', label: 'EduPro', icon: <GraduationCap className="h-4 w-4" />, gradient: 'from-info to-cyan', subtitle: 'For private schools & academies' },
  { key: 'legal', label: 'LawPro', icon: <Scale className="h-4 w-4" />, gradient: 'from-emerald-500 to-teal-500', subtitle: 'For law firms & practitioners' },
  { key: 'hire', label: 'HirePro', icon: <Hammer className="h-4 w-4" />, gradient: 'from-amber-500 to-orange-500', subtitle: 'For equipment rental companies' },
  { key: 'guesthouse', label: 'StayPro', icon: <Hotel className="h-4 w-4" />, gradient: 'from-rose-500 to-pink-500', subtitle: 'For guest houses & lodges' },
  { key: 'fleet', label: 'FleetPro', icon: <Truck className="h-4 w-4" />, gradient: 'from-slate-600 to-zinc-800', subtitle: 'For vehicle fleets & logistics' },
  { key: 'gym', label: 'GymPro', icon: <Dumbbell className="h-4 w-4" />, gradient: 'from-lime-500 to-green-600', subtitle: 'For gyms & fitness centres' },
];

function PricingCard({ tier, systemKey, symbol, rate, loading, currency }: { tier: PackageTier; systemKey: string; symbol: string; rate: number; loading: boolean; currency: string }) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 bg-card p-6 sm:p-8 transition-all duration-300',
        tier.is_popular
          ? 'border-primary shadow-glow-md scale-[1.02]'
          : 'border-border hover:border-primary/40 hover:shadow-elevated'
      )}
    >
      {tier.is_popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
          Most Popular
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
      </div>

      <div className="text-center mb-8">
        {loading ? (
          <Skeleton className="h-12 w-32 mx-auto mb-1" />
        ) : (
          <span className="font-display text-4xl sm:text-5xl font-bold text-gradient">
            {formatGeoPrice(tier.bundle_price, symbol, rate)}
          </span>
        )}
        <span className="text-muted-foreground text-sm block mt-1">/month</span>
        {!loading && currency !== 'LSL' && (
          <span className="text-xs text-muted-foreground">Prices shown in {currency}</span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature.name} className="flex items-center gap-3 text-sm">
            {feature.included ? (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className={cn(feature.included ? 'text-foreground' : 'text-muted-foreground')}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link to={`/auth?system=${systemKey}`} className="flex-1">
          <Button
            variant={tier.is_popular ? 'gradient' : 'outline'}
            className="w-full rounded-xl h-12 font-semibold"
          >
            Start Free Trial
          </Button>
        </Link>
        <Link to={`/auth?system=${systemKey}&subscribe=true`} className="flex-1">
          <Button
            variant="outline"
            className="w-full rounded-xl h-12 font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Subscribe
          </Button>
        </Link>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        7-day free trial · No credit card required
      </p>
    </div>
  );
}

export function PricingTable() {
  const [activeSystem, setActiveSystem] = useState('business');
  const current = systemTabs.find((s) => s.key === activeSystem)!;
  const { symbol, rate, loading: geoLoading, currency } = useGeoPricing();
  const { tiers, isLoading: tiersLoading } = usePackageTiers(activeSystem);

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the package that fits your needs. Start with a 7-day free trial — no credit card required.
          </p>
        </div>

        {/* System tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto scrollbar-hide px-2">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1.5 min-w-0">
            {systemTabs.map((sys) => (
              <button
                key={sys.key}
                onClick={() => setActiveSystem(sys.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  activeSystem === sys.key
                    ? `bg-gradient-to-r ${sys.gradient} text-white shadow-md`
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {sys.icon}
                <span>{sys.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-10">
          <h3 className={cn(
            'font-display text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2',
            current.gradient
          )}>
            {current.label}
          </h3>
          <p className="text-muted-foreground">{current.subtitle}</p>
        </div>

        {tiersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[500px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} systemKey={current.key} symbol={symbol} rate={rate} loading={geoLoading} currency={currency} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to={`/auth?system=${activeSystem}&custom=true`} className="text-sm text-primary hover:underline underline-offset-4 font-medium">
            Or build your own custom package →
          </Link>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Briefcase, Scale, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeoPricing, formatGeoPrice } from '@/hooks/useGeoPricing';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackageTiers, type PackageTier } from '@/hooks/usePackageTiers';

interface PlanCard {
  systemKey: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
}

const plans: PlanCard[] = [
  { systemKey: 'business', label: 'BizPro', icon: <Briefcase className="h-5 w-5" />, gradient: 'from-primary to-violet' },
  { systemKey: 'legal', label: 'LawPro', icon: <Scale className="h-5 w-5" />, gradient: 'from-purple-500 to-purple-700' },
  { systemKey: 'gym', label: 'GymPro', icon: <Dumbbell className="h-5 w-5" />, gradient: 'from-lime-500 to-green-600' },
];

function PricingCard({ tier, plan, symbol, rate, loading, currency }: { tier: PackageTier; plan: PlanCard; symbol: string; rate: number; loading: boolean; currency: string }) {
  return (
    <div className="relative flex flex-col rounded-2xl border-2 bg-card p-6 sm:p-8 transition-all duration-300 border-border hover:border-primary/40 hover:shadow-elevated">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('p-2.5 rounded-xl bg-gradient-to-r text-white', plan.gradient)}>
          {plan.icon}
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">{plan.label}</h3>
          <p className="text-sm text-muted-foreground">{tier.description}</p>
        </div>
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
        {tier.features.filter(f => f.included).map((feature) => (
          <li key={feature.name} className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-foreground">{feature.name}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link to={`/auth?system=${plan.systemKey}`} className="flex-1">
          <Button
            variant="gradient"
            className="w-full rounded-xl h-12 font-semibold"
          >
            Start Free Trial
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
  const { symbol, rate, loading: geoLoading, currency } = useGeoPricing();
  const { tiers: bizTiers, isLoading: bizLoading } = usePackageTiers('business');
  const { tiers: lawTiers, isLoading: lawLoading } = usePackageTiers('legal');
  const { tiers: gymTiers, isLoading: gymLoading } = usePackageTiers('gym');

  const isLoading = bizLoading || lawLoading || gymLoading;
  const allTiers: { tier: PackageTier; plan: PlanCard }[] = [];
  if (bizTiers[0]) allTiers.push({ tier: bizTiers[0], plan: plans[0] });
  if (lawTiers[0]) allTiers.push({ tier: lawTiers[0], plan: plans[1] });
  if (gymTiers[0]) allTiers.push({ tier: gymTiers[0], plan: plans[2] });

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three plans. One price each. No surprises at the end of the month.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[500px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {allTiers.map(({ tier, plan }) => (
              <PricingCard key={tier.id} tier={tier} plan={plan} symbol={symbol} rate={rate} loading={geoLoading} currency={currency} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

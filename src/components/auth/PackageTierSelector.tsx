import { Check, Minus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { usePackageTiers, type PackageTier } from '@/hooks/usePackageTiers';

const SYSTEM_META: Record<string, { label: string; subtitle: string; gradient: string }> = {
  business: { label: 'BizPro', subtitle: 'For companies & professionals', gradient: 'from-primary to-violet' },
  workshop: { label: 'ShopPro', subtitle: 'For auto shops & service centres', gradient: 'from-coral to-warning' },
  school: { label: 'EduPro', subtitle: 'For private schools & academies', gradient: 'from-info to-cyan' },
  legal: { label: 'LawPro', subtitle: 'For law firms & practitioners', gradient: 'from-emerald-500 to-teal-500' },
  hire: { label: 'HirePro', subtitle: 'For equipment rental companies', gradient: 'from-amber-500 to-orange-500' },
  guesthouse: { label: 'StayPro', subtitle: 'For lodges & hospitality', gradient: 'from-rose-500 to-pink-500' },
  fleet: { label: 'FleetPro', subtitle: 'For vehicle fleets & logistics', gradient: 'from-slate-600 to-zinc-800' },
  gym: { label: 'GymPro', subtitle: 'For gyms & fitness centres', gradient: 'from-lime-500 to-green-600' },
};

interface PackageTierSelectorProps {
  systemType: string;
  onSelect: (tierName: string, moduleKeys: string[], tierId: string) => void;
  onBack: () => void;
  onCustomBuild: () => void;
}

export function PackageTierSelector({ systemType, onSelect, onBack, onCustomBuild }: PackageTierSelectorProps) {
  const { tiers, isLoading } = usePackageTiers(systemType);
  const meta = SYSTEM_META[systemType] || SYSTEM_META.business;

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Link to="/">
            <PlatformLogo className="h-12 w-auto" />
          </Link>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
          {meta.label}
        </h1>
        <p className="text-white/70 text-sm sm:text-base">
          Choose a package to start your 7-day free trial
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-2xl border-2 bg-card p-6 transition-all duration-300',
                tier.is_popular
                  ? 'border-primary shadow-glow-md scale-[1.02]'
                  : 'border-border hover:border-primary/40 hover:shadow-elevated'
              )}
            >
              {tier.is_popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="font-display text-3xl sm:text-4xl font-bold text-gradient">
                  {formatMaluti(tier.bundle_price)}
                </span>
                <span className="text-muted-foreground text-xs block mt-1">/month</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-2 text-xs">
                    {feature.included ? (
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                        <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                    )}
                    <span className={cn(feature.included ? 'text-foreground' : 'text-muted-foreground')}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.is_popular ? 'gradient' : 'outline'}
                className="w-full rounded-xl h-10 font-semibold"
                onClick={() => onSelect(tier.name, tier.module_keys, tier.id)}
              >
                Select {tier.name}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                7-day free trial · No credit card
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onCustomBuild}
          className="text-sm text-white hover:underline underline-offset-4 font-medium"
        >
          Or build your own custom package →
        </button>
      </div>
    </div>
  );
}

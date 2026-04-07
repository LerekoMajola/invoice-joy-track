import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { usePackageTiers, type PackageTier } from '@/hooks/usePackageTiers';

interface PackageTierSelectorProps {
  systemType: string;
  onSelect: (tierName: string, moduleKeys: string[], tierId: string) => void;
  onBack: () => void;
  onCustomBuild: () => void;
}

export function PackageTierSelector({ systemType, onSelect, onBack }: PackageTierSelectorProps) {
  const { tiers, isLoading } = usePackageTiers(systemType);
  const tier = tiers[0]; // Only one tier per system now

  const systemLabel = systemType === 'gym' ? 'GymPro' : 'BizPro';

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Link to="/">
            <PlatformLogo className="h-12 w-auto rounded-xl p-2 bg-white shadow-sm" />
          </Link>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
          {systemLabel}
        </h1>
        <p className="text-white/70 text-sm sm:text-base">
          Start your 7-day free trial
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : tier ? (
        <div className="relative flex flex-col rounded-2xl border-2 bg-card p-6 border-primary shadow-glow-md">
          <div className="text-center mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">{tier.display_name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
          </div>

          <div className="text-center mb-6">
            <span className="font-display text-3xl sm:text-4xl font-bold text-gradient">
              {formatMaluti(tier.bundle_price)}
            </span>
            <span className="text-muted-foreground text-xs block mt-1">/month</span>
          </div>

          <ul className="space-y-2 mb-6 flex-1">
            {tier.features.filter(f => f.included).map((feature) => (
              <li key={feature.name} className="flex items-center gap-2 text-xs">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>
                <span className="text-foreground">{feature.name}</span>
              </li>
            ))}
          </ul>

          <Button
            variant="gradient"
            className="w-full rounded-xl h-10 font-semibold"
            onClick={() => onSelect(tier.name, tier.module_keys, tier.id)}
          >
            Continue with {tier.display_name}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            7-day free trial · No credit card
          </p>
        </div>
      ) : (
        <p className="text-white/70 text-center">No package available.</p>
      )}

      <div className="flex flex-col items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-white/70 hover:text-white hover:underline underline-offset-4"
        >
          ← Back to system selection
        </button>
      </div>
    </div>
  );
}

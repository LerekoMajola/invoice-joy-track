import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, Lock, Package, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';

interface PlatformModule {
  id: string;
  name: string;
  key: string;
  description: string | null;
  monthly_price: number;
  icon: string;
  is_core: boolean;
  is_active: boolean;
  sort_order: number;
}

function getIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Package;
}

export function PricingTable() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['platform-modules-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      // Auto-select core modules
      const coreIds = (data as PlatformModule[]).filter(m => m.is_core).map(m => m.id);
      setSelectedIds(new Set(coreIds));
      return data as PlatformModule[];
    },
  });

  const toggleModule = (id: string, isCore: boolean) => {
    if (isCore) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const monthlyTotal = modules
    .filter(m => selectedIds.has(m.id))
    .reduce((sum, m) => sum + m.monthly_price, 0);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Build Your Package
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick the modules your business needs. Start with a 7-day free trial.
            No credit card required.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto mb-12">
              {modules.map((mod, index) => {
                const selected = selectedIds.has(mod.id);
                const IconComponent = getIcon(mod.icon);

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id, mod.is_core)}
                    className={cn(
                      'relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 animate-slide-up',
                      selected
                        ? 'border-primary bg-primary/5 shadow-glow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-elevated',
                      mod.is_core && 'cursor-default'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        {mod.is_core ? (
                          <Lock className="h-3 w-3 text-primary-foreground" />
                        ) : (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    )}

                    <div className={cn(
                      'p-3 rounded-xl transition-colors',
                      selected ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <IconComponent className={cn(
                        'h-6 w-6',
                        selected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-sm text-foreground">{mod.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {mod.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-bold text-foreground">
                        {formatMaluti(mod.monthly_price)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">/mo</span>
                    </div>

                    {mod.is_core && (
                      <Badge variant="secondary" className="text-[10px]">Always included</Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Total & CTA */}
            <div className="max-w-md mx-auto text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Your estimated monthly cost</p>
                <p className="font-display text-5xl font-bold text-gradient">
                  {formatMaluti(monthlyTotal)}
                </p>
                <p className="text-sm text-muted-foreground">/month after trial</p>
              </div>

              <Link to="/auth">
                <Button
                  variant="gradient"
                  className="w-full rounded-xl h-14 text-lg font-semibold shadow-glow-sm hover:shadow-glow-md transition-all"
                >
                  Start Free Trial
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground">
                7-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

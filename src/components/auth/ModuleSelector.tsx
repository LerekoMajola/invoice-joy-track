import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Lock, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

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

interface ModuleSelectorProps {
  onComplete: (selectedModuleIds: string[]) => void;
  loading?: boolean;
  systemType?: string;
}

function getIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Package;
}

export function ModuleSelector({ onComplete, loading, systemType }: ModuleSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['platform-modules-signup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      // Filter by system_type if provided
      const allModules = data as (PlatformModule & { system_type?: string })[];
      if (systemType) {
        return allModules.filter(
          (m) => !m.system_type || m.system_type === 'shared' || m.system_type === systemType
        );
      }
      return allModules;
    },
  });

  // Auto-select core modules
  useEffect(() => {
    const coreIds = modules.filter((m) => m.is_core).map((m) => m.id);
    if (coreIds.length > 0) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        coreIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [modules]);

  const toggleModule = (moduleId: string, isCore: boolean) => {
    if (isCore) return; // Can't deselect core
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const selectedModules = modules.filter((m) => selectedIds.has(m.id));
  const monthlyTotal = selectedModules.reduce((sum, m) => sum + m.monthly_price, 0);

  const handleComplete = () => {
    onComplete(Array.from(selectedIds));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8 animate-slide-up">
        <div className="flex justify-center mb-4">
          <PlatformLogo className="h-12 w-auto" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Build Your Package
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Select the modules you need. Start with a 7-day free trial.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {modules.map((mod) => {
          const selected = selectedIds.has(mod.id);
          const IconComponent = getIcon(mod.icon);

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => toggleModule(mod.id, mod.is_core)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                selected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50',
                mod.is_core && 'cursor-default'
              )}
            >
              {/* Selection indicator */}
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
                  'h-5 w-5',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>

              <div className="text-center w-full">
                <p className="font-semibold text-sm text-foreground">{mod.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {mod.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground">
                  {formatMaluti(mod.monthly_price)}
                </span>
                <span className="text-[10px] text-muted-foreground">/mo</span>
                {mod.is_core && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    Required
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border py-4 px-2 -mx-2 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatMaluti(monthlyTotal)}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={handleComplete}
            disabled={loading || selectedIds.size === 0}
            className="rounded-xl px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Start Free Trial'
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          7-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
}

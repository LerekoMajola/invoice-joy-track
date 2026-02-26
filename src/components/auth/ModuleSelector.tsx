import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Lock, Package, Shield } from 'lucide-react';
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
  onComplete: (selectedModuleIds: string[], isTrial: boolean) => void;
  loading?: boolean;
  systemType?: string;
}

const BASE_PACKAGE_KEYS = ['core_crm', 'quotes', 'invoices', 'delivery_notes'];
const BASE_PRICE = 350;

function getIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Package;
}

const SYSTEM_ALLOWED_SHARED_KEYS: Record<string, string[]> = {
  legal:    ['core_crm', 'invoices', 'tasks', 'accounting', 'staff'],
  business: [
    'core_crm', 'quotes', 'invoices', 'delivery_notes', 'profitability', 'tasks', 'accounting', 'staff', 'fleet', 'tenders',
    'workshop', 'hire_equipment', 'hire_orders', 'hire_calendar', 'hire_returns',
    'school_admin', 'students', 'school_fees',
    'gh_rooms', 'gh_bookings', 'gh_housekeeping', 'gh_reviews',
  ],
  gym:      ['core_crm', 'invoices', 'tasks', 'accounting', 'staff'],
  school:   ['invoices', 'tasks', 'accounting', 'staff'],
};

export function ModuleSelector({ onComplete, loading, systemType }: ModuleSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['platform-modules-signup', systemType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      const allModules = data as (PlatformModule & { system_type?: string })[];
      if (systemType) {
        const allowedSharedKeys = SYSTEM_ALLOWED_SHARED_KEYS[systemType] || [];
        return allModules.filter((m) => {
          if (!m.system_type || m.system_type === 'shared') {
            return allowedSharedKeys.includes(m.key);
          }
          return m.system_type === systemType;
        });
      }
      return allModules;
    },
  });

  const baseModules = modules.filter((m) => BASE_PACKAGE_KEYS.includes(m.key));
  const addonModules = modules.filter((m) => !BASE_PACKAGE_KEYS.includes(m.key));

  // Auto-select base package modules
  useEffect(() => {
    const baseIds = baseModules.map((m) => m.id);
    if (baseIds.length > 0) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        baseIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [modules]);

  const toggleModule = (moduleId: string) => {
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

  const selectedAddons = addonModules.filter((m) => selectedIds.has(m.id));
  const addonsTotal = selectedAddons.reduce((sum, m) => sum + m.monthly_price, 0);
  const monthlyTotal = BASE_PRICE + addonsTotal;

  const handleComplete = (isTrial: boolean) => {
    onComplete(Array.from(selectedIds), isTrial);
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
          <PlatformLogo className="h-12 w-auto rounded-xl p-2 bg-white shadow-sm" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Build Your Package
        </h1>
        <p className="text-white/70 mt-2 text-sm sm:text-base">
          Start with the base package, then add what you need. 7-day free trial.
        </p>
      </div>

      {/* Base Package Card */}
      <div className="mb-6 rounded-xl border-2 border-primary bg-card shadow-lg p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">BizPro Base</h2>
              <p className="text-xs text-muted-foreground">Everything you need to get started</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{formatMaluti(BASE_PRICE)}</span>
            <span className="text-xs text-muted-foreground">/mo</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {baseModules.map((mod) => {
            const IconComponent = getIcon(mod.icon);
            return (
              <div key={mod.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <IconComponent className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">{mod.name}</span>
                <Check className="h-3 w-3 text-primary ml-auto shrink-0" />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Included in every package</span>
        </div>
      </div>

      {/* Add-ons Section */}
      {addonModules.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-white/80 mb-3 px-1">Add-on Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {addonModules.map((mod) => {
              const selected = selectedIds.has(mod.id);
              const IconComponent = getIcon(mod.icon);

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    selected
                      ? 'border-primary bg-card shadow-md'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
                  )}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
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
                      +{formatMaluti(mod.monthly_price)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/mo</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Summary bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border py-4 px-2 -mx-2 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Base {formatMaluti(BASE_PRICE)}
              {selectedAddons.length > 0 && ` + ${selectedAddons.length} add-on${selectedAddons.length !== 1 ? 's' : ''}`}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatMaluti(monthlyTotal)}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => handleComplete(true)}
              disabled={loading || selectedIds.size === 0}
              className="rounded-xl px-6"
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
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleComplete(false)}
              disabled={loading || selectedIds.size === 0}
              className="rounded-xl px-6"
            >
              Subscribe
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          7-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UsageMeter } from '@/components/subscription/UsageMeter';
import { useSubscription } from '@/hooks/useSubscription';
import { useModules } from '@/hooks/useModules';
import { Clock, AlertTriangle, Package, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';

function getIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Package;
}

export default function Billing() {
  const { isTrialing, isTrialExpired, trialDaysRemaining } = useSubscription();
  const { platformModules, userModules, isLoading, getMonthlyTotal, toggleModule } = useModules();

  // Build a set of active module IDs for the user
  const activeModuleIds = new Set(
    userModules.filter(um => um.is_active).map(um => um.module_id)
  );

  return (
    <DashboardLayout>
      <Header 
        title="Billing & Subscription" 
        subtitle="Manage your modules and payment details" 
      />
      
      <div className="p-4 md:p-6 space-y-6 pb-safe">
        {/* Trial Warning */}
        {isTrialing && (
          <Card className={cn(
            "border-2",
            isTrialExpired ? "border-destructive bg-destructive/5" : "border-warning bg-warning/5"
          )}>
            <CardContent className="flex items-center gap-4 p-4">
              {isTrialExpired ? (
                <AlertTriangle className="h-6 w-6 text-destructive" />
              ) : (
                <Clock className="h-6 w-6 text-warning" />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {isTrialExpired 
                    ? 'Your free trial has expired' 
                    : `Your free trial ends in ${trialDaysRemaining} days`
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {isTrialExpired 
                    ? 'Contact us to activate your subscription.' 
                    : 'Enjoy full access to all your selected modules during the trial.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Usage */}
        <UsageMeter />

        {/* Active Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Your Modules
            </h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Monthly total</p>
              <p className="text-2xl font-bold text-foreground">
                {formatMaluti(getMonthlyTotal())}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platformModules.map((mod) => {
                const isActive = activeModuleIds.has(mod.id);
                const IconComponent = getIcon(mod.icon);

                return (
                  <Card
                    key={mod.id}
                    className={cn(
                      'transition-all',
                      isActive ? 'border-primary/30 bg-primary/5' : 'opacity-60'
                    )}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn(
                          'p-2.5 rounded-xl',
                          isActive ? 'bg-primary/10' : 'bg-muted'
                        )}>
                          <IconComponent className={cn(
                            'h-5 w-5',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{mod.name}</p>
                            {mod.is_core && (
                              <Badge variant="secondary" className="text-[9px] px-1.5">Required</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatMaluti(mod.monthly_price)}/mo
                          </p>
                        </div>
                      </div>

                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => {
                          toggleModule.mutate({ moduleId: mod.id, activate: checked });
                        }}
                        disabled={mod.is_core || toggleModule.isPending}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              We accept M-Pesa, bank transfers, and mobile money payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To activate your subscription, please contact us at{' '}
              <a href="mailto:support@orionlabs.com" className="text-primary hover:underline">
                support@orionlabs.com
              </a>
              {' '}or call us to arrange payment.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

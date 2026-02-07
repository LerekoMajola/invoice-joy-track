import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UsageMeter } from '@/components/subscription/UsageMeter';
import { useSubscription } from '@/hooks/useSubscription';
import { useModules } from '@/hooks/useModules';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import {
  Clock, AlertTriangle, Package, Loader2, Smartphone, Building2,
  CheckCircle2, ChevronDown, Copy
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { toast } from 'sonner';

const ADMIN_USER_ID = '89710bb3-dff7-4e5e-9af0-7ef7f3ad105d';

function getIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Package;
}

export default function Billing() {
  const { user } = useAuth();
  const { isTrialing, isTrialExpired, trialDaysRemaining, isActive, paymentReference, subscription, systemType } = useSubscription();
  const { platformModules, userModules, isLoading, getMonthlyTotal, toggleModule, getModulesForSystem } = useModules();
  
  // Only show modules relevant to user's system type
  const filteredModules = getModulesForSystem(systemType);
  const { profile: companyProfile } = useCompanyProfile();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const monthlyTotal = getMonthlyTotal();
  const companyName = companyProfile?.company_name || 'your company';

  // Build a set of active module IDs for the user
  const activeModuleIds = new Set(
    userModules.filter(um => um.is_active).map(um => um.module_id)
  );

  const copyReference = () => {
    navigator.clipboard.writeText(paymentReference);
    toast.success('Reference copied');
  };

  const handlePaymentNotification = async () => {
    if (!user) return;
    setSending(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: ADMIN_USER_ID,
        type: 'payment',
        title: 'Payment Notification',
        message: `${companyName} says they've made payment of ${formatMaluti(monthlyTotal)}. Reference: ${paymentReference}`,
        reference_id: user.id,
        reference_type: 'subscription',
        link: '/admin',
      });

      if (error) throw error;
      setSent(true);
      toast.success('Payment notification sent! We will verify and activate your account.');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Subscription status badge
  const statusBadge = () => {
    if (isActive) return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    if (isTrialExpired) return <Badge variant="destructive">Trial Expired</Badge>;
    if (isTrialing) return <Badge className="bg-warning/10 text-warning border-warning/20">Trial</Badge>;
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <DashboardLayout>
      <Header 
        title="Billing & Subscription" 
        subtitle="Manage your modules and payment details" 
      />
      
      <div className="p-4 md:p-6 space-y-6 pb-safe">
        {/* Subscription Status */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Subscription status</p>
              <div className="flex items-center gap-2 mt-1">
                {statusBadge()}
                {isTrialing && !isTrialExpired && (
                  <span className="text-sm text-muted-foreground">
                    {trialDaysRemaining} days remaining
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Monthly total</p>
              <p className="text-2xl font-bold text-foreground">{formatMaluti(monthlyTotal)}</p>
            </div>
          </CardContent>
        </Card>

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
                    ? 'Make a payment below to continue using the platform.' 
                    : 'Enjoy full access to all your selected modules during the trial.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Usage */}
        <UsageMeter />

        {/* Payment Section */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Make a Payment
          </h2>

          {/* Payment Reference */}
          <Card className="mb-3">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Your payment reference</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-bold text-foreground tracking-wider">
                  {paymentReference}
                </span>
                <Button variant="ghost" size="sm" onClick={copyReference}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Always include this reference when making payment
              </p>
            </CardContent>
          </Card>

          {/* M-Pesa */}
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="h-5 w-5 text-success" />
                Pay via M-Pesa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</Badge>
                  <span>Dial <strong className="text-foreground">*111#</strong> on your phone</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</Badge>
                  <span>Select <strong className="text-foreground">Pay Bill</strong></span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</Badge>
                  <span>Enter business number: <strong className="text-foreground">123456</strong></span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</Badge>
                  <span>Enter reference: <strong className="text-foreground">{paymentReference}</strong></span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</Badge>
                  <span>Enter amount: <strong className="text-foreground">{formatMaluti(monthlyTotal)}</strong></span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">6</Badge>
                  <span>Enter your PIN and confirm</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Collapsible open={bankOpen} onOpenChange={setBankOpen}>
            <Card className="mb-3">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-info" />
                      Pay via Bank Transfer
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-y-2 text-muted-foreground">
                    <span>Bank</span>
                    <span className="text-foreground font-medium">FNB Lesotho</span>
                    <span>Account Name</span>
                    <span className="text-foreground font-medium">Orion Labs (Pty) Ltd</span>
                    <span>Account Number</span>
                    <span className="text-foreground font-medium">62012345678</span>
                    <span>Branch Code</span>
                    <span className="text-foreground font-medium">260001</span>
                    <span>Reference</span>
                    <span className="text-foreground font-medium font-mono">{paymentReference}</span>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* I've Made Payment */}
          {sent ? (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Payment notification sent</p>
                  <p className="text-xs text-muted-foreground">
                    We'll verify your payment and activate your account shortly.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={handlePaymentNotification}
              disabled={sending}
              className="w-full h-12 text-base"
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "I've Made Payment"
              )}
            </Button>
          )}
        </div>

        {/* Active Modules */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Your Modules
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredModules.map((mod) => {
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
      </div>
    </DashboardLayout>
  );
}
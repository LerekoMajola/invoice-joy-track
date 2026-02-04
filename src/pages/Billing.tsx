import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsageMeter } from '@/components/subscription/UsageMeter';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const plans = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: 'M300',
    period: '/month',
    description: 'Perfect for small businesses.',
    features: ['50 clients', '100 quotes/month', '50 invoices/month', 'Email support'],
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: 'M500',
    period: '/month',
    description: 'For growing businesses.',
    features: ['200 clients', 'Unlimited quotes', 'Unlimited invoices', 'Priority support'],
    popular: true,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'M800',
    period: '/month',
    description: 'For established businesses.',
    features: ['Unlimited clients', 'Unlimited quotes', 'Unlimited invoices', 'Dedicated support'],
  },
];

export default function Billing() {
  const { subscription, currentPlan, isTrialing, isTrialExpired, trialDaysRemaining } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    toast.info('Payment integration coming soon! Contact us to upgrade your plan.');
  };

  return (
    <DashboardLayout>
      <Header 
        title="Billing & Subscription" 
        subtitle="Manage your subscription plan and payment details" 
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
                    ? 'Upgrade to a paid plan to continue using all features.' 
                    : 'Upgrade now to ensure uninterrupted access to all features.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Usage */}
        <UsageMeter />

        {/* Plans */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={cn(
                  "relative transition-all",
                  plan.popular && "border-primary shadow-lg",
                  currentPlan === plan.id && "ring-2 ring-primary"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {currentPlan === plan.id && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={currentPlan === plan.id ? "outline" : "default"}
                    disabled={currentPlan === plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {currentPlan === plan.id ? (
                      'Current Plan'
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
              To upgrade your plan, please contact us at{' '}
              <a href="mailto:support@leekay.com" className="text-primary hover:underline">
                support@leekay.com
              </a>
              {' '}or call us to arrange payment.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

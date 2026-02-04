import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Basic',
    price: 'M300',
    period: '/month',
    description: 'Perfect for small businesses just getting started.',
    features: [
      'Up to 50 clients',
      '100 quotes per month',
      '50 invoices per month',
      'Delivery notes',
      'Basic profitability tracking',
      'Email support'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Standard',
    price: 'M500',
    period: '/month',
    description: 'For growing businesses that need more capacity.',
    features: [
      'Up to 200 clients',
      'Unlimited quotes',
      'Unlimited invoices',
      'Delivery notes',
      'Advanced profitability tracking',
      'Task management',
      'Tender tracking',
      'Priority support'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Pro',
    price: 'M800',
    period: '/month',
    description: 'For established businesses with high volume needs.',
    features: [
      'Unlimited clients',
      'Unlimited quotes',
      'Unlimited invoices',
      'Delivery notes',
      'Full profitability analytics',
      'Task management',
      'Tender tracking',
      'Custom document templates',
      'Priority phone support',
      'Dedicated account manager'
    ],
    cta: 'Start Free Trial',
    popular: false
  }
];

export function PricingTable() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Start with a 7-day free trial. No credit card required. 
            Choose the plan that fits your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1",
                plan.popular 
                  ? "border-primary shadow-elevated ring-1 ring-primary/20" 
                  : "border-border shadow-card hover:shadow-elevated"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="rounded-full bg-accent/10 p-0.5 mt-0.5 flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button 
                  className={cn(
                    "w-full",
                    plan.popular 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

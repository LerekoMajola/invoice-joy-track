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
    popular: false,
    gradient: 'from-muted to-secondary',
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
    popular: true,
    gradient: 'from-primary to-violet',
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
    popular: false,
    gradient: 'from-success to-accent',
  }
];

export function PricingTable() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 7-day free trial. No credit card required. 
            Choose the plan that fits your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-card p-8 transition-all duration-300 hover:-translate-y-2 animate-slide-up",
                plan.popular 
                  ? "border-primary shadow-glow-md scale-105 z-10" 
                  : "border-border hover:shadow-elevated"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-violet text-white text-sm font-semibold px-5 py-1.5 rounded-full shadow-glow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={cn(
                    "font-display text-5xl font-bold",
                    plan.popular ? "text-gradient" : "text-foreground"
                  )}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={feature} 
                    className="flex items-start gap-3 animate-slide-up"
                    style={{ animationDelay: `${(index * 100) + (featureIndex * 30)}ms` }}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                      plan.popular ? "bg-gradient-to-br from-success to-accent text-white" : "bg-success/10 text-success"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button 
                  className={cn(
                    "w-full rounded-xl h-12 text-base font-semibold transition-all duration-300",
                    plan.popular 
                      ? "bg-gradient-to-r from-primary to-violet hover:opacity-90 text-white shadow-glow-sm hover:shadow-glow-md" 
                      : "bg-secondary text-foreground hover:bg-secondary/80 hover:shadow-elevated"
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

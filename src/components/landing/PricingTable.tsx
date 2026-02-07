import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';

interface PackageTier {
  name: string;
  price: number;
  target: string;
  popular?: boolean;
  features: { name: string; included: boolean }[];
}

interface SystemPackages {
  system: string;
  label: string;
  tiers: PackageTier[];
}

const packages: SystemPackages[] = [
  {
    system: 'business',
    label: 'Business',
    tiers: [
      {
        name: 'Starter',
        price: 350,
        target: 'Growing service companies',
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'Quotes', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Delivery Notes', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Tender Tracking', included: false },
          { name: 'Accounting', included: false },
          { name: 'Staff & HR', included: false },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Professional',
        price: 520,
        target: 'Established contractors',
        popular: true,
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'Quotes', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Delivery Notes', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Tender Tracking', included: true },
          { name: 'Accounting', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Enterprise',
        price: 680,
        target: 'Large operations & teams',
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'Quotes', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Delivery Notes', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Tender Tracking', included: true },
          { name: 'Accounting', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Fleet Management', included: true },
        ],
      },
    ],
  },
  {
    system: 'workshop',
    label: 'Workshop',
    tiers: [
      {
        name: 'Starter',
        price: 450,
        target: 'Small repair shops',
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'Workshop (Job Cards)', included: true },
          { name: 'Quotes', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Delivery Notes', included: true },
          { name: 'Staff & HR', included: false },
          { name: 'Profitability Tracking', included: false },
          { name: 'Accounting', included: false },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Professional',
        price: 650,
        target: 'Busy workshops',
        popular: true,
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'Workshop (Job Cards)', included: true },
          { name: 'Quotes', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Delivery Notes', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Accounting', included: true },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Enterprise',
        price: 850,
        target: 'Multi-bay service centres',
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'Workshop (Job Cards)', included: true },
          { name: 'Quotes', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Delivery Notes', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Accounting', included: true },
          { name: 'Fleet Management', included: true },
        ],
      },
    ],
  },
  {
    system: 'school',
    label: 'School',
    tiers: [
      {
        name: 'Starter',
        price: 720,
        target: 'Small private schools',
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'School Admin', included: true },
          { name: 'Student Management', included: true },
          { name: 'School Fees', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: false },
          { name: 'Profitability Tracking', included: false },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Professional',
        price: 950,
        target: 'Mid-size academies',
        popular: true,
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'School Admin', included: true },
          { name: 'Student Management', included: true },
          { name: 'School Fees', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Enterprise',
        price: 1200,
        target: 'Large schools & campuses',
        features: [
          { name: 'Core CRM & Clients', included: true },
          { name: 'School Admin', included: true },
          { name: 'Student Management', included: true },
          { name: 'School Fees', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: true },
          { name: 'Profitability Tracking', included: true },
          { name: 'Fleet Management', included: true },
        ],
      },
    ],
  },
];

function PricingCard({ tier }: { tier: PackageTier }) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 bg-card p-6 sm:p-8 transition-all duration-300',
        tier.popular
          ? 'border-primary shadow-glow-md scale-[1.02]'
          : 'border-border hover:border-primary/40 hover:shadow-elevated'
      )}
    >
      {tier.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
          Most Popular
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{tier.target}</p>
      </div>

      <div className="text-center mb-8">
        <span className="font-display text-4xl sm:text-5xl font-bold text-gradient">
          {formatMaluti(tier.price)}
        </span>
        <span className="text-muted-foreground text-sm block mt-1">/month</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature.name} className="flex items-center gap-3 text-sm">
            {feature.included ? (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className={cn(feature.included ? 'text-foreground' : 'text-muted-foreground')}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Link to="/auth">
        <Button
          variant={tier.popular ? 'gradient' : 'outline'}
          className="w-full rounded-xl h-12 font-semibold"
        >
          Start Free Trial
        </Button>
      </Link>
      <p className="text-xs text-muted-foreground text-center mt-3">
        7-day free trial · No credit card required
      </p>
    </div>
  );
}

export function PricingTable() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the package that fits your industry. Start with a 7-day free trial — no credit card required.
          </p>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mx-auto mb-12 flex w-fit gap-1 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="business" className="rounded-lg px-6 py-2.5 text-sm font-medium">
              Business
            </TabsTrigger>
            <TabsTrigger value="workshop" className="rounded-lg px-6 py-2.5 text-sm font-medium">
              Workshop
            </TabsTrigger>
            <TabsTrigger value="school" className="rounded-lg px-6 py-2.5 text-sm font-medium">
              School
            </TabsTrigger>
          </TabsList>

          {packages.map((systemPkg) => (
            <TabsContent key={systemPkg.system} value={systemPkg.system}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {systemPkg.tiers.map((tier) => (
                  <PricingCard key={tier.name} tier={tier} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <Link to="/auth" className="text-sm text-primary hover:underline underline-offset-4 font-medium">
            Or build your own custom package →
          </Link>
        </div>
      </div>
    </section>
  );
}

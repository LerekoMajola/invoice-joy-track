import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Minus, Briefcase, Wrench, GraduationCap, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';

interface PackageTier {
  name: string;
  price: number;
  target: string;
  popular?: boolean;
  features: { name: string; included: boolean }[];
}

interface SystemTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  subtitle: string;
  tiers: PackageTier[];
}

const systems: SystemTab[] = [
  {
    key: 'business',
    label: 'Business',
    icon: <Briefcase className="h-4 w-4" />,
    gradient: 'from-primary to-violet',
    subtitle: 'For companies & professionals',
    tiers: [
      {
        name: 'Starter', price: 350, target: 'Freelancers & sole traders',
        features: [
          { name: 'Quotes & Estimates', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'CRM & Leads', included: false },
          { name: 'Accounting', included: false },
          { name: 'Tenders', included: false },
          { name: 'Delivery Notes', included: false },
        ],
      },
      {
        name: 'Professional', price: 550, target: 'Growing businesses', popular: true,
        features: [
          { name: 'Quotes & Estimates', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'CRM & Leads', included: true },
          { name: 'Accounting', included: true },
          { name: 'Tenders', included: false },
          { name: 'Delivery Notes', included: false },
        ],
      },
      {
        name: 'Enterprise', price: 800, target: 'Established companies',
        features: [
          { name: 'Quotes & Estimates', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'CRM & Leads', included: true },
          { name: 'Accounting', included: true },
          { name: 'Tenders', included: true },
          { name: 'Delivery Notes', included: true },
        ],
      },
    ],
  },
  {
    key: 'workshop',
    label: 'Workshop',
    icon: <Wrench className="h-4 w-4" />,
    gradient: 'from-coral to-warning',
    subtitle: 'For auto shops & service centres',
    tiers: [
      {
        name: 'Starter', price: 450, target: 'Small repair shops',
        features: [
          { name: 'Workshop & Job Cards', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: false },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Professional', price: 650, target: 'Mid-size workshops', popular: true,
        features: [
          { name: 'Workshop & Job Cards', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: true },
          { name: 'Fleet Management', included: false },
        ],
      },
      {
        name: 'Enterprise', price: 900, target: 'Large service centres',
        features: [
          { name: 'Workshop & Job Cards', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: true },
          { name: 'Fleet Management', included: true },
        ],
      },
    ],
  },
  {
    key: 'school',
    label: 'School',
    icon: <GraduationCap className="h-4 w-4" />,
    gradient: 'from-info to-cyan',
    subtitle: 'For private schools & academies',
    tiers: [
      {
        name: 'Starter', price: 720, target: 'Small private schools',
        features: [
          { name: 'School Admin', included: true },
          { name: 'Student Management', included: true },
          { name: 'School Fees', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: false },
        ],
      },
      {
        name: 'Professional', price: 950, target: 'Mid-size academies', popular: true,
        features: [
          { name: 'School Admin', included: true },
          { name: 'Student Management', included: true },
          { name: 'School Fees', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: true },
        ],
      },
      {
        name: 'Enterprise', price: 1200, target: 'Large schools & campuses',
        features: [
          { name: 'School Admin', included: true },
          { name: 'Student Management', included: true },
          { name: 'School Fees', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Accounting', included: true },
        ],
      },
    ],
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: <Scale className="h-4 w-4" />,
    gradient: 'from-emerald-500 to-teal-500',
    subtitle: 'For law firms & practitioners',
    tiers: [
      {
        name: 'Starter', price: 500, target: 'Solo practitioners',
        features: [
          { name: 'Cases & Matters', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Billing & Time Tracking', included: false },
          { name: 'Accounting', included: false },
          { name: 'Document Management', included: false },
          { name: 'Court Calendar', included: false },
        ],
      },
      {
        name: 'Professional', price: 700, target: 'Growing law firms', popular: true,
        features: [
          { name: 'Cases & Matters', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Billing & Time Tracking', included: true },
          { name: 'Accounting', included: true },
          { name: 'Document Management', included: true },
          { name: 'Court Calendar', included: false },
        ],
      },
      {
        name: 'Enterprise', price: 950, target: 'Established firms',
        features: [
          { name: 'Cases & Matters', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Billing & Time Tracking', included: true },
          { name: 'Accounting', included: true },
          { name: 'Document Management', included: true },
          { name: 'Court Calendar', included: true },
        ],
      },
    ],
  },
];

function PricingCard({ tier, systemKey }: { tier: PackageTier; systemKey: string }) {
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

      <Link to={`/auth?system=${systemKey}`}>
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
  const [activeSystem, setActiveSystem] = useState('business');
  const current = systems.find((s) => s.key === activeSystem)!;

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the package that fits your needs. Start with a 7-day free trial — no credit card required.
          </p>
        </div>

        {/* System tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1.5">
            {systems.map((sys) => (
              <button
                key={sys.key}
                onClick={() => setActiveSystem(sys.key)}
                className={cn(
                  'flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  activeSystem === sys.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {sys.icon}
                <span className="hidden sm:inline">{sys.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-10">
          <h3 className={cn(
            'font-display text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2',
            current.gradient
          )}>
            {current.label}
          </h3>
          <p className="text-muted-foreground">{current.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {current.tiers.map((tier) => (
            <PricingCard key={`${current.key}-${tier.name}`} tier={tier} systemKey={current.key} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/auth" className="text-sm text-primary hover:underline underline-offset-4 font-medium">
            Or build your own custom package →
          </Link>
        </div>
      </div>
    </section>
  );
}

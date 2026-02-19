import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Minus, Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeoPricing, formatGeoPrice } from '@/hooks/useGeoPricing';
import { Skeleton } from '@/components/ui/skeleton';

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
    label: 'BizPro',
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
    label: 'ShopPro',
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
    label: 'EduPro',
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
    label: 'LawPro',
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
  {
    key: 'hire',
    label: 'HirePro',
    icon: <Hammer className="h-4 w-4" />,
    gradient: 'from-amber-500 to-orange-500',
    subtitle: 'For equipment rental companies',
    tiers: [
      {
        name: 'Starter', price: 400, target: 'Small rental shops',
        features: [
          { name: 'Equipment Catalogue', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Hire Orders', included: false },
          { name: 'Accounting', included: false },
          { name: 'Availability Calendar', included: false },
          { name: 'Returns & Tracking', included: false },
        ],
      },
      {
        name: 'Professional', price: 600, target: 'Growing rental businesses', popular: true,
        features: [
          { name: 'Equipment Catalogue', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Hire Orders', included: true },
          { name: 'Accounting', included: true },
          { name: 'Availability Calendar', included: false },
          { name: 'Returns & Tracking', included: false },
        ],
      },
      {
        name: 'Enterprise', price: 850, target: 'Large hire companies',
        features: [
          { name: 'Equipment Catalogue', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Hire Orders', included: true },
          { name: 'Accounting', included: true },
          { name: 'Availability Calendar', included: true },
          { name: 'Returns & Tracking', included: true },
        ],
      },
    ],
  },
  {
    key: 'guesthouse',
    label: 'StayPro',
    icon: <Hotel className="h-4 w-4" />,
    gradient: 'from-rose-500 to-pink-500',
    subtitle: 'For guest houses & lodges',
    tiers: [
      {
        name: 'Starter', price: 650, target: 'Small guest houses',
        features: [
          { name: 'Room Management', included: true },
          { name: 'Bookings', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Housekeeping', included: false },
          { name: 'Accounting', included: false },
          { name: 'Guest Reviews', included: false },
        ],
      },
      {
        name: 'Professional', price: 850, target: 'Growing lodges', popular: true,
        features: [
          { name: 'Room Management', included: true },
          { name: 'Bookings', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Housekeeping', included: true },
          { name: 'Accounting', included: true },
          { name: 'Guest Reviews', included: false },
        ],
      },
      {
        name: 'Enterprise', price: 1100, target: 'Large hospitality businesses',
        features: [
          { name: 'Room Management', included: true },
          { name: 'Bookings', included: true },
          { name: 'Invoices', included: true },
          { name: 'Task Management', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Housekeeping', included: true },
          { name: 'Accounting', included: true },
          { name: 'Guest Reviews', included: true },
        ],
      },
    ],
  },
  {
    key: 'fleet',
    label: 'FleetPro',
    icon: <Truck className="h-4 w-4" />,
    gradient: 'from-slate-600 to-zinc-800',
    subtitle: 'For vehicle fleets & logistics',
    tiers: [
      {
        name: 'Starter', price: 500, target: 'Small fleets (up to 15 vehicles)',
        features: [
          { name: 'Fleet Overview & Dashboard', included: true },
          { name: 'Vehicle Registry', included: true },
          { name: 'Service History & Logging', included: true },
          { name: 'Fuel Cost Entry', included: true },
          { name: 'Invoices', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Maintenance Scheduling', included: false },
          { name: 'Cost Intelligence', included: false },
          { name: 'Tyre Management', included: false },
          { name: 'Driver Risk Scoring', included: false },
        ],
      },
      {
        name: 'Professional', price: 700, target: 'Growing fleets', popular: true,
        features: [
          { name: 'Fleet Overview & Dashboard', included: true },
          { name: 'Vehicle Registry', included: true },
          { name: 'Service History & Logging', included: true },
          { name: 'Fuel Cost Entry', included: true },
          { name: 'Invoices', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Maintenance Scheduling', included: true },
          { name: 'Cost Intelligence', included: true },
          { name: 'Tyre Management', included: false },
          { name: 'Driver Risk Scoring', included: false },
        ],
      },
      {
        name: 'Enterprise', price: 950, target: 'Large fleets (50+ vehicles)',
        features: [
          { name: 'Fleet Overview & Dashboard', included: true },
          { name: 'Vehicle Registry', included: true },
          { name: 'Service History & Logging', included: true },
          { name: 'Fuel Cost Entry', included: true },
          { name: 'Invoices', included: true },
          { name: 'Staff & HR', included: true },
          { name: 'Maintenance Scheduling', included: true },
          { name: 'Cost Intelligence', included: true },
          { name: 'Tyre Management', included: true },
          { name: 'Driver Risk Scoring', included: true },
        ],
      },
    ],
  },
];

function PricingCard({ tier, systemKey, symbol, rate, loading, currency }: { tier: PackageTier; systemKey: string; symbol: string; rate: number; loading: boolean; currency: string }) {
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
        {loading ? (
          <Skeleton className="h-12 w-32 mx-auto mb-1" />
        ) : (
          <span className="font-display text-4xl sm:text-5xl font-bold text-gradient">
            {formatGeoPrice(tier.price, symbol, rate)}
          </span>
        )}
        <span className="text-muted-foreground text-sm block mt-1">/month</span>
        {!loading && currency !== 'LSL' && (
          <span className="text-xs text-muted-foreground">Prices shown in {currency}</span>
        )}
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
  const { symbol, rate, loading, currency } = useGeoPricing();

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
        <div className="flex justify-center mb-10 overflow-x-auto scrollbar-hide px-2">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1.5 min-w-0">
            {systems.map((sys) => (
              <button
                key={sys.key}
                onClick={() => setActiveSystem(sys.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  activeSystem === sys.key
                    ? `bg-gradient-to-r ${sys.gradient} text-white shadow-md`
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {sys.icon}
                <span>{sys.label}</span>
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
            <PricingCard key={`${current.key}-${tier.name}`} tier={tier} systemKey={current.key} symbol={symbol} rate={rate} loading={loading} currency={currency} />
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

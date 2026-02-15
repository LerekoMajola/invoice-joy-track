import { ArrowLeft, Check, Minus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

interface PackageTier {
  name: string;
  price: number;
  target: string;
  popular?: boolean;
  moduleKeys: string[];
  features: { name: string; included: boolean }[];
}

const businessTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 350,
    target: 'Freelancers & sole traders',
    moduleKeys: ['quotes', 'invoices', 'tasks', 'staff'],
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
    name: 'Professional',
    price: 550,
    target: 'Growing businesses',
    popular: true,
    moduleKeys: ['quotes', 'invoices', 'crm', 'tasks', 'staff', 'accounting'],
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
    name: 'Enterprise',
    price: 800,
    target: 'Established companies',
    moduleKeys: ['quotes', 'invoices', 'crm', 'tasks', 'staff', 'accounting', 'tenders', 'delivery_notes'],
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
];

const workshopTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 450,
    target: 'Small repair shops',
    moduleKeys: ['workshop', 'invoices', 'tasks', 'staff'],
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
    name: 'Professional',
    price: 650,
    target: 'Mid-size workshops',
    popular: true,
    moduleKeys: ['workshop', 'invoices', 'tasks', 'staff', 'accounting'],
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
    name: 'Enterprise',
    price: 900,
    target: 'Large service centres',
    moduleKeys: ['workshop', 'invoices', 'tasks', 'staff', 'accounting', 'fleet'],
    features: [
      { name: 'Workshop & Job Cards', included: true },
      { name: 'Invoices', included: true },
      { name: 'Task Management', included: true },
      { name: 'Staff & HR', included: true },
      { name: 'Accounting', included: true },
      { name: 'Fleet Management', included: true },
    ],
  },
];

const schoolTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 720,
    target: 'Small private schools',
    moduleKeys: ['school_admin', 'students', 'school_fees', 'invoices', 'tasks', 'staff'],
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
    name: 'Professional',
    price: 950,
    target: 'Mid-size academies',
    popular: true,
    moduleKeys: ['school_admin', 'students', 'school_fees', 'invoices', 'tasks', 'staff', 'accounting'],
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
    name: 'Enterprise',
    price: 1200,
    target: 'Large schools & campuses',
    moduleKeys: ['school_admin', 'students', 'school_fees', 'invoices', 'tasks', 'staff', 'accounting'],
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
];

const legalTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 500,
    target: 'Solo practitioners',
    moduleKeys: ['legal_cases', 'invoices', 'tasks', 'staff'],
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
    name: 'Professional',
    price: 700,
    target: 'Growing law firms',
    popular: true,
    moduleKeys: ['legal_cases', 'legal_billing', 'legal_documents', 'invoices', 'tasks', 'staff', 'accounting'],
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
    name: 'Enterprise',
    price: 950,
    target: 'Established firms',
    moduleKeys: ['legal_cases', 'legal_billing', 'legal_documents', 'legal_calendar', 'invoices', 'tasks', 'staff', 'accounting', 'core_crm'],
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
];

const hireTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 400,
    target: 'Small rental shops',
    moduleKeys: ['hire_equipment', 'invoices', 'tasks', 'staff'],
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
    name: 'Professional',
    price: 600,
    target: 'Growing rental businesses',
    popular: true,
    moduleKeys: ['hire_equipment', 'hire_orders', 'invoices', 'tasks', 'staff', 'accounting'],
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
    name: 'Enterprise',
    price: 850,
    target: 'Large hire companies',
    moduleKeys: ['hire_equipment', 'hire_orders', 'hire_calendar', 'hire_returns', 'invoices', 'tasks', 'staff', 'accounting', 'core_crm'],
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
];

const guesthouseTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 650,
    target: 'Small guest houses',
    moduleKeys: ['gh_rooms', 'gh_bookings', 'invoices', 'tasks', 'staff'],
    features: [
      { name: 'Room Management', included: true },
      { name: 'Bookings & Calendar', included: true },
      { name: 'Invoices', included: true },
      { name: 'Task Management', included: true },
      { name: 'Staff & HR', included: true },
      { name: 'Housekeeping', included: false },
      { name: 'Accounting', included: false },
      { name: 'Guest Reviews', included: false },
    ],
  },
  {
    name: 'Professional',
    price: 850,
    target: 'Growing lodges',
    popular: true,
    moduleKeys: ['gh_rooms', 'gh_bookings', 'gh_housekeeping', 'invoices', 'tasks', 'staff', 'accounting', 'gh_reviews'],
    features: [
      { name: 'Room Management', included: true },
      { name: 'Bookings & Calendar', included: true },
      { name: 'Invoices', included: true },
      { name: 'Task Management', included: true },
      { name: 'Staff & HR', included: true },
      { name: 'Housekeeping', included: true },
      { name: 'Accounting', included: true },
      { name: 'Guest Reviews', included: true },
    ],
  },
  {
    name: 'Enterprise',
    price: 1100,
    target: 'Established hospitality',
    moduleKeys: ['gh_rooms', 'gh_bookings', 'gh_housekeeping', 'gh_reviews', 'invoices', 'tasks', 'staff', 'accounting', 'core_crm'],
    features: [
      { name: 'Room Management', included: true },
      { name: 'Bookings & Calendar', included: true },
      { name: 'Invoices', included: true },
      { name: 'Task Management', included: true },
      { name: 'Staff & HR', included: true },
      { name: 'Housekeeping', included: true },
      { name: 'Accounting', included: true },
      { name: 'Guest Reviews', included: true },
    ],
  },
];

const fleetTiers: PackageTier[] = [
  {
    name: 'Starter',
    price: 500,
    target: 'Small fleets (up to 15 vehicles)',
    moduleKeys: ['fleet', 'invoices', 'tasks', 'staff'],
    features: [
      { name: 'Executive Dashboard', included: true },
      { name: 'Fleet Overview Panel', included: true },
      { name: 'Vehicle Health Indicators', included: true },
      { name: 'Add/Edit Vehicles', included: true },
      { name: 'Digital Vehicle File', included: true },
      { name: 'License & Insurance Tracking', included: true },
      { name: 'Odometer & Driver Assignment', included: true },
      { name: 'Service History & Logging', included: true },
      { name: 'Fuel Cost Entry', included: true },
      { name: 'Activity Log', included: true },
      { name: 'Smart Alerts Center', included: false },
      { name: 'Warranty Tracking', included: false },
      { name: 'Maintenance Scheduling', included: false },
      { name: 'Cost Intelligence', included: false },
      { name: 'Vehicle Health AI', included: false },
      { name: 'Tyre Lifecycle Manager', included: false },
      { name: 'Fleet Reporting', included: false },
      { name: 'Document Archive', included: false },
    ],
  },
  {
    name: 'Professional',
    price: 700,
    target: 'Growing fleets',
    popular: true,
    moduleKeys: ['fleet', 'fleet_maintenance', 'fleet_costs', 'invoices', 'tasks', 'staff', 'accounting'],
    features: [
      { name: 'Executive Dashboard', included: true },
      { name: 'Fleet Overview Panel', included: true },
      { name: 'Vehicle Health Indicators', included: true },
      { name: 'Add/Edit Vehicles', included: true },
      { name: 'Digital Vehicle File', included: true },
      { name: 'License & Insurance Tracking', included: true },
      { name: 'Odometer & Driver Assignment', included: true },
      { name: 'Service History & Logging', included: true },
      { name: 'Fuel Cost Entry', included: true },
      { name: 'Smart Alerts Center', included: true },
      { name: 'Warranty Tracking', included: true },
      { name: 'Maintenance Scheduling', included: true },
      { name: 'Preventative Maintenance', included: true },
      { name: 'Parts & Provider Tracking', included: true },
      { name: 'Total Cost Per Vehicle', included: true },
      { name: 'Cost Per KM Calculation', included: true },
      { name: 'Monthly Fleet Cost Dashboard', included: true },
      { name: 'High-Cost Vehicle Alerts', included: true },
      { name: 'Accounting Integration', included: true },
      { name: 'Vehicle Health AI', included: false },
      { name: 'Tyre Lifecycle Manager', included: false },
      { name: 'Driver Risk Scoring', included: false },
      { name: 'Fleet Reporting', included: false },
      { name: 'Document Archive', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 950,
    target: 'Large fleets (50+ vehicles)',
    moduleKeys: ['fleet', 'fleet_maintenance', 'fleet_costs', 'fleet_tyres', 'fleet_drivers', 'fleet_reports', 'fleet_documents', 'invoices', 'tasks', 'staff', 'accounting', 'core_crm'],
    features: [
      { name: 'Executive Dashboard', included: true },
      { name: 'Fleet Overview Panel', included: true },
      { name: 'Vehicle Health Indicators', included: true },
      { name: 'Add/Edit Vehicles', included: true },
      { name: 'Digital Vehicle File', included: true },
      { name: 'License & Insurance Tracking', included: true },
      { name: 'Smart Alerts Center', included: true },
      { name: 'Warranty Tracking', included: true },
      { name: 'Maintenance Scheduling', included: true },
      { name: 'Preventative Maintenance', included: true },
      { name: 'Parts & Provider Tracking', included: true },
      { name: 'Total Cost Per Vehicle', included: true },
      { name: 'Cost Per KM Calculation', included: true },
      { name: 'Monthly Fleet Cost Dashboard', included: true },
      { name: 'Accounting Integration', included: true },
      { name: 'Vehicle Health AI Score', included: true },
      { name: 'Replace-or-Keep Predictor', included: true },
      { name: 'Tyre Lifecycle Manager', included: true },
      { name: 'Driver Risk Scoring', included: true },
      { name: 'Incident & Claims Management', included: true },
      { name: 'Fleet Reporting (PDF/Excel)', included: true },
      { name: 'Document Archive', included: true },
      { name: 'Multi-Branch Support', included: true },
      { name: 'Role-Based Access', included: true },
    ],
  },
];

const SYSTEM_CONFIG: Record<string, { label: string; subtitle: string; gradient: string; tiers: PackageTier[] }> = {
  business: { label: 'Business Management', subtitle: 'For companies & professionals', gradient: 'from-primary to-violet', tiers: businessTiers },
  workshop: { label: 'Workshop Management', subtitle: 'For auto shops & service centres', gradient: 'from-coral to-warning', tiers: workshopTiers },
  school: { label: 'School Management', subtitle: 'For private schools & academies', gradient: 'from-info to-cyan', tiers: schoolTiers },
  legal: { label: 'Legal Practice', subtitle: 'For law firms & practitioners', gradient: 'from-emerald-500 to-teal-500', tiers: legalTiers },
  hire: { label: 'Tool Hire', subtitle: 'For equipment rental companies', gradient: 'from-amber-500 to-orange-500', tiers: hireTiers },
  guesthouse: { label: 'Guest House', subtitle: 'For lodges & hospitality', gradient: 'from-rose-500 to-pink-500', tiers: guesthouseTiers },
  fleet: { label: 'Fleet Management', subtitle: 'For vehicle fleets & logistics', gradient: 'from-slate-600 to-zinc-800', tiers: fleetTiers },
};

interface PackageTierSelectorProps {
  systemType: string;
  onSelect: (tierName: string, moduleKeys: string[]) => void;
  onBack: () => void;
  onCustomBuild: () => void;
}

export function PackageTierSelector({ systemType, onSelect, onBack, onCustomBuild }: PackageTierSelectorProps) {
  const config = SYSTEM_CONFIG[systemType] || SYSTEM_CONFIG.school;

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <PlatformLogo className="h-12 w-auto" />
        </div>
        <h1 className={cn(
          'font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2',
          config.gradient
        )}>
          {config.label}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Choose a package to start your 7-day free trial
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {config.tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              'relative flex flex-col rounded-2xl border-2 bg-card p-6 transition-all duration-300',
              tier.popular
                ? 'border-primary shadow-glow-md scale-[1.02]'
                : 'border-border hover:border-primary/40 hover:shadow-elevated'
            )}
          >
            {tier.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            )}

            <div className="text-center mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">{tier.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tier.target}</p>
            </div>

            <div className="text-center mb-6">
              <span className="font-display text-3xl sm:text-4xl font-bold text-gradient">
                {formatMaluti(tier.price)}
              </span>
              <span className="text-muted-foreground text-xs block mt-1">/month</span>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-2 text-xs">
                  {feature.included ? (
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                      <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className={cn(feature.included ? 'text-foreground' : 'text-muted-foreground')}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant={tier.popular ? 'gradient' : 'outline'}
              className="w-full rounded-xl h-10 font-semibold"
              onClick={() => onSelect(tier.name, tier.moduleKeys)}
            >
              Select {tier.name}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              7-day free trial · No credit card
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onCustomBuild}
          className="text-sm text-primary hover:underline underline-offset-4 font-medium"
        >
          Or build your own custom package →
        </button>
      </div>
    </div>
  );
}

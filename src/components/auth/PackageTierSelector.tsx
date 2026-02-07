import { ArrowLeft, Check, Minus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import type { SystemType } from './SystemSelector';

interface PackageTier {
  name: string;
  price: number;
  target: string;
  popular?: boolean;
  moduleKeys: string[];
  features: { name: string; included: boolean }[];
}

interface SystemConfig {
  label: string;
  gradient: string;
  tiers: PackageTier[];
}

// Module keys mapped to each tier for saving to user_modules
const SYSTEM_TIERS: Record<SystemType, SystemConfig> = {
  business: {
    label: 'Business Management',
    gradient: 'from-primary to-violet',
    tiers: [
      {
        name: 'Starter',
        price: 350,
        target: 'Growing service companies',
        moduleKeys: ['crm', 'clients', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'profitability'],
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
        moduleKeys: ['crm', 'clients', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'profitability', 'tenders', 'accounting', 'staff'],
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
        moduleKeys: ['crm', 'clients', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'profitability', 'tenders', 'accounting', 'staff', 'fleet'],
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
  workshop: {
    label: 'Workshop Management',
    gradient: 'from-coral to-warning',
    tiers: [
      {
        name: 'Starter',
        price: 450,
        target: 'Small repair shops',
        moduleKeys: ['crm', 'clients', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes'],
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
        moduleKeys: ['crm', 'clients', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'staff', 'profitability', 'accounting'],
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
        moduleKeys: ['crm', 'clients', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes', 'staff', 'profitability', 'accounting', 'fleet'],
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
  school: {
    label: 'School Management',
    gradient: 'from-info to-cyan',
    tiers: [
      {
        name: 'Starter',
        price: 720,
        target: 'Small private schools',
        moduleKeys: ['crm', 'clients', 'school_admin', 'students', 'school_fees', 'invoices', 'tasks', 'staff'],
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
        moduleKeys: ['crm', 'clients', 'school_admin', 'students', 'school_fees', 'invoices', 'tasks', 'staff', 'accounting', 'profitability'],
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
        moduleKeys: ['crm', 'clients', 'school_admin', 'students', 'school_fees', 'invoices', 'tasks', 'staff', 'accounting', 'profitability', 'fleet'],
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
};

interface PackageTierSelectorProps {
  systemType: SystemType;
  onSelect: (tierName: string, moduleKeys: string[]) => void;
  onBack: () => void;
  onCustomBuild: () => void;
}

export function PackageTierSelector({ systemType, onSelect, onBack, onCustomBuild }: PackageTierSelectorProps) {
  const config = SYSTEM_TIERS[systemType];

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
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to system selection
        </button>
      </div>
    </div>
  );
}

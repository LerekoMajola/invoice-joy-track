import { Briefcase, Wrench, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

export type SystemType = 'business' | 'workshop' | 'school';

interface SystemOption {
  type: SystemType;
  label: string;
  description: string;
  startingPrice: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}

const systems: SystemOption[] = [
  {
    type: 'business',
    label: 'Business',
    description: 'Quotes, invoices, CRM, tenders & accounting for service companies',
    startingPrice: 'M350',
    icon: Briefcase,
    gradient: 'from-primary to-violet',
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    type: 'workshop',
    label: 'Workshop',
    description: 'Job cards, repairs, parts tracking & invoicing for auto workshops',
    startingPrice: 'M450',
    icon: Wrench,
    gradient: 'from-coral to-warning',
    iconBg: 'bg-coral/10 text-coral',
  },
  {
    type: 'school',
    label: 'School',
    description: 'Students, fee collection, terms & class management for schools',
    startingPrice: 'M720',
    icon: GraduationCap,
    gradient: 'from-info to-cyan',
    iconBg: 'bg-info/10 text-info',
  },
];

interface SystemSelectorProps {
  onSelect: (system: SystemType) => void;
}

export function SystemSelector({ onSelect }: SystemSelectorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <PlatformLogo className="h-12 w-auto" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          What are you managing?
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Choose the system that fits your industry. You'll pick a package next.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {systems.map((system) => {
          const Icon = system.icon;
          return (
            <button
              key={system.type}
              type="button"
              onClick={() => onSelect(system.type)}
              className={cn(
                'group relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl border-2 border-border bg-card',
                'transition-all duration-300 hover:border-primary/50 hover:shadow-elevated hover:-translate-y-1',
                'text-center cursor-pointer'
              )}
            >
              {/* Gradient top bar */}
              <div className={cn(
                'absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity',
                system.gradient
              )} />

              <div className={cn('p-4 rounded-2xl', system.iconBg)}>
                <Icon className="h-8 w-8" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{system.label}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {system.description}
                </p>
              </div>

              <div className="mt-auto pt-2">
                <p className="text-sm text-muted-foreground">
                  Starting from{' '}
                  <span className="font-bold text-foreground">{system.startingPrice}/mo</span>
                </p>
              </div>

              <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Select <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

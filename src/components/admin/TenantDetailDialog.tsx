import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { Building2, Mail, Phone, Calendar, CreditCard, BarChart3, Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Car, Dumbbell, Puzzle, X, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tenant } from '@/hooks/useAdminTenants';
import { formatMaluti } from '@/lib/currency';
import { TenantModuleManager } from './TenantModuleManager';
import { TenantBusinessInsights } from './TenantBusinessInsights';
import { TenantSmsCredits } from './TenantSmsCredits';

interface TenantDetailDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const planLabels: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic',
  standard: 'Standard',
  pro: 'Pro',
};

const statusColors: Record<string, string> = {
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function TenantDetailDialog({ tenant, open, onOpenChange }: TenantDetailDialogProps) {
  if (!tenant || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background animate-in fade-in-0 duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold truncate">{tenant.company_name}</h1>
        <div className="ml-auto">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{tenant.company_name}</h3>
              <div className="space-y-2 text-sm">
                {tenant.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {tenant.email}
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {tenant.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Registered: {format(new Date(tenant.created_at), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <h4 className="font-medium">Subscription</h4>
              </div>
              {tenant.subscription ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">System:</span>
                    <span className="font-medium flex items-center gap-1.5">
                      {(() => {
                        const sys = tenant.subscription.system_type || 'business';
                        const iconMap: Record<string, typeof Briefcase> = { business: Briefcase, workshop: Wrench, school: GraduationCap, legal: Scale, hire: Hammer, guesthouse: Hotel, fleet: Car, gym: Dumbbell };
                        const labelMap: Record<string, string> = { business: 'Business', workshop: 'Workshop', school: 'School', legal: 'Legal', hire: 'HirePro', guesthouse: 'StayPro', fleet: 'FleetPro', gym: 'GymPro' };
                        const Icon = iconMap[sys] || Briefcase;
                        const label = labelMap[sys] || 'Business';
                        return (<><Icon className="h-4 w-4" />{label}</>);
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">
                      {planLabels[tenant.subscription.plan] || tenant.subscription.plan}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={statusColors[tenant.subscription.status]}>
                      {tenant.subscription.status}
                    </Badge>
                  </div>
                  {tenant.subscription.trial_ends_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Trial Ends:</span>
                      <span>{format(new Date(tenant.subscription.trial_ends_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {tenant.subscription.current_period_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Period Ends:</span>
                      <span>{format(new Date(tenant.subscription.current_period_end), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription data</p>
              )}
            </div>

            <Separator />

            {/* Usage Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <h4 className="font-medium">Usage (Current Period)</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{tenant.usage?.clients_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Clients</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{tenant.usage?.quotes_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Quotes</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{tenant.usage?.invoices_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Invoices</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Modules */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Puzzle className="h-4 w-4" />
                <h4 className="font-medium">Modules</h4>
              </div>
              <TenantModuleManager
                userId={tenant.user_id}
                systemType={tenant.subscription?.system_type || 'business'}
              />
            </div>

            <Separator />

            {/* SMS Credits */}
            <TenantSmsCredits tenantUserId={tenant.user_id} />

            <Separator />

            {/* Business Insights */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <h4 className="font-medium">Business Insights</h4>
              </div>
              <TenantBusinessInsights tenantUserId={tenant.user_id} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

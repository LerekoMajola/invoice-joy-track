import { format } from 'date-fns';
import { Building2, Mail, Phone, Calendar, CreditCard, BarChart3, Briefcase, Wrench, GraduationCap, Puzzle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tenant } from '@/hooks/useAdminTenants';
import { formatMaluti } from '@/lib/currency';
import { TenantModuleManager } from './TenantModuleManager';

interface TenantDetailDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const planLabels: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic (M300/mo)',
  standard: 'Standard (M500/mo)',
  pro: 'Pro (M800/mo)',
};

const statusColors: Record<string, string> = {
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function TenantDetailDialog({ tenant, open, onOpenChange }: TenantDetailDialogProps) {
  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tenant Details
          </DialogTitle>
        </DialogHeader>

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
                      const Icon = sys === 'workshop' ? Wrench : sys === 'school' ? GraduationCap : Briefcase;
                      const label = sys === 'workshop' ? 'Workshop' : sys === 'school' ? 'School' : 'Business';
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

          <Separator />

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
        </div>
      </DialogContent>
    </Dialog>
  );
}

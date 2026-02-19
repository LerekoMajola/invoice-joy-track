import { useState } from 'react';
import { format } from 'date-fns';
import { Search, FileText, Settings, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTenants, Tenant } from '@/hooks/useAdminTenants';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import { GenerateAdminInvoiceDialog } from './GenerateAdminInvoiceDialog';
import { PaymentTracker } from './PaymentTracker';
import { STATUS_COLORS, PLAN_LABELS, SYSTEM_ICONS, SYSTEM_LABELS, SYSTEM_COLORS } from './adminConstants';
import { formatMaluti } from '@/lib/currency';

export function BillingTab() {
  const { data: tenants, isLoading } = useAdminTenants();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billingTenant, setBillingTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [invoiceTenant, setInvoiceTenant] = useState<Tenant | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Only show tenants that have moved past the trialing stage
  const billingTenants = (tenants || []).filter(
    (t) => t.subscription && t.subscription.status !== 'trialing'
  );

  const filtered = billingTenants.filter((t) => {
    const s = search.toLowerCase();
    if (search && !(t.company_name?.toLowerCase().includes(s) || t.email?.toLowerCase().includes(s))) return false;
    if (statusFilter !== 'all' && t.subscription?.status !== statusFilter) return false;
    return true;
  });

  // Summary stats
  const activeCount = billingTenants.filter(t => t.subscription?.status === 'active').length;
  const pastDueCount = billingTenants.filter(t => t.subscription?.status === 'past_due').length;
  const mrr = billingTenants
    .filter(t => t.subscription?.status === 'active')
    .reduce((sum, t) => sum + (t.module_total || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{activeCount}</div>
          <div className="text-sm text-muted-foreground mt-1">Paying (Active)</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pastDueCount}</div>
          <div className="text-sm text-muted-foreground mt-1">Past Due</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{formatMaluti(mrr)}</div>
          <div className="text-sm text-muted-foreground mt-1">MRR</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} billing accounts</div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[750px]">
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price/mo</TableHead>
              <TableHead>Trial Ended</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No billing accounts found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tenant) => {
                const sys = tenant.subscription?.system_type || 'business';
                const Icon = SYSTEM_ICONS[sys] || SYSTEM_ICONS.business;
                const sub = tenant.subscription!;
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="font-medium">{tenant.company_name}</div>
                      {tenant.email && (
                        <div className="text-sm text-muted-foreground">{tenant.email}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={SYSTEM_COLORS[sys] || SYSTEM_COLORS.business}>
                        <Icon className="h-3 w-3 mr-1" />
                        {SYSTEM_LABELS[sys] || 'Business'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[sub.status] || ''}>
                        {sub.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {PLAN_LABELS[sub.plan] || sub.plan}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatMaluti(tenant.module_total)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.trial_ends_at
                        ? format(new Date(sub.trial_ends_at), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setBillingTenant(tenant)}>
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Billing & Payments</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setInvoiceTenant(tenant)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Generate Invoice</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingTenant(tenant)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Subscription</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Billing sheet */}
      <Sheet open={!!billingTenant} onOpenChange={(open) => !open && setBillingTenant(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{billingTenant?.company_name} — Billing</SheetTitle>
          </SheetHeader>
          {billingTenant?.subscription && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {PLAN_LABELS[billingTenant.subscription.plan] || billingTenant.subscription.plan}
                </Badge>
                <Badge className={STATUS_COLORS[billingTenant.subscription.status]}>
                  {billingTenant.subscription.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatMaluti(billingTenant.module_total)}/mo
                </span>
              </div>

              <Separator />

              <PaymentTracker
                subscriptionId={billingTenant.subscription.id}
                userId={billingTenant.user_id}
                planPrice={billingTenant.module_total}
                trialEndsAt={billingTenant.subscription.trial_ends_at}
              />

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setInvoiceTenant(billingTenant);
                  setBillingTenant(null);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEditingTenant(billingTenant);
                  setBillingTenant(null);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Subscription
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <EditSubscriptionDialog
        tenant={editingTenant}
        open={!!editingTenant}
        onOpenChange={(open) => !open && setEditingTenant(null)}
      />

      <GenerateAdminInvoiceDialog
        open={!!invoiceTenant}
        onOpenChange={(open) => !open && setInvoiceTenant(null)}
        preselectedTenant={invoiceTenant}
      />
    </div>
  );
}

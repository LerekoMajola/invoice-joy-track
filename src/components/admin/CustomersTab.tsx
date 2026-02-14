import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Eye, Settings, Briefcase, Wrench, GraduationCap, Scale, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminTenants, Tenant } from '@/hooks/useAdminTenants';
import { useAdminSignups, type AdminSignup } from '@/hooks/useAdminSignups';
import { TenantDetailDialog } from './TenantDetailDialog';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors: Record<string, string> = {
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const planLabels: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic',
  standard: 'Standard',
  pro: 'Pro',
};

const systemIcons: Record<string, typeof Briefcase> = {
  business: Briefcase,
  workshop: Wrench,
  school: GraduationCap,
  legal: Scale,
};

const systemLabels: Record<string, string> = {
  business: 'Business',
  workshop: 'Workshop',
  school: 'School',
  legal: 'Legal',
};

const systemColors: Record<string, string> = {
  business: 'bg-blue-900 text-white dark:bg-blue-800 dark:text-white',
  workshop: 'bg-orange-900 text-white dark:bg-orange-800 dark:text-white',
  school: 'bg-emerald-900 text-white dark:bg-emerald-800 dark:text-white',
  legal: 'bg-purple-900 text-white dark:bg-purple-800 dark:text-white',
};

interface UnifiedCustomer {
  id: string;
  user_id: string;
  email: string | null;
  company_name: string | null;
  system_type: string;
  onboarded: boolean;
  created_at: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  // Only for onboarded tenants
  tenant?: Tenant;
}

function mergeData(tenants: Tenant[] | undefined, signups: AdminSignup[] | undefined): UnifiedCustomer[] {
  const customerMap = new Map<string, UnifiedCustomer>();

  // Add all signups first (keyed by user id)
  (signups || []).forEach((s) => {
    customerMap.set(s.id, {
      id: s.id,
      user_id: s.id,
      email: s.email,
      company_name: s.company_name,
      system_type: s.system_type,
      onboarded: s.onboarded,
      created_at: s.created_at,
      subscription_status: s.subscription_status,
      subscription_plan: s.subscription_plan,
    });
  });

  // Enrich with tenant data for onboarded users
  (tenants || []).forEach((t) => {
    const existing = customerMap.get(t.user_id);
    if (existing) {
      existing.tenant = t;
      existing.company_name = t.company_name;
      existing.onboarded = true;
      if (t.subscription) {
        existing.subscription_status = t.subscription.status;
        existing.subscription_plan = t.subscription.plan;
        existing.system_type = t.subscription.system_type;
      }
    } else {
      // Tenant exists but wasn't in signups list (edge case)
      customerMap.set(t.user_id, {
        id: t.id,
        user_id: t.user_id,
        email: t.email,
        company_name: t.company_name,
        system_type: t.subscription?.system_type || 'business',
        onboarded: true,
        created_at: t.created_at,
        subscription_status: t.subscription?.status || null,
        subscription_plan: t.subscription?.plan || null,
        tenant: t,
      });
    }
  });

  return Array.from(customerMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function CustomersTab() {
  const { data: tenants, isLoading: tenantsLoading } = useAdminTenants();
  const { data: signups, isLoading: signupsLoading } = useAdminSignups();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [onboardFilter, setOnboardFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedCustomer | null>(null);

  const isLoading = tenantsLoading || signupsLoading;

  const deleteTenantMutation = useMutation({
    mutationFn: async (customer: UnifiedCustomer) => {
      if (customer.tenant) {
        const { error: subError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', customer.user_id);
        if (subError) throw subError;

        const { error: profileError } = await supabase
          .from('company_profiles')
          .delete()
          .eq('id', customer.tenant.id);
        if (profileError) throw profileError;
      } else {
        // Non-onboarded user — delete via edge function
        const { data, error } = await supabase.functions.invoke('admin-get-signups', {
          body: { action: 'delete', userId: customer.user_id },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
      }
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-signups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete customer');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const allCustomers = mergeData(tenants, signups);

  const filtered = allCustomers.filter((c) => {
    const searchStr = search.toLowerCase();
    if (search && !(c.email?.toLowerCase().includes(searchStr) || c.company_name?.toLowerCase().includes(searchStr))) return false;
    if (onboardFilter === 'onboarded' && !c.onboarded) return false;
    if (onboardFilter === 'not_onboarded' && c.onboarded) return false;
    if (systemFilter !== 'all' && c.system_type !== systemFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Onboard toggle */}
      <Tabs value={onboardFilter} onValueChange={setOnboardFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({allCustomers.length})</TabsTrigger>
          <TabsTrigger value="onboarded">Onboarded ({allCustomers.filter(c => c.onboarded).length})</TabsTrigger>
          <TabsTrigger value="not_onboarded">Not Onboarded ({allCustomers.filter(c => !c.onboarded).length})</TabsTrigger>
        </TabsList>
      </Tabs>

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
        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="school">School</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">{filtered.length} customers</div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company / Email</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => {
                const sys = customer.system_type || 'business';
                const Icon = systemIcons[sys] || Briefcase;
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        {customer.company_name ? (
                          <div className="font-medium">{customer.company_name}</div>
                        ) : null}
                        <div className={customer.company_name ? 'text-sm text-muted-foreground' : 'font-medium'}>
                          {customer.email || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={systemColors[sys] || systemColors.business}>
                        <Icon className="h-3 w-3 mr-1" />
                        {systemLabels[sys] || 'Business'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {customer.onboarded ? (
                        <Badge className="bg-green-900 text-white dark:bg-green-800 dark:text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Onboarded
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Onboarded
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.subscription_status ? (
                        <div className="flex flex-col gap-1">
                          <Badge className={statusColors[customer.subscription_status] || ''}>
                            {customer.subscription_status}
                          </Badge>
                          {customer.subscription_plan && (
                            <span className="text-xs text-muted-foreground">
                              {planLabels[customer.subscription_plan] || customer.subscription_plan}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.tenant?.usage ? (
                        <div className="text-sm">
                          <span className="text-muted-foreground">C:</span> {customer.tenant.usage.clients_count}
                          <span className="mx-1">|</span>
                          <span className="text-muted-foreground">Q:</span> {customer.tenant.usage.quotes_count}
                          <span className="mx-1">|</span>
                          <span className="text-muted-foreground">I:</span> {customer.tenant.usage.invoices_count}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(customer.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {customer.tenant && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedTenant(customer.tenant!)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingTenant(customer.tenant!)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TenantDetailDialog
        tenant={selectedTenant}
        open={!!selectedTenant}
        onOpenChange={(open) => !open && setSelectedTenant(null)}
      />

      <EditSubscriptionDialog
        tenant={editingTenant}
        open={!!editingTenant}
        onOpenChange={(open) => !open && setEditingTenant(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Customer"
        description={`This will permanently delete ${deleteTarget?.company_name || deleteTarget?.email} and all their data. This cannot be undone.`}
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteTenantMutation.mutate(deleteTarget)}
      />
    </div>
  );
}

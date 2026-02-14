import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Settings } from 'lucide-react';
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
import { useAdminTenants, Tenant } from '@/hooks/useAdminTenants';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import { PaymentTracker } from './PaymentTracker';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMaluti } from '@/lib/currency';
import { Separator } from '@/components/ui/separator';

const PLAN_PRICES: Record<string, number> = {
  free_trial: 0,
  basic: 300,
  standard: 500,
  pro: 800,
};

const statusColors: Record<string, string> = {
  trialing: 'bg-blue-900 text-white dark:bg-blue-800 dark:text-white',
  active: 'bg-green-900 text-white dark:bg-green-800 dark:text-white',
  past_due: 'bg-yellow-700 text-white dark:bg-yellow-700 dark:text-white',
  cancelled: 'bg-red-900 text-white dark:bg-red-800 dark:text-white',
  expired: 'bg-gray-900 text-white dark:bg-gray-800 dark:text-white',
};

const planLabels: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic',
  standard: 'Standard',
  pro: 'Pro',
};

export function SubscriptionsTab() {
  const { data: tenants, isLoading } = useAdminTenants();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

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

  const tenantsWithSubs = tenants?.filter(t => t.subscription) || [];

  const filteredTenants = tenantsWithSubs.filter((tenant) => {
    const matchesSearch = 
      tenant.company_name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.subscription?.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.subscription?.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free_trial">Free Trial</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial Ends</TableHead>
              <TableHead>Period Ends</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow 
                  key={tenant.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <TableCell className="font-medium">{tenant.company_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {planLabels[tenant.subscription?.plan || '']}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatMaluti(PLAN_PRICES[tenant.subscription?.plan || 'free_trial'])}/mo
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[tenant.subscription?.status || 'expired']}>
                      {tenant.subscription?.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tenant.subscription?.trial_ends_at
                      ? format(new Date(tenant.subscription.trial_ends_at), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {tenant.subscription?.current_period_end
                      ? format(new Date(tenant.subscription.current_period_end), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTenant(tenant);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedTenant?.company_name}</SheetTitle>
          </SheetHeader>
          {selectedTenant?.subscription && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{planLabels[selectedTenant.subscription.plan]}</Badge>
                <Badge className={statusColors[selectedTenant.subscription.status]}>
                  {selectedTenant.subscription.status}
                </Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  {formatMaluti(PLAN_PRICES[selectedTenant.subscription.plan])}/mo
                </span>
              </div>

              <Separator />

              <PaymentTracker
                subscriptionId={selectedTenant.subscription.id}
                userId={selectedTenant.user_id}
                planPrice={PLAN_PRICES[selectedTenant.subscription.plan]}
              />

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEditingTenant(selectedTenant);
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
    </div>
  );
}

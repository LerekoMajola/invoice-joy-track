import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Eye, Settings, Briefcase, Wrench, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminTenants, Tenant } from '@/hooks/useAdminTenants';
import { TenantDetailDialog } from './TenantDetailDialog';
import { EditSubscriptionDialog } from './EditSubscriptionDialog';
import { Skeleton } from '@/components/ui/skeleton';

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
};

const systemLabels: Record<string, string> = {
  business: 'Business',
  workshop: 'Workshop',
  school: 'School',
};

const systemColors: Record<string, string> = {
  business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  school: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
};

export function TenantsTab() {
  const { data: tenants, isLoading } = useAdminTenants();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [systemFilter, setSystemFilter] = useState<string>('all');
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

  const filteredTenants = tenants?.filter((tenant) => {
    const matchesSearch = 
      tenant.company_name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.subscription?.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.subscription?.plan === planFilter;
    const matchesSystem = systemFilter === 'all' || tenant.subscription?.system_type === systemFilter;

    return matchesSearch && matchesStatus && matchesPlan && matchesSystem;
  }) || [];

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
        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="school">School</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No tenants found
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.company_name}</TableCell>
                  <TableCell>
                    {(() => {
                      const sys = tenant.subscription?.system_type || 'business';
                      const Icon = systemIcons[sys] || Briefcase;
                      return (
                        <Badge className={systemColors[sys] || systemColors.business}>
                          <Icon className="h-3 w-3 mr-1" />
                          {systemLabels[sys] || 'Business'}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{tenant.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {planLabels[tenant.subscription?.plan || ''] || 'No Plan'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[tenant.subscription?.status || 'expired']}>
                      {tenant.subscription?.status || 'No Subscription'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-muted-foreground">C:</span> {tenant.usage?.clients_count || 0}
                      <span className="mx-1">|</span>
                      <span className="text-muted-foreground">Q:</span> {tenant.usage?.quotes_count || 0}
                      <span className="mx-1">|</span>
                      <span className="text-muted-foreground">I:</span> {tenant.usage?.invoices_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(tenant.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTenant(tenant)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
    </div>
  );
}

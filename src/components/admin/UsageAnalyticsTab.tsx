import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAdminUsageAnalytics, TenantUsage } from '@/hooks/useAdminUsageAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Database, TrendingUp } from 'lucide-react';
import { SYSTEM_LABELS, SYSTEM_COLORS } from './adminConstants';
import { format } from 'date-fns';
import { useState } from 'react';

const ENGAGEMENT_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const TABLE_LABELS: Record<string, string> = {
  invoices: 'Invoices',
  quotes: 'Quotes',
  clients: 'Clients',
  tasks: 'Tasks',
  leads: 'Leads',
  job_cards: 'Job Cards',
  legal_cases: 'Legal Cases',
  gym_members: 'Gym Members',
  delivery_notes: 'Delivery Notes',
  staff_members: 'Staff',
  hire_orders: 'Hire Orders',
  bookings: 'Bookings',
  fleet_vehicles: 'Vehicles',
  students: 'Students',
  expenses: 'Expenses',
};

type SortKey = keyof Pick<TenantUsage, 'companyName' | 'invoices' | 'quotes' | 'clients' | 'tasks' | 'leads' | 'staff' | 'engagementScore'>;

export function UsageAnalyticsTab() {
  const { data, isLoading } = useAdminUsageAnalytics();
  const [sortBy, setSortBy] = useState<SortKey>('engagementScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('desc'); }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">No data available.</p>;

  const { tenantUsage, featurePopularity, monthlyActivity, moduleAdoption, summary } = data;

  // Prepare feature popularity chart data
  const featureChartData = Object.entries(featurePopularity)
    .map(([key, count]) => ({ name: TABLE_LABELS[key] || key, count }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  // Prepare module adoption chart data
  const adoptionChartData = Object.entries(moduleAdoption)
    .map(([key, tenants]) => ({ name: TABLE_LABELS[key] || key, tenants }))
    .filter(d => d.tenants > 0)
    .sort((a, b) => b.tenants - a.tenants);

  // Sort tenant table
  const sortedTenants = [...tenantUsage].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort(field)}>
      {label} {sortBy === field && (sortDir === 'desc' ? '↓' : '↑')}
    </TableHead>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary.totalRecords.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary.totalTenants}</p>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summary.activeTenants}</p>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {summary.totalTenants > 0 ? Math.round((summary.activeTenants / summary.totalTenants) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Activation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Trend (6 Months)</CardTitle>
            <CardDescription>Records created per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: 'Records', color: 'hsl(var(--primary))' } }} className="h-[250px]">
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(v) => { try { return format(new Date(v + '-01'), 'MMM yy'); } catch { return v; }}} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Feature Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Popularity</CardTitle>
            <CardDescription>Total records by module</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: 'Records', color: 'hsl(var(--primary))' } }} className="h-[250px]">
              <BarChart data={featureChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Adoption */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Module Adoption</CardTitle>
          <CardDescription>Number of tenants using each feature</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ tenants: { label: 'Tenants', color: 'hsl(var(--chart-2, var(--primary)))' } }} className="h-[250px]">
            <BarChart data={adoptionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="tenants" fill="hsl(var(--chart-2, var(--primary)))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Per-Tenant Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-Tenant Usage</CardTitle>
          <CardDescription>Click column headers to sort</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader label="Tenant" field="companyName" />
                  <TableHead>System</TableHead>
                  <SortHeader label="Invoices" field="invoices" />
                  <SortHeader label="Quotes" field="quotes" />
                  <SortHeader label="Clients" field="clients" />
                  <SortHeader label="Tasks" field="tasks" />
                  <SortHeader label="Leads" field="leads" />
                  <SortHeader label="Staff" field="staff" />
                  <TableHead>Last Active</TableHead>
                  <SortHeader label="Score" field="engagementScore" />
                  <TableHead>Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTenants.map((t) => (
                  <TableRow key={t.userId}>
                    <TableCell className="font-medium max-w-[200px] truncate">{t.companyName}</TableCell>
                    <TableCell>
                      <Badge className={SYSTEM_COLORS[t.systemType] || 'bg-muted text-foreground'}>
                        {SYSTEM_LABELS[t.systemType] || t.systemType}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.invoices}</TableCell>
                    <TableCell>{t.quotes}</TableCell>
                    <TableCell>{t.clients}</TableCell>
                    <TableCell>{t.tasks}</TableCell>
                    <TableCell>{t.leads}</TableCell>
                    <TableCell>{t.staff}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.lastActive ? format(new Date(t.lastActive), 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell className="font-mono">{t.engagementScore}</TableCell>
                    <TableCell>
                      <Badge className={ENGAGEMENT_COLORS[t.engagement]}>
                        {t.engagement.charAt(0).toUpperCase() + t.engagement.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTenants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      No tenant data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

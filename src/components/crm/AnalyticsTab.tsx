import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads, LEAD_STATUSES, LEAD_SOURCES } from '@/hooks/useLeads';
import { useCRMClients } from '@/hooks/useCRMClients';
import { formatMaluti } from '@/lib/currency';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Funnel,
  FunnelChart,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign, 
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { differenceInDays, parseISO, subMonths, startOfMonth, format, isWithinInterval } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export function AnalyticsTab() {
  const { leads, isLoading: leadsLoading } = useLeads();
  const { clients, isLoading: clientsLoading } = useCRMClients();

  const analytics = useMemo(() => {
    if (!leads.length) return null;

    // Conversion metrics
    const wonLeads = leads.filter(l => l.status === 'won');
    const lostLeads = leads.filter(l => l.status === 'lost');
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status));
    
    const conversionRate = leads.length > 0 
      ? ((wonLeads.length / leads.length) * 100).toFixed(1) 
      : '0';

    // Pipeline value
    const pipelineValue = activeLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
    const wonValue = wonLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
    const avgDealSize = wonLeads.length > 0 ? wonValue / wonLeads.length : 0;

    // Sales velocity (average days to close)
    const closedDeals = wonLeads.filter(l => l.created_at);
    const avgDaysToClose = closedDeals.length > 0
      ? closedDeals.reduce((sum, l) => {
          return sum + differenceInDays(parseISO(l.updated_at), parseISO(l.created_at));
        }, 0) / closedDeals.length
      : 0;

    // Funnel data
    const funnelData = LEAD_STATUSES
      .filter(s => s.value !== 'lost')
      .map(status => ({
        name: status.label,
        value: leads.filter(l => l.status === status.value).length,
        fill: status.color.replace('bg-', '#').replace('-500', ''),
      }));

    // Source performance
    const sourceData = LEAD_SOURCES.map(source => {
      const sourceLeads = leads.filter(l => l.source === source.value);
      const sourceWon = sourceLeads.filter(l => l.status === 'won');
      return {
        name: source.label,
        total: sourceLeads.length,
        won: sourceWon.length,
        conversion: sourceLeads.length > 0 
          ? ((sourceWon.length / sourceLeads.length) * 100).toFixed(0) 
          : '0',
      };
    }).filter(s => s.total > 0);

    // Status distribution for pie chart
    const statusDistribution = LEAD_STATUSES.map(status => ({
      name: status.label,
      value: leads.filter(l => l.status === status.value).length,
    })).filter(s => s.value > 0);

    // Monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));
      
      const monthLeads = leads.filter(l => {
        const createdAt = parseISO(l.created_at);
        return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
      });

      monthlyData.push({
        month: format(monthStart, 'MMM'),
        created: monthLeads.length,
        won: monthLeads.filter(l => l.status === 'won').length,
        value: monthLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
      });
    }

    return {
      conversionRate,
      pipelineValue,
      wonValue,
      avgDealSize,
      avgDaysToClose: Math.round(avgDaysToClose),
      totalLeads: leads.length,
      activeLeads: activeLeads.length,
      wonCount: wonLeads.length,
      lostCount: lostLeads.length,
      winLossRatio: lostLeads.length > 0 ? (wonLeads.length / lostLeads.length).toFixed(2) : 'N/A',
      funnelData,
      sourceData,
      statusDistribution,
      monthlyData,
    };
  }, [leads]);

  if (leadsLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Target className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No data yet</p>
        <p className="text-sm">Add leads to see your CRM analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatMaluti(analytics.pipelineValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">{formatMaluti(analytics.avgDealSize)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Days to Close</p>
                <p className="text-2xl font-bold">{analytics.avgDaysToClose} days</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-secondary/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Leads</p>
            <p className="text-xl font-bold">{analytics.totalLeads}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold text-blue-600">{analytics.activeLeads}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Won</p>
            <p className="text-xl font-bold text-green-600">{analytics.wonCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Lost</p>
            <p className="text-xl font-bold text-red-600">{analytics.lostCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Win/Loss Ratio</p>
            <p className="text-xl font-bold">{analytics.winLossRatio}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Sources Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total" />
                <Bar dataKey="won" fill="#82ca9d" name="Won" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="created" 
                stroke="#8884d8" 
                name="Leads Created"
                strokeWidth={2}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="won" 
                stroke="#82ca9d" 
                name="Deals Won"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Client Revenue</p>
                <p className="text-2xl font-bold">
                  {formatMaluti(clients.reduce((sum, c) => sum + c.totalRevenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Won Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatMaluti(analytics.wonValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

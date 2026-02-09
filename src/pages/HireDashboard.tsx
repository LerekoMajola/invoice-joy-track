import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { useHireOrders } from '@/hooks/useHireOrders';
import { Hammer, ClipboardList, AlertTriangle, Package } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { format } from 'date-fns';

export default function HireDashboard() {
  const { equipment } = useEquipment();
  const { orders } = useHireOrders();

  const onHire = equipment.filter(e => e.status === 'on_hire').length;
  const available = equipment.filter(e => e.status === 'available').length;
  const overdueOrders = orders.filter(o => o.status === 'overdue' || (o.status === 'active' && new Date(o.hire_end) < new Date())).length;
  const revenueThisMonth = orders
    .filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = orders.slice(0, 5);

  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-info/10 text-info',
    returned: 'bg-success/10 text-success',
    overdue: 'bg-destructive/10 text-destructive',
  };

  return (
    <DashboardLayout>
      <Header title="Tool Hire Dashboard" subtitle="Equipment rental overview" />
      <div className="p-4 md:p-6 space-y-6 pb-safe">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Equipment" value={equipment.length} icon={Package} />
          <StatCard title="On Hire" value={onHire} icon={Hammer} />
          <StatCard title="Overdue Returns" value={overdueOrders} icon={AlertTriangle} />
          <StatCard title="Revenue (Month)" value={formatMaluti(revenueThisMonth)} icon={ClipboardList} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Hire Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hire orders yet. Create your first order from the Hire Orders page.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.client_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatMaluti(order.total)}</span>
                      <Badge className={statusColor[order.status] || ''} variant="secondary">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

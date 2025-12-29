import { FileText, Receipt, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'invoice',
    message: 'Invoice #INV-0024 sent to Acme Corp',
    time: '2 hours ago',
    icon: Receipt,
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    id: 2,
    type: 'quote',
    message: 'Quote #QT-0089 accepted by TechStart Inc',
    time: '4 hours ago',
    icon: FileText,
    iconBg: 'bg-success/10 text-success',
  },
  {
    id: 3,
    type: 'delivery',
    message: 'Delivery note #DN-0156 marked as delivered',
    time: '6 hours ago',
    icon: Truck,
    iconBg: 'bg-info/10 text-info',
  },
  {
    id: 4,
    type: 'client',
    message: 'New client added: Global Solutions Ltd',
    time: 'Yesterday',
    icon: Users,
    iconBg: 'bg-warning/10 text-warning',
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold text-card-foreground">
        Recent Activity
      </h3>
      <div className="mt-4 space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn('rounded-lg p-2', activity.iconBg)}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-card-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

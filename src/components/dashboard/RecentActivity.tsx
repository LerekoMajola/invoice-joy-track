import { FileText, Receipt, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Quote } from '@/hooks/useQuotes';
import { Invoice } from '@/hooks/useInvoices';
import { DeliveryNote } from '@/hooks/useDeliveryNotes';
import { Client } from '@/hooks/useClients';

interface RecentActivityProps {
  quotes: Quote[];
  invoices: Invoice[];
  deliveryNotes: DeliveryNote[];
  clients: Client[];
  isLoading: boolean;
}

interface ActivityItem {
  id: string;
  type: 'invoice' | 'quote' | 'delivery' | 'client';
  message: string;
  time: Date;
  icon: typeof FileText;
  iconBg: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function RecentActivity({ quotes, invoices, deliveryNotes, clients, isLoading }: RecentActivityProps) {
  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add recent invoices
    invoices.forEach(invoice => {
      const statusText = invoice.status === 'paid' ? 'marked as paid' : 
                        invoice.status === 'sent' ? 'sent to' : 
                        invoice.status === 'overdue' ? 'is overdue for' : 'created for';
      items.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        message: `Invoice #${invoice.invoiceNumber} ${statusText} ${invoice.clientName}`,
        time: new Date(invoice.updatedAt || invoice.createdAt),
        icon: Receipt,
        iconBg: 'bg-primary/10 text-primary',
      });
    });

    // Add recent quotes
    quotes.forEach(quote => {
      const statusText = quote.status === 'accepted' ? 'accepted by' : 
                        quote.status === 'sent' ? 'sent to' : 
                        quote.status === 'rejected' ? 'rejected by' : 'created for';
      items.push({
        id: `quote-${quote.id}`,
        type: 'quote',
        message: `Quote #${quote.quoteNumber} ${statusText} ${quote.clientName}`,
        time: new Date(quote.updatedAt || quote.createdAt),
        icon: FileText,
        iconBg: quote.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-info/10 text-info',
      });
    });

    // Add recent delivery notes
    deliveryNotes.forEach(note => {
      const statusText = note.status === 'delivered' ? 'marked as delivered' : 'created';
      items.push({
        id: `delivery-${note.id}`,
        type: 'delivery',
        message: `Delivery note #${note.noteNumber} ${statusText}`,
        time: new Date(note.updatedAt || note.createdAt),
        icon: Truck,
        iconBg: 'bg-info/10 text-info',
      });
    });

    // Add recent clients
    clients.forEach(client => {
      items.push({
        id: `client-${client.id}`,
        type: 'client',
        message: `New client added: ${client.company}`,
        time: new Date(client.createdAt),
        icon: Users,
        iconBg: 'bg-warning/10 text-warning',
      });
    });

    // Sort by time (most recent first) and take top 5
    return items
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5);
  }, [quotes, invoices, deliveryNotes, clients]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-card-foreground">
          Recent Activity
        </h3>
        <div className="mt-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="rounded-lg p-2 bg-muted h-8 w-8" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold text-card-foreground">
        Recent Activity
      </h3>
      <div className="mt-4 space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
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
                <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.time)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

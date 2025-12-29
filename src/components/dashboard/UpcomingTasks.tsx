import { Calendar, Clock, FileText, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Quote } from '@/hooks/useQuotes';
import { Invoice } from '@/hooks/useInvoices';

interface UpcomingTasksProps {
  quotes: Quote[];
  invoices: Invoice[];
  isLoading: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  dueDateRaw: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'quote' | 'invoice';
}

const priorityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground border-border',
};

function formatDueDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dueDay.getTime() === today.getTime()) return 'Today';
  if (dueDay.getTime() === tomorrow.getTime()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPriority(date: Date): 'high' | 'medium' | 'low' {
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'high';
  if (diffDays <= 7) return 'medium';
  return 'low';
}

export function UpcomingTasks({ quotes, invoices, isLoading }: UpcomingTasksProps) {
  const tasks = useMemo(() => {
    const items: TaskItem[] = [];
    const now = new Date();

    // Add quotes expiring soon (sent quotes with valid_until in the future)
    quotes
      .filter(q => q.status === 'sent' && new Date(q.validUntil) >= now)
      .forEach(quote => {
        const dueDate = new Date(quote.validUntil);
        items.push({
          id: `quote-${quote.id}`,
          title: `Follow up on Quote #${quote.quoteNumber} for ${quote.clientName}`,
          dueDate: formatDueDate(dueDate),
          dueDateRaw: dueDate,
          priority: getPriority(dueDate),
          type: 'quote',
        });
      });

    // Add unpaid invoices with due dates
    invoices
      .filter(i => (i.status === 'sent' || i.status === 'overdue'))
      .forEach(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const isOverdue = dueDate < now;
        items.push({
          id: `invoice-${invoice.id}`,
          title: isOverdue 
            ? `Collect payment for overdue Invoice #${invoice.invoiceNumber}`
            : `Invoice #${invoice.invoiceNumber} payment due`,
          dueDate: isOverdue ? 'Overdue' : formatDueDate(dueDate),
          dueDateRaw: dueDate,
          priority: isOverdue ? 'high' : getPriority(dueDate),
          type: 'invoice',
        });
      });

    // Sort by due date (earliest first) and take top 5
    return items
      .sort((a, b) => a.dueDateRaw.getTime() - b.dueDateRaw.getTime())
      .slice(0, 5);
  }, [quotes, invoices]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-card-foreground">
            Upcoming Tasks
          </h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-secondary/30 p-3">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-card-foreground">
          Upcoming Tasks
        </h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming tasks</p>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {task.type === 'quote' ? (
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn('ml-2 capitalize shrink-0', priorityStyles[task.priority])}
              >
                {task.priority}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

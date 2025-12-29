import { Briefcase, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tenders = [
  {
    id: 1,
    title: 'Office Supplies Contract',
    organization: 'City Council',
    dueDate: 'Jan 5, 2025',
    value: '$45,000',
    status: 'open',
  },
  {
    id: 2,
    title: 'IT Infrastructure Upgrade',
    organization: 'TechCorp Inc',
    dueDate: 'Jan 10, 2025',
    value: '$120,000',
    status: 'open',
  },
  {
    id: 3,
    title: 'Marketing Services RFQ',
    organization: 'StartUp Labs',
    dueDate: 'Jan 15, 2025',
    value: '$25,000',
    status: 'open',
  },
];

const statusStyles = {
  open: 'bg-success/10 text-success border-success/20',
  submitted: 'bg-info/10 text-info border-info/20',
  won: 'bg-primary/10 text-primary border-primary/20',
  lost: 'bg-muted text-muted-foreground border-border',
};

export function TendersList() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-card-foreground">
          Active Tenders & RFQs
        </h3>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          View all
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {tenders.map((tender, index) => (
          <div
            key={tender.id}
            className="rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{tender.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {tender.organization}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn('capitalize', statusStyles[tender.status])}
              >
                {tender.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Due: {tender.dueDate}</span>
              <span className="font-semibold text-card-foreground">{tender.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

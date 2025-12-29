import { Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function TendersList() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-card-foreground">
          Active Tenders & RFQs
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-primary"
          onClick={() => navigate('/tenders')}
        >
          <Plus className="h-4 w-4" />
          Add Tender
        </Button>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-card-foreground mb-1">No tenders yet</h4>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Track tender opportunities and RFQ deadlines by adding them to your dashboard.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/tenders')}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Your First Tender
        </Button>
      </div>
    </div>
  );
}

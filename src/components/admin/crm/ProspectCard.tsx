import { AdminProspect } from '@/hooks/useAdminProspects';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface ProspectCardProps {
  prospect: AdminProspect;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-destructive/10 text-destructive',
};

export function ProspectCard({ prospect, onClick, onDragStart }: ProspectCardProps) {
  const isFollowUpDue = prospect.next_follow_up
    ? prospect.next_follow_up <= new Date().toISOString().split('T')[0]
    : false;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{prospect.company_name}</p>
          <p className="text-xs text-muted-foreground truncate">{prospect.contact_name}</p>
        </div>
        <Badge className={`text-xs shrink-0 ${priorityColors[prospect.priority]}`} variant="secondary">
          {prospect.priority}
        </Badge>
      </div>

      {/* Contact info */}
      {prospect.email && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{prospect.email}</span>
        </div>
      )}
      {prospect.phone && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Phone className="h-3 w-3 shrink-0" />
          <span>{prospect.phone}</span>
        </div>
      )}

      {/* Value & probability */}
      {(prospect.estimated_value > 0 || prospect.win_probability != null) && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
          {prospect.estimated_value > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <DollarSign className="h-3 w-3 text-success" />
              <span className="font-medium">{prospect.estimated_value.toLocaleString()}</span>
            </div>
          )}
          {prospect.win_probability != null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{prospect.win_probability}%</span>
            </div>
          )}
        </div>
      )}

      {/* Follow-up */}
      {prospect.next_follow_up && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs ${isFollowUpDue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Calendar className="h-3 w-3" />
          <span>{isFollowUpDue ? '⚠ Follow-up due: ' : 'Follow-up: '}{format(new Date(prospect.next_follow_up), 'dd MMM')}</span>
        </div>
      )}

      {/* Plan badge */}
      {prospect.interested_plan && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">{prospect.interested_plan}</Badge>
        </div>
      )}
    </div>
  );
}

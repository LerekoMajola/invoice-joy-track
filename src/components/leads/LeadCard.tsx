import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Lead, LEAD_STATUSES, useLeads } from '@/hooks/useLeads';
import { formatMaluti } from '@/lib/currency';
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { 
  MoreVertical, 
  Calendar, 
  Building2, 
  Phone, 
  Mail, 
  Star,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onAddActivity: (lead: Lead) => void;
}

export function LeadCard({ lead, onViewDetails, onAddActivity }: LeadCardProps) {
  const { updateLead, deleteLead } = useLeads();
  
  const status = LEAD_STATUSES.find(s => s.value === lead.status) || LEAD_STATUSES[0];
  const isOverdue = lead.next_follow_up && isPast(parseISO(lead.next_follow_up));
  const isHighPriority = lead.priority === 'high';
  const isHotLead = isHighPriority && (lead.estimated_value || 0) > 10000;

  const handleStatusChange = async (newStatus: string) => {
    await updateLead({ id: lead.id, status: newStatus });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(lead.id);
    }
  };

  return (
    <Card className={`relative transition-all hover:shadow-md ${isHotLead ? 'ring-2 ring-orange-400' : ''} ${isOverdue ? 'border-destructive/50' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
            <Badge variant="outline" className="text-xs">
              {status.label}
            </Badge>
            {isHighPriority && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(lead)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddActivity(lead)}>
                Add Note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-foreground truncate">{lead.name}</h3>
            {lead.company && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{lead.company}</span>
              </div>
            )}
          </div>

          {lead.estimated_value && (
            <div className="text-lg font-bold text-primary">
              {formatMaluti(lead.estimated_value)}
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {lead.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{lead.email}</span>
              </div>
            )}
          </div>

          {/* Follow-up Date */}
          {lead.next_follow_up && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>
                Follow-up: {format(parseISO(lead.next_follow_up), 'MMM d, yyyy')}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}

          {/* Created */}
          <div className="text-xs text-muted-foreground">
            Added {formatDistanceToNow(parseISO(lead.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onAddActivity(lead)}
          >
            Add Note
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                Status <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {LEAD_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  className={lead.status === s.value ? 'bg-accent' : ''}
                >
                  <div className={`w-2 h-2 rounded-full ${s.color} mr-2`} />
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

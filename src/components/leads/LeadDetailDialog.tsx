import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lead, LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES, useLeads } from '@/hooks/useLeads';
import { useLeadActivities, ACTIVITY_TYPES } from '@/hooks/useLeadActivities';
import { formatMaluti } from '@/lib/currency';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { 
  FileText, Phone, Mail, Users, Send, Clock, 
  Building2, Calendar, Star, UserPlus, Trash2
} from 'lucide-react';

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onAddActivity: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Phone,
  Mail,
  Users,
  Send,
  Clock,
};

export function LeadDetailDialog({ open, onOpenChange, lead, onAddActivity }: LeadDetailDialogProps) {
  const { updateLead, convertToClient } = useLeads();
  const { activities, isLoading: activitiesLoading, deleteActivity } = useLeadActivities(lead?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
  }, [lead]);

  if (!lead) return null;

  const status = LEAD_STATUSES.find(s => s.value === lead.status) || LEAD_STATUSES[0];

  const handleSave = async () => {
    const { id, user_id, created_at, updated_at, ...updates } = formData;
    await updateLead({ id: lead.id, ...updates });
    setIsEditing(false);
  };

  const handleConvert = async () => {
    if (confirm('Convert this lead to a client? This will create a new client record.')) {
      await convertToClient(lead);
      onOpenChange(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const activityType = ACTIVITY_TYPES.find(t => t.value === type);
    if (activityType) {
      const Icon = iconMap[activityType.icon];
      return Icon ? <Icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              <DialogTitle>{lead.name}</DialogTitle>
              {lead.priority === 'high' && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {lead.status !== 'won' && lead.status !== 'lost' && (
                <Button variant="outline" size="sm" onClick={handleConvert}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Convert to Client
                </Button>
              )}
            </div>
          </div>
          {lead.company && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {lead.company}
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activities">
              Activities ({activities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${s.color}`} />
                          {s.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Source</Label>
                <Select
                  value={formData.source || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estimated Value (M)</Label>
                <Input
                  type="number"
                  value={formData.estimated_value || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimated_value: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Next Follow-up</Label>
                <Input
                  type="date"
                  value={formData.next_follow_up || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_follow_up: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Company</Label>
                <Input
                  value={formData.company || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(parseISO(lead.created_at), { addSuffix: true })}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => { setFormData(lead); setIsEditing(false); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Lead
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Activity Timeline</h3>
              <Button size="sm" onClick={onAddActivity}>
                Add Activity
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {activitiesLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading activities...
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No activities recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const activityType = ACTIVITY_TYPES.find(t => t.value === activity.activity_type);
                    return (
                      <div key={activity.id} className="flex gap-3 group">
                        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {activityType?.label || activity.activity_type}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteActivity(activity.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mt-1 text-foreground">
                            {activity.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

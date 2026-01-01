import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeadActivities, ACTIVITY_TYPES } from '@/hooks/useLeadActivities';
import { Lead } from '@/hooks/useLeads';
import { FileText, Phone, Mail, Users, Send, Clock } from 'lucide-react';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const iconMap = {
  FileText,
  Phone,
  Mail,
  Users,
  Send,
  Clock,
};

export function AddActivityDialog({ open, onOpenChange, lead }: AddActivityDialogProps) {
  const { createActivity } = useLeadActivities(lead?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityType, setActivityType] = useState('note');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !content.trim()) return;

    setIsSubmitting(true);
    const result = await createActivity({
      lead_id: lead.id,
      activity_type: activityType,
      content: content.trim(),
    });
    setIsSubmitting(false);

    if (result) {
      setContent('');
      setActivityType('note');
      onOpenChange(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Progress Note</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Recording activity for <span className="font-medium">{lead.name}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activity_type">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => {
                  const Icon = iconMap[type.icon as keyof typeof iconMap];
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Details *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe what happened or what was discussed..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

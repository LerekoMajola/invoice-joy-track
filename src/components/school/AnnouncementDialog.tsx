import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SchoolClass } from '@/hooks/useSchoolClasses';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: SchoolClass[];
  onCreated: () => void;
}

export function AnnouncementDialog({ open, onOpenChange, classes, onCreated }: AnnouncementDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetClassId: '',
    isPublished: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('school_announcements').insert({
        user_id: user.id,
        title: form.title,
        message: form.message,
        target_class_id: form.targetClassId || null,
        is_published: form.isPublished,
        published_at: form.isPublished ? new Date().toISOString() : null,
      });

      if (error) throw error;
      toast.success('Announcement created');
      setForm({ title: '', message: '', targetClassId: '', isPublished: true });
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Announcement title" /></div>
          <div><Label>Message *</Label><Textarea value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} required rows={4} placeholder="Write your announcement..." /></div>
          <div>
            <Label>Target Audience</Label>
            <Select value={form.targetClassId} onValueChange={(v) => setForm(p => ({ ...p, targetClassId: v }))}>
              <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.filter(c => c.isActive).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Publish immediately</Label>
            <Switch checked={form.isPublished} onCheckedChange={(v) => setForm(p => ({ ...p, isPublished: v }))} />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

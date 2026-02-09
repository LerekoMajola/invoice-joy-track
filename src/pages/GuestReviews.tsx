import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Loader2 } from 'lucide-react';
import { useGuestReviews } from '@/hooks/useGuestReviews';
import { useBookings } from '@/hooks/useBookings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function GuestReviews() {
  const { reviews, isLoading, createReview, averageRating } = useGuestReviews();
  const { bookings } = useBookings();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ booking_id: '', rating: '5', comment: '', source: 'direct' });

  const handleSubmit = () => {
    if (!form.booking_id) return;
    createReview.mutate({
      booking_id: form.booking_id,
      rating: parseInt(form.rating),
      comment: form.comment || null,
      source: form.source,
    });
    setAddOpen(false);
    setForm({ booking_id: '', rating: '5', comment: '', source: 'direct' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Guest Reviews</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              {averageRating.toFixed(1)} average · {reviews.length} reviews
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Review</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : reviews.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.bookings?.guest_name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{review.bookings?.booking_number} · {format(new Date(review.created_at), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  <Badge variant="outline" className="mt-2 text-xs capitalize">{review.source.replace('_', ' ')}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Review</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Booking *</Label>
              <Select value={form.booking_id} onValueChange={v => setForm(p => ({ ...p, booking_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
                <SelectContent>
                  {bookings.filter(b => b.status === 'checked_out').map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.guest_name} — {b.booking_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={form.rating} onValueChange={v => setForm(p => ({ ...p, rating: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map(r => (<SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={v => setForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="booking_com">Booking.com</SelectItem>
                    <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} placeholder="Guest feedback..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.booking_id || createReview.isPending}>
              {createReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

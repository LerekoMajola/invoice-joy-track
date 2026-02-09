import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface GuestReview {
  id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  source: string;
  created_at: string;
  bookings?: { guest_name: string; booking_number: string };
}

export function useGuestReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['guest-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*, bookings(guest_name, booking_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GuestReview[];
    },
    enabled: !!user,
  });

  const createReview = useMutation({
    mutationFn: async (review: Omit<GuestReview, 'id' | 'user_id' | 'created_at' | 'bookings'>) => {
      const { error } = await supabase
        .from('guest_reviews')
        .insert({ ...review, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-reviews'] });
      toast.success('Review added');
    },
    onError: () => toast.error('Failed to add review'),
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('guest_reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-reviews'] });
      toast.success('Review deleted');
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return { reviews, isLoading, createReview, deleteReview, averageRating };
}

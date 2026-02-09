import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  booking_number: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  guest_id_number: string | null;
  num_guests: number;
  check_in: string;
  check_out: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
  status: string;
  total: number;
  deposit_paid: number;
  meal_plan: string;
  special_requests: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  rooms?: { room_number: string; name: string };
}

export function useBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, rooms(room_number, name)')
        .order('check_in', { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const createBooking = useMutation({
    mutationFn: async (booking: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'rooms'>) => {
      const { error } = await supabase
        .from('bookings')
        .insert({ ...booking, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created');
    },
    onError: () => toast.error('Failed to create booking'),
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
      const { rooms: _, ...clean } = updates as any;
      const { error } = await supabase
        .from('bookings')
        .update(clean)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking updated');
    },
    onError: () => toast.error('Failed to update booking'),
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking deleted');
    },
    onError: () => toast.error('Failed to delete booking'),
  });

  const checkIn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'checked_in', actual_check_in: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Guest checked in');
    },
  });

  const checkOut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'checked_out', actual_check_out: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Guest checked out');
    },
  });

  return { bookings, isLoading, createBooking, updateBooking, deleteBooking, checkIn, checkOut };
}

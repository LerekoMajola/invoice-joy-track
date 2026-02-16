import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface DeliveryNoteItem {
  id: string;
  description: string;
  quantity: number;
}

export interface DeliveryNote {
  id: string;
  noteNumber: string;
  clientId: string | null;
  invoiceId: string | null;
  clientName: string;
  date: string;
  deliveryAddress: string | null;
  status: 'pending' | 'delivered';
  items: DeliveryNoteItem[];
  createdAt: string;
  updatedAt: string;
}

interface DeliveryNoteInsert {
  clientId?: string;
  invoiceId?: string;
  clientName: string;
  date: string;
  deliveryAddress?: string;
  status?: 'pending' | 'delivered';
  items: Omit<DeliveryNoteItem, 'id'>[];
}

export function useDeliveryNotes() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async (): Promise<User | null> => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (sessionUser) return sessionUser;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  };

  const fetchDeliveryNotes = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      setDeliveryNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('delivery_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }

      const { data: notesData, error: notesError } = await query;
      if (notesError) throw notesError;

      const noteIds = (notesData || []).map((n) => n.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('delivery_note_items')
        .select('*')
        .in('delivery_note_id', noteIds.length > 0 ? noteIds : ['']);

      if (itemsError) throw itemsError;

      const itemsByNote: Record<string, DeliveryNoteItem[]> = {};
      (itemsData || []).forEach((item) => {
        if (!itemsByNote[item.delivery_note_id]) {
          itemsByNote[item.delivery_note_id] = [];
        }
        itemsByNote[item.delivery_note_id].push({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
        });
      });

      setDeliveryNotes(
        (notesData || []).map((n) => ({
          id: n.id,
          noteNumber: n.note_number,
          clientId: n.client_id,
          invoiceId: n.invoice_id,
          clientName: n.client_name,
          date: n.date,
          deliveryAddress: n.delivery_address,
          status: n.status as DeliveryNote['status'],
          items: itemsByNote[n.id] || [],
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      toast.error('Failed to load delivery notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryNotes();
  }, [user, activeCompanyId]);

  const generateNoteNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('delivery_notes')
      .select('note_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (data && data.length > 0) {
      const match = data[0].note_number.match(/DN-(\d+)/);
      if (match) {
        lastNum = parseInt(match[1], 10);
      }
    }
    return `DN-${String(lastNum + 1).padStart(4, '0')}`;
  };

  const createDeliveryNote = async (note: DeliveryNoteInsert): Promise<DeliveryNote | null> => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      toast.error('You must be logged in to create a delivery note');
      return null;
    }

    try {
      const noteNumber = await generateNoteNumber();

      const { data: noteData, error: noteError } = await supabase
        .from('delivery_notes')
        .insert({
          user_id: activeUser.id,
          company_profile_id: activeCompanyId || null,
          note_number: noteNumber,
          client_id: note.clientId || null,
          invoice_id: note.invoiceId || null,
          client_name: note.clientName,
          date: note.date,
          delivery_address: note.deliveryAddress || null,
          status: note.status || 'pending',
        })
        .select()
        .single();

      if (noteError) throw noteError;

      const itemsToInsert = note.items.map((item) => ({
        delivery_note_id: noteData.id,
        description: item.description,
        quantity: item.quantity,
      }));

      const { data: itemsData, error: itemsError } = await supabase
        .from('delivery_note_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      const newNote: DeliveryNote = {
        id: noteData.id,
        noteNumber: noteData.note_number,
        clientId: noteData.client_id,
        invoiceId: noteData.invoice_id,
        clientName: noteData.client_name,
        date: noteData.date,
        deliveryAddress: noteData.delivery_address,
        status: noteData.status as DeliveryNote['status'],
        items: (itemsData || []).map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
        })),
        createdAt: noteData.created_at,
        updatedAt: noteData.updated_at,
      };

      setDeliveryNotes((prev) => [newNote, ...prev]);
      toast.success('Delivery note created successfully');
      return newNote;
    } catch (error) {
      console.error('Error creating delivery note:', error);
      toast.error('Failed to create delivery note');
      return null;
    }
  };

  const updateDeliveryNote = async (
    id: string,
    updates: Partial<Omit<DeliveryNoteInsert, 'items'>> & { items?: DeliveryNoteItem[] }
  ): Promise<boolean> => {
    try {
      const { error: noteError } = await supabase
        .from('delivery_notes')
        .update({
          client_id: updates.clientId,
          client_name: updates.clientName,
          date: updates.date,
          delivery_address: updates.deliveryAddress,
          status: updates.status,
        })
        .eq('id', id);

      if (noteError) throw noteError;

      if (updates.items) {
        await supabase.from('delivery_note_items').delete().eq('delivery_note_id', id);
        const itemsToInsert = updates.items.map((item) => ({
          delivery_note_id: id,
          description: item.description,
          quantity: item.quantity,
        }));
        await supabase.from('delivery_note_items').insert(itemsToInsert);
      }

      await fetchDeliveryNotes();
      toast.success('Delivery note updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating delivery note:', error);
      toast.error('Failed to update delivery note');
      return false;
    }
  };

  const deleteDeliveryNote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('delivery_notes').delete().eq('id', id);
      if (error) throw error;
      setDeliveryNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Delivery note deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting delivery note:', error);
      toast.error('Failed to delete delivery note');
      return false;
    }
  };

  const markAsDelivered = async (id: string): Promise<boolean> => {
    return updateDeliveryNote(id, { status: 'delivered' });
  };

  return {
    deliveryNotes,
    isLoading,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    markAsDelivered,
    refetch: fetchDeliveryNotes,
  };
}

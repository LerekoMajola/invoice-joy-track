import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface LegalCaseNote {
  id: string;
  caseId: string;
  content: string;
  noteType: string;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useLegalCaseNotes(caseId?: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LegalCaseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = async () => {
    if (!user) { setNotes([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('legal_case_notes').select('*').order('created_at', { ascending: false });
      if (caseId) query = query.eq('case_id', caseId);
      const { data, error } = await query;
      if (error) throw error;
      setNotes((data || []).map(n => ({
        id: n.id,
        caseId: n.case_id,
        content: n.content,
        noteType: n.note_type,
        isConfidential: n.is_confidential ?? false,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching case notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [user, caseId]);

  const createNote = async (note: { caseId: string; content: string; noteType: string; isConfidential?: boolean }) => {
    if (!user) return false;
    const { error } = await supabase.from('legal_case_notes').insert({
      user_id: user.id,
      case_id: note.caseId,
      content: note.content,
      note_type: note.noteType,
      is_confidential: note.isConfidential ?? false,
    });
    if (error) { toast.error('Failed to add note'); return false; }
    toast.success('Note added');
    fetchNotes();
    return true;
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('legal_case_notes').delete().eq('id', id);
    if (error) { toast.error('Failed to delete note'); return false; }
    toast.success('Note deleted');
    fetchNotes();
    return true;
  };

  return { notes, isLoading, refetch: fetchNotes, createNote, deleteNote };
}

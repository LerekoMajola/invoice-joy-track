import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string | null;
  classTeacherId: string | null;
  capacity: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useSchoolClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async () => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (sessionUser) return sessionUser;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  };

  const fetchAll = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      setClasses([]);
      setTerms([]);
      setIsLoading(false);
      return;
    }

    try {
      const [classRes, termRes] = await Promise.all([
        supabase.from('school_classes').select('*').order('sort_order', { ascending: true }),
        supabase.from('academic_terms').select('*').order('start_date', { ascending: false }),
      ]);

      if (classRes.error) throw classRes.error;
      if (termRes.error) throw termRes.error;

      setClasses(
        (classRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          gradeLevel: c.grade_level,
          classTeacherId: c.class_teacher_id,
          capacity: c.capacity,
          isActive: c.is_active,
          sortOrder: c.sort_order,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }))
      );

      setTerms(
        (termRes.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          startDate: t.start_date,
          endDate: t.end_date,
          isCurrent: t.is_current,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching school data:', error);
      toast.error('Failed to load school data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  // ===== Classes CRUD =====
  const createClass = async (data: { name: string; gradeLevel?: string; classTeacherId?: string; capacity?: number }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      const { data: newClass, error } = await supabase
        .from('school_classes')
        .insert({
          user_id: activeUser.id,
          name: data.name,
          grade_level: data.gradeLevel || null,
          class_teacher_id: data.classTeacherId || null,
          capacity: data.capacity || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Class created');
      return newClass;
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
      return null;
    }
  };

  const updateClass = async (id: string, updates: Partial<{ name: string; gradeLevel: string; classTeacherId: string; capacity: number; isActive: boolean }>) => {
    try {
      const { error } = await supabase
        .from('school_classes')
        .update({
          name: updates.name,
          grade_level: updates.gradeLevel,
          class_teacher_id: updates.classTeacherId,
          capacity: updates.capacity,
          is_active: updates.isActive,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchAll();
      toast.success('Class updated');
      return true;
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
      return false;
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase.from('school_classes').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Class deleted');
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
      return false;
    }
  };

  // ===== Terms CRUD =====
  const createTerm = async (data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      // If marking as current, unset others first
      if (data.isCurrent) {
        await supabase
          .from('academic_terms')
          .update({ is_current: false })
          .eq('user_id', activeUser.id);
      }

      const { data: newTerm, error } = await supabase
        .from('academic_terms')
        .insert({
          user_id: activeUser.id,
          name: data.name,
          start_date: data.startDate,
          end_date: data.endDate,
          is_current: data.isCurrent || false,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Term created');
      return newTerm;
    } catch (error) {
      console.error('Error creating term:', error);
      toast.error('Failed to create term');
      return null;
    }
  };

  const updateTerm = async (id: string, updates: Partial<{ name: string; startDate: string; endDate: string; isCurrent: boolean }>) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return false;

    try {
      if (updates.isCurrent) {
        await supabase
          .from('academic_terms')
          .update({ is_current: false })
          .eq('user_id', activeUser.id);
      }

      const { error } = await supabase
        .from('academic_terms')
        .update({
          name: updates.name,
          start_date: updates.startDate,
          end_date: updates.endDate,
          is_current: updates.isCurrent,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchAll();
      toast.success('Term updated');
      return true;
    } catch (error) {
      console.error('Error updating term:', error);
      toast.error('Failed to update term');
      return false;
    }
  };

  const deleteTerm = async (id: string) => {
    try {
      const { error } = await supabase.from('academic_terms').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Term deleted');
      return true;
    } catch (error) {
      console.error('Error deleting term:', error);
      toast.error('Failed to delete term');
      return false;
    }
  };

  const currentTerm = terms.find((t) => t.isCurrent) || null;

  return {
    classes,
    terms,
    currentTerm,
    isLoading,
    createClass,
    updateClass,
    deleteClass,
    createTerm,
    updateTerm,
    deleteTerm,
    refetch: fetchAll,
  };
}

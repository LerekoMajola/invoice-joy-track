import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Subject {
  id: string;
  name: string;
  shortCode: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  periodId: string;
  teacherId: string | null;
  dayOfWeek: number;
  room: string | null;
  createdAt: string;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function useTimetable() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
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

  const fetchAll = useCallback(async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      setSubjects([]);
      setPeriods([]);
      setEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      const [subRes, perRes, entRes] = await Promise.all([
        supabase.from('school_subjects').select('*').order('name'),
        supabase.from('school_periods').select('*').order('sort_order'),
        supabase.from('timetable_entries').select('*'),
      ]);

      if (subRes.error) throw subRes.error;
      if (perRes.error) throw perRes.error;
      if (entRes.error) throw entRes.error;

      setSubjects(
        (subRes.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          shortCode: s.short_code,
          color: s.color,
          isActive: s.is_active,
          createdAt: s.created_at,
        }))
      );

      setPeriods(
        (perRes.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          startTime: p.start_time,
          endTime: p.end_time,
          isBreak: p.is_break,
          sortOrder: p.sort_order,
          createdAt: p.created_at,
        }))
      );

      setEntries(
        (entRes.data || []).map((e) => ({
          id: e.id,
          classId: e.class_id,
          subjectId: e.subject_id,
          periodId: e.period_id,
          teacherId: e.teacher_id,
          dayOfWeek: e.day_of_week,
          room: e.room,
          createdAt: e.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      toast.error('Failed to load timetable data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ===== Subjects CRUD =====
  const createSubject = async (data: { name: string; shortCode?: string; color?: string }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      const { data: newSubject, error } = await supabase
        .from('school_subjects')
        .insert({
          user_id: activeUser.id,
          name: data.name,
          short_code: data.shortCode || null,
          color: data.color || '#6366f1',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Subject created');
      return newSubject;
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject');
      return null;
    }
  };

  const updateSubject = async (id: string, updates: Partial<{ name: string; shortCode: string; color: string; isActive: boolean }>) => {
    try {
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.shortCode !== undefined) updateData.short_code = updates.shortCode;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase.from('school_subjects').update(updateData).eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Subject updated');
      return true;
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error('Failed to update subject');
      return false;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase.from('school_subjects').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Subject deleted');
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
      return false;
    }
  };

  // ===== Periods CRUD =====
  const createPeriod = async (data: { name: string; startTime: string; endTime: string; isBreak?: boolean; sortOrder?: number }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      const { data: newPeriod, error } = await supabase
        .from('school_periods')
        .insert({
          user_id: activeUser.id,
          name: data.name,
          start_time: data.startTime,
          end_time: data.endTime,
          is_break: data.isBreak || false,
          sort_order: data.sortOrder ?? periods.length,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Period created');
      return newPeriod;
    } catch (error) {
      console.error('Error creating period:', error);
      toast.error('Failed to create period');
      return null;
    }
  };

  const updatePeriod = async (id: string, updates: Partial<{ name: string; startTime: string; endTime: string; isBreak: boolean; sortOrder: number }>) => {
    try {
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
      if (updates.isBreak !== undefined) updateData.is_break = updates.isBreak;
      if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

      const { error } = await supabase.from('school_periods').update(updateData).eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Period updated');
      return true;
    } catch (error) {
      console.error('Error updating period:', error);
      toast.error('Failed to update period');
      return false;
    }
  };

  const deletePeriod = async (id: string) => {
    try {
      const { error } = await supabase.from('school_periods').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Period deleted');
      return true;
    } catch (error) {
      console.error('Error deleting period:', error);
      toast.error('Failed to delete period');
      return false;
    }
  };

  // ===== Timetable Entries CRUD =====
  const createEntry = async (data: { classId: string; subjectId: string; periodId: string; teacherId?: string; dayOfWeek: number; room?: string }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      const { data: newEntry, error } = await supabase
        .from('timetable_entries')
        .insert({
          user_id: activeUser.id,
          class_id: data.classId,
          subject_id: data.subjectId,
          period_id: data.periodId,
          teacher_id: data.teacherId || null,
          day_of_week: data.dayOfWeek,
          room: data.room || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Timetable entry added');
      return newEntry;
    } catch (error: any) {
      console.error('Error creating entry:', error);
      if (error.code === '23505') {
        toast.error('This slot already has a subject assigned');
      } else {
        toast.error('Failed to add timetable entry');
      }
      return null;
    }
  };

  const updateEntry = async (id: string, updates: Partial<{ subjectId: string; teacherId: string | null; room: string | null }>) => {
    try {
      const updateData: Record<string, any> = {};
      if (updates.subjectId !== undefined) updateData.subject_id = updates.subjectId;
      if (updates.teacherId !== undefined) updateData.teacher_id = updates.teacherId;
      if (updates.room !== undefined) updateData.room = updates.room;

      const { error } = await supabase.from('timetable_entries').update(updateData).eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Timetable entry updated');
      return true;
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update entry');
      return false;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Timetable entry removed');
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to remove entry');
      return false;
    }
  };

  // Helper: get entry for a specific slot
  const getEntry = (classId: string, periodId: string, dayOfWeek: number) => {
    return entries.find(
      (e) => e.classId === classId && e.periodId === periodId && e.dayOfWeek === dayOfWeek
    ) || null;
  };

  // Helper: count entries for a subject
  const getSubjectEntryCount = (subjectId: string) => {
    return entries.filter((e) => e.subjectId === subjectId).length;
  };

  return {
    subjects,
    periods,
    entries,
    isLoading,
    createSubject,
    updateSubject,
    deleteSubject,
    createPeriod,
    updatePeriod,
    deletePeriod,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getSubjectEntryCount,
    refetch: fetchAll,
    DAY_NAMES,
  };
}

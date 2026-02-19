import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface GymClass {
  id: string;
  name: string;
  description: string | null;
  instructor: string | null;
  category: string;
  maxCapacity: number;
  durationMinutes: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GymClassInsert {
  name: string;
  description?: string;
  instructor?: string;
  category?: string;
  maxCapacity?: number;
  durationMinutes?: number;
  color?: string;
  isActive?: boolean;
}

export interface GymClassSchedule {
  id: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  instructorOverride: string | null;
  maxCapacityOverride: number | null;
  isActive: boolean;
  // joined
  className?: string;
  classColor?: string;
  classInstructor?: string;
  classDuration?: number;
  classMaxCapacity?: number;
}

export interface GymClassScheduleInsert {
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  instructorOverride?: string;
  maxCapacityOverride?: number;
}

export function useGymClasses() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [schedules, setSchedules] = useState<GymClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getActiveUser = async () => {
    if (user) return user;
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.user ?? null;
  };

  const fetchClasses = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) { setClasses([]); setIsLoading(false); return; }

    try {
      let query = (supabase.from('gym_classes') as any).select('*').order('name');
      if (activeCompanyId) query = query.eq('company_profile_id', activeCompanyId);
      const { data, error } = await query;
      if (error) throw error;

      setClasses((data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        instructor: c.instructor,
        category: c.category,
        maxCapacity: c.max_capacity,
        durationMinutes: c.duration_minutes,
        color: c.color || '#6366f1',
        isActive: c.is_active,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching gym classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) { setSchedules([]); return; }

    try {
      let query = (supabase.from('gym_class_schedules') as any)
        .select('*, gym_classes(name, color, instructor, duration_minutes, max_capacity)')
        .order('day_of_week').order('start_time');
      if (activeCompanyId) query = query.eq('company_profile_id', activeCompanyId);
      const { data, error } = await query;
      if (error) throw error;

      setSchedules((data || []).map((s: any) => ({
        id: s.id,
        classId: s.class_id,
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time,
        instructorOverride: s.instructor_override,
        maxCapacityOverride: s.max_capacity_override,
        isActive: s.is_active,
        className: s.gym_classes?.name,
        classColor: s.gym_classes?.color,
        classInstructor: s.gym_classes?.instructor,
        classDuration: s.gym_classes?.duration_minutes,
        classMaxCapacity: s.gym_classes?.max_capacity,
      })));
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSchedules();

    const channel = supabase
      .channel('gym-classes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_classes' }, () => {
        fetchClasses();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gym_class_schedules' }, () => {
        fetchSchedules();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCompanyId]);

  const createClass = async (cls: GymClassInsert): Promise<boolean> => {
    const activeUser = await getActiveUser();
    if (!activeUser) { toast.error('You must be logged in'); return false; }

    try {
      const { error } = await (supabase.from('gym_classes') as any).insert({
        user_id: activeUser.id,
        company_profile_id: activeCompanyId || null,
        name: cls.name,
        description: cls.description || null,
        instructor: cls.instructor || null,
        category: cls.category || 'general',
        max_capacity: cls.maxCapacity ?? 20,
        duration_minutes: cls.durationMinutes ?? 60,
        color: cls.color || '#6366f1',
        is_active: cls.isActive ?? true,
      });
      if (error) throw error;
      await fetchClasses();
      toast.success('Class created');
      return true;
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
      return false;
    }
  };

  const updateClass = async (id: string, updates: Partial<GymClassInsert>): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.instructor !== undefined) dbUpdates.instructor = updates.instructor || null;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.maxCapacity !== undefined) dbUpdates.max_capacity = updates.maxCapacity;
      if (updates.durationMinutes !== undefined) dbUpdates.duration_minutes = updates.durationMinutes;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await (supabase.from('gym_classes') as any).update(dbUpdates).eq('id', id);
      if (error) throw error;
      await fetchClasses();
      toast.success('Class updated');
      return true;
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
      return false;
    }
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase.from('gym_classes') as any).delete().eq('id', id);
      if (error) throw error;
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success('Class removed');
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to remove class');
      return false;
    }
  };

  const createSchedule = async (schedule: GymClassScheduleInsert): Promise<boolean> => {
    const activeUser = await getActiveUser();
    if (!activeUser) { toast.error('You must be logged in'); return false; }

    try {
      const { error } = await (supabase.from('gym_class_schedules') as any).insert({
        user_id: activeUser.id,
        company_profile_id: activeCompanyId || null,
        class_id: schedule.classId,
        day_of_week: schedule.dayOfWeek,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        instructor_override: schedule.instructorOverride || null,
        max_capacity_override: schedule.maxCapacityOverride || null,
      });
      if (error) throw error;
      await fetchSchedules();
      toast.success('Schedule added');
      return true;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to add schedule');
      return false;
    }
  };

  const deleteSchedule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase.from('gym_class_schedules') as any).delete().eq('id', id);
      if (error) throw error;
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success('Schedule removed');
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to remove schedule');
      return false;
    }
  };

  return {
    classes, schedules, isLoading,
    createClass, updateClass, deleteClass,
    createSchedule, deleteSchedule,
    refetch: () => { fetchClasses(); fetchSchedules(); },
  };
}

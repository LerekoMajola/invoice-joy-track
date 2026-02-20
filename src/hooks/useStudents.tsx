import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { toast } from 'sonner';

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  classId: string | null;
  enrollmentDate: string | null;
  status: 'active' | 'graduated' | 'withdrawn' | 'suspended';
  address: string | null;
  medicalNotes: string | null;
  photoUrl: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  guardianRelationship: string | null;
  secondaryGuardianName: string | null;
  secondaryGuardianPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  portalUserId: string | null;
}

interface StudentInsert {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  classId?: string;
  enrollmentDate?: string;
  status?: Student['status'];
  address?: string;
  medicalNotes?: string;
  photoUrl?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  secondaryGuardianName?: string;
  secondaryGuardianPhone?: string;
  notes?: string;
}

export function useStudents() {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const [students, setStudents] = useState<Student[]>([]);
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

  const fetchStudents = async () => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      setStudents([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase.from('students').select('*').order('created_at', { ascending: false });
      if (activeCompanyId) {
        query = query.eq('company_profile_id', activeCompanyId);
      }
      const { data, error } = await query;

      setStudents(
        (data || []).map((s: any) => ({
          id: s.id,
          admissionNumber: s.admission_number,
          firstName: s.first_name,
          lastName: s.last_name,
          dateOfBirth: s.date_of_birth,
          gender: s.gender,
          classId: s.class_id,
          enrollmentDate: s.enrollment_date,
          status: s.status as Student['status'],
          address: s.address,
          medicalNotes: s.medical_notes,
          photoUrl: s.photo_url,
          guardianName: s.guardian_name,
          guardianPhone: s.guardian_phone,
          guardianEmail: s.guardian_email,
          guardianRelationship: s.guardian_relationship,
          secondaryGuardianName: s.secondary_guardian_name,
          secondaryGuardianPhone: s.secondary_guardian_phone,
          notes: s.notes,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
          portalUserId: s.portal_user_id || null,
        }))
      );
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    const channel = supabase
      .channel('students-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeCompanyId]);

  const generateAdmissionNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('students')
      .select('admission_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (data && data.length > 0) {
      const match = data[0].admission_number.match(/STU-(\d+)/);
      if (match) lastNum = parseInt(match[1], 10);
    }
    return `STU-${String(lastNum + 1).padStart(4, '0')}`;
  };

  const createStudent = async (student: StudentInsert): Promise<Student | null> => {
    const activeUser = await getActiveUser();
    if (!activeUser) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const admissionNumber = await generateAdmissionNumber();
      const { data, error } = await supabase
        .from('students')
        .insert({
          user_id: activeUser.id,
          company_profile_id: activeCompanyId || null,
          admission_number: admissionNumber,
          first_name: student.firstName,
          last_name: student.lastName,
          date_of_birth: student.dateOfBirth || null,
          gender: student.gender || null,
          class_id: student.classId || null,
          enrollment_date: student.enrollmentDate || null,
          status: student.status || 'active',
          address: student.address || null,
          medical_notes: student.medicalNotes || null,
          photo_url: student.photoUrl || null,
          guardian_name: student.guardianName || null,
          guardian_phone: student.guardianPhone || null,
          guardian_email: student.guardianEmail || null,
          guardian_relationship: student.guardianRelationship || null,
          secondary_guardian_name: student.secondaryGuardianName || null,
          secondary_guardian_phone: student.secondaryGuardianPhone || null,
          notes: student.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newStudent: Student = {
        id: data.id,
        admissionNumber: data.admission_number,
        firstName: data.first_name,
        lastName: data.last_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        classId: data.class_id,
        enrollmentDate: data.enrollment_date,
        status: data.status as Student['status'],
        address: data.address,
        medicalNotes: data.medical_notes,
        photoUrl: data.photo_url,
        guardianName: data.guardian_name,
        guardianPhone: data.guardian_phone,
        guardianEmail: data.guardian_email,
        guardianRelationship: data.guardian_relationship,
        secondaryGuardianName: data.secondary_guardian_name,
        secondaryGuardianPhone: data.secondary_guardian_phone,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        portalUserId: data.portal_user_id || null,
      };

      setStudents((prev) => [newStudent, ...prev]);
      toast.success('Student added successfully');
      return newStudent;
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Failed to add student');
      return null;
    }
  };

  const updateStudent = async (id: string, updates: Partial<StudentInsert>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          date_of_birth: updates.dateOfBirth,
          gender: updates.gender,
          class_id: updates.classId,
          enrollment_date: updates.enrollmentDate,
          status: updates.status,
          address: updates.address,
          medical_notes: updates.medicalNotes,
          photo_url: updates.photoUrl,
          guardian_name: updates.guardianName,
          guardian_phone: updates.guardianPhone,
          guardian_email: updates.guardianEmail,
          guardian_relationship: updates.guardianRelationship,
          secondary_guardian_name: updates.secondaryGuardianName,
          secondary_guardian_phone: updates.secondaryGuardianPhone,
          notes: updates.notes,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchStudents();
      toast.success('Student updated');
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
      return false;
    }
  };

  const deleteStudent = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success('Student removed');
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to remove student');
      return false;
    }
  };

  return {
    students,
    isLoading,
    createStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FeeSchedule {
  id: string;
  termId: string;
  classId: string | null;
  feeType: string;
  amount: number;
  isOptional: boolean;
  createdAt: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  termId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
}

export function useSchoolFees() {
  const { user } = useAuth();
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
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
      setFeeSchedules([]);
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      const [schedRes, payRes] = await Promise.all([
        supabase.from('fee_schedules').select('*').order('created_at', { ascending: false }),
        supabase.from('student_fee_payments').select('*').order('payment_date', { ascending: false }),
      ]);

      if (schedRes.error) throw schedRes.error;
      if (payRes.error) throw payRes.error;

      setFeeSchedules(
        (schedRes.data || []).map((f: any) => ({
          id: f.id,
          termId: f.term_id,
          classId: f.class_id,
          feeType: f.fee_type,
          amount: Number(f.amount),
          isOptional: f.is_optional,
          createdAt: f.created_at,
        }))
      );

      setPayments(
        (payRes.data || []).map((p: any) => ({
          id: p.id,
          studentId: p.student_id,
          termId: p.term_id,
          amount: Number(p.amount),
          paymentDate: p.payment_date,
          paymentMethod: p.payment_method,
          referenceNumber: p.reference_number,
          notes: p.notes,
          createdAt: p.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast.error('Failed to load fee data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('school-fees-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fee_schedules' }, () => {
        fetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_fee_payments' }, () => {
        fetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // ===== Fee Schedules =====
  const createFeeSchedule = async (data: { termId: string; classId?: string; feeType: string; amount: number; isOptional?: boolean }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      const { data: newFee, error } = await supabase
        .from('fee_schedules')
        .insert({
          user_id: activeUser.id,
          term_id: data.termId,
          class_id: data.classId || null,
          fee_type: data.feeType,
          amount: data.amount,
          is_optional: data.isOptional || false,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Fee schedule added');
      return newFee;
    } catch (error) {
      console.error('Error creating fee schedule:', error);
      toast.error('Failed to add fee schedule');
      return null;
    }
  };

  const deleteFeeSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from('fee_schedules').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Fee schedule removed');
      return true;
    } catch (error) {
      console.error('Error deleting fee schedule:', error);
      toast.error('Failed to remove fee schedule');
      return false;
    }
  };

  // ===== Payments =====
  const recordPayment = async (data: {
    studentId: string;
    termId: string;
    amount: number;
    paymentDate: string;
    paymentMethod?: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    const activeUser = await getActiveUser();
    if (!activeUser) return null;

    try {
      const { data: newPayment, error } = await supabase
        .from('student_fee_payments')
        .insert({
          user_id: activeUser.id,
          student_id: data.studentId,
          term_id: data.termId,
          amount: data.amount,
          payment_date: data.paymentDate,
          payment_method: data.paymentMethod || null,
          reference_number: data.referenceNumber || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAll();
      toast.success('Payment recorded');
      return newPayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
      return null;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase.from('student_fee_payments').delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast.success('Payment deleted');
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
      return false;
    }
  };

  // ===== Computed Stats =====
  const getTermStats = (termId: string, students: { id: string; classId: string | null }[]) => {
    const termSchedules = feeSchedules.filter((f) => f.termId === termId);
    const termPayments = payments.filter((p) => p.termId === termId);

    // Calculate total expected fees
    let totalExpected = 0;
    students.forEach((student) => {
      termSchedules.forEach((schedule) => {
        if (!schedule.isOptional) {
          if (!schedule.classId || schedule.classId === student.classId) {
            totalExpected += schedule.amount;
          }
        }
      });
    });

    const totalCollected = termPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return { totalExpected, totalCollected, totalOutstanding, collectionRate };
  };

  const getStudentBalance = (studentId: string, termId: string, studentClassId: string | null) => {
    const termSchedules = feeSchedules.filter((f) => f.termId === termId);
    const studentPayments = payments.filter((p) => p.studentId === studentId && p.termId === termId);

    let totalOwed = 0;
    termSchedules.forEach((schedule) => {
      if (!schedule.isOptional) {
        if (!schedule.classId || schedule.classId === studentClassId) {
          totalOwed += schedule.amount;
        }
      }
    });

    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    return { totalOwed, totalPaid, balance: totalOwed - totalPaid };
  };

  return {
    feeSchedules,
    payments,
    isLoading,
    createFeeSchedule,
    deleteFeeSchedule,
    recordPayment,
    deletePayment,
    getTermStats,
    getStudentBalance,
    refetch: fetchAll,
  };
}

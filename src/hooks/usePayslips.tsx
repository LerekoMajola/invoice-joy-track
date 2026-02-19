import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export type PayslipStatus = 'draft' | 'approved' | 'paid';

export interface AllowanceDeduction {
  name: string;
  amount: number;
}

export interface Payslip {
  id: string;
  staffMemberId: string;
  staffName?: string;
  staffDepartment?: string;
  staffEmployeeNumber?: string | null;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  basicSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  allowances: AllowanceDeduction[];
  totalAllowances: number;
  deductions: AllowanceDeduction[];
  totalDeductions: number;
  grossPay: number;
  netPay: number;
  status: PayslipStatus;
  notes: string | null;
  createdAt: string;
}

export interface CreatePayslipData {
  staffMemberId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  basicSalary: number;
  overtimeHours?: number;
  overtimeRate?: number;
  allowances?: AllowanceDeduction[];
  deductions?: AllowanceDeduction[];
  notes?: string;
}

export interface UpdatePayslipData {
  payPeriodStart?: string;
  payPeriodEnd?: string;
  paymentDate?: string;
  basicSalary?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  allowances?: AllowanceDeduction[];
  deductions?: AllowanceDeduction[];
  status?: PayslipStatus;
  notes?: string;
}

function parseAllowanceDeduction(data: Json): AllowanceDeduction[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    if (typeof item === 'object' && item !== null && 'name' in item && 'amount' in item) {
      return {
        name: String(item.name),
        amount: Number(item.amount) || 0,
      };
    }
    return { name: '', amount: 0 };
  }).filter(item => item.name);
}

export function usePayslips() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPayslips = useCallback(async () => {
    if (!user) {
      setPayslips([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payslips')
        .select(`
          *,
          staff_members (
            name,
            department,
            employee_number
          )
        `)
        .eq('owner_user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      const mapped: Payslip[] = (data || []).map((p) => ({
        id: p.id,
        staffMemberId: p.staff_member_id,
        staffName: p.staff_members?.name || 'Unknown',
        staffDepartment: p.staff_members?.department || undefined,
        staffEmployeeNumber: (p.staff_members as any)?.employee_number || null,
        payPeriodStart: p.pay_period_start,
        payPeriodEnd: p.pay_period_end,
        paymentDate: p.payment_date,
        basicSalary: Number(p.basic_salary) || 0,
        overtimeHours: Number(p.overtime_hours) || 0,
        overtimeRate: Number(p.overtime_rate) || 0,
        overtimeAmount: Number(p.overtime_amount) || 0,
        allowances: parseAllowanceDeduction(p.allowances),
        totalAllowances: Number(p.total_allowances) || 0,
        deductions: parseAllowanceDeduction(p.deductions),
        totalDeductions: Number(p.total_deductions) || 0,
        grossPay: Number(p.gross_pay) || 0,
        netPay: Number(p.net_pay) || 0,
        status: p.status as PayslipStatus,
        notes: p.notes,
        createdAt: p.created_at,
      }));

      setPayslips(mapped);
    } catch (error: any) {
      console.error('Error fetching payslips:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payslips',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  const calculateTotals = (data: CreatePayslipData | UpdatePayslipData) => {
    const basicSalary = data.basicSalary || 0;
    const overtimeHours = data.overtimeHours || 0;
    const overtimeRate = data.overtimeRate || 0;
    const overtimeAmount = overtimeHours * overtimeRate;
    
    const totalAllowances = (data.allowances || []).reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = (data.deductions || []).reduce((sum, d) => sum + d.amount, 0);
    
    const grossPay = basicSalary + overtimeAmount + totalAllowances;
    const netPay = grossPay - totalDeductions;

    return { overtimeAmount, totalAllowances, totalDeductions, grossPay, netPay };
  };

  const createPayslip = async (data: CreatePayslipData): Promise<Payslip | null> => {
    if (!user) return null;

    try {
      const totals = calculateTotals(data);

      const { data: payslipData, error } = await supabase
        .from('payslips')
        .insert({
          owner_user_id: user.id,
          staff_member_id: data.staffMemberId,
          pay_period_start: data.payPeriodStart,
          pay_period_end: data.payPeriodEnd,
          payment_date: data.paymentDate,
          basic_salary: data.basicSalary,
          overtime_hours: data.overtimeHours || 0,
          overtime_rate: data.overtimeRate || 0,
          overtime_amount: totals.overtimeAmount,
          allowances: (data.allowances || []) as unknown as Json,
          total_allowances: totals.totalAllowances,
          deductions: (data.deductions || []) as unknown as Json,
          total_deductions: totals.totalDeductions,
          gross_pay: totals.grossPay,
          net_pay: totals.netPay,
          notes: data.notes || null,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payslip created successfully',
      });

      await fetchPayslips();
      return payslips.find(p => p.id === payslipData.id) || null;
    } catch (error: any) {
      console.error('Error creating payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payslip',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePayslip = async (id: string, data: UpdatePayslipData): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, any> = {};
      
      if (data.payPeriodStart !== undefined) updateData.pay_period_start = data.payPeriodStart;
      if (data.payPeriodEnd !== undefined) updateData.pay_period_end = data.payPeriodEnd;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate;
      if (data.basicSalary !== undefined) updateData.basic_salary = data.basicSalary;
      if (data.overtimeHours !== undefined) updateData.overtime_hours = data.overtimeHours;
      if (data.overtimeRate !== undefined) updateData.overtime_rate = data.overtimeRate;
      if (data.allowances !== undefined) updateData.allowances = data.allowances;
      if (data.deductions !== undefined) updateData.deductions = data.deductions;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;

      // Recalculate totals if needed
      if (data.basicSalary !== undefined || data.overtimeHours !== undefined || 
          data.overtimeRate !== undefined || data.allowances !== undefined || 
          data.deductions !== undefined) {
        const existingPayslip = payslips.find(p => p.id === id);
        if (existingPayslip) {
          const mergedData = {
            basicSalary: data.basicSalary ?? existingPayslip.basicSalary,
            overtimeHours: data.overtimeHours ?? existingPayslip.overtimeHours,
            overtimeRate: data.overtimeRate ?? existingPayslip.overtimeRate,
            allowances: data.allowances ?? existingPayslip.allowances,
            deductions: data.deductions ?? existingPayslip.deductions,
          };
          const totals = calculateTotals(mergedData);
          updateData.overtime_amount = totals.overtimeAmount;
          updateData.total_allowances = totals.totalAllowances;
          updateData.total_deductions = totals.totalDeductions;
          updateData.gross_pay = totals.grossPay;
          updateData.net_pay = totals.netPay;
        }
      }

      const { error } = await supabase
        .from('payslips')
        .update(updateData)
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payslip updated successfully',
      });

      await fetchPayslips();
      return true;
    } catch (error: any) {
      console.error('Error updating payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payslip',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletePayslip = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('payslips')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;

      setPayslips(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Payslip deleted successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payslip',
        variant: 'destructive',
      });
      return false;
    }
  };

  const approvePayslip = async (id: string): Promise<boolean> => {
    return updatePayslip(id, { status: 'approved' });
  };

  const markAsPaid = async (id: string): Promise<boolean> => {
    const payslip = payslips.find(p => p.id === id);
    const result = await updatePayslip(id, { status: 'paid' });

    // Auto-record to accounting ledger
    if (result && payslip && user) {
      try {
        await supabase.from('accounting_transactions').insert({
          user_id: user.id,
          transaction_type: 'expense',
          reference_type: 'payroll',
          reference_id: id,
          date: payslip.paymentDate,
          amount: payslip.netPay,
          description: `Payroll — ${payslip.staffName || 'Staff'}`,
        });
      } catch (err) {
        console.error('Error auto-recording payroll transaction:', err);
      }
    }

    return result;
  };

  return {
    payslips,
    isLoading,
    createPayslip,
    updatePayslip,
    deletePayslip,
    approvePayslip,
    markAsPaid,
    refetch: fetchPayslips,
  };
}

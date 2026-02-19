import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllowanceDeduction, CreatePayslipData, Payslip } from '@/hooks/usePayslips';
import { StaffMember } from '@/hooks/useStaff';
import { formatMaluti } from '@/lib/currency';
import { format, startOfMonth, endOfMonth, lastDayOfMonth } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

interface GeneratePayslipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember[];
  createPayslip: (data: CreatePayslipData) => Promise<Payslip | null>;
  onSuccess?: () => void;
}

export function GeneratePayslipDialog({ open, onOpenChange, staff, createPayslip, onSuccess }: GeneratePayslipDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const today = new Date();
  const defaultStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const defaultEnd = format(endOfMonth(today), 'yyyy-MM-dd');
  const defaultPaymentDate = format(lastDayOfMonth(today), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    staffMemberId: '',
    payPeriodStart: defaultStart,
    payPeriodEnd: defaultEnd,
    paymentDate: defaultPaymentDate,
    basicSalary: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    notes: '',
  });

  const [allowances, setAllowances] = useState<AllowanceDeduction[]>([]);
  const [deductions, setDeductions] = useState<AllowanceDeduction[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        staffMemberId: '',
        payPeriodStart: defaultStart,
        payPeriodEnd: defaultEnd,
        paymentDate: defaultPaymentDate,
        basicSalary: 0,
        overtimeHours: 0,
        overtimeRate: 0,
        notes: '',
      });
      setAllowances([]);
      setDeductions([]);
    }
  }, [open, defaultStart, defaultEnd, defaultPaymentDate]);

  // Calculate totals
  const overtimeAmount = formData.overtimeHours * formData.overtimeRate;
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const grossPay = formData.basicSalary + overtimeAmount + totalAllowances;
  const netPay = grossPay - totalDeductions;

  const addAllowance = () => {
    setAllowances([...allowances, { name: '', amount: 0 }]);
  };

  const removeAllowance = (index: number) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  const updateAllowance = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...allowances];
    updated[index] = { ...updated[index], [field]: value };
    setAllowances(updated);
  };

  const addDeduction = () => {
    setDeductions([...deductions, { name: '', amount: 0 }]);
  };

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const updateDeduction = (index: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: value };
    setDeductions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffMemberId) return;

    setIsSubmitting(true);
    try {
      const result = await createPayslip({
        staffMemberId: formData.staffMemberId,
        payPeriodStart: formData.payPeriodStart,
        payPeriodEnd: formData.payPeriodEnd,
        paymentDate: formData.paymentDate,
        basicSalary: formData.basicSalary,
        overtimeHours: formData.overtimeHours,
        overtimeRate: formData.overtimeRate,
        allowances: allowances.filter(a => a.name && a.amount > 0),
        deductions: deductions.filter(d => d.name && d.amount > 0),
        notes: formData.notes || undefined,
      });
      if (result) {
        onSuccess?.();
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Payslip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee & Period */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff">Employee *</Label>
              <Select 
                value={formData.staffMemberId} 
                onValueChange={(v) => setFormData({ ...formData, staffMemberId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.department ? `(${s.department})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodStart">Period Start *</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.payPeriodStart}
                onChange={(e) => setFormData({ ...formData, payPeriodStart: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period End *</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.payPeriodEnd}
                onChange={(e) => setFormData({ ...formData, payPeriodEnd: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Earnings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Earnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">Basic Salary *</Label>
                  <Input
                    id="basicSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basicSalary || ''}
                    onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtimeHours">Overtime Hours</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.overtimeHours || ''}
                    onChange={(e) => setFormData({ ...formData, overtimeHours: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtimeRate">Overtime Rate</Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.overtimeRate || ''}
                    onChange={(e) => setFormData({ ...formData, overtimeRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Allowances */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Allowances</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAllowance}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {allowances.map((allowance, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Name (e.g. Transport)"
                      value={allowance.name}
                      onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                      value={allowance.amount || ''}
                      onChange={(e) => updateAllowance(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAllowance(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Deductions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Deductions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDeduction}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {deductions.map((deduction, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name (e.g. PAYE Tax)"
                    value={deduction.name}
                    onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={deduction.amount || ''}
                    onChange={(e) => updateDeduction(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDeduction(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span>{formatMaluti(formData.basicSalary)}</span>
                </div>
                {overtimeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Overtime ({formData.overtimeHours} hrs)</span>
                    <span>{formatMaluti(overtimeAmount)}</span>
                  </div>
                )}
                {totalAllowances > 0 && (
                  <div className="flex justify-between">
                    <span>Allowances</span>
                    <span>{formatMaluti(totalAllowances)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Gross Pay</span>
                  <span>{formatMaluti(grossPay)}</span>
                </div>
                {totalDeductions > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Deductions</span>
                    <span>-{formatMaluti(totalDeductions)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Net Pay</span>
                  <span>{formatMaluti(netPay)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.staffMemberId}>
              {isSubmitting ? 'Creating...' : 'Create Payslip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

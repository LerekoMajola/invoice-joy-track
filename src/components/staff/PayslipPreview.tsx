import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Payslip } from '@/hooks/usePayslips';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { formatMaluti } from '@/lib/currency';
import { format } from 'date-fns';
import { Download, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface PayslipPreviewProps {
  payslip: Payslip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayslipPreview({ payslip, open, onOpenChange }: PayslipPreviewProps) {
  const { profile } = useCompanyProfile();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!payslip) return null;

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: `payslip-${payslip.staffName?.replace(/\s+/g, '-')}-${format(new Date(payslip.payPeriodEnd), 'yyyy-MM')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    await html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    if (!contentRef.current) return;
    const printContent = contentRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${payslip.staffName}</title>
            <style>
              body { font-family: 'DM Sans', sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px 12px; text-align: left; }
              .text-right { text-align: right; }
              .border-t { border-top: 1px solid #e5e7eb; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 1.125rem; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'approved': return 'default';
      case 'paid': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Payslip Preview</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={contentRef} className="space-y-6 p-4 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              {profile?.logo_url && (
                <img 
                  src={profile.logo_url} 
                  alt="Company Logo" 
                  className="h-12 mb-2"
                />
              )}
              <h1 className="text-xl font-bold">{profile?.company_name || 'Company Name'}</h1>
              {profile?.address_line_1 && (
                <p className="text-sm text-muted-foreground">{profile.address_line_1}</p>
              )}
              {profile?.city && (
                <p className="text-sm text-muted-foreground">
                  {profile.city}{profile.postal_code ? `, ${profile.postal_code}` : ''}
                </p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary">PAYSLIP</h2>
              <p className="text-sm text-muted-foreground">
                Period: {format(new Date(payslip.payPeriodStart), 'dd MMM')} - {format(new Date(payslip.payPeriodEnd), 'dd MMM yyyy')}
              </p>
              <Badge 
                variant={getStatusColor(payslip.status) as "default" | "secondary"} 
                className={payslip.status === 'paid' ? 'bg-green-500' : payslip.status === 'approved' ? 'bg-blue-500' : ''}
              >
                {payslip.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee</p>
              <p className="font-semibold">{payslip.staffName}</p>
              {payslip.staffDepartment && (
                <p className="text-sm text-muted-foreground">Department: {payslip.staffDepartment}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Payment Date</p>
              <p className="font-semibold">{format(new Date(payslip.paymentDate), 'dd MMMM yyyy')}</p>
            </div>
          </div>

          {/* Earnings */}
          <div>
            <h3 className="font-semibold mb-3 text-primary">EARNINGS</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1">Basic Salary</td>
                  <td className="py-1 text-right">{formatMaluti(payslip.basicSalary)}</td>
                </tr>
                {payslip.overtimeAmount > 0 && (
                  <tr>
                    <td className="py-1">Overtime ({payslip.overtimeHours} hrs @ {formatMaluti(payslip.overtimeRate)}/hr)</td>
                    <td className="py-1 text-right">{formatMaluti(payslip.overtimeAmount)}</td>
                  </tr>
                )}
                {payslip.allowances.map((allowance, index) => (
                  <tr key={index}>
                    <td className="py-1">{allowance.name}</td>
                    <td className="py-1 text-right">{formatMaluti(allowance.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td className="py-2">Gross Pay</td>
                  <td className="py-2 text-right">{formatMaluti(payslip.grossPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          {payslip.deductions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-primary">DEDUCTIONS</h3>
              <table className="w-full">
                <tbody>
                  {payslip.deductions.map((deduction, index) => (
                    <tr key={index}>
                      <td className="py-1">{deduction.name}</td>
                      <td className="py-1 text-right text-destructive">-{formatMaluti(deduction.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td className="py-2">Total Deductions</td>
                    <td className="py-2 text-right text-destructive">-{formatMaluti(payslip.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Net Pay */}
          <div className="border-t border-b py-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">NET PAY</span>
              <span className="text-2xl font-bold text-primary">{formatMaluti(payslip.netPay)}</span>
            </div>
          </div>

          {/* Notes */}
          {payslip.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground">Notes:</p>
              <p>{payslip.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>Generated on {format(new Date(), 'dd MMMM yyyy')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

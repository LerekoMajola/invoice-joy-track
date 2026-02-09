import {
  Stethoscope, CheckCircle, Play, FileText, Receipt, Package,
} from 'lucide-react';
import type { JobCardStatus } from '@/hooks/useJobCards';

interface NextAction {
  label: string;
  nextStatus?: JobCardStatus;
  icon: any;
  isSpecial?: 'quote' | 'invoice';
}

export function getNextAction(status: JobCardStatus, hasLineItems: boolean): NextAction | null {
  switch (status) {
    case 'received':
      return { label: 'Start Diagnosis', nextStatus: 'diagnosing', icon: Stethoscope };
    case 'diagnosing':
      return { label: 'Mark Diagnosed', nextStatus: 'diagnosed', icon: CheckCircle };
    case 'diagnosed':
      return { label: 'Create Quote', icon: FileText, isSpecial: 'quote' };
    case 'quoted':
      return { label: 'Mark Approved', nextStatus: 'approved', icon: CheckCircle };
    case 'approved':
      return { label: 'Start Work', nextStatus: 'in_progress', icon: Play };
    case 'in_progress':
      return { label: 'Mark Completed', nextStatus: 'completed', icon: CheckCircle };
    case 'quality_check':
      return { label: 'Mark Completed', nextStatus: 'completed', icon: CheckCircle };
    case 'completed':
      return hasLineItems
        ? { label: 'Create Invoice', icon: Receipt, isSpecial: 'invoice' }
        : null;
    case 'invoiced':
      return { label: 'Mark Collected', nextStatus: 'collected', icon: Package };
    default:
      return null;
  }
}

export function getWhatsAppMessage(
  status: JobCardStatus,
  clientName: string,
  vehicleReg: string | null,
  jobCardNumber: string,
): string {
  const vehicle = vehicleReg ? ` (${vehicleReg})` : '';
  const ref = `Job ${jobCardNumber}`;

  switch (status) {
    case 'received':
      return `Hi ${clientName}, we've received your vehicle${vehicle}. ${ref} has been created. We'll start the diagnosis shortly.`;
    case 'diagnosing':
      return `Hi ${clientName}, we've started diagnosing your vehicle${vehicle}. ${ref} is in progress — we'll update you once we know more.`;
    case 'diagnosed':
      return `Hi ${clientName}, diagnosis on your vehicle${vehicle} is complete. We'll prepare a quote for you shortly. ${ref}.`;
    case 'quoted':
      return `Hi ${clientName}, a quote for your vehicle${vehicle} has been sent. Please review and let us know if you'd like to proceed. ${ref}.`;
    case 'approved':
      return `Hi ${clientName}, your quote for${vehicle} has been approved! We'll begin work shortly. ${ref}.`;
    case 'in_progress':
      return `Hi ${clientName}, work has started on your vehicle${vehicle}. We'll keep you posted on progress. ${ref}.`;
    case 'awaiting_parts':
      return `Hi ${clientName}, we're waiting for parts for your vehicle${vehicle}. We'll resume work as soon as they arrive. ${ref}.`;
    case 'quality_check':
      return `Hi ${clientName}, your vehicle${vehicle} is undergoing a final quality check. Almost done! ${ref}.`;
    case 'completed':
      return `Hi ${clientName}, great news! Your vehicle${vehicle} is ready for collection. ${ref}.`;
    case 'invoiced':
      return `Hi ${clientName}, an invoice for your vehicle${vehicle} has been prepared. ${ref}. Please let us know if you have any questions.`;
    case 'collected':
      return `Hi ${clientName}, thank you for collecting your vehicle${vehicle}. We appreciate your business! ${ref}.`;
    default:
      return `Hi ${clientName}, here's an update on your vehicle${vehicle}. ${ref}.`;
  }
}

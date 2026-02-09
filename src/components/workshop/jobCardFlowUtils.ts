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

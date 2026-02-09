import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import {
  Car, Wrench, Plus, Trash2, Save, FileText, Receipt,
  Eye, Stethoscope, Play, Pause, CheckCircle, Package, MoreHorizontal, PlusCircle, MessageCircle
} from 'lucide-react';
import type { JobCard, JobCardLineItem, JobCardStatus } from '@/hooks/useJobCards';
import { JobCardPreview } from './JobCardPreview';
import { JobCardProgressStepper } from './JobCardProgressStepper';
import { QuickAddCost } from './QuickAddCost';
import { getNextAction, getWhatsAppMessage } from './jobCardFlowUtils';
import { supabase } from '@/integrations/supabase/client';

const statusConfig: Record<JobCardStatus, { label: string; color: string }> = {
  received: { label: 'Received', color: 'bg-muted text-muted-foreground' },
  diagnosing: { label: 'Diagnosing', color: 'bg-info/10 text-info' },
  diagnosed: { label: 'Diagnosed', color: 'bg-warning/10 text-warning' },
  quoted: { label: 'Quoted', color: 'bg-accent/10 text-accent-foreground' },
  approved: { label: 'Approved', color: 'bg-success/10 text-success' },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary' },
  awaiting_parts: { label: 'Awaiting Parts', color: 'bg-warning/10 text-warning' },
  quality_check: { label: 'Quality Check', color: 'bg-info/10 text-info' },
  completed: { label: 'Completed', color: 'bg-success/10 text-success' },
  invoiced: { label: 'Invoiced', color: 'bg-success/10 text-success' },
  collected: { label: 'Collected', color: 'bg-muted text-muted-foreground' },
};

const allStatuses: { label: string; status: JobCardStatus; icon: any }[] = [
  { label: 'Received', status: 'received', icon: Car },
  { label: 'Diagnosing', status: 'diagnosing', icon: Stethoscope },
  { label: 'Diagnosed', status: 'diagnosed', icon: CheckCircle },
  { label: 'In Progress', status: 'in_progress', icon: Play },
  { label: 'Awaiting Parts', status: 'awaiting_parts', icon: Pause },
  { label: 'Quality Check', status: 'quality_check', icon: Eye },
  { label: 'Completed', status: 'completed', icon: CheckCircle },
  { label: 'Collected', status: 'collected', icon: Package },
];

interface JobCardDetailDialogProps {
  jobCard: JobCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateJobCard: (id: string, updates: Record<string, any>) => Promise<boolean>;
  onUpdateStatus: (id: string, status: JobCardStatus) => Promise<boolean>;
  onAddLineItem: (jobCardId: string, item: Omit<JobCardLineItem, 'id'>) => Promise<boolean>;
  onRemoveLineItem: (jobCardId: string, lineItemId: string) => Promise<boolean>;
  onGenerateQuote: (jobCard: JobCard) => void;
  onGenerateInvoice: (jobCard: JobCard) => void;
}

export function JobCardDetailDialog({
  jobCard,
  open,
  onOpenChange,
  onUpdateJobCard,
  onUpdateStatus,
  onAddLineItem,
  onRemoveLineItem,
  onGenerateQuote,
  onGenerateInvoice,
}: JobCardDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'diagnosis' | 'items' | 'preview'>('details');
  const [diagnosis, setDiagnosis] = useState('');
  const [recommendedWork, setRecommendedWork] = useState('');
  const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [clientPhone, setClientPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!jobCard?.clientId) { setClientPhone(null); return; }
    supabase.from('clients').select('phone').eq('id', jobCard.clientId).single()
      .then(({ data }) => setClientPhone(data?.phone ?? null));
  }, [jobCard?.clientId]);

  // Line item form
  const [newItemType, setNewItemType] = useState<'parts' | 'labour'>('parts');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPartNumber, setNewItemPartNumber] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  if (!jobCard) return null;

  const status = statusConfig[jobCard.status] || statusConfig.received;
  const partsItems = jobCard.lineItems.filter((i) => i.itemType === 'parts');
  const labourItems = jobCard.lineItems.filter((i) => i.itemType === 'labour');
  const partsSubtotal = partsItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const labourSubtotal = labourItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotal = partsSubtotal + labourSubtotal;
  const tax = subtotal * (jobCard.taxRate / 100);
  const total = subtotal + tax;

  const nextAction = getNextAction(jobCard.status, jobCard.lineItems.length > 0);

  const handleSaveDiagnosis = async () => {
    setIsSavingDiagnosis(true);
    await onUpdateJobCard(jobCard.id, {
      diagnosis: diagnosis || jobCard.diagnosis,
      recommendedWork: recommendedWork || jobCard.recommendedWork,
    });
    setIsSavingDiagnosis(false);
  };

  const handleAddLineItem = async () => {
    if (!newItemDesc.trim() || !newItemPrice) return;
    await onAddLineItem(jobCard.id, {
      itemType: newItemType,
      description: newItemDesc,
      partNumber: newItemPartNumber || null,
      quantity: Number(newItemQty) || 1,
      unitPrice: Number(newItemPrice) || 0,
    });
    setNewItemDesc('');
    setNewItemPartNumber('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const handleNextAction = () => {
    if (!nextAction) return;
    if (nextAction.isSpecial === 'quote') {
      onGenerateQuote(jobCard);
    } else if (nextAction.isSpecial === 'invoice') {
      onGenerateInvoice(jobCard);
    } else if (nextAction.nextStatus) {
      onUpdateStatus(jobCard.id, nextAction.nextStatus);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[100dvh] md:h-auto md:max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Sticky Header */}
        <div className="px-4 pt-4 pb-2 border-b border-border shrink-0">
          <DialogHeader className="mb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4 text-primary" />
                {jobCard.jobCardNumber}
              </DialogTitle>
              <Badge className={cn('capitalize text-xs', status.color)}>{status.label}</Badge>
            </div>
          </DialogHeader>

          {/* Progress Stepper */}
          <div className="mb-2">
            <JobCardProgressStepper status={jobCard.status} />
          </div>

          {/* Tab Nav */}
          <div className="flex gap-1">
            {[
              { key: 'details', label: 'Details', icon: Car },
              { key: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
              { key: 'items', label: 'Parts & Labour', icon: Wrench },
              { key: 'preview', label: 'Preview', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Client</Label>
                  <p className="font-medium text-sm">{jobCard.clientName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge variant="outline" className="capitalize text-xs">{jobCard.priority}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Vehicle Info</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { label: 'Reg', value: jobCard.vehicleReg },
                    { label: 'Make', value: jobCard.vehicleMake },
                    { label: 'Model', value: jobCard.vehicleModel },
                    { label: 'Year', value: jobCard.vehicleYear },
                    { label: 'VIN', value: jobCard.vehicleVin },
                    { label: 'Mileage', value: jobCard.vehicleMileage },
                    { label: 'Color', value: jobCard.vehicleColor },
                  ].map((field) => field.value && (
                    <div key={field.label}>
                      <p className="text-[10px] text-muted-foreground">{field.label}</p>
                      <p className="text-xs font-medium">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {jobCard.reportedIssue && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Reported Issue</Label>
                    <p className="text-sm mt-0.5 whitespace-pre-line">{jobCard.reportedIssue}</p>
                  </div>
                </>
              )}

              {jobCard.assignedTechnicianName && (
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned Technician</Label>
                  <p className="text-sm font-medium">{jobCard.assignedTechnicianName}</p>
                </div>
              )}

              {jobCard.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-0.5 whitespace-pre-line">{jobCard.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis Tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-3">
              <div>
                <Label>Diagnosis Notes</Label>
                <Textarea
                  defaultValue={jobCard.diagnosis || ''}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="What did the technician find wrong?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Recommended Work</Label>
                <Textarea
                  defaultValue={jobCard.recommendedWork || ''}
                  onChange={(e) => setRecommendedWork(e.target.value)}
                  placeholder="What work needs to be done?"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveDiagnosis} disabled={isSavingDiagnosis} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          )}

          {/* Parts & Labour Tab */}
          {activeTab === 'items' && (
            <div className="space-y-3">
              {/* Add Item Form */}
              <div className="rounded-lg border border-border p-2.5 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">Add Item</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newItemType} onValueChange={(v) => setNewItemType(v as 'parts' | 'labour')}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parts">Parts</SelectItem>
                      <SelectItem value="labour">Labour</SelectItem>
                    </SelectContent>
                  </Select>
                  {newItemType === 'parts' && (
                    <Input
                      value={newItemPartNumber}
                      onChange={(e) => setNewItemPartNumber(e.target.value)}
                      placeholder="Part number"
                      className="h-9"
                    />
                  )}
                </div>
                <Input
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Description"
                  className="h-9"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} placeholder="Qty" min="1" className="h-9" />
                  <Input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Unit price" min="0" step="0.01" className="h-9" />
                  <Button onClick={handleAddLineItem} disabled={!newItemDesc.trim() || !newItemPrice} size="sm" className="h-9">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Parts List */}
              {partsItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Parts</h4>
                  <div className="space-y-1">
                    {partsItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-card border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.description}</p>
                          {item.partNumber && <p className="text-[10px] text-muted-foreground">Part #: {item.partNumber}</p>}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{item.quantity} × {formatMaluti(item.unitPrice)}</span>
                          <span className="font-medium">{formatMaluti(item.quantity * item.unitPrice)}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemoveLineItem(jobCard.id, item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-xs font-medium text-muted-foreground pr-8">Parts: {formatMaluti(partsSubtotal)}</div>
                  </div>
                </div>
              )}

              {/* Labour List */}
              {labourItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Labour</h4>
                  <div className="space-y-1">
                    {labourItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-card border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{item.quantity} hrs × {formatMaluti(item.unitPrice)}</span>
                          <span className="font-medium">{formatMaluti(item.quantity * item.unitPrice)}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemoveLineItem(jobCard.id, item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-xs font-medium text-muted-foreground pr-8">Labour: {formatMaluti(labourSubtotal)}</div>
                  </div>
                </div>
              )}

              {/* Totals */}
              {jobCard.lineItems.length > 0 && (
                <div className="border-t border-border pt-2 space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatMaluti(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">VAT ({jobCard.taxRate}%)</span>
                    <span>{formatMaluti(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Total</span>
                    <span>{formatMaluti(total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <JobCardPreview jobCard={jobCard} />
          )}
        </div>

        {/* Quick Add Cost Panel */}
        <QuickAddCost
          open={showQuickAdd}
          onOpenChange={setShowQuickAdd}
          onAddItem={(item) => onAddLineItem(jobCard.id, item)}
        />

        {/* Sticky Bottom Action Bar */}
        <div className="shrink-0 border-t border-border px-4 py-3 flex items-center gap-2 bg-background safe-area-bottom">
          {/* Running Total */}
          <div className="flex flex-col mr-auto">
            <span className="text-[10px] text-muted-foreground leading-tight">Total</span>
            <span className="text-sm font-bold">{formatMaluti(total)}</span>
          </div>

          {/* WhatsApp Alert */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                    disabled={!clientPhone}
                    onClick={() => {
                      if (!clientPhone) return;
                      const clean = clientPhone.replace(/\D/g, '');
                      const msg = getWhatsAppMessage(jobCard.status, jobCard.clientName, jobCard.vehicleReg, jobCard.jobCardNumber);
                      const link = document.createElement('a');
                      link.href = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {clientPhone ? 'Send WhatsApp update' : 'No phone number on file'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Quick Add Cost Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allStatuses.map((action) => (
                <DropdownMenuItem
                  key={action.status}
                  onClick={() => onUpdateStatus(jobCard.id, action.status)}
                  disabled={jobCard.status === action.status}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Next Step Button */}
          {nextAction && (
            <Button onClick={handleNextAction} size="sm" className="shrink-0">
              <nextAction.icon className="h-4 w-4 mr-1" />
              {nextAction.label}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

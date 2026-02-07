import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import {
  Car, Wrench, Plus, Trash2, Save, FileText, Receipt,
  ChevronDown, Eye, Stethoscope, Play, Pause, CheckCircle, Package
} from 'lucide-react';
import type { JobCard, JobCardLineItem, JobCardStatus } from '@/hooks/useJobCards';
import { JobCardPreview } from './JobCardPreview';

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

  // Line item form
  const [newItemType, setNewItemType] = useState<'parts' | 'labour'>('parts');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPartNumber, setNewItemPartNumber] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  if (!jobCard) return null;

  const status = statusConfig[jobCard.status] || statusConfig.received;

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

  const partsItems = jobCard.lineItems.filter((i) => i.itemType === 'parts');
  const labourItems = jobCard.lineItems.filter((i) => i.itemType === 'labour');
  const partsSubtotal = partsItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const labourSubtotal = labourItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotal = partsSubtotal + labourSubtotal;
  const tax = subtotal * (jobCard.taxRate / 100);
  const total = subtotal + tax;

  const statusActions: { label: string; status: JobCardStatus; icon: any }[] = [
    { label: 'Start Diagnosis', status: 'diagnosing', icon: Stethoscope },
    { label: 'Mark Diagnosed', status: 'diagnosed', icon: CheckCircle },
    { label: 'Start Work', status: 'in_progress', icon: Play },
    { label: 'Awaiting Parts', status: 'awaiting_parts', icon: Pause },
    { label: 'Quality Check', status: 'quality_check', icon: Eye },
    { label: 'Mark Completed', status: 'completed', icon: CheckCircle },
    { label: 'Mark Collected', status: 'collected', icon: Package },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              {jobCard.jobCardNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn('capitalize', status.color)}>{status.label}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Update Status <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusActions.map((action) => (
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
            </div>
          </div>
        </DialogHeader>

        {/* Tab Nav */}
        <div className="flex gap-1 border-b border-border">
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
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Client</Label>
                <p className="font-medium">{jobCard.clientName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Badge variant="outline" className="capitalize">{jobCard.priority}</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Vehicle Info</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { label: 'Registration', value: jobCard.vehicleReg },
                  { label: 'Make', value: jobCard.vehicleMake },
                  { label: 'Model', value: jobCard.vehicleModel },
                  { label: 'Year', value: jobCard.vehicleYear },
                  { label: 'VIN', value: jobCard.vehicleVin },
                  { label: 'Mileage', value: jobCard.vehicleMileage },
                  { label: 'Color', value: jobCard.vehicleColor },
                ].map((field) => field.value && (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {jobCard.reportedIssue && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Reported Issue</Label>
                  <p className="text-sm mt-1 whitespace-pre-line">{jobCard.reportedIssue}</p>
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
                <p className="text-sm mt-1 whitespace-pre-line">{jobCard.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Diagnosis Tab */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-4">
            <div>
              <Label>Diagnosis Notes</Label>
              <Textarea
                defaultValue={jobCard.diagnosis || ''}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="What did the technician find wrong?"
                rows={4}
              />
            </div>
            <div>
              <Label>Recommended Work</Label>
              <Textarea
                defaultValue={jobCard.recommendedWork || ''}
                onChange={(e) => setRecommendedWork(e.target.value)}
                placeholder="What work needs to be done?"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveDiagnosis} disabled={isSavingDiagnosis}>
                <Save className="h-4 w-4 mr-2" />
                Save Diagnosis
              </Button>
              {(jobCard.status === 'diagnosed' || jobCard.diagnosis) && (
                <Button variant="outline" onClick={() => onGenerateQuote(jobCard)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Quote
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Parts & Labour Tab */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Add Item Form */}
            <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Add Item</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={newItemType} onValueChange={(v) => setNewItemType(v as 'parts' | 'labour')}>
                  <SelectTrigger>
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
                  />
                )}
              </div>
              <Input
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Description"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  placeholder="Qty"
                  min="1"
                />
                <Input
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Unit price"
                  min="0"
                  step="0.01"
                />
                <Button onClick={handleAddLineItem} disabled={!newItemDesc.trim() || !newItemPrice}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Parts List */}
            {partsItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parts</h4>
                <div className="space-y-1">
                  {partsItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.description}</p>
                        {item.partNumber && <p className="text-xs text-muted-foreground">Part #: {item.partNumber}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{item.quantity} × {formatMaluti(item.unitPrice)}</span>
                        <span className="font-medium">{formatMaluti(item.quantity * item.unitPrice)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onRemoveLineItem(jobCard.id, item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-sm font-medium text-muted-foreground pr-10">
                    Parts subtotal: {formatMaluti(partsSubtotal)}
                  </div>
                </div>
              </div>
            )}

            {/* Labour List */}
            {labourItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Labour</h4>
                <div className="space-y-1">
                  {labourItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{item.quantity} hrs × {formatMaluti(item.unitPrice)}</span>
                        <span className="font-medium">{formatMaluti(item.quantity * item.unitPrice)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onRemoveLineItem(jobCard.id, item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-sm font-medium text-muted-foreground pr-10">
                    Labour subtotal: {formatMaluti(labourSubtotal)}
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            {jobCard.lineItems.length > 0 && (
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMaluti(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT ({jobCard.taxRate}%)</span>
                  <span>{formatMaluti(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatMaluti(total)}</span>
                </div>
              </div>
            )}

            {/* Generate Invoice */}
            {['completed', 'quality_check'].includes(jobCard.status) && jobCard.lineItems.length > 0 && (
              <Button onClick={() => onGenerateInvoice(jobCard)} className="w-full">
                <Receipt className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            )}
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <JobCardPreview jobCard={jobCard} />
        )}
      </DialogContent>
    </Dialog>
  );
}

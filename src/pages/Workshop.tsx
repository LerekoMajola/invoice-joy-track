import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import {
  Wrench, MoreHorizontal, Eye, Trash2, Loader2, Search,
  Stethoscope, Play, Clock, CheckCircle, Car,
} from 'lucide-react';
import { useJobCards, type JobCard, type JobCardStatus } from '@/hooks/useJobCards';
import { CreateJobCardDialog } from '@/components/workshop/CreateJobCardDialog';
import { JobCardDetailDialog } from '@/components/workshop/JobCardDetailDialog';
import { toast } from 'sonner';
import { PaginationControls } from '@/components/shared/PaginationControls';

const ITEMS_PER_PAGE = 10;

const statusStyles: Record<string, string> = {
  received: 'bg-muted text-muted-foreground border-border',
  diagnosing: 'bg-info/10 text-info border-info/20',
  diagnosed: 'bg-warning/10 text-warning border-warning/20',
  quoted: 'bg-accent/10 text-accent-foreground border-accent/20',
  approved: 'bg-success/10 text-success border-success/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  awaiting_parts: 'bg-warning/10 text-warning border-warning/20',
  quality_check: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  invoiced: 'bg-success/10 text-success border-success/20',
  collected: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  received: 'Received',
  diagnosing: 'Diagnosing',
  diagnosed: 'Diagnosed',
  quoted: 'Quoted',
  approved: 'Approved',
  in_progress: 'In Progress',
  awaiting_parts: 'Awaiting Parts',
  quality_check: 'Quality Check',
  completed: 'Completed',
  invoiced: 'Invoiced',
  collected: 'Collected',
};

function JobCardCard({ jobCard, onView, onDelete }: { jobCard: JobCard; onView: () => void; onDelete: () => void }) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="mobile-card animate-slide-up" onClick={onView}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-card-foreground">{jobCard.jobCardNumber}</p>
            <p className="text-sm text-muted-foreground truncate">{jobCard.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[jobCard.status])}>
            {statusLabels[jobCard.status] || jobCard.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Car className="h-3.5 w-3.5" />
          <span>{jobCard.vehicleReg || 'No reg'}</span>
          {jobCard.vehicleMake && <span>• {jobCard.vehicleMake} {jobCard.vehicleModel || ''}</span>}
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(jobCard.createdAt)}</span>
      </div>
    </div>
  );
}

export default function Workshop() {
  const navigate = useNavigate();
  const { jobCards, isLoading, createJobCard, updateJobCard, updateStatus, addLineItem, removeLineItem, deleteJobCard } = useJobCards();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();

  const filtered = jobCards.filter((jc) => {
    const q = searchQuery.toLowerCase();
    return (
      jc.jobCardNumber.toLowerCase().includes(q) ||
      jc.clientName.toLowerCase().includes(q) ||
      (jc.vehicleReg || '').toLowerCase().includes(q) ||
      (jc.vehicleMake || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedFiltered = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleView = (jc: JobCard) => {
    setSelectedJobCard(jc);
    setDetailOpen(true);
  };

  const handleDelete = (id: string, number: string) => {
    openConfirmDialog({
      title: 'Delete Job Card',
      description: `Are you sure you want to delete ${number}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      action: async () => { await deleteJobCard(id); },
    });
  };

  const handleGenerateQuote = (jc: JobCard) => {
    const quoteData = {
      sourceJobCardId: jc.id,
      clientId: jc.clientId,
      clientName: jc.clientName,
      description: [jc.diagnosis, jc.recommendedWork].filter(Boolean).join('\n\n'),
      lineItems: jc.lineItems.map((item) => ({
        description: `${item.itemType === 'labour' ? '[Labour] ' : ''}${item.description}${item.partNumber ? ` (Part #${item.partNumber})` : ''}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: 0,
      })),
    };
    sessionStorage.setItem('newQuoteFromJobCard', JSON.stringify(quoteData));
    toast.success('Creating quote from job card');
    navigate('/quotes');
  };

  const handleGenerateInvoice = (jc: JobCard) => {
    const invoiceData = {
      sourceJobCardId: jc.id,
      clientId: jc.clientId,
      clientName: jc.clientName,
      description: `Work performed per Job Card ${jc.jobCardNumber}`,
      taxRate: jc.taxRate,
      lineItems: jc.lineItems.map((item) => ({
        description: `${item.itemType === 'labour' ? '[Labour] ' : ''}${item.description}${item.partNumber ? ` (Part #${item.partNumber})` : ''}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: 0,
      })),
    };
    sessionStorage.setItem('newInvoiceFromJobCard', JSON.stringify(invoiceData));
    toast.success('Creating invoice from job card');
    navigate('/invoices');
  };

  // Stats
  const totalJobs = jobCards.length;
  const diagnosing = jobCards.filter((jc) => jc.status === 'diagnosing').length;
  const inProgress = jobCards.filter((jc) => jc.status === 'in_progress').length;
  const awaitingParts = jobCards.filter((jc) => jc.status === 'awaiting_parts').length;
  const completed = jobCards.filter((jc) => ['completed', 'invoiced', 'collected'].includes(jc.status)).length;

  // Sync selected with latest data
  const currentSelected = selectedJobCard ? jobCards.find((jc) => jc.id === selectedJobCard.id) || selectedJobCard : null;

  return (
    <DashboardLayout>
      <Header
        title="Workshop"
        subtitle="Manage job cards and vehicle repairs"
        action={{ label: 'New Job Card', onClick: () => setCreateOpen(true) }}
      />

      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total Jobs', value: totalJobs, icon: Wrench, color: 'text-primary' },
            { label: 'Diagnosing', value: diagnosing, icon: Stethoscope, color: 'text-info' },
            { label: 'In Progress', value: inProgress, icon: Play, color: 'text-primary' },
            { label: 'Awaiting Parts', value: awaitingParts, icon: Clock, color: 'text-warning' },
            { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-success' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                <stat.icon className={cn('h-4 w-4', stat.color)} />
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
              <p className={cn('text-lg md:text-2xl font-display font-semibold mt-1', stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by job #, client, registration..."
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Wrench className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No job cards yet</p>
              <p className="text-sm">Create your first job card to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {paginatedFiltered.map((jc) => (
                <JobCardCard
                  key={jc.id}
                  jobCard={jc}
                  onView={() => handleView(jc)}
                  onDelete={() => handleDelete(jc.id, jc.jobCardNumber)}
                />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Job Card</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Vehicle</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFiltered.map((jc, index) => (
                    <TableRow
                      key={jc.id}
                      className="animate-slide-up cursor-pointer hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleView(jc)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Wrench className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{jc.jobCardNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{jc.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {jc.vehicleReg || '-'}
                        {jc.vehicleMake && ` • ${jc.vehicleMake}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize',
                          jc.priority === 'urgent' && 'bg-destructive/10 text-destructive border-destructive/20',
                          jc.priority === 'high' && 'bg-warning/10 text-warning border-warning/20',
                          jc.priority === 'medium' && 'bg-info/10 text-info border-info/20',
                          jc.priority === 'low' && 'bg-muted text-muted-foreground border-border',
                        )}>
                          {jc.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', statusStyles[jc.status])}>
                          {statusLabels[jc.status] || jc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(jc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(jc); }}>
                              <Eye className="h-4 w-4 mr-2" />View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(jc.id, jc.jobCardNumber); }}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      <CreateJobCardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={createJobCard}
      />

      <JobCardDetailDialog
        jobCard={currentSelected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateJobCard={updateJobCard}
        onUpdateStatus={updateStatus}
        onAddLineItem={addLineItem}
        onRemoveLineItem={removeLineItem}
        onGenerateQuote={handleGenerateQuote}
        onGenerateInvoice={handleGenerateInvoice}
      />

      <ConfirmDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant as any}
        onConfirm={handleConfirm}
      />
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Calendar, Building2, DollarSign, MoreHorizontal, Eye, Send, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tender {
  id: string;
  title: string;
  organization: string;
  dueDate: string;
  value: string;
  status: 'open' | 'submitted' | 'won' | 'lost';
  notes?: string;
}

const initialTenders: Tender[] = [];

const statusStyles = {
  open: 'bg-success/10 text-success border-success/20',
  submitted: 'bg-info/10 text-info border-info/20',
  won: 'bg-primary/10 text-primary border-primary/20',
  lost: 'bg-muted text-muted-foreground border-border',
};

export default function Tenders() {
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);
  const [isOpen, setIsOpen] = useState(false);
  const [newTender, setNewTender] = useState({
    title: '',
    organization: '',
    dueDate: '',
    value: '',
    notes: '',
  });

  const handleAddTender = () => {
    const tender: Tender = {
      id: Date.now().toString(),
      ...newTender,
      status: 'open',
    };
    setTenders([tender, ...tenders]);
    setNewTender({ title: '', organization: '', dueDate: '', value: '', notes: '' });
    setIsOpen(false);
  };

  const openTenders = tenders.filter(t => t.status === 'open');
  const submittedTenders = tenders.filter(t => t.status === 'submitted');
  const wonTenders = tenders.filter(t => t.status === 'won');
  const lostTenders = tenders.filter(t => t.status === 'lost');

  return (
    <DashboardLayout>
      <Header 
        title="Tenders & RFQs" 
        subtitle="Track opportunities and submissions"
        action={{
          label: 'Add Tender',
          onClick: () => setIsOpen(true),
        }}
      />
      
      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
          {[
            { label: 'Open', value: openTenders.length, color: 'text-success' },
            { label: 'Submitted', value: submittedTenders.length, color: 'text-info' },
            { label: 'Won', value: wonTenders.length, color: 'text-primary' },
            { label: 'Lost', value: lostTenders.length, color: 'text-muted-foreground' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-xl md:text-2xl font-display font-semibold mt-1', stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="open" className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-secondary/50 w-max md:w-auto">
              <TabsTrigger value="open" className="text-xs md:text-sm">Open ({openTenders.length})</TabsTrigger>
              <TabsTrigger value="submitted" className="text-xs md:text-sm">Submitted ({submittedTenders.length})</TabsTrigger>
              <TabsTrigger value="won" className="text-xs md:text-sm">Won ({wonTenders.length})</TabsTrigger>
              <TabsTrigger value="lost" className="text-xs md:text-sm">Lost ({lostTenders.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="open" className="space-y-4">
            {openTenders.map((tender, index) => (
              <TenderCard key={tender.id} tender={tender} delay={index * 50} />
            ))}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedTenders.map((tender, index) => (
              <TenderCard key={tender.id} tender={tender} delay={index * 50} />
            ))}
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            {wonTenders.map((tender, index) => (
              <TenderCard key={tender.id} tender={tender} delay={index * 50} />
            ))}
          </TabsContent>

          <TabsContent value="lost" className="space-y-4">
            {lostTenders.map((tender, index) => (
              <TenderCard key={tender.id} tender={tender} delay={index * 50} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Tender/RFQ</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTender.title}
                onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
                placeholder="Tender title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={newTender.organization}
                onChange={(e) => setNewTender({ ...newTender, organization: e.target.value })}
                placeholder="Issuing organization"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  value={newTender.dueDate}
                  onChange={(e) => setNewTender({ ...newTender, dueDate: e.target.value })}
                  placeholder="Jan 15, 2025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Estimated Value</Label>
                <Input
                  id="value"
                  value={newTender.value}
                  onChange={(e) => setNewTender({ ...newTender, value: e.target.value })}
                  placeholder="M50,000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTender.notes}
                onChange={(e) => setNewTender({ ...newTender, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTender}>Add Tender</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function TenderCard({ tender, delay = 0 }: { tender: Tender; delay?: number }) {
  return (
    <div 
      className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-card transition-all hover:shadow-elevated animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="rounded-lg bg-primary/10 p-2 md:p-3 shrink-0">
            <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-semibold text-card-foreground text-sm md:text-base line-clamp-2">{tender.title}</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">{tender.organization}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                Due: {tender.dueDate}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                {tender.value}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
          <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[tender.status])}>
            {tender.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="h-4 w-4 mr-2" />
                Mark Submitted
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

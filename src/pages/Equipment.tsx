import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEquipment, CreateEquipmentInput } from '@/hooks/useEquipment';
import { formatMaluti } from '@/lib/currency';
import { Plus, Search, Loader2, Hammer, Package } from 'lucide-react';

const CATEGORIES = ['Power Tools', 'Earthmoving', 'Generators', 'Scaffolding', 'Cleaning', 'Compactors', 'Event/Party', 'General'];
const CONDITIONS = ['excellent', 'good', 'fair', 'poor'];
const STATUSES = ['available', 'on_hire', 'maintenance', 'retired'];

const statusColor: Record<string, string> = {
  available: 'bg-success/10 text-success',
  on_hire: 'bg-info/10 text-info',
  maintenance: 'bg-warning/10 text-warning',
  retired: 'bg-muted text-muted-foreground',
};

export default function Equipment() {
  const { equipment, isLoading, createEquipment, deleteEquipment, isCreating } = useEquipment();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [form, setForm] = useState<CreateEquipmentInput>({
    name: '',
    category: 'General',
    daily_rate: 0,
    description: '',
    serial_number: '',
    weekly_rate: undefined,
    monthly_rate: undefined,
    deposit_amount: 0,
    condition: 'good',
  });

  const filtered = equipment.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    return true;
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createEquipment(form);
    setAddOpen(false);
    setForm({ name: '', category: 'General', daily_rate: 0, description: '', serial_number: '', deposit_amount: 0, condition: 'good' });
  };

  const uniqueCategories = [...new Set(equipment.map(e => e.category))];

  return (
    <DashboardLayout>
      <Header
        title="Equipment Catalogue"
        subtitle="Manage your tools and equipment inventory"
        action={{ label: 'Add Equipment', onClick: () => setAddOpen(true) }}
      />
      <div className="p-4 md:p-6 space-y-4 pb-safe">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No equipment found. Add your first item to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge className={statusColor[item.status] || ''} variant="secondary">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {item.serial_number && <p className="text-xs text-muted-foreground mb-2">S/N: {item.serial_number}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Daily Rate</p>
                      <p className="font-bold text-sm">{formatMaluti(item.daily_rate)}</p>
                    </div>
                    {item.weekly_rate && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Weekly</p>
                        <p className="font-semibold text-sm">{formatMaluti(item.weekly_rate)}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Condition</p>
                      <p className="text-sm capitalize">{item.condition}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Equipment Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hilti Hammer Drill" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Daily Rate *</Label>
                <Input type="number" value={form.daily_rate || ''} onChange={e => setForm(f => ({ ...f, daily_rate: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Weekly Rate</Label>
                <Input type="number" value={form.weekly_rate || ''} onChange={e => setForm(f => ({ ...f, weekly_rate: parseFloat(e.target.value) || undefined }))} />
              </div>
              <div className="space-y-2">
                <Label>Monthly Rate</Label>
                <Input type="number" value={form.monthly_rate || ''} onChange={e => setForm(f => ({ ...f, monthly_rate: parseFloat(e.target.value) || undefined }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Deposit</Label>
                <Input type="number" value={form.deposit_amount || ''} onChange={e => setForm(f => ({ ...f, deposit_amount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input value={form.serial_number || ''} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={form.condition || 'good'} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isCreating || !form.name.trim()}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

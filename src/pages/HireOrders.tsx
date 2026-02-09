import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHireOrders, CreateHireOrderInput, HireOrder, HireOrderItem } from '@/hooks/useHireOrders';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import { formatMaluti } from '@/lib/currency';
import { format } from 'date-fns';
import { Plus, Loader2, ClipboardList, Search, Trash2, RotateCcw, FileText } from 'lucide-react';
import { ProcessReturnDialog } from '@/components/hire/ProcessReturnDialog';
import { HireOrderPreview } from '@/components/hire/HireOrderPreview';

const statusColor: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-info/10 text-info',
  returned: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
};

interface OrderItemForm {
  equipment_item_id: string;
  equipment_name: string;
  daily_rate: number;
  quantity: number;
}

export default function HireOrders() {
  const { orders, isLoading, createOrder, isCreating, getOrderItems } = useHireOrders();
  const { equipment } = useEquipment();
  const { clients } = useClients();
  const [addOpen, setAddOpen] = useState(false);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');

  // Return dialog state
  const [returnOrder, setReturnOrder] = useState<HireOrder | null>(null);

  // Preview state
  const [previewOrder, setPreviewOrder] = useState<HireOrder | null>(null);
  const [previewItems, setPreviewItems] = useState<HireOrderItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_id: '',
    client_phone: '',
    hire_start: format(new Date(), 'yyyy-MM-dd'),
    hire_end: '',
    deposit_paid: 0,
    notes: '',
  });

  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);

  const filtered = orders.filter(o => {
    if (statusTab !== 'all' && o.status !== statusTab) return false;
    if (search && !o.order_number.toLowerCase().includes(search.toLowerCase()) && !o.client_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addItem = () => {
    setOrderItems(prev => [...prev, { equipment_item_id: '', equipment_name: '', daily_rate: 0, quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof OrderItemForm, value: string | number) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'equipment_item_id') {
        const eq = equipment.find(e => e.id === value);
        if (eq) {
          updated.equipment_name = eq.name;
          updated.daily_rate = eq.daily_rate;
        }
      }
      return updated;
    }));
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setForm(f => ({ ...f, client_id: clientId, client_name: client.company, client_phone: client.phone || '' }));
    }
  };

  const calculateTotal = () => {
    if (!form.hire_start || !form.hire_end) return 0;
    const days = Math.max(1, Math.ceil((new Date(form.hire_end).getTime() - new Date(form.hire_start).getTime()) / (1000 * 60 * 60 * 24)));
    return orderItems.reduce((sum, item) => sum + (item.daily_rate * item.quantity * days), 0);
  };

  const handleCreate = () => {
    if (!form.client_name.trim() || !form.hire_start || !form.hire_end) return;
    const total = calculateTotal();
    const input: CreateHireOrderInput = {
      client_name: form.client_name,
      client_id: form.client_id || undefined,
      client_phone: form.client_phone || undefined,
      hire_start: form.hire_start,
      hire_end: form.hire_end,
      deposit_paid: form.deposit_paid,
      total,
      notes: form.notes || undefined,
      items: orderItems.map(item => ({
        equipment_item_id: item.equipment_item_id || undefined,
        equipment_name: item.equipment_name,
        daily_rate: item.daily_rate,
        quantity: item.quantity,
        subtotal: item.daily_rate * item.quantity,
      })),
    };
    createOrder(input);
    setAddOpen(false);
    setForm({ client_name: '', client_id: '', client_phone: '', hire_start: format(new Date(), 'yyyy-MM-dd'), hire_end: '', deposit_paid: 0, notes: '' });
    setOrderItems([]);
  };

  const handleOpenPreview = async (order: HireOrder) => {
    setPreviewLoading(true);
    setPreviewOrder(order);
    const items = await getOrderItems(order.id);
    setPreviewItems(items);
    setPreviewLoading(false);
  };

  const availableEquipment = equipment.filter(e => e.available_quantity > 0);

  return (
    <DashboardLayout>
      <Header
        title="Hire Orders"
        subtitle="Manage rental agreements and bookings"
        action={{ label: 'New Order', onClick: () => setAddOpen(true) }}
      />
      <div className="p-4 md:p-6 space-y-4 pb-safe">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="returned">Returned</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No hire orders found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{order.order_number}</h3>
                        <Badge className={statusColor[order.status] || ''} variant="secondary">{order.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{order.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatMaluti(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.hire_start), 'dd MMM')} — {format(new Date(order.hire_end), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleOpenPreview(order)}>
                      <FileText className="h-3.5 w-3.5 mr-1" />Agreement
                    </Button>
                    {(order.status === 'active' || order.status === 'overdue') && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setReturnOrder(order)}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />Process Return
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Hire Order Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Hire Order</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={form.client_id} onValueChange={handleClientSelect}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Customer name" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.hire_start} onChange={e => setForm(f => ({ ...f, hire_start: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" value={form.hire_end} onChange={e => setForm(f => ({ ...f, hire_end: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Deposit Paid</Label>
                <Input type="number" value={form.deposit_paid || ''} onChange={e => setForm(f => ({ ...f, deposit_paid: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>

            {/* Equipment Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Equipment Items</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
              </div>
              {orderItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 border rounded-lg">No items added. Click "Add Item" to select equipment.</p>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Select value={item.equipment_item_id} onValueChange={v => updateItem(idx, 'equipment_item_id', v)}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select equipment..." /></SelectTrigger>
                        <SelectContent>
                          {availableEquipment.map(eq => (
                            <SelectItem key={eq.id} value={eq.id}>{eq.name} — {formatMaluti(eq.daily_rate)}/day ({eq.available_quantity} avail)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input type="number" className="w-16" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} placeholder="Qty" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Estimated Total</span>
              <span className="font-bold text-lg">{formatMaluti(calculateTotal())}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !form.client_name.trim() || !form.hire_end}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Return Dialog */}
      {returnOrder && (
        <ProcessReturnDialog
          order={returnOrder}
          open={!!returnOrder}
          onOpenChange={(open) => { if (!open) setReturnOrder(null); }}
        />
      )}

      {/* Hire Order Preview */}
      {previewOrder && !previewLoading && (
        <HireOrderPreview
          order={previewOrder}
          items={previewItems}
          onClose={() => setPreviewOrder(null)}
        />
      )}
    </DashboardLayout>
  );
}

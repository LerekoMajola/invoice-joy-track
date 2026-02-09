import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, RotateCcw } from 'lucide-react';
import { HireOrder, HireOrderItem, useHireOrders } from '@/hooks/useHireOrders';
import { formatMaluti } from '@/lib/currency';
import { format, differenceInDays } from 'date-fns';

const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'damaged'] as const;

interface ItemReturnState {
  id: string;
  equipment_name: string;
  condition_out: string | null;
  condition_in: string;
  damage_notes: string;
  damage_charge: number;
  daily_rate: number;
  quantity: number;
}

interface ProcessReturnDialogProps {
  order: HireOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcessReturnDialog({ order, open, onOpenChange }: ProcessReturnDialogProps) {
  const { getOrderItems, processReturn, isProcessingReturn } = useHireOrders();
  const [items, setItems] = useState<ItemReturnState[]>([]);
  const [loading, setLoading] = useState(true);

  const actualReturnDate = format(new Date(), 'yyyy-MM-dd');
  const daysLate = Math.max(0, differenceInDays(new Date(), new Date(order.hire_end)));
  const dailyTotal = items.reduce((sum, i) => sum + i.daily_rate * i.quantity, 0);
  const lateFee = daysLate * dailyTotal;
  const damageTotal = items.reduce((sum, i) => sum + i.damage_charge, 0);
  const adjustedTotal = order.total + lateFee + damageTotal;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getOrderItems(order.id).then((orderItems: HireOrderItem[]) => {
      setItems(orderItems.map(i => ({
        id: i.id,
        equipment_name: i.equipment_name,
        condition_out: i.condition_out,
        condition_in: i.condition_out || 'good',
        damage_notes: '',
        damage_charge: 0,
        daily_rate: i.daily_rate,
        quantity: i.quantity,
      })));
      setLoading(false);
    });
  }, [open, order.id]);

  const updateItem = (id: string, field: keyof ItemReturnState, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleConfirm = () => {
    processReturn({
      orderId: order.id,
      actualReturnDate,
      adjustedTotal,
      items: items.map(i => ({
        id: i.id,
        condition_in: i.condition_in,
        damage_notes: i.damage_notes || null,
        damage_charge: i.damage_charge,
      })),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Process Return — {order.order_number}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Client:</span> <span className="font-medium">{order.client_name}</span></div>
              <div><span className="text-muted-foreground">Hire Period:</span> <span className="font-medium">{format(new Date(order.hire_start), 'dd MMM')} — {format(new Date(order.hire_end), 'dd MMM yyyy')}</span></div>
              <div><span className="text-muted-foreground">Return Date:</span> <span className="font-medium">{format(new Date(), 'dd MMM yyyy')}</span></div>
              {daysLate > 0 && (
                <div><Badge variant="destructive" className="text-xs">{daysLate} day{daysLate > 1 ? 's' : ''} late</Badge></div>
              )}
            </div>

            <Separator />

            {/* Equipment Items */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Equipment Condition</Label>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.equipment_name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                      <span className="text-xs text-muted-foreground">Out: {item.condition_out || 'N/A'}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Condition In</Label>
                        <Select value={item.condition_in} onValueChange={v => updateItem(item.id, 'condition_in', v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Damage Charge</Label>
                        <Input type="number" className="h-8 text-xs" value={item.damage_charge || ''} onChange={e => updateItem(item.id, 'damage_charge', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Damage Notes</Label>
                        <Input className="h-8 text-xs" value={item.damage_notes} onChange={e => updateItem(item.id, 'damage_notes', e.target.value)} placeholder="Notes..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Original Total</span><span>{formatMaluti(order.total)}</span></div>
              {daysLate > 0 && (
                <div className="flex justify-between text-destructive"><span>Late Fee ({daysLate} days × {formatMaluti(dailyTotal)}/day)</span><span>+{formatMaluti(lateFee)}</span></div>
              )}
              {damageTotal > 0 && (
                <div className="flex justify-between text-destructive"><span>Damage Charges</span><span>+{formatMaluti(damageTotal)}</span></div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Adjusted Total</span><span>{formatMaluti(adjustedTotal)}</span></div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isProcessingReturn || loading}>
            {isProcessingReturn && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

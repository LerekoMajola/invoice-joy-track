import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAdminTenants, Tenant } from '@/hooks/useAdminTenants';
import { useAdminInvoices } from '@/hooks/useAdminInvoices';
import { supabase } from '@/integrations/supabase/client';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface GenerateAdminInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTenant?: Tenant | null;
}

export function GenerateAdminInvoiceDialog({ open, onOpenChange, preselectedTenant }: GenerateAdminInvoiceDialogProps) {
  const { data: tenants } = useAdminTenants();
  const { generateNextNumber, createInvoice } = useAdminInvoices();

  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedTenant = tenants?.find(t => t.id === selectedTenantId) || null;

  useEffect(() => {
    if (open) {
      generateNextNumber().then(setInvoiceNumber);
      setDueDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
      if (preselectedTenant) {
        setSelectedTenantId(preselectedTenant.id);
      } else {
        setSelectedTenantId('');
      }
      setLineItems([]);
      setTaxRate(0);
      setNotes('');
    }
  }, [open]);

  // Auto-populate line items when tenant is selected
  useEffect(() => {
    if (!selectedTenant) return;
    const fetchModules = async () => {
      const { data } = await supabase
        .from('user_modules')
        .select('module:platform_modules(name, monthly_price)')
        .eq('user_id', selectedTenant.user_id)
        .eq('is_active', true);

      if (data) {
        const items: LineItem[] = data
          .filter((d: any) => d.module)
          .map((d: any) => ({
            description: d.module.name,
            quantity: 1,
            unit_price: d.module.monthly_price || 0,
          }));
        setLineItems(items.length > 0 ? items : [{ description: '', quantity: 1, unit_price: 0 }]);
      }
    };
    fetchModules();
  }, [selectedTenant?.user_id]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      await createInvoice.mutateAsync({
        tenant_user_id: selectedTenant.user_id,
        company_profile_id: selectedTenant.id,
        invoice_number: invoiceNumber,
        company_name: selectedTenant.company_name,
        tenant_email: selectedTenant.email,
        line_items: lineItems as any,
        subtotal,
        tax_rate: taxRate,
        total,
        currency: 'LSL',
        status: 'draft',
        issue_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: dueDate,
        payment_date: null,
        payment_method: null,
        payment_reference: null,
        notes: notes || null,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Generate Invoice</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Invoice Number</Label>
              <Input value={invoiceNumber} readOnly className="font-mono bg-muted" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Tenant</Label>
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenant..." />
              </SelectTrigger>
              <SelectContent>
                {tenants?.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTenant && (
            <div className="text-sm text-muted-foreground">
              Email: {selectedTenant.email || 'N/A'}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">Line Items</Label>
            {lineItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  {i === 0 && <Label className="text-[10px]">Description</Label>}
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                    placeholder="Module / Service"
                  />
                </div>
                <div className="w-16">
                  {i === 0 && <Label className="text-[10px]">Qty</Label>}
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(i, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-24">
                  {i === 0 && <Label className="text-[10px]">Price</Label>}
                  <Input
                    type="number"
                    min={0}
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setLineItems(items => items.filter((_, idx) => idx !== i))}
                  disabled={lineItems.length <= 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLineItems(items => [...items, { description: '', quantity: 1, unit_price: 0 }])}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tax Rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-3 bg-muted/30 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>M{subtotal.toFixed(2)}</span></div>
            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({taxRate}%)</span><span>M{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>Total</span><span>M{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions, terms, etc."
              rows={3}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !selectedTenant || lineItems.length === 0}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save as Draft
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

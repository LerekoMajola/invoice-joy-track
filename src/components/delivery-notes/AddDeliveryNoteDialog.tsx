import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useDeliveryNotes } from '@/hooks/useDeliveryNotes';

interface LineItem {
  description: string;
  quantity: number;
}

interface AddDeliveryNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyItem: LineItem = { description: '', quantity: 1 };

export function AddDeliveryNoteDialog({ open, onOpenChange }: AddDeliveryNoteDialogProps) {
  const { clients } = useClients();
  const { createDeliveryNote } = useDeliveryNotes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientName, setClientName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);

  const resetForm = () => {
    setClientName('');
    setSelectedClientId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDeliveryAddress('');
    setItems([{ ...emptyItem }]);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === '_manual') {
      setClientName('');
      setDeliveryAddress('');
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.company);
      setDeliveryAddress(client.address || '');
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validItems = items.filter((item) => item.description.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || validItems.length === 0) return;

    setIsSubmitting(true);
    const result = await createDeliveryNote({
      clientId: selectedClientId && selectedClientId !== '_manual' ? selectedClientId : undefined,
      clientName: clientName.trim(),
      date,
      deliveryAddress: deliveryAddress.trim() || undefined,
      status: 'pending',
      items: validItems.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
      })),
    });

    if (result) {
      resetForm();
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[560px] max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Delivery Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          {clients.length > 0 && (
            <div className="grid gap-2">
              <Label>Select Client (optional)</Label>
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose existing client or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_manual">Enter manually</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="dn-client-name">Client Name *</Label>
            <Input
              id="dn-client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client or company name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dn-date">Date *</Label>
              <Input
                id="dn-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dn-address">Delivery Address</Label>
            <Textarea
              id="dn-address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Delivery address"
              rows={2}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <Label>Items *</Label>
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !clientName.trim() || validItems.length === 0}>
              {isSubmitting ? 'Creating...' : 'Create Delivery Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

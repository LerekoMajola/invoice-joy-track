import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { JobCardLineItem } from '@/hooks/useJobCards';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<JobCardLineItem, 'id'>) => Promise<boolean>;
}

export function QuickAddCost({ open, onOpenChange, onAddItem }: Props) {
  const [type, setType] = useState<'parts' | 'labour'>('parts');
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!desc.trim() || !price) return;
    setAdding(true);
    await onAddItem({
      itemType: type,
      description: desc,
      partNumber: null,
      quantity: Number(qty) || 1,
      unitPrice: Number(price) || 0,
    });
    setDesc('');
    setQty('1');
    setPrice('');
    setAdding(false);
  };

  if (!open) return null;

  return (
    <div className="border-t border-border px-3 py-2 bg-muted/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">Quick Add Cost</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenChange(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex gap-1.5 items-end">
        <Select value={type} onValueChange={(v) => setType(v as 'parts' | 'labour')}>
          <SelectTrigger className="h-8 w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parts">Parts</SelectItem>
            <SelectItem value="labour">Labour</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="h-8 text-xs flex-1"
        />
        <Input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Qty"
          min="1"
          className="h-8 text-xs w-14"
        />
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          min="0"
          step="0.01"
          className="h-8 text-xs w-20"
        />
        <Button onClick={handleAdd} disabled={!desc.trim() || !price || adding} size="sm" className="h-8 px-2">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

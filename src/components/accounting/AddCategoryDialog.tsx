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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenseCategories } from '@/hooks/useExpenses';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'orange', label: 'Orange' },
  { value: 'amber', label: 'Amber' },
  { value: 'sky', label: 'Sky' },
  { value: 'slate', label: 'Slate' },
  { value: 'gray', label: 'Gray' },
];

const ICONS = [
  { value: 'package', label: 'Package' },
  { value: 'plane', label: 'Travel' },
  { value: 'zap', label: 'Utilities' },
  { value: 'megaphone', label: 'Marketing' },
  { value: 'briefcase', label: 'Professional' },
  { value: 'monitor', label: 'Equipment' },
  { value: 'building', label: 'Building' },
  { value: 'shield', label: 'Insurance' },
  { value: 'wrench', label: 'Maintenance' },
  { value: 'truck', label: 'Transport' },
  { value: 'phone', label: 'Communication' },
  { value: 'folder', label: 'General' },
];

export function AddCategoryDialog({ open, onOpenChange }: AddCategoryDialogProps) {
  const { createCategory } = useExpenseCategories();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('package');
  const [color, setColor] = useState('blue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCategory.mutate(
      { name: name.trim(), icon, color },
      {
        onSuccess: () => {
          setName('');
          setIcon('package');
          setColor('blue');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Expense Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Transport"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full inline-block"
                          style={{
                            backgroundColor:
                              c.value === 'blue' ? '#3b82f6' :
                              c.value === 'purple' ? '#8b5cf6' :
                              c.value === 'green' ? '#22c55e' :
                              c.value === 'red' ? '#ef4444' :
                              c.value === 'yellow' ? '#eab308' :
                              c.value === 'pink' ? '#ec4899' :
                              c.value === 'indigo' ? '#6366f1' :
                              c.value === 'orange' ? '#f97316' :
                              c.value === 'amber' ? '#f59e0b' :
                              c.value === 'sky' ? '#0ea5e9' :
                              c.value === 'slate' ? '#64748b' :
                              '#9ca3af'
                          }}
                        />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCategory.isPending}>
              {createCategory.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FleetVehicle } from '@/hooks/useFleetVehicles';
import { FleetDocumentInsert } from '@/hooks/useFleetDocuments';
import { Upload } from 'lucide-react';

interface AddFleetDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: FleetVehicle[];
  onSubmit: (doc: FleetDocumentInsert) => Promise<boolean>;
}

const DOC_TYPES = ['Insurance Certificate', 'Roadworthy Certificate', 'License Disk', 'Service Invoice', 'Inspection Report', 'Registration Document', 'Warranty Document', 'Other'];

export function AddFleetDocumentDialog({ open, onOpenChange, vehicles, onSubmit }: AddFleetDocumentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', documentType: 'Insurance Certificate', expiryDate: '', notes: '' });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !file) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      vehicleId: form.vehicleId, documentType: form.documentType, file,
      expiryDate: form.expiryDate || undefined, notes: form.notes || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setForm({ vehicleId: '', documentType: 'Insurance Certificate', expiryDate: '', notes: '' });
      setFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Document Type *</Label>
            <Select value={form.documentType} onValueChange={v => setForm(f => ({ ...f, documentType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>File *</Label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />{file ? file.name : 'Choose file...'}
            </Button>
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !file}>{isSubmitting ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

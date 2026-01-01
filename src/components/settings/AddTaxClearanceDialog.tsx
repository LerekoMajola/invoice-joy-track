import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Upload, Loader2, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaxClearances } from '@/hooks/useTaxClearances';

interface AddTaxClearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaxClearanceDialog({ open, onOpenChange }: AddTaxClearanceDialogProps) {
  const { addTaxClearance, uploadDocument, isAdding } = useTaxClearances();
  const [activityName, setActivityName] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);
    const url = await uploadDocument(file);
    if (url) {
      setDocumentUrl(url);
    }
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (!activityName || !expiryDate || !documentUrl) return;

    addTaxClearance({
      activity_name: activityName,
      expiry_date: format(expiryDate, 'yyyy-MM-dd'),
      document_url: documentUrl,
    });

    // Reset form
    setActivityName('');
    setExpiryDate(undefined);
    setDocumentUrl(null);
    setFileName(null);
    onOpenChange(false);
  };

  const isValid = activityName && expiryDate && documentUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tax Clearance</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="activity">Activity / Business Type</Label>
            <Input
              id="activity"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g., General Trading, Construction, IT Services"
            />
          </div>

          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, 'PPP') : 'Select expiry date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Document</Label>
            {documentUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted border">
                <FileText className="h-6 w-6 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName || 'Document uploaded'}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setDocumentUrl(null);
                    setFileName(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Tax Clearance'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

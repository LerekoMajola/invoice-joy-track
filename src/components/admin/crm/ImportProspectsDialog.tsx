import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, FileText, AlertTriangle, CheckCircle2, Download, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportProspectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

interface ProspectInsert {
  company_name: string;
  contact_name: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  priority?: string;
  estimated_value?: number;
  source?: string | null;
  notes?: string | null;
  next_follow_up?: string | null;
  interested_plan?: string | null;
  interested_system?: string | null;
}

interface ParsedRow {
  data: Record<string, string>;
  mapped: ProspectInsert;
  valid: boolean;
  error?: string;
}

const HEADER_MAP: Record<string, keyof ProspectInsert> = {
  'company': 'company_name',
  'company name': 'company_name',
  'organization': 'company_name',
  'contact': 'contact_name',
  'contact name': 'contact_name',
  'name': 'contact_name',
  'full name': 'contact_name',
  'email': 'email',
  'email address': 'email',
  'phone': 'phone',
  'telephone': 'phone',
  'mobile': 'phone',
  'phone number': 'phone',
  'status': 'status',
  'stage': 'status',
  'lead status': 'status',
  'priority': 'priority',
  'value': 'estimated_value',
  'estimated value': 'estimated_value',
  'deal value': 'estimated_value',
  'source': 'source',
  'campaign name': 'source',
  'platform': 'source',
  'notes': 'notes',
  'comments': 'notes',
  'ad name': 'notes',
  'adset name': 'notes',
  'follow up': 'next_follow_up',
  'next follow up': 'next_follow_up',
  'plan': 'interested_plan',
  'interested plan': 'interested_plan',
  'system': 'interested_system',
  'interested system': 'interested_system',
};

function cleanText(text: string): string {
  // Strip BOM and null bytes (handles UTF-16 read as UTF-8)
  return text.replace(/\uFEFF/g, '').replace(/\0/g, '');
}

function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  const semicolons = (line.match(/;/g) || []).length;
  if (tabs >= commas && tabs >= semicolons && tabs > 0) return '\t';
  if (semicolons > commas && semicolons > 0) return ';';
  return ',';
}

function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function mapHeaders(headers: string[]): (keyof ProspectInsert | null)[] {
  return headers.map((h) => {
    const normalized = h.toLowerCase().replace(/[_\-]/g, ' ').trim();
    return HEADER_MAP[normalized] ?? null;
  });
}

const TEMPLATE_CSV = `company_name,contact_name,email,phone,source,estimated_value,priority,status,notes,next_follow_up,interested_plan,interested_system
Acme Corp,John Doe,john@acme.com,+1234567890,referral,5000,high,lead,Interested in premium plan,2025-04-01,professional,business`;

export function ImportProspectsDialog({ open, onOpenChange, onImported }: ImportProspectsDialogProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [columnMap, setColumnMap] = useState<(keyof ProspectInsert | null)[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reset = () => {
    setParsedRows([]);
    setColumnMap([]);
    setRawHeaders([]);
    setFileName('');
    setProgress(0);
    setImporting(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        const text = cleanText(raw);
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          toast({ title: 'Invalid CSV', description: 'File must have a header row and at least one data row.', variant: 'destructive' });
          return;
        }
        const delimiter = detectDelimiter(lines[0]);
        const headers = parseCSVLine(lines[0], delimiter);
        const mapped = mapHeaders(headers);
        setRawHeaders(headers);
        setColumnMap(mapped);

        const rows: ParsedRow[] = [];
        for (let i = 1; i < Math.min(lines.length, 501); i++) {
          const values = parseCSVLine(lines[i], delimiter);
          const data: Record<string, string> = {};
          headers.forEach((h, idx) => {
            data[h] = values[idx] || '';
          });

          const prospect: ProspectInsert = { company_name: '', contact_name: '' };
          mapped.forEach((field, idx) => {
            if (!field) return;
            const val = values[idx]?.trim() || '';
            if (!val) return;
            if (field === 'estimated_value') {
              const num = parseFloat(val.replace(/[^0-9.\-]/g, ''));
              if (!isNaN(num)) prospect.estimated_value = num;
            } else {
              (prospect as any)[field] = val;
            }
          });

          if (!prospect.status || !['lead','contacted','demo','proposal','negotiation','won','lost'].includes(prospect.status)) prospect.status = 'lead';
          if (!prospect.priority || !['low','medium','high'].includes(prospect.priority)) prospect.priority = 'medium';

          const hasName = !!prospect.company_name?.trim() || !!prospect.contact_name?.trim();
          if (!prospect.company_name?.trim()) prospect.company_name = prospect.contact_name || 'Unknown';
          if (!prospect.contact_name?.trim()) prospect.contact_name = prospect.company_name || 'Unknown';
          rows.push({
            data,
            mapped: prospect,
            valid: hasName,
            error: hasName ? undefined : 'Missing company and contact name',
          });
        }
        setParsedRows(rows);
      };
      reader.readAsText(file);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) handleFile(file);
    },
    [handleFile]
  );

  const validRows = parsedRows.filter((r) => r.valid);
  const invalidRows = parsedRows.filter((r) => !r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setProgress(0);

    const BATCH_SIZE = 100;
    let imported = 0;
    const prospectsToInsert = validRows.map((r) => r.mapped);

    try {
      for (let i = 0; i < prospectsToInsert.length; i += BATCH_SIZE) {
        const batch = prospectsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('admin_prospects').insert(batch);
        if (error) throw error;
        imported += batch.length;
        setProgress(Math.round((imported / prospectsToInsert.length) * 100));
      }

      toast({
        title: 'Import Complete',
        description: `Imported ${imported} prospects${invalidRows.length ? `, ${invalidRows.length} skipped` : ''}.`,
      });
      onImported?.();
      handleClose(false);
    } catch (error: any) {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospects-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Prospects from CSV</DialogTitle>
        </DialogHeader>

        {parsedRows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div
              className="w-full border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports .csv files up to 500 rows</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template CSV
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{fileName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={reset}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {invalidRows.length} skipped
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {rawHeaders.map((h, i) => (
                <Badge key={i} variant={columnMap[i] ? 'default' : 'outline'} className="text-xs">
                  {h} → {columnMap[i] || 'ignored'}
                </Badge>
              ))}
            </div>

            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">Valid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 100).map((row, i) => (
                    <TableRow key={i} className={!row.valid ? 'opacity-50' : ''}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="font-medium">{row.mapped.company_name || '-'}</TableCell>
                      <TableCell>{row.mapped.contact_name || '-'}</TableCell>
                      <TableCell>{row.mapped.email || '-'}</TableCell>
                      <TableCell>{row.mapped.phone || '-'}</TableCell>
                      <TableCell>{row.mapped.status || 'lead'}</TableCell>
                      <TableCell>
                        {row.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedRows.length > 100 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing first 100 of {parsedRows.length} rows
              </p>
            )}

            {importing && <Progress value={progress} className="h-2" />}
          </div>
        )}

        {parsedRows.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing || validRows.length === 0}>
              {importing ? `Importing... ${progress}%` : `Import ${validRows.length} Prospects`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

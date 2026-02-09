import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FolderOpen, Search, Loader2, Upload, Download, FileText, File } from 'lucide-react';
import { useLegalCases } from '@/hooks/useLegalCases';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LegalDocument {
  id: string;
  caseId: string | null;
  title: string;
  documentType: string;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string;
  notes: string | null;
  createdAt: string;
}

const documentTypes = ['contract', 'agreement', 'court_paper', 'evidence', 'correspondence', 'pleading', 'affidavit', 'other'];

export default function LegalDocuments() {
  const { user } = useAuth();
  const { cases } = useLegalCases();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', documentType: 'other', caseId: '', notes: '' });
  const [file, setFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    if (!user) { setDocuments([]); setIsLoading(false); return; }
    const { data, error } = await supabase.from('legal_documents').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load documents'); setIsLoading(false); return; }
    setDocuments((data || []).map(d => ({
      id: d.id, caseId: d.case_id, title: d.title, documentType: d.document_type,
      fileName: d.file_name, fileSize: d.file_size, fileUrl: d.file_url,
      notes: d.notes, createdAt: d.created_at,
    })));
    setIsLoading(false);
  };

  useEffect(() => { fetchDocuments(); }, [user]);

  const caseMap = new Map(cases.map(c => [c.id, `${c.caseNumber} - ${c.title}`]));

  const filtered = documents.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || (d.fileName || '').toLowerCase().includes(q);
  });

  const handleSubmit = async () => {
    if (!user || !form.title || !file) {
      toast.error('Title and file are required');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('legal-documents').upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('legal-documents').getPublicUrl(path);

      const { error } = await supabase.from('legal_documents').insert({
        user_id: user.id,
        title: form.title,
        document_type: form.documentType,
        case_id: form.caseId || null,
        file_name: file.name,
        file_size: file.size,
        file_url: urlData.publicUrl,
        notes: form.notes || null,
      });
      if (error) throw error;

      toast.success('Document uploaded');
      setAddOpen(false);
      setForm({ title: '', documentType: 'other', caseId: '', notes: '' });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <Header title="Legal Documents" subtitle="Upload and manage case documents" action={{ label: 'Upload', onClick: () => setAddOpen(true) }} />

      <div className="p-4 md:p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documents..." className="pl-9" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No documents yet</p>
            <p className="text-sm">Upload your first document</p>
          </Card>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {filtered.map(d => (
                <Card key={d.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.fileName} • {formatSize(d.fileSize)}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize text-xs">{d.documentType.replace('_', ' ')}</Badge>
                        <span>{formatDate(d.createdAt)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Case</TableHead>
                    <TableHead className="font-semibold">File</TableHead>
                    <TableHead className="font-semibold">Size</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{d.title}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{d.documentType.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{d.caseId ? caseMap.get(d.caseId) || '-' : '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{d.fileName || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatSize(d.fileSize)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title" /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.documentType} onValueChange={(v) => setForm(f => ({ ...f, documentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{documentTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Case</Label>
              <Select value={form.caseId} onValueChange={(v) => setForm(f => ({ ...f, caseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select case (optional)" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.caseNumber} - {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>File *</Label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="cursor-pointer" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</> : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

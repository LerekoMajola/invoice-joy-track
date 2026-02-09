import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FileText, Upload, Trash2, Download, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CaseDocument {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string;
  documentType: string;
  createdAt: string;
}

const documentTypes = ['contract', 'agreement', 'court_paper', 'evidence', 'correspondence', 'pleading', 'affidavit', 'other'];

interface Props {
  caseId: string;
}

export function CaseDocumentsTab({ caseId }: Props) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(
        (data || []).map((d) => ({
          id: d.id,
          title: d.title,
          fileName: d.file_name,
          fileSize: d.file_size,
          fileUrl: d.file_url,
          documentType: d.document_type,
          createdAt: d.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching case documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchDocuments();
  }, [caseId]);

  const handleUpload = async () => {
    if (!user || !selectedFile || !title.trim()) {
      toast.error('Title and file are required');
      return;
    }

    setIsUploading(true);
    try {
      const ext = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('legal-documents')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('legal_documents')
        .insert({
          user_id: user.id,
          case_id: caseId,
          title: title.trim(),
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_url: urlData.publicUrl,
          document_type: documentType,
        })
        .select()
        .single();

      if (error) throw error;

      setDocuments((prev) => [
        {
          id: data.id,
          title: data.title,
          fileName: data.file_name,
          fileSize: data.file_size,
          fileUrl: data.file_url,
          documentType: data.document_type,
          createdAt: data.created_at,
        },
        ...prev,
      ]);

      setTitle('');
      setDocumentType('other');
      setSelectedFile(null);
      setShowForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Document uploaded');
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: CaseDocument) => {
    try {
      const url = new URL(doc.fileUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/legal-documents/');
      if (pathParts[1]) {
        await supabase.storage.from('legal-documents').remove([pathParts[1]]);
      }

      const { error } = await supabase
        .from('legal_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" />Upload Document
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 mb-3 space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title..." />
          </div>
          <div>
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {documentTypes.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setTitle(''); setDocumentType('other'); setSelectedFile(null); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={isUploading || !title.trim() || !selectedFile}>
              {isUploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
              Upload
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No documents linked to this case</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0">{doc.documentType.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {doc.fileName && <span>{doc.fileName} • </span>}
                    {formatFileSize(doc.fileSize)}
                    {doc.fileSize && ' • '}
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => window.open(doc.fileUrl, '_blank')}>
                  <Download className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(doc)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

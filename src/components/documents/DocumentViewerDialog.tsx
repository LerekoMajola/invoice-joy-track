import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Copy, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

function getFileType(url: string): 'pdf' | 'image' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.pdf')) return 'pdf';
  if (lowerUrl.includes('.png') || lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.webp')) return 'image';
  // Default to PDF for Supabase storage URLs without clear extension
  if (lowerUrl.includes('storage') && !lowerUrl.includes('.')) return 'pdf';
  return 'pdf'; // Default to PDF viewer which handles most cases
}

export function DocumentViewerDialog({ 
  open, 
  onOpenChange, 
  title, 
  url 
}: DocumentViewerDialogProps) {
  const [copied, setCopied] = useState(false);
  const fileType = getFileType(url);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title.replace(/\s+/g, '_') || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="truncate">{title}</DialogTitle>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">{copied ? 'Copied' : 'Copy link'}</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Download</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Open</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-muted/30">
          {fileType === 'image' ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={url} 
                alt={title} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <iframe
              src={url}
              title={title}
              className="w-full h-full border-0"
              onError={() => {
                toast.error('Failed to load document preview');
              }}
            />
          )}
        </div>

        {/* Fallback message for when iframe doesn't work */}
        <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>
            If the preview doesn't load, use the <strong>Download</strong> or <strong>Open</strong> button above.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

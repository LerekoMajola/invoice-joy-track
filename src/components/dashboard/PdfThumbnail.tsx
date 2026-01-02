import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// @ts-ignore - Vite URL import for worker
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

// Set up the worker using Vite-friendly URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface PdfThumbnailProps {
  url: string;
  className?: string;
}

export function PdfThumbnail({ url, className = '' }: PdfThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let cancelled = false;

    async function renderPdf() {
      try {
        setIsLoading(true);
        setHasError(false);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        // Get the first page
        const page = await pdf.getPage(1);

        if (cancelled) return;

        // Set up canvas for rendering
        const scale = 0.5; // Thumbnail scale
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the page - pdfjs-dist v5 requires canvas parameter
        await page.render({
          canvas: canvas,
          viewport: viewport,
        }).promise;

        if (cancelled) return;

        // Convert to image URL
        const imageUrl = canvas.toDataURL('image/png');
        setThumbnailUrl(imageUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Error rendering PDF thumbnail:', error);
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (isLoading) {
    return <Skeleton className={`${className} bg-muted`} />;
  }

  if (hasError || !thumbnailUrl) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={thumbnailUrl}
      alt="Document preview"
      className={`${className} object-cover rounded-lg shadow-sm border border-border`}
    />
  );
}

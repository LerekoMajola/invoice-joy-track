import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, Globe, Smartphone } from 'lucide-react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IconUploadSectionProps {
  label: string;
  description: string;
  currentUrl: string | null;
  defaultLabel: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  uploading: boolean;
  icon: React.ReactNode;
  recommended: string;
}

function IconUploadSection({
  label,
  description,
  currentUrl,
  defaultLabel,
  onUpload,
  onRemove,
  uploading,
  icon,
  recommended,
}: IconUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <label className="text-sm font-medium text-foreground">{label}</label>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>

      <div className="border rounded-xl p-6 bg-muted/30 flex flex-col items-center gap-3">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="h-16 w-16 rounded-xl object-contain bg-white p-2 shadow-sm border"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center border">
            {icon}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {currentUrl ? 'Custom icon' : defaultLabel}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/x-icon,image/ico"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>

        {currentUrl && (
          <Button size="sm" variant="outline" onClick={onRemove}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{recommended}</p>
    </div>
  );
}

export function AppIconSettings() {
  const {
    faviconUrl,
    updateFaviconUrl,
    appIconUrl,
    updateAppIconUrl,
  } = usePlatformSettings();

  const [faviconUploading, setFaviconUploading] = useState(false);
  const [appIconUploading, setAppIconUploading] = useState(false);

  const uploadIcon = async (
    file: File,
    path: string,
    updateFn: typeof updateFaviconUrl,
    setUploading: (v: boolean) => void,
    label: string
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `platform/${path}.${fileExt}`;

      await supabase.storage.from('company-assets').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateFn.mutateAsync(publicUrl);

      // Dynamically update the favicon/icons in the browser
      if (path === 'favicon') {
        updateDocumentIcon('icon', publicUrl);
      } else if (path === 'app-icon') {
        updateDocumentIcon('apple-touch-icon', publicUrl);
      }

      toast.success(`${label} updated!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${label.toLowerCase()}`);
    } finally {
      setUploading(false);
    }
  };

  const removeIcon = async (
    updateFn: typeof updateFaviconUrl,
    linkRel: string,
    label: string
  ) => {
    try {
      await updateFn.mutateAsync(null);
      // Revert to default
      if (linkRel === 'icon') {
        updateDocumentIcon('icon', '/favicon.png');
      } else {
        updateDocumentIcon('apple-touch-icon', '/apple-touch-icon.png');
      }
      toast.success(`${label} reverted to default`);
    } catch (error) {
      toast.error(`Failed to remove ${label.toLowerCase()}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Icons</CardTitle>
        <CardDescription>
          Manage the icons that appear in the browser tab (favicon) and when users save the app to their phone's home screen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <IconUploadSection
          label="Browser Tab Icon (Favicon)"
          description="The small icon shown in the browser tab, bookmarks bar, and browser history."
          currentUrl={faviconUrl}
          defaultLabel="Default favicon"
          onUpload={(file) =>
            uploadIcon(file, 'favicon', updateFaviconUrl, setFaviconUploading, 'Favicon')
          }
          onRemove={() => removeIcon(updateFaviconUrl, 'icon', 'Favicon')}
          uploading={faviconUploading}
          icon={<Globe className="h-5 w-5 text-muted-foreground" />}
          recommended="Recommended: 32×32 or 64×64 px, PNG or ICO format, max 2MB."
        />

        <div className="border-t" />

        <IconUploadSection
          label="Home Screen Icon (App Icon)"
          description="The icon shown when users save the app to their phone's home screen or tablet."
          currentUrl={appIconUrl}
          defaultLabel="Default app icon"
          onUpload={(file) =>
            uploadIcon(file, 'app-icon', updateAppIconUrl, setAppIconUploading, 'App icon')
          }
          onRemove={() => removeIcon(updateAppIconUrl, 'apple-touch-icon', 'App icon')}
          uploading={appIconUploading}
          icon={<Smartphone className="h-5 w-5 text-muted-foreground" />}
          recommended="Recommended: 512×512 px, PNG format, max 2MB. Used for iOS & Android home screen."
        />
      </CardContent>
    </Card>
  );
}

/** Dynamically update a <link> tag in the document head */
function updateDocumentIcon(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (link) {
    link.href = href;
  } else {
    link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  }
}

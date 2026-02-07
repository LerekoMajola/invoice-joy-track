import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import orionLabsLogo from '@/assets/orion-labs-logo.png';

export function AdminSettingsTab() {
  const { logoUrl, updateLogoUrl } = usePlatformSettings();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const filePath = `platform/logo.${fileExt}`;

      // Remove old logo if exists
      await supabase.storage.from('company-assets').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      // Add cache buster
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await updateLogoUrl.mutateAsync(publicUrl);
      toast.success('Platform logo updated!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    try {
      await updateLogoUrl.mutateAsync(null);
      toast.success('Logo reverted to default');
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const displayUrl = logoUrl || orionLabsLogo;
  const isCustom = !!logoUrl;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Branding</CardTitle>
          <CardDescription>
            Manage the platform logo displayed across all pages — landing, login, and admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Logo</label>
            <div className="border rounded-xl p-8 bg-muted/30 flex flex-col items-center gap-4">
              <div className="bg-white rounded-xl px-6 py-3 shadow-sm border">
                <img
                  src={displayUrl}
                  alt="Current platform logo"
                  className="h-12 w-auto max-w-[200px] object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isCustom ? 'Custom logo' : 'Default logo (Orion Labs)'}
              </p>
            </div>
          </div>

          {/* Upload & Remove Actions */}
          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="default"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Logo
                </>
              )}
            </Button>

            {isCustom && (
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={updateLogoUrl.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Revert to Default
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Preferred size: <strong>200 × 60 px</strong> (or similar aspect ratio). PNG or SVG, max 2 MB. The logo will appear on the landing page, login, footer, and admin header.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

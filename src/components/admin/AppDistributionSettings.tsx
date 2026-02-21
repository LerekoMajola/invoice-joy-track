import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Loader2, Download, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function usePlatformSetting(key: string) {
  const queryClient = useQueryClient();

  const { data: value, isLoading } = useQuery({
    queryKey: ['platform-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) return null;
      return data?.value ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });

  const update = useMutation({
    mutationFn: async (val: string | null) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ value: val, updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key, value: val });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });

  return { value: value ?? null, isLoading, update };
}

export function AppDistributionSettings() {
  const apkUrl = usePlatformSetting('android_apk_url');
  const apkVersion = usePlatformSetting('android_apk_version');
  const [uploading, setUploading] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.apk')) {
      toast.error('Please select an APK file (.apk)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('APK must be under 100MB');
      return;
    }

    setUploading(true);
    try {
      const filePath = 'orion-labs-latest.apk';

      // Remove old APK
      await supabase.storage.from('app-releases').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('app-releases')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('app-releases')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await apkUrl.update.mutateAsync(publicUrl);

      if (versionLabel.trim()) {
        await apkVersion.update.mutateAsync(versionLabel.trim());
      }

      toast.success('APK uploaded successfully! Visitors can now download it.');
    } catch (error: any) {
      console.error('APK upload error:', error);
      toast.error('Failed to upload APK');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    try {
      await supabase.storage.from('app-releases').remove(['orion-labs-latest.apk']);
      await apkUrl.update.mutateAsync(null);
      await apkVersion.update.mutateAsync(null);
      toast.success('APK removed. Download button will be hidden from visitors.');
    } catch (error) {
      toast.error('Failed to remove APK');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          App Distribution
        </CardTitle>
        <CardDescription>
          Upload your Android APK to let users download and install the app directly from your website.
          iOS users will see instructions to install the PWA via Safari.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current APK Status */}
        <div className="rounded-xl border bg-muted/30 p-5">
          {apkUrl.value ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">APK is live</p>
                <p className="text-xs text-muted-foreground truncate">
                  {apkVersion.value ? `Version ${apkVersion.value}` : 'No version label'}
                  {' · '}
                  Visitors can download it from the landing page
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No APK uploaded</p>
                <p className="text-xs text-muted-foreground">
                  Upload an APK to show the "Download for Android" button on your site
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Version Label */}
        <div className="space-y-2">
          <Label htmlFor="apk-version">Version Label (optional)</Label>
          <Input
            id="apk-version"
            placeholder="e.g. v1.0.2"
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
            className="max-w-[200px]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading APK...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {apkUrl.value ? 'Replace APK' : 'Upload APK'}
              </>
            )}
          </Button>

          {apkUrl.value && (
            <Button variant="outline" onClick={handleRemove} disabled={apkUrl.update.isPending}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove APK
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Accepted format: <strong>.apk</strong> · Max size: <strong>100 MB</strong>.
          The download button will appear on the landing page, about page, and footer once uploaded.
        </p>
      </CardContent>
    </Card>
  );
}

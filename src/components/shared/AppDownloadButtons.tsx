import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Share, Plus, Globe, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AppDownloadButtonsProps {
  variant?: 'hero' | 'default';
  className?: string;
}

function useSettingValue(key: string) {
  const { data, isLoading } = useQuery({
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
  return { value: data ?? null, isLoading };
}

/** Inline Android robot SVG */
function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.523 2.226a.75.75 0 0 0-1.046.2l-1.15 1.727A7.07 7.07 0 0 0 12 3.5a7.07 7.07 0 0 0-3.327.653L7.523 2.426a.75.75 0 1 0-1.246.848l1.07 1.605A7.015 7.015 0 0 0 5 10.5h14a7.015 7.015 0 0 0-2.347-5.621l1.07-1.605a.75.75 0 0 0-.2-1.048ZM9 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM5 11.5v6A2.5 2.5 0 0 0 7.5 20h1V22a1.5 1.5 0 0 0 3 0v-2h1v2a1.5 1.5 0 0 0 3 0v-2h1a2.5 2.5 0 0 0 2.5-2.5v-6H5ZM3.5 11A1.5 1.5 0 0 0 2 12.5v4a1.5 1.5 0 0 0 3 0v-4A1.5 1.5 0 0 0 3.5 11Zm17 0a1.5 1.5 0 0 0-1.5 1.5v4a1.5 1.5 0 0 0 3 0v-4a1.5 1.5 0 0 0-1.5-1.5Z"/>
    </svg>
  );
}

/** Inline Apple logo SVG */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-27.1-46.9-42.4-83.5-46.2-34.5-3.5-72.4 20.3-86.2 20.3-14.4 0-47.7-19.3-73.6-19.3C75.6 139.6 0 183.2 0 282.1c0 29.4 5.4 59.7 16.3 91 14.5 41.4 66.9 142.9 121.3 141.1 27.8-.7 47.4-19.9 73.5-19.9 25.2 0 43.5 19.9 73.6 19.9 55 0 100.6-90.8 114.6-132.3-73-33.6-69.3-98.3-69.3-99.5-.1-1.2-.1-2.4-.1-3.6 0-3.1.1-6.1.3-9.1h.5zm-73.3-136c25.2-30.5 22.8-58.5 22.1-68.7-21.8 1.3-47.1 14.9-61.6 32.5-15.8 18.8-25 41.8-23 67.8 23.6 1.8 45.4-11.2 62.5-31.6z"/>
    </svg>
  );
}

export function AppDownloadButtons({ variant = 'default', className = '' }: AppDownloadButtonsProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const apk = useSettingValue('android_apk_url');
  const version = useSettingValue('android_apk_version');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handlePwaInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    }
  };

  const isHero = variant === 'hero';

  // Compact variant for footer
  if (variant === 'default') {
    return (
      <div className={`flex flex-col sm:flex-row items-stretch gap-3 ${className}`}>
        {/* Android */}
        {apk.value ? (
          <a href={apk.value} download>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-elevated transition-all duration-300 cursor-pointer group">
              <AndroidIcon className="h-7 w-7 text-success shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground leading-none">Download for</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Android
                  {version.value && <span className="text-xs font-normal text-muted-foreground ml-1.5">{version.value}</span>}
                </p>
              </div>
            </div>
          </a>
        ) : installPrompt ? (
          <div
            onClick={handlePwaInstall}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-elevated transition-all duration-300 cursor-pointer group"
          >
            <Smartphone className="h-6 w-6 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-none">Install</p>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Web App</p>
            </div>
          </div>
        ) : null}

        {/* iOS */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-elevated transition-all duration-300 cursor-pointer group">
              <AppleIcon className="h-6 w-6 text-foreground shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground leading-none">Install on</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">iPhone</p>
              </div>
            </div>
          </PopoverTrigger>
          <IosInstructions />
        </Popover>
      </div>
    );
  }

  // Hero variant — bolder, for gradient backgrounds
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      {/* Android APK badge */}
      {apk.value && (
        <a href={apk.value} download>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer group min-w-[200px]">
            <AndroidIcon className="h-8 w-8 text-[#3DDC84] shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-white/50 leading-none uppercase tracking-wider">Download for</p>
              <p className="text-base font-bold text-white">
                Android
                {version.value && <span className="text-xs font-normal text-white/50 ml-1.5">{version.value}</span>}
              </p>
            </div>
            <Download className="h-4 w-4 text-white/40 ml-auto group-hover:text-white/70 transition-colors" />
          </div>
        </a>
      )}

      {/* PWA install fallback (when no APK) */}
      {installPrompt && !apk.value && (
        <div
          onClick={handlePwaInstall}
          className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer group min-w-[200px]"
        >
          <Smartphone className="h-8 w-8 text-white shrink-0" />
          <div className="text-left">
            <p className="text-[10px] text-white/50 leading-none uppercase tracking-wider">Install</p>
            <p className="text-base font-bold text-white">Web App</p>
          </div>
          <Download className="h-4 w-4 text-white/40 ml-auto group-hover:text-white/70 transition-colors" />
        </div>
      )}

      {/* iOS badge */}
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 hover:bg-white/20 transition-all duration-300 cursor-pointer group min-w-[200px]">
            <AppleIcon className="h-7 w-7 text-white shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-white/50 leading-none uppercase tracking-wider">Install on</p>
              <p className="text-base font-bold text-white">iPhone</p>
            </div>
          </div>
        </PopoverTrigger>
        <IosInstructions />
      </Popover>

      {/* Android note */}
      {apk.value && (
        <p className="text-[11px] text-white/30 max-w-xs text-center sm:text-left">
          You may need to enable "Install from unknown sources" in your Android settings.
        </p>
      )}
    </div>
  );
}

function IosInstructions() {
  return (
    <PopoverContent className="w-80 p-5" side="top" align="center">
      <div className="flex items-center gap-2 mb-3">
        <AppleIcon className="h-5 w-5 text-foreground" />
        <h4 className="font-display font-semibold text-foreground">Install on iPhone</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Add this app to your home screen for the best experience:
      </p>
      <ol className="space-y-3 text-sm text-foreground">
        <li className="flex items-start gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</span>
          <span className="flex items-center gap-1.5">
            Open this site in <Globe className="h-4 w-4 text-info inline" /> <strong>Safari</strong>
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">2</span>
          <span className="flex items-center gap-1.5">
            Tap the <Share className="h-4 w-4 text-info inline" /> <strong>Share</strong> button
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">3</span>
          <span className="flex items-center gap-1.5">
            Tap <Plus className="h-4 w-4 text-info inline" /> <strong>Add to Home Screen</strong>
          </span>
        </li>
      </ol>
      <p className="text-xs text-muted-foreground mt-4">
        The app will appear on your home screen and work like a native app!
      </p>
    </PopoverContent>
  );
}

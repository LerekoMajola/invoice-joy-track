import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Apple, Share, Plus, Globe } from 'lucide-react';
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

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
      {/* Android APK Download */}
      {apk.value && (
        <a href={apk.value} download className="w-full sm:w-auto">
          <Button
            size="lg"
            className={`w-full rounded-2xl px-6 py-5 text-base font-semibold transition-all duration-300 hover:scale-105 ${
              isHero
                ? 'bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <Download className="h-5 w-5 mr-2" />
            Download for Android
            {version.value && (
              <span className={`ml-2 text-xs ${isHero ? 'text-white/60' : 'text-primary-foreground/60'}`}>
                {version.value}
              </span>
            )}
          </Button>
        </a>
      )}

      {/* iOS PWA Install */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            variant="outline"
            className={`w-full sm:w-auto rounded-2xl px-6 py-5 text-base font-semibold transition-all duration-300 hover:scale-105 ${
              isHero
                ? 'bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20'
                : 'border-border text-foreground hover:bg-accent/10'
            }`}
          >
            <Apple className="h-5 w-5 mr-2" />
            Install on iPhone
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-5" side="top" align="center">
          <h4 className="font-display font-semibold text-foreground mb-3">Install on iPhone</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Since this app isn't on the App Store yet, you can install it as a web app:
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
      </Popover>

      {/* PWA Install (if browser supports it and no APK available) */}
      {installPrompt && !apk.value && (
        <Button
          size="lg"
          onClick={handlePwaInstall}
          className={`w-full sm:w-auto rounded-2xl px-6 py-5 text-base font-semibold transition-all duration-300 hover:scale-105 ${
            isHero
              ? 'bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <Download className="h-5 w-5 mr-2" />
          Install App
        </Button>
      )}

      {/* Android unknown sources note */}
      {apk.value && (
        <p className={`text-xs w-full text-center sm:text-left ${isHero ? 'text-white/40' : 'text-muted-foreground'}`}>
          Android: You may need to enable "Install from unknown sources" in settings.
        </p>
      )}
    </div>
  );
}

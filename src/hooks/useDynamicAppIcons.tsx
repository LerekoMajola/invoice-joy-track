import { useEffect } from 'react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

/**
 * Dynamically applies custom favicon and app icon from platform settings.
 * Should be called once at the app root level.
 */
export function useDynamicAppIcons() {
  const { faviconUrl, appIconUrl } = usePlatformSettings();

  useEffect(() => {
    if (faviconUrl) {
      updateLink('icon', faviconUrl);
    }
  }, [faviconUrl]);

  useEffect(() => {
    if (appIconUrl) {
      updateLink('apple-touch-icon', appIconUrl);
    }
  }, [appIconUrl]);
}

function updateLink(rel: string, href: string) {
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

import { useState } from 'react';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import orionLabsLogo from '@/assets/orion-labs-logo.png';

interface PlatformLogoProps {
  className?: string;
  alt?: string;
  fallbackIcon?: React.ReactNode;
}

export function PlatformLogo({ className = 'h-8 w-8 rounded-full p-1 bg-white shadow-sm object-contain', alt = 'Platform Logo', fallbackIcon }: PlatformLogoProps) {
  const { logoUrl, isLoading } = usePlatformSettings();
  const [imgError, setImgError] = useState(false);

  const src = (!imgError && logoUrl) ? logoUrl : orionLabsLogo;

  if (isLoading) {
    // Show default logo while loading to avoid layout shift
    return <img src={orionLabsLogo} alt={alt} className={className} />;
  }

  if (imgError && !logoUrl && fallbackIcon) {
    return <>{fallbackIcon}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
}

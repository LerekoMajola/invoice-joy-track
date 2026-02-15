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

  // Extract size/padding/bg classes for the wrapper vs image-only classes
  const hasCircularPadding = className.includes('rounded-full') && className.includes('bg-');

  if (hasCircularPadding) {
    // Separate container styles from image styles
    const containerClasses = className
      .split(' ')
      .filter(c => /^(h-|w-|rounded-|p-|bg-|shadow-)/.test(c))
      .join(' ');
    const imgClasses = className
      .split(' ')
      .filter(c => /^(object-)/.test(c))
      .join(' ');

    return (
      <div className={`flex items-center justify-center ${containerClasses}`}>
        <img
          src={src}
          alt={alt}
          className={`h-full w-full ${imgClasses}`}
          onError={() => setImgError(true)}
        />
      </div>
    );
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

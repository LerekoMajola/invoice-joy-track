import { useDynamicAppIcons } from '@/hooks/useDynamicAppIcons';

/**
 * Invisible component that dynamically applies custom favicon and app icons
 * from platform settings. Renders nothing.
 */
export function DynamicAppIcons() {
  useDynamicAppIcons();
  return null;
}

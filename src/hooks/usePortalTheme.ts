import { useState, useEffect } from 'react';

export function usePortalTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('portal_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const el = document.querySelector('[data-portal-theme]');
      if (el) {
        setIsDark(el.getAttribute('data-portal-theme') === 'dark');
      }
    });
    const root = document.querySelector('[data-portal-theme]');
    if (root) {
      setIsDark(root.getAttribute('data-portal-theme') === 'dark');
      observer.observe(root, { attributes: true, attributeFilter: ['data-portal-theme'] });
    }
    return () => observer.disconnect();
  }, []);

  const pt = (dark: string, light: string) => isDark ? dark : light;

  return { isDark, pt };
}

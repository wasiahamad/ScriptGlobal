import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSiteSettings } from '@/lib/api';
import type { SiteSettings } from '@/types';

interface SiteDataContextValue {
  settings: SiteSettings | null;
  loading: boolean;
  refresh: () => void;
}

const SiteDataContext = createContext<SiteDataContextValue>({
  settings: null,
  loading: true,
  refresh: () => {},
});

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getSiteSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!settings) return;
    if (settings.brand_name) document.title = settings.brand_name;
    document.documentElement.style.setProperty('--site-primary-color', settings.primary_color || '#0f766e');
    document.documentElement.style.setProperty('--site-accent-color', settings.accent_color || '#14b8a6');
  }, [settings]);

  return (
    <SiteDataContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}

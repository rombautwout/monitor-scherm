import React, { createContext, useContext, useEffect, useState } from 'react';

type SettingsContextType = {
  defaultBrowserUrl: string;
  setDefaultBrowserUrl: (url: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_URL = 'https://example.com';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [defaultBrowserUrl, setDefaultBrowserUrlState] = useState<string>(DEFAULT_URL);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('defaultBrowserUrl');
      if (stored) setDefaultBrowserUrlState(stored);
    } catch {}
  }, []);

  const setDefaultBrowserUrl = (url: string) => {
    setDefaultBrowserUrlState(url);
    try {
      localStorage.setItem('defaultBrowserUrl', url);
    } catch {}
  };

  return (
    <SettingsContext.Provider value={{ defaultBrowserUrl, setDefaultBrowserUrl }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

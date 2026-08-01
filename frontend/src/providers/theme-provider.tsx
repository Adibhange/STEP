'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type TableDensity = 'standard';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  reducedMotion: boolean;
  setReducedMotion: (reducedMotion: boolean) => void;
  tableDensity: TableDensity;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  locale: string;
  setLocale: (locale: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'step-theme-preference';
const SIDEBAR_STORAGE_KEY = 'step-sidebar-collapsed';

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: Theme }> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [tableDensity] = useState<TableDensity>('standard');
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(false);
  const [locale, setLocaleState] = useState<string>('en-US');

  // Hydrate preferences from localStorage and system media queries
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      }

      const savedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedSidebar !== null) {
        setSidebarCollapsedState(savedSidebar === 'true');
      }

      // Check system reduced motion media query
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotionState(motionQuery.matches);

      const handleMotionChange = (e: MediaQueryListEvent) => {
        setReducedMotionState(e.matches);
      };

      motionQuery.addEventListener('change', handleMotionChange);
      return () => motionQuery.removeEventListener('change', handleMotionChange);
    } catch {
      // Fallback gracefully if localStorage is unavailable
    }
  }, []);

  // Update DOM class for dark mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Fallback
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      // Fallback
    }
  };

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
  };

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        reducedMotion,
        setReducedMotion,
        tableDensity,
        sidebarCollapsed,
        setSidebarCollapsed,
        locale,
        setLocale,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

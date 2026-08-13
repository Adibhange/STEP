'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type TableDensity = 'standard';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (e?: React.MouseEvent | { clientX?: number; clientY?: number }) => void;
  setThemeWithTransition: (theme: Theme, e?: React.MouseEvent | { clientX?: number; clientY?: number }) => void;
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
  defaultTheme = 'dark',
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

  // Update DOM class and data-theme attribute for dark mode
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      let effectiveTheme: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = systemDark ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }

      root.classList.add(effectiveTheme);
      root.setAttribute('data-theme', effectiveTheme);
    };

    applyTheme();

    if (theme === 'system') {
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleColorSchemeChange = () => applyTheme();
      colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
      return () => colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
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

  /**
   * Smooth circular radial expansion transition from click origin across the full screen
   */
  const setThemeWithTransition = (
    newTheme: Theme,
    e?: React.MouseEvent | { clientX?: number; clientY?: number }
  ) => {
    if (
      typeof document === 'undefined' ||
      !(document as any).startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(newTheme);
      return;
    }

    const targetEl = (
      e && 'currentTarget' in e
        ? (e.currentTarget as HTMLElement)
        : e && 'target' in e
        ? (e.target as HTMLElement)
        : undefined
    );
    const rect = targetEl?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : (e?.clientX ?? (window.innerWidth - 80));
    const y = rect ? rect.top + rect.height / 2 : (e?.clientY ?? 40);
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      // Synchronously mutate root classes and attributes so the transition captures the complete updated frame instantly!
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      let effectiveTheme: 'light' | 'dark' = 'light';
      if (newTheme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = systemDark ? 'dark' : 'light';
      } else {
        effectiveTheme = newTheme;
      }
      root.classList.add(effectiveTheme);
      root.setAttribute('data-theme', effectiveTheme);

      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // Fallback
      }
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 750,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  const toggleTheme = (e?: React.MouseEvent | { clientX?: number; clientY?: number }) => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeWithTransition(nextTheme, e);
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
        toggleTheme,
        setThemeWithTransition,
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

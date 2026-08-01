'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast';
export type TableDensity = 'compact' | 'comfortable' | 'spacious';

interface UserPreferences {
  theme: ThemeMode;
  density: TableDensity;
  sidebarCollapsed: boolean;
  favorites: string[];
  pinnedPages: string[];
  recentPages: string[];
  animationsEnabled: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: TableDensity) => void;
  toggleSidebar: () => void;
  toggleFavorite: (path: string) => void;
  togglePin: (path: string) => void;
  addRecentPage: (path: string) => void;
  toggleAnimations: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  density: 'comfortable',
  sidebarCollapsed: false,
  favorites: ['/candidates', '/vacancies'],
  pinnedPages: ['/dashboard'],
  recentPages: ['/dashboard'],
  animationsEnabled: true,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('erms_user_preferences');
      if (stored) {
        try {
          return { ...defaultPreferences, ...JSON.parse(stored) };
        } catch {
          // fallback to default
        }
      }
    }
    return defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('erms_user_preferences', JSON.stringify(preferences));

    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');

    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'high-contrast') {
      root.classList.add('high-contrast');
    } else if (preferences.theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }

    root.setAttribute('data-density', preferences.density);
  }, [preferences]);

  const setTheme = (theme: ThemeMode) => setPreferences((prev) => ({ ...prev, theme }));
  const setDensity = (density: TableDensity) => setPreferences((prev) => ({ ...prev, density }));
  const toggleSidebar = () => setPreferences((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  const toggleAnimations = () => setPreferences((prev) => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));

  const toggleFavorite = (path: string) => {
    setPreferences((prev) => {
      const exists = prev.favorites.includes(path);
      return {
        ...prev,
        favorites: exists ? prev.favorites.filter((p) => p !== path) : [...prev.favorites, path],
      };
    });
  };

  const togglePin = (path: string) => {
    setPreferences((prev) => {
      const exists = prev.pinnedPages.includes(path);
      return {
        ...prev,
        pinnedPages: exists ? prev.pinnedPages.filter((p) => p !== path) : [...prev.pinnedPages, path],
      };
    });
  };

  const addRecentPage = (path: string) => {
    setPreferences((prev) => {
      const filtered = prev.recentPages.filter((p) => p !== path);
      return { ...prev, recentPages: [path, ...filtered].slice(0, 5) };
    });
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setTheme,
        setDensity,
        toggleSidebar,
        toggleFavorite,
        togglePin,
        addRecentPage,
        toggleAnimations,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

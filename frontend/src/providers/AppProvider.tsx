'use client';

import React from 'react';
import { ReduxProvider } from './redux-provider';
import { ThemeProvider } from './theme-provider';
import { AccessibilityProvider } from './accessibility-provider';
import { UserPreferencesProvider } from './user-preferences-provider';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * STEP Enterprise AppProvider
 *
 * Single master provider wrapper encapsulating Redux, Theme, Accessibility,
 * and UserPreferences providers for the entire application.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <UserPreferencesProvider>
            {children}
          </UserPreferencesProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
};

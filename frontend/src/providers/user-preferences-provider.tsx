'use client';

import React, { createContext, useContext, useState } from 'react';

interface UserPreferencesContextType {
  density: 'compact' | 'comfortable';
  setDensity: (density: 'compact' | 'comfortable') => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  density: 'compact',
  setDensity: () => {},
});

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

  return (
    <UserPreferencesContext.Provider value={{ density, setDensity }}>
      <div data-density={density} suppressHydrationWarning>{children}</div>
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => useContext(UserPreferencesContext);

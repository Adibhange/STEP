'use client';

import React, { createContext, useContext } from 'react';

interface PermissionsContextType {
  hasPermission: (module: string, action: string) => boolean;
  userAccess?: any;
}

const PermissionsContext = createContext<PermissionsContextType>({
  hasPermission: () => true,
  userAccess: null
});

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PermissionsContext.Provider value={{ hasPermission: () => true, userAccess: {} }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  return useContext(PermissionsContext);
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AccessibilityContextType {
  isKeyboardUser: boolean;
  highContrast: boolean;
  setHighContrast: (highContrast: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  useEffect(() => {
    // Detect keyboard navigation usage vs pointer usage
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsKeyboardUser(true);
        document.body.classList.add('user-is-tabbing');
      }
    };

    const handlePointerDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('user-is-tabbing');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return (
    <AccessibilityContext.Provider value={{ isKeyboardUser, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

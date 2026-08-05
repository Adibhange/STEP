'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { useIdleTimer, IdleTimerContext } from '@/hooks/useIdleTimer';
import { notifyError } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isDashboardRoute = pathname?.startsWith('/dashboard');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('step_token');
    const hasToken = Boolean(token && token.trim().length > 0);

    if (isDashboardRoute && !hasToken) {
      setIsAuthenticated(false);
      setIsChecking(false);
      notifyError({
        title: 'Authentication Required',
        description: 'Please sign in to access your workspace.',
      });
      router.push('/');
      return;
    }

    if (pathname === '/' && hasToken) {
      router.push('/dashboard');
      return;
    }

    setIsAuthenticated(hasToken);
    setIsChecking(false);
  }, [pathname, isDashboardRoute, router]);

  // Activate idle timer (30s idle -> 15m countdown) when authenticated on dashboard
  const idleTimer = useIdleTimer({
    enabled: isAuthenticated && isDashboardRoute,
  });

  // Render loading spinner while checking auth status
  if (isChecking && isDashboardRoute) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-6">
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] p-8 text-center shadow-xl max-w-sm w-full">
          <Icon name="spinner" size="lg" className="animate-spin text-[var(--accent-indigo)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">Authenticating Session...</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 font-sans">Verifying access credentials for STEP</p>
        </div>
      </div>
    );
  }

  return (
    <IdleTimerContext.Provider value={idleTimer}>
      {children}
    </IdleTimerContext.Provider>
  );
};

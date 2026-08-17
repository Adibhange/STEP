'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIdleTimer, IdleTimerContext } from '@/hooks/useIdleTimer';
import {
  useAppSelector,
  useAppDispatch,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  syncFromStorage,
  notifyError,
} from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);

  const isDashboardRoute = pathname?.startsWith('/dashboard');

  // Sync state from persistent storage on client mount
  useEffect(() => {
    dispatch(syncFromStorage());
  }, [dispatch]);

  // Route protection guard — only evaluate after storage hydration
  useEffect(() => {
    if (!isInitialized) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
    const hasToken = Boolean(token && token.trim().length > 0);

    if (isDashboardRoute && !isAuthenticated && !hasToken) {
      notifyError({
        title: 'Authentication Required',
        description: 'Please sign in to access your workspace.',
      });
      router.push('/');
      return;
    }

    if (pathname === '/' && (isAuthenticated || hasToken)) {
      router.push('/dashboard');
    }
  }, [pathname, isDashboardRoute, isAuthenticated, isInitialized, router]);

  // Activate idle timer when authenticated in dashboard
  const idleTimer = useIdleTimer({
    enabled: isAuthenticated && Boolean(isDashboardRoute),
  });

  return (
    <IdleTimerContext.Provider value={idleTimer}>
      {children}
    </IdleTimerContext.Provider>
  );
};


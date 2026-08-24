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

  const currentUser = useAppSelector((state) => state.auth.user);

  // Route protection guard — only evaluate after storage hydration
  useEffect(() => {
    if (!isInitialized) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
    const hasToken = Boolean(token && token.trim().length > 0);

    if (isDashboardRoute && !isAuthenticated && !hasToken) {
      dispatch(
        notifyError({
          title: 'Authentication Required',
          description: 'Please sign in to access your workspace.',
        })
      );
      router.push('/');
      return;
    }

    // RBAC: Interviewers cannot access /dashboard/users or /dashboard/settings
    if (isDashboardRoute && (isAuthenticated || hasToken) && currentUser) {
      const isRestrictedAdminRoute = pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/settings');
      if (isRestrictedAdminRoute && currentUser.role === 'Interviewer') {
        dispatch(
          notifyError({
            title: 'Access Restricted',
            description: 'You do not have administrative permissions to view this section.',
          })
        );
        router.push('/dashboard');
        return;
      }
    }

    if (pathname === '/' && (isAuthenticated || hasToken)) {
      router.push('/dashboard');
    }
  }, [pathname, isDashboardRoute, isAuthenticated, isInitialized, currentUser, router, dispatch]);

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


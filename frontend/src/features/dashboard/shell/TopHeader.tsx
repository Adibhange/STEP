'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Badge } from '@/design-system';
import type { QuickNotification, CurrentUser } from '@/features/dashboard/types/dashboard.types';
import { useIdleTimerContext } from '@/hooks/useIdleTimer';
import { useTheme, type Theme } from '@/providers/theme-provider';
import { useAppDispatch, useAppSelector, selectCurrentUser, logout } from '@/store';
import { ChangePasswordModal } from './ChangePasswordModal';

interface TopHeaderProps {
  onMobileMenuOpen: () => void;
}

/**
 * STEP Enterprise TopHeader — Clean Streamlined Profile Dropdown with Interactive Breadcrumbs
 */
export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectCurrentUser);

  const { isIdle, formattedTime, resetTimer } = useIdleTimerContext();
  const { theme, toggleTheme, setThemeWithTransition } = useTheme();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = reduxUser?.name || 'Administrator';
  const displayEmail = reduxUser?.email || 'admin@sthapatya.com';
  const displayRole = reduxUser?.role || 'System Administrator';
  const avatarInitials = (displayName || 'Administrator')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'A';

  const user: CurrentUser = {
    name: displayName,
    email: displayEmail,
    role: displayRole,
    avatarInitials,
  };

  const notifications: QuickNotification[] = [];

  const isDirector = user.role?.toLowerCase().includes('director') ?? false;

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const notifIconMap: Record<string, string> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
  };
  const notifColorMap: Record<string, string> = {
    info: 'text-[var(--status-info)]',
    success: 'text-[var(--status-success)]',
    warning: 'text-[var(--status-warning)]',
    error: 'text-[var(--status-danger)]',
  };

  const BREADCRUMB_MAP: { match: string; label: string; href: string }[] = [
    { match: '/dashboard/candidates', label: 'Candidates', href: '/dashboard/candidates' },
    { match: '/dashboard/assessments', label: 'Assessments', href: '/dashboard/assessments' },
    { match: '/dashboard/users', label: 'Users & Access', href: '/dashboard/users' },
    { match: '/dashboard/vacancies', label: 'Vacancies', href: '/dashboard/vacancies' },
    { match: '/dashboard/reports', label: 'Reports', href: '/dashboard/reports' },
    { match: '/dashboard/settings', label: 'Master Data & Settings', href: '/dashboard/settings' },
  ];

  const activeCrumb = BREADCRUMB_MAP.find((b) => pathname?.includes(b.match));
  const isDashboardRoot = !activeCrumb;

  return (
    <header
      className="sticky top-0 z-30 h-[var(--header-height)] flex items-center justify-between px-4 sm:px-6 bg-[var(--surface-1)] border-b border-[var(--border-default)]"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Left: Mobile Menu Trigger + Interactive Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors focus-ring-step cursor-pointer"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          <Icon name="menu" size="sm" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-2 text-[var(--type-body-md-size)] select-none">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-[11px] sm:text-[13px] font-medium text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)] hover:underline tracking-tight cursor-pointer transition-colors"
          >
            STEP
          </button>
          <Icon name="chevron-right" size="xs" className="text-[var(--text-tertiary)] opacity-60 shrink-0" />

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className={`text-[11px] sm:text-[13.5px] tracking-tight font-heading cursor-pointer transition-colors ${isDashboardRoot
                ? 'font-bold text-[var(--text-primary)]'
                : 'font-medium text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)] hover:underline'
              }`}
          >
            Dashboard
          </button>

          {activeCrumb && (
            <>
              <Icon name="chevron-right" size="xs" className="text-[var(--text-tertiary)] opacity-60 shrink-0" />
              <button
                type="button"
                onClick={() => router.push(activeCrumb.href)}
                className="text-[11px] sm:text-[13.5px] font-bold text-[var(--text-primary)] tracking-tight font-heading hover:text-[var(--accent-indigo)] cursor-pointer truncate max-w-[100px] sm:max-w-none"
              >
                {activeCrumb.label}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Right: Idle Badge + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Live Idle 15-Min Auto-Logout Badge */}
        {isIdle && (
          <button
            type="button"
            onClick={resetTimer}
            title="Auto-logout timer. Click or move mouse to reset."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning-text)] text-xs font-bold font-mono cursor-pointer hover:opacity-90 transition-all shadow-xs animate-pulse"
          >
            <Icon name="alert-triangle" size="xs" />
            <span>{formattedTime}</span>
          </button>
        )}

        {/* Theme Toggle Trigger with Top-Right to Bottom-Left Circular Expansion */}
        <button
          type="button"
          id="theme-toggle-trigger"
          className="w-8.5 h-8.5 flex items-center justify-center rounded-full text-[var(--text-secondary)]
            hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:scale-[1.04] active:scale-95 transition-all duration-150 focus-ring-step cursor-pointer"
          onClick={(e) => toggleTheme(e)}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          title={`Current theme: ${theme}. Click to toggle.`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
        </button>

        {/* Notification Bell Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            id="notifications-trigger"
            className="relative w-8.5 h-8.5 flex items-center justify-center rounded-full text-[var(--text-secondary)]
              hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:scale-[1.04] active:scale-95 transition-all duration-150 focus-ring-step cursor-pointer"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Icon name="bell" size="sm" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--status-danger)] ring-2 ring-[var(--surface-1)]" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--surface-1)] border border-[var(--border-default)]
                  rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] z-50 overflow-hidden origin-top-right"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surface-2)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[var(--text-primary)] font-heading">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="danger" size="sm">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-soft)] scrollbar-step">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-[12px] flex items-start gap-3 hover:bg-[var(--surface-hover)] transition-colors ${!n.read ? 'bg-[var(--accent-indigo-dim)]/20' : ''
                          }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <Icon
                            name={(notifIconMap[n.type] || 'info') as any}
                            size="xs"
                            className={notifColorMap[n.type] || 'text-[var(--text-secondary)]'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[var(--text-primary)] leading-tight">{n.title}</div>
                          <div className="text-[var(--text-secondary)] text-[11.5px] mt-0.5 leading-snug">
                            {n.description}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)] mt-1 font-mono">{n.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            id="profile-menu-trigger"
            className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-[var(--surface-hover)] transition-colors focus-ring-step cursor-pointer"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div
              className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[12px] flex items-center justify-center shadow-xs"
              suppressHydrationWarning
            >
              {user.avatarInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left" suppressHydrationWarning>
              <span className="text-[12.5px] font-bold text-[var(--text-primary)] leading-none font-heading" suppressHydrationWarning>
                {user.name}
              </span>
              <span className="text-[10.5px] text-[var(--text-tertiary)] font-medium leading-tight" suppressHydrationWarning>
                {user.role}
              </span>
            </div>
            <Icon
              name="chevron-down"
              size="xs"
              className={`text-[var(--text-tertiary)] transition-transform duration-150 ${profileOpen ? 'rotate-180 text-[var(--text-primary)]' : ''
                }`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface-1)] border border-[var(--border-default)]
                  rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] z-50 overflow-hidden origin-top-right divide-y divide-[var(--border-default)]"
              >
                {/* User info header */}
                <div className="p-3.5 bg-[var(--surface-2)] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[13px] flex items-center justify-center shrink-0 shadow-xs">
                    {user.avatarInitials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-[var(--text-primary)] truncate font-heading leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)] truncate font-medium">
                      {user.email}
                    </span>
                    <span className="text-[10px] text-[var(--accent-indigo)] font-semibold uppercase tracking-wider mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5 space-y-0.5 text-xs font-medium">
                  {/* Theme Selector */}
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                      Theme
                    </span>
                    <div className="flex items-center gap-1 bg-[var(--surface-3)] p-0.5 rounded-lg border border-[var(--border-default)]">
                      {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={(e) => setThemeWithTransition(t, e)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                            theme === t
                              ? 'bg-[var(--surface-1)] text-[var(--accent-indigo)] shadow-xs font-bold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Icon name={isDirector ? 'shield' : 'lock'} size="xs" className="text-[var(--text-tertiary)]" />
                    <span>{isDirector ? 'Change PIN' : 'Change Password'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Icon name="settings" size="xs" className="text-[var(--text-tertiary)]" />
                    <span>System Settings</span>
                  </button>
                </div>

                {/* Sign out */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      dispatch(logout());
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer font-semibold"
                  >
                    <Icon name="log-out" size="xs" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        isDirector={isDirector}
      />
    </header>
  );
};

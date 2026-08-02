'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Badge } from '@/design-system';
import { QUICK_NOTIFICATIONS, CURRENT_USER } from '@/mock/dashboard';

interface TopHeaderProps {
  onMobileMenuOpen: () => void;
}

/**
 * STEP Enterprise TopHeader — Clean Streamlined Profile Dropdown with Interactive Breadcrumbs
 */
export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuOpen }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = QUICK_NOTIFICATIONS.filter((n) => !n.read).length;

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

  // Determine breadcrumb structure based on pathname
  const isCandidatePage = pathname?.includes('/dashboard/candidates');

  return (
    <header
      className="sticky top-0 z-30 h-13 flex items-center justify-between px-4 sm:px-6 bg-[var(--surface-1)] border-b border-[var(--border-default)]"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Left: Mobile Menu Trigger + Interactive Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors focus-ring-step cursor-pointer"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
        >
          <Icon name="menu" size="sm" />
        </button>

        {/* Page breadcrumb with active back navigation */}
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
            className={`text-[11px] sm:text-[13.5px] tracking-tight font-heading cursor-pointer transition-colors ${
              isCandidatePage
                ? 'font-medium text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)] hover:underline'
                : 'font-bold text-[var(--text-primary)]'
            }`}
          >
            Dashboard
          </button>

          {isCandidatePage && (
            <>
              <Icon name="chevron-right" size="xs" className="text-[var(--text-tertiary)] opacity-60 shrink-0" />
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-[11px] sm:text-[13.5px] font-bold text-[var(--text-primary)] tracking-tight font-heading hover:text-[var(--accent-indigo)] cursor-pointer truncate max-w-[72px] sm:max-w-none"
              >
                Candidates
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-3">
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

          {/* Notification Panel */}
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
                  {QUICK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-[12px] flex items-start gap-3 hover:bg-[var(--surface-hover)] transition-colors ${
                        !n.read ? 'bg-[var(--accent-indigo-dim)]/20' : ''
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
                  ))}
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
            <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[12px] flex items-center justify-center shadow-xs">
              {CURRENT_USER.avatarInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[12.5px] font-bold text-[var(--text-primary)] leading-none font-heading">
                {CURRENT_USER.name}
              </span>
              <span className="text-[10.5px] text-[var(--text-tertiary)] font-medium leading-tight">
                {CURRENT_USER.role}
              </span>
            </div>
            <Icon
              name="chevron-down"
              size="xs"
              className={`text-[var(--text-tertiary)] transition-transform duration-150 ${
                profileOpen ? 'rotate-180 text-[var(--text-primary)]' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

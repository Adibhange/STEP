'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Badge } from '@/design-system';
import { QUICK_NOTIFICATIONS, CURRENT_USER } from '@/mock/dashboard';

interface TopHeaderProps {
  onMobileMenuOpen: () => void;
}

/**
 * STEP Enterprise TopHeader — Clean Streamlined Profile Dropdown
 */
export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuOpen }) => {
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

  return (
    <header
      className="sticky top-0 z-30 h-13 flex items-center justify-between px-4 sm:px-6 bg-[var(--surface-1)] border-b border-[var(--border-default)]"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
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

        {/* Page breadcrumb */}
        <div className="flex items-center gap-2 text-[var(--type-body-md-size)]">
          <span className="text-[13px] font-medium text-[var(--text-tertiary)] tracking-tight">STEP</span>
          <Icon name="chevron-right" size="xs" className="text-[var(--text-tertiary)] opacity-60" />
          <span className="text-[13.5px] font-bold text-[var(--text-primary)] tracking-tight font-heading">Dashboard</span>
        </div>
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
            onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
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
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
                role="region"
                aria-label="Notifications"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="danger" size="sm">{unreadCount} unread</Badge>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-step">
                  {QUICK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-2.5 border-b border-[var(--border-soft)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer
                        ${!n.read ? 'bg-[var(--surface-2)]' : ''}`}
                    >
                      <span className={`mt-0.5 shrink-0 ${notifColorMap[n.type]}`}>
                        <Icon name={notifIconMap[n.type] as any} size="sm" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate">{n.title}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-snug mt-0.5 line-clamp-2">{n.description}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{n.time}</p>
                      </div>
                      {!n.read && (
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center border-t border-[var(--border-default)] bg-[var(--surface-2)]">
                  <button
                    type="button"
                    className="text-[12px] text-[var(--accent-indigo)] font-semibold hover:text-[var(--accent-indigo-hover)] transition-colors cursor-pointer"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar Trigger & Streamlined Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            id="profile-trigger"
            className="w-8.5 h-8.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)] flex items-center justify-center text-[11.5px] font-black
              border border-[var(--accent-indigo)] border-opacity-30 hover:border-opacity-60 hover:scale-[1.04] active:scale-95 transition-all duration-150 focus-ring-step cursor-pointer"
            onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            {CURRENT_USER.avatarInitials}
          </button>

          {/* Streamlined Profile Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
                role="menu"
                aria-label="Profile menu"
              >
                <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surface-2)]">
                  <p className="text-[13px] font-bold text-[var(--text-primary)]">{CURRENT_USER.name}</p>
                  <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">{CURRENT_USER.role}</p>
                  <p className="text-[10.5px] text-[var(--text-tertiary)] truncate mt-0.5">{CURRENT_USER.email}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                  >
                    <Icon name="user" size="xs" />
                    Profile Settings
                  </button>
                </div>

                <div className="border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)] transition-colors text-left cursor-pointer"
                  >
                    <Icon name="log-out" size="xs" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

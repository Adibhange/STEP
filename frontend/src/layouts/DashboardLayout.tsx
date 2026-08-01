'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/registry/icons';
import { useUserPreferences } from '@/providers/user-preferences-provider';
import { CommandPalette } from '@/components/search/CommandPalette';
import { useKeyboard } from '@/hooks/useKeyboard';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Overview Dashboard', path: '/dashboard', icon: 'BarChart3' },
  { label: 'Candidates Grid', path: '/candidates', icon: 'Users' },
  { label: 'Verification Queue', path: '/candidates/verification', icon: 'UserCheck' },
  { label: 'Walk-In Registration', path: '/candidates/walk-in', icon: 'Plus' },
  { label: 'Vacancies Pipeline', path: '/vacancies', icon: 'Briefcase' },
  { label: 'Question Repository', path: '/assessment/question-bank', icon: 'FileText' },
  { label: 'Paper & Pattern Builder', path: '/assessment/paper-builder', icon: 'SlidersHorizontal' },
  { label: 'Live Exam Sessions', path: '/assessment/sessions', icon: 'Clock' },
  { label: 'Interview Timetable', path: '/interviews/schedule', icon: 'Calendar' },
  { label: 'Reports & Analytics', path: '/reports', icon: 'TrendingUp' },
  { label: 'System Audit Logs', path: '/audit-logs', icon: 'ShieldAlert' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { preferences, setTheme, setDensity, toggleSidebar } = useUserPreferences();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useKeyboard({
    'ctrl+k': () => setIsCommandOpen(true),
    '/': () => setIsCommandOpen(true),
  });

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside
        className={`bg-[var(--bg-sidebar)] text-slate-300 border-r border-[var(--border-subtle)] flex flex-col transition-all duration-200 ${
          preferences.sidebarCollapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Brand Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-slate-800">
          {!preferences.sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-xs">
                S
              </div>
              <span className="font-bold text-xs tracking-tight text-white">STEP ERMS</span>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
            title="Toggle Sidebar"
          >
            <Icon name={preferences.sidebarCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={14} />
          </button>
        </div>

        {/* Quick Command Trigger */}
        {!preferences.sidebarCollapsed && (
          <div className="p-2 border-b border-slate-800">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-400 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="Search" size={13} />
                <span>Search system...</span>
              </div>
              <kbd className="px-1 text-[10px] bg-slate-800 rounded font-mono">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-[var(--brand-primary)] text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={preferences.sidebarCollapsed ? item.label : undefined}
              >
                <Icon name={item.icon as any} size={15} />
                {!preferences.sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-2.5 border-t border-slate-800 flex items-center justify-between">
          {!preferences.sidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-xs">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Aditya Bhange</p>
                <p className="text-[10px] text-slate-400 truncate">Senior Director</p>
              </div>
            </div>
          )}
          <Link href="/login" className="text-slate-400 hover:text-red-400 p-1" title="Sign Out">
            <Icon name="LogOut" size={15} />
          </Link>
        </div>
      </aside>

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium flex items-center gap-1">
              <Icon name="Building2" size={13} />
              Mumbai HQ (192.168.2.5)
            </span>
          </div>

          {/* Controls & Preferences Toolbar */}
          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <div className="flex items-center bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded p-0.5">
              <button
                onClick={() => setTheme('light')}
                className={`p-1 rounded ${preferences.theme === 'light' ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs' : 'text-[var(--text-muted)]'}`}
                title="Light Theme"
              >
                <Icon name="Sun" size={13} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1 rounded ${preferences.theme === 'dark' ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-xs' : 'text-[var(--text-muted)]'}`}
                title="Dark Theme"
              >
                <Icon name="Moon" size={13} />
              </button>
              <button
                onClick={() => setTheme('high-contrast')}
                className={`p-1 rounded ${preferences.theme === 'high-contrast' ? 'bg-[var(--bg-surface)] text-yellow-400 font-bold shadow-xs' : 'text-[var(--text-muted)]'}`}
                title="High Contrast Accessibility Theme"
              >
                <Icon name="Eye" size={13} />
              </button>
            </div>

            {/* Density Selector */}
            <div className="flex items-center bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded p-0.5 text-[10px] font-medium">
              <button
                onClick={() => setDensity('compact')}
                className={`px-1.5 py-0.5 rounded ${preferences.density === 'compact' ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}`}
              >
                Compact
              </button>
              <button
                onClick={() => setDensity('comfortable')}
                className={`px-1.5 py-0.5 rounded ${preferences.density === 'comfortable' ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}`}
              >
                Comfortable
              </button>
              <button
                onClick={() => setDensity('spacious')}
                className={`px-1.5 py-0.5 rounded ${preferences.density === 'spacious' ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}`}
              >
                Spacious
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-1.5 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]">
              <Icon name="Bell" size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--status-danger)] rounded-full animate-ping" />
            </button>
          </div>
        </header>

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
};

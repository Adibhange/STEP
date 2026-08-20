'use client';

import React, { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * STEP Enterprise DashboardShell
 *
 * Provides responsive sidebar, sticky header, and immediate content rendering
 * without blocking layout animations on Next.js client-side route transitions.
 */
export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);
  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--canvas)]">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <TopHeader onMobileMenuOpen={handleMobileOpen} />

        {/* Scrollable page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--canvas)] scrollbar-step"
          tabIndex={-1}
          aria-label="Main content"
        >
          <div key={pathname} className="w-full min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

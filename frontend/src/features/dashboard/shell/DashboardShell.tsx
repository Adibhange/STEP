'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * STEP Enterprise DashboardShell
 *
 * Page Transition:
 * - Fade + 12px upward motion
 * - Duration: 220ms
 * - Easing: easeOut
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

        {/* Scrollable page content with Smooth Entrance Transition */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--canvas)] scrollbar-step"
          tabIndex={-1}
          aria-label="Main content"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

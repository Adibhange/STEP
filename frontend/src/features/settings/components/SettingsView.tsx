'use client';

import React from 'react';
import { Icon } from '@/design-system';
import { useAppSelector, selectCurrentUser } from '@/store';
import { ConfigurationPanel } from './ConfigurationPanel';

/**
 * STEP Enterprise Master Data View
 *
 * Dedicated Master Data Workspace for enterprise taxonomies:
 * Roles, Experience, Departments, Employment Types, Hiring Locations, Test Locations.
 */
export const SettingsView: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const isInterviewer = currentUser?.role === 'Interviewer';

  if (isInterviewer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[var(--danger-subtle)] border border-[var(--danger-border)] flex items-center justify-center text-[var(--danger)] mb-4 shadow-sm">
          <Icon name="lock" size="md" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Restricted</h2>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Master Data management is restricted to Directors and HRs. Interviewers have access to assigned candidate workspaces and technical evaluations only.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 w-full">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
          Master Data Management
        </h1>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Manage enterprise recruitment taxonomy, department definitions, experience tiers, and location masters.
        </p>
      </div>

      {/* Main Content Workspace */}
      <main className="w-full flex flex-col gap-4 min-w-0">
        <ConfigurationPanel />
      </main>
    </div>
  );
};

'use client';

import React from 'react';
import { ConfigurationPanel } from './ConfigurationPanel';

/**
 * STEP Enterprise Master Data View
 *
 * Dedicated Master Data Workspace for enterprise taxonomies:
 * Roles, Experience, Departments, Employment Types, Hiring Locations, Test Locations.
 */
export const SettingsView: React.FC = () => {
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

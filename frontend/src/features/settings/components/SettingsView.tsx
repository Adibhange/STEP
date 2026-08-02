'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { ConfigurationPanel } from './ConfigurationPanel';

export type SettingsTabId = 'general' | 'configuration' | 'notifications' | 'security' | 'audit';

export interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  icon: string;
  description: string;
}

export const SETTINGS_TABS: SettingsTabItem[] = [
  { id: 'general', label: 'General', icon: 'settings', description: 'Platform branding, organization details & defaults' },
  { id: 'configuration', label: 'Configuration', icon: 'grid', description: 'Enterprise Master Data taxonomy & dropdown values' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', description: 'Email templates, Webhooks & Automated alerts' },
  { id: 'security', label: 'Security', icon: 'shield-check', description: 'SSO, Password policies & 2FA access control' },
  { id: 'audit', label: 'Audit Logs', icon: 'file-text', description: 'System-wide activity audit trail' },
];

/**
 * STEP Enterprise SettingsView
 *
 * 2-Column Modern Settings Architecture:
 * Left Nav: General, Configuration, Notifications, Security, Audit Logs
 * Right Panel: Selected settings view
 */
export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('configuration');

  const currentTab = SETTINGS_TABS.find((t) => t.id === activeTab) || SETTINGS_TABS[1];

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
          System Settings
        </h1>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Manage enterprise platform configuration, master data taxonomy, notification rules, and security controls.
        </p>
      </div>

      {/* 2-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-2 shadow-2xs flex flex-col gap-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)] font-bold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'}`}>
                  <Icon name={tab.icon as any} size="sm" />
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] leading-tight truncate">{tab.label}</span>
                  <span className="text-[10.5px] text-[var(--text-tertiary)] truncate mt-0.5 font-normal">
                    {tab.description}
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right Content Panel */}
        <main className="lg:col-span-9 flex flex-col gap-4 min-w-0">
          {activeTab === 'configuration' && <ConfigurationPanel />}

          {activeTab === 'general' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3">General Settings</h3>
              <div className="space-y-4 text-[13px]">
                <div>
                  <label className="font-bold text-[var(--text-primary)] block">Organization Name</label>
                  <input type="text" defaultValue="SthapatyaSTEP Enterprise" className="w-full mt-1.5 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] outline-none" />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-primary)] block">Primary Timezone</label>
                  <input type="text" defaultValue="Asia/Kolkata (IST +05:30)" className="w-full mt-1.5 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3">Notification Rules</h3>
              <p className="text-[12.5px] text-[var(--text-tertiary)]">Configure automated recruitment alerts, email templates, and candidate notifications.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3">Security & Access Control</h3>
              <p className="text-[12.5px] text-[var(--text-tertiary)]">Manage SSO authentication, session timeouts, and role-based permissions.</p>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3">System Audit Trail</h3>
              <p className="text-[12.5px] text-[var(--text-tertiary)]">Chronological audit log of master data updates, user role changes, and system events.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

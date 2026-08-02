'use client';

import React from 'react';
import { Icon } from '@/design-system';
import { EntityStatus } from '../entity-status/EntityStatus';

export interface WorkspaceHeaderTab {
  id: string;
  label: string;
  badge?: number | string;
  icon?: string;
}

export interface WorkspaceHeaderProps {
  /** Title e.g. "Senior React Developer" or "Aditya Bhange" */
  title: string;
  /** Status Label e.g. "Open", "Draft", "Screening" */
  status?: string;
  /** Status Variant color token */
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Metadata key-value pills e.g. [{ label: 'Location', value: 'Pune' }] */
  metadata?: Array<{ label?: string; value: string; icon?: string }>;
  /** Primary Action Buttons e.g. "Edit Vacancy", "Generate QR" */
  actions?: React.ReactNode;
  /** Secondary Tabs Navigation */
  tabs?: WorkspaceHeaderTab[];
  /** Active Tab ID */
  activeTab?: string;
  /** Tab Change Handler */
  onTabChange?: (tabId: string) => void;
  /** Optional Back link handler */
  onBack?: () => void;
  backLabel?: string;
}

/**
 * STEP Enterprise WorkspaceHeader Primitive
 *
 * Universal workspace header used across Vacancy Workspace, Candidate Workspace, etc.
 * Features Title, Status Badge, Metadata tags, Primary Action buttons, and Secondary Tab navigation.
 */
export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  status,
  statusVariant = 'success',
  metadata = [],
  actions,
  tabs = [],
  activeTab,
  onTabChange,
  onBack,
  backLabel = 'Back',
}) => {
  return (
    <header className="bg-[var(--surface-1)] border-b border-[var(--border-default)] pt-4 px-4 sm:px-6 shadow-2xs flex flex-col gap-4">
      {/* Top Back Link */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer w-fit"
        >
          <Icon name="arrow-left" size="xs" />
          <span>{backLabel}</span>
        </button>
      )}

      {/* Main Title Row + Status + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title + Status + Metadata */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
              {title}
            </h1>
            {status && <EntityStatus status={status} variant={statusVariant} />}
          </div>

          {/* Metadata Tags */}
          {metadata.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {metadata.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded-md border border-[var(--border-default)]"
                >
                  {item.icon && <Icon name={item.icon as any} size="xs" className="text-[var(--text-tertiary)]" />}
                  {item.label && <span className="text-[var(--text-tertiary)] font-normal">{item.label}:</span>}
                  <span className="font-semibold text-[var(--text-primary)]">{item.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Secondary Tabs Navigation */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-[var(--border-default)] pt-1 -mb-px">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer
                  ${
                    isActive
                      ? 'border-[var(--accent-indigo)] text-[var(--accent-indigo)] font-bold'
                      : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                  }`}
              >
                {tab.icon && <Icon name={tab.icon as any} size="xs" />}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)]'
                        : 'bg-[var(--surface-3)] text-[var(--text-tertiary)]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

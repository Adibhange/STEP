'use client';

import React from 'react';
import { Icon } from '@/design-system';

export interface EntityHeaderTab {
  id: string;
  label: string;
  badge?: number | string;
  icon?: string;
}

export interface EntityHeaderProps {
  /** Entity Title e.g. "Senior React Developer" */
  title: string;
  /** Status Label e.g. "Open", "Draft", "Active" */
  status?: string;
  /** Status Variant color token */
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Metadata key-value pills e.g. [{ label: 'Location', value: 'Pune' }, { label: 'Exp', value: '2–4 Yrs' }] */
  metadata?: Array<{ label?: string; value: string; icon?: string }>;
  /** Primary Action Buttons e.g. "Edit Vacancy", "Generate QR" */
  actions?: React.ReactNode;
  /** Secondary Tabs Navigation */
  tabs?: EntityHeaderTab[];
  /** Active Tab ID */
  activeTab?: string;
  /** Tab Change Handler */
  onTabChange?: (tabId: string) => void;
  /** Optional Breadcrumb back label / handler */
  onBack?: () => void;
  backLabel?: string;
}

const STATUS_STYLE_MAP = {
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger)]',
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info)]',
  neutral: 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border-default)]',
};

/**
 * STEP Enterprise EntityHeader Primitive
 *
 * Universal header component for Vacancies, Candidates, Assessments, Question Papers.
 * Renders Title, Status Badge, Metadata tags, Primary Action buttons, and Secondary Tab navigation.
 */
export const EntityHeader: React.FC<EntityHeaderProps> = ({
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
      {/* Top Navigation Back Link (if provided) */}
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
        {/* Left: Title + Status Badge + Metadata Pills */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
              {title}
            </h1>
            {status && (
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs font-mono uppercase tracking-wider ${
                  STATUS_STYLE_MAP[statusVariant]
                }`}
              >
                {status}
              </span>
            )}
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

        {/* Right: Primary & Secondary Actions */}
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
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer
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

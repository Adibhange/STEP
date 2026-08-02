'use client';

import React from 'react';
import { Icon } from '@/design-system';

export interface JourneyCardProps {
  id?: string;
  title: string;
  status: 'passed' | 'active' | 'scheduled' | 'pending' | 'rejected' | 'skipped' | 'not_started';
  statusLabel?: string;
  date?: string;
  owner?: string;
  summary?: string;
  actions?: React.ReactNode;
  icon?: string;
  colorToken?: string; // e.g. '--status-success'
  metadata?: { label: string; value: string; icon?: string }[];
  isLast?: boolean;
}

/**
 * STEP Enterprise JourneyCard Primitive
 * Reusable workflow timeline card used across Recruitment Journey, Vacancy Pipeline, Assessment Progress.
 */
export const JourneyCard: React.FC<JourneyCardProps> = ({
  title,
  status,
  statusLabel,
  date,
  owner,
  summary,
  actions,
  icon,
  metadata = [],
  isLast = false,
}) => {
  // Status style mappings using strictly registered IconNames
  const statusMap = {
    passed: {
      dotBg: 'bg-[var(--status-success)] text-white',
      badgeBg: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]',
      borderLeft: 'border-l-[var(--status-success)]',
      icon: 'check',
      defaultLabel: 'Passed',
    },
    active: {
      dotBg: 'bg-[var(--accent-indigo)] text-white animate-pulse shadow-[0_0_0_4px_rgba(99,102,241,0.2)]',
      badgeBg: 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)] border-[var(--accent-indigo)]',
      borderLeft: 'border-l-[var(--accent-indigo)]',
      icon: 'trending-up',
      defaultLabel: 'Current Active Stage',
    },
    scheduled: {
      dotBg: 'bg-[var(--status-info)] text-white',
      badgeBg: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info)]',
      borderLeft: 'border-l-[var(--status-info)]',
      icon: 'calendar',
      defaultLabel: 'Scheduled',
    },
    pending: {
      dotBg: 'bg-[var(--status-warning)] text-white',
      badgeBg: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning)]',
      borderLeft: 'border-l-[var(--status-warning)]',
      icon: 'info',
      defaultLabel: 'Pending',
    },
    rejected: {
      dotBg: 'bg-[var(--status-danger)] text-white',
      badgeBg: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger)]',
      borderLeft: 'border-l-[var(--status-danger)]',
      icon: 'x',
      defaultLabel: 'Rejected',
    },
    skipped: {
      dotBg: 'bg-[var(--accent-violet)] text-white',
      badgeBg: 'bg-[var(--accent-violet-dim)] text-[var(--accent-violet-hover)] border-[var(--accent-violet)]',
      borderLeft: 'border-l-[var(--accent-violet)]',
      icon: 'arrow-right',
      defaultLabel: 'Skipped',
    },
    not_started: {
      dotBg: 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border border-[var(--border-default)]',
      badgeBg: 'bg-[var(--surface-2)] text-[var(--text-tertiary)] border-[var(--border-default)]',
      borderLeft: 'border-l-[var(--border-default)]',
      icon: 'info',
      defaultLabel: 'Not Started',
    },
  };

  const style = statusMap[status] || statusMap.not_started;
  const label = statusLabel || style.defaultLabel;
  const cardIcon = icon || style.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline Vertical Connector & Dot */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-extrabold shrink-0 z-10 ${style.dotBg}`}>
          <Icon name={cardIcon as any} size="xs" />
        </span>
        {!isLast && (
          <div className="w-[2px] flex-1 bg-[var(--border-default)] my-1.5 min-h-[32px]" />
        )}
      </div>

      {/* Card Content Container */}
      <div
        className={`flex-1 bg-[var(--surface-1)] rounded-[var(--radius-md)] border border-[var(--border-default)] border-l-4 ${style.borderLeft} p-4 shadow-2xs transition-all duration-150 hover:-translate-y-[1px] hover:shadow-xs mb-5`}
      >
        {/* Top Card Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[14px] font-extrabold text-[var(--text-primary)] font-heading leading-tight">
              {title}
            </h4>
            <span className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full font-mono border ${style.badgeBg}`}>
              {label}
            </span>
          </div>

          {date && (
            <span className="text-[11.5px] font-mono text-[var(--text-tertiary)] font-semibold flex items-center gap-1">
              <Icon name="calendar" size="xs" />
              {date}
            </span>
          )}
        </div>

        {/* Metadata Grid */}
        {metadata.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2.5 p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-soft)] text-[12px]">
            {metadata.map((m, idx) => (
              <div key={idx} className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block truncate">
                  {m.label}
                </span>
                <span className="font-semibold text-[var(--text-primary)] mt-0.5 truncate flex items-center gap-1">
                  {m.icon && <Icon name={m.icon as any} size="xs" className="text-[var(--text-tertiary)]" />}
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Owner & Summary Text */}
        {owner && (
          <div className="text-[11.5px] text-[var(--text-secondary)] font-medium mb-1.5 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)] font-mono font-bold text-[9.5px] flex items-center justify-center shrink-0">
              {owner.split(' ').map((w) => w[0]).join('')}
            </span>
            <span>Assigned: <strong className="text-[var(--text-primary)]">{owner}</strong></span>
          </div>
        )}

        {summary && (
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-2)] p-2.5 rounded-[var(--radius-sm)] border border-[var(--border-soft)] mt-2 font-sans italic">
            "{summary}"
          </p>
        )}

        {/* Action Button Row */}
        {actions && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[var(--border-soft)]">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React from 'react';

export interface EntityStatusProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

const STATUS_STYLE_MAP = {
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger)]',
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info)]',
  neutral: 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border-default)]',
};

const DOT_COLOR_MAP = {
  success: 'bg-[var(--status-success)]',
  warning: 'bg-[var(--status-warning)]',
  danger: 'bg-[var(--status-danger)]',
  info: 'bg-[var(--status-info)]',
  neutral: 'bg-[var(--text-tertiary)]',
};

/**
 * STEP Enterprise EntityStatus Primitive
 * Reusable pill badge component for candidate statuses, vacancy statuses, and master data statuses.
 */
export const EntityStatus: React.FC<EntityStatusProps> = ({
  status,
  variant = 'neutral',
  size = 'md',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-bold rounded-full border shadow-2xs ${
        size === 'sm' ? 'text-[10px] px-2 py-0.2' : 'text-[11px] px-2.5 py-0.5'
      } ${STATUS_STYLE_MAP[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR_MAP[variant]}`} />
      <span>{status}</span>
    </span>
  );
};

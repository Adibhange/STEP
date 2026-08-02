'use client';

import React from 'react';
import { Icon } from '@/design-system';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * STEP Enterprise EmptyState
 *
 * Minimal, elegant empty state for tables and lists.
 * No fake charts. No fake widgets. Just clear, actionable guidance.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-[var(--space-md)] py-[var(--space-4xl)] px-[var(--padding-card)]"
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <span className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-tertiary)]">
        <Icon name={icon as any} size="md" />
      </span>

      {/* Text */}
      <div className="flex flex-col items-center gap-[var(--space-2xs)] text-center max-w-xs">
        <h3 className="text-[var(--type-h3-size)] font-semibold text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="text-[var(--type-body-md-size)] text-[var(--text-tertiary)] leading-relaxed">{description}</p>
        )}
      </div>

      {/* Optional action */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-[var(--space-2xs)] h-8 px-[var(--space-md)] rounded-[var(--radius-md)]
            bg-[var(--accent-indigo)] text-white text-[var(--type-body-md-size)] font-semibold
            hover:bg-[var(--accent-indigo-hover)] transition-colors duration-[var(--duration-fast)] focus-ring-step"
        >
          <Icon name="plus" size="xs" />
          {action.label}
        </button>
      )}
    </div>
  );
};

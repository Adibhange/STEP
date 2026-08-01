import React from 'react';
import type { BadgeProps } from './badge.types';

/**
 * Badge Primitive Component
 *
 * High-contrast status pill tag component supporting 6px indicator dots,
 * semantic status variants, and contextual accent variants.
 *
 * Accent variants reference the canonical accent palette (colors.css §5).
 * They do NOT encode module or domain semantics — that is the page's responsibility.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const variantStyles: Record<string, { container: string; dot: string }> = {
    // ── Neutral ───────────────────────────────────────────────────────────
    neutral: {
      container: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
      dot: 'bg-[var(--text-muted)]',
    },

    // ── Semantic Status ───────────────────────────────────────────────────
    success: {
      container: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]',
      dot: 'bg-[var(--status-success)]',
    },
    warning: {
      container: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)]',
      dot: 'bg-[var(--status-warning)]',
    },
    danger: {
      container: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)]',
      dot: 'bg-[var(--status-danger)]',
    },
    info: {
      container: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border border-[var(--status-info-border)]',
      dot: 'bg-[var(--status-info)]',
    },

    // ── Accent Palette Variants ───────────────────────────────────────────
    // Pages use these when a contextual accent label is needed.
    // No module semantics are encoded here.
    indigo: {
      container: 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)] border border-[var(--accent-indigo-dim)]',
      dot: 'bg-[var(--accent-indigo)]',
    },
    violet: {
      container: 'bg-[var(--accent-violet-dim)] text-[var(--accent-violet-hover)] border border-[var(--accent-violet-dim)]',
      dot: 'bg-[var(--accent-violet)]',
    },
    blue: {
      container: 'bg-[var(--accent-blue-dim)] text-[var(--accent-blue-hover)] border border-[var(--accent-blue-dim)]',
      dot: 'bg-[var(--accent-blue)]',
    },
    cyan: {
      container: 'bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan-hover)] border border-[var(--accent-cyan-dim)]',
      dot: 'bg-[var(--accent-cyan)]',
    },
    green: {
      container: 'bg-[var(--accent-green-dim)] text-[var(--accent-green-hover)] border border-[var(--accent-green-dim)]',
      dot: 'bg-[var(--accent-green)]',
    },
    orange: {
      container: 'bg-[var(--accent-orange-dim)] text-[var(--accent-orange-hover)] border border-[var(--accent-orange-dim)]',
      dot: 'bg-[var(--accent-orange)]',
    },
    red: {
      container: 'bg-[var(--accent-red-dim)] text-[var(--accent-red-hover)] border border-[var(--accent-red-dim)]',
      dot: 'bg-[var(--accent-red)]',
    },
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
  };

  const activeVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold select-none shrink-0 ${activeVariant.container} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeVariant.dot}`} />}
      {icon}
      {children && <span>{children}</span>}
    </span>
  );
};

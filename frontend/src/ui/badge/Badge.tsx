'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'muted',
  size = 'md',
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const variants = {
    success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success)]/20',
    warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning)]/20',
    danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger)]/20',
    info: 'bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info)]/20',
    brand: 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/20',
    muted: 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

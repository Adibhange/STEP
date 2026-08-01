'use client';

import React from 'react';
import { Icon, IconName } from '@/registry/icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white focus:ring-[var(--brand-primary)]',
    secondary: 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] focus:ring-[var(--border-strong)]',
    outline: 'border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] focus:ring-[var(--brand-primary)]',
    ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] focus:ring-[var(--border-strong)]',
    danger: 'bg-[var(--status-danger)] hover:opacity-90 text-white focus:ring-[var(--status-danger)]',
    success: 'bg-[var(--status-success)] hover:opacity-90 text-white focus:ring-[var(--status-success)]',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-xs gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : icon && iconPosition === 'left' ? (
        <Icon name={icon} size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      ) : null}

      {children}

      {!isLoading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

'use client';

import React from 'react';
import { Icon, IconName } from '@/registry/icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: IconName;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none">
            <Icon name={icon} size={15} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[var(--bg-input)] text-[var(--text-primary)] border ${
            error ? 'border-[var(--status-danger)] focus:ring-[var(--status-danger)]' : 'border-[var(--border-strong)] focus:border-[var(--brand-primary)]'
          } rounded px-3 py-1.5 text-xs placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] transition-all ${
            icon ? 'pl-8' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-[var(--status-danger)] animate-slide-down">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

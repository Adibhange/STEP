import React from 'react';
import type { KbdProps } from './kbd.types';

/**
 * Kbd Primitive Component
 * 
 * Stylized keyboard shortcut key badge component.
 */
export const Kbd: React.FC<KbdProps> = ({ children, className = '', ...props }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-3xs rounded-xs bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-strong)] text-[length:var(--type-mono-size)] font-mono font-medium shadow-sm select-none ${className}`}
      {...props}
    >
      {children}
    </kbd>
  );
};

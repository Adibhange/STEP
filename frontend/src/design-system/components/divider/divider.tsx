import React from 'react';
import type { DividerProps } from './divider.types';

/**
 * Divider Primitive Component
 * 
 * Layout boundary separator supporting horizontal and vertical orientations.
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'subtle',
  label,
  className = '',
  ...props
}) => {
  const borderClass = variant === 'strong' ? 'border-[var(--border-strong)]' : 'border-[var(--border-subtle)]';

  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`inline-block self-stretch w-[1px] border-l ${borderClass} ${className}`}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" aria-orientation="horizontal" className={`flex items-center w-full my-xs ${className}`} {...props}>
        <div className={`flex-grow border-t ${borderClass}`} />
        <span className="px-xs text-[length:var(--type-caption-size)] text-[var(--text-muted)] font-medium select-none">
          {label}
        </span>
        <div className={`flex-grow border-t ${borderClass}`} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`w-full border-t ${borderClass} my-xs ${className}`}
      {...props}
    />
  );
};

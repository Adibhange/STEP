import React, { useId } from 'react';
import type { CheckboxProps } from './checkbox.types';
import { Icon } from '../../icon';

/**
 * Checkbox Primitive Component
 * 
 * Accessible checkbox component with tactile active state, keyboard focus ring,
 * and custom checkmark animation.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      checked = false,
      disabled = false,
      className = '',
      id: customId,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = customId || generatedId;

    return (
      <div className={`flex items-start gap-xs select-none ${className}`}>
        <div className="relative flex items-center mt-3xs">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-[18px] h-[18px] rounded-xs border transition-all duration-fast flex items-center justify-center cursor-pointer focus-ring-step ${
              checked
                ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                : 'bg-[var(--surface-base)] border-[var(--border-strong)] hover:border-[var(--brand-primary)]'
            } ${disabled ? 'opacity-disabled cursor-not-allowed' : ''}`}
          >
            {checked && <Icon name="check" size="xs" strokeWidth="hero" className="text-white" />}
          </div>
        </div>

        {label && (
          <div className="flex flex-col">
            <label
              htmlFor={checkboxId}
              className={`text-[length:var(--type-body-md-size)] text-[var(--text-primary)] cursor-pointer ${
                disabled ? 'opacity-disabled cursor-not-allowed' : ''
              }`}
            >
              {label}
            </label>
            {helperText && (
              <p className="text-[length:var(--type-caption-size)] text-[var(--text-muted)]">{helperText}</p>
            )}
            {error && (
              <p role="alert" className="text-[length:var(--type-caption-size)] text-[var(--status-danger)]">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

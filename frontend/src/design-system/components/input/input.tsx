import React, { useId } from 'react';
import type { InputProps } from './input.types';
import { Icon } from '../../icon';

/**
 * Universal Input Primitive Component
 * 
 * Single base input component for text, numbers, search, and password entries.
 * Features label, helper text, error live-region, clear button (✕), and slotting.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      sizeToken = 'md',
      leftSlot,
      rightSlot,
      onClear,
      value,
      onChange,
      disabled = false,
      readOnly = false,
      required = false,
      className = '',
      containerClassName = '',
      type = 'text',
      placeholder,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasValue = value !== undefined && value !== null && String(value).length > 0;
    const showClear = onClear && hasValue && !disabled && !readOnly;

    const sizeStyles: Record<string, string> = {
      sm: 'h-8 text-xs px-2.5',
      md: 'h-9 text-xs px-3',
      lg: 'h-11 text-sm px-3.5',
    };

    const isError = Boolean(error);

    return (
      <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide select-none"
          >
            {label}
            {required && <span className="text-[var(--status-danger)] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftSlot && (
            <div className="absolute left-3 flex items-center justify-center pointer-events-none text-[var(--text-muted)] z-10">
              {leftSlot}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            aria-invalid={isError}
            aria-describedby={isError ? errorId : helperText ? helperId : undefined}
            className={`w-full rounded-md bg-[var(--surface-base)] text-[var(--text-primary)] border transition-all duration-150 focus-ring-step placeholder:text-[var(--text-muted)] disabled:opacity-40 disabled:cursor-not-allowed ${
              isError
                ? 'border-[var(--status-danger)]'
                : 'border-[var(--border-subtle)] focus:border-[var(--border-strong)]'
            } ${leftSlot ? 'pl-9' : ''} ${
              rightSlot && showClear ? 'pr-16' : rightSlot || showClear ? 'pr-9' : ''
            } ${sizeStyles[sizeToken]} ${className}`}
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-1.5 z-10">
            {showClear && (
              <button
                type="button"
                onClick={onClear}
                tabIndex={-1}
                aria-label="Clear input text"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-full focus-ring-step cursor-pointer"
              >
                <Icon name="close" size="xs" />
              </button>
            )}
            {rightSlot}
          </div>
        </div>

        {isError && (
          <p id={errorId} role="alert" className="text-xs text-[var(--status-danger)] font-medium mt-0.5">
            {error}
          </p>
        )}

        {!isError && helperText && (
          <p id={helperId} className="text-xs text-[var(--text-muted)] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

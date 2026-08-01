import React, { useRef, useEffect } from 'react';
import type { PinInputProps } from './pin-input.types';

/**
 * 6-Digit Keypad PIN Input Primitive Component
 * 
 * Auto-advancing digit input keypad supporting 6-digit paste, backspace navigation,
 * mask toggle, numeric keyboard support, and auto-completion trigger.
 */
export const PinInput: React.FC<PinInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  masked = false,
  error,
  disabled = false,
  autoFocus = false,
  className = '',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split PIN string into digit array
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleDigitChange = (index: number, digitValue: string) => {
    // Only accept numeric digits
    const cleaned = digitValue.replace(/\D/g, '');
    if (!cleaned && digitValue !== '') return;

    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    const newValue = newDigits.join('');

    onChange(newValue);

    // Auto advance to next input
    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto complete callback when full length is entered
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);

    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className={`flex flex-col gap-xs items-center ${className}`}>
      <div className="flex items-center gap-xs">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-[44px] h-[48px] text-center text-[length:var(--type-h2-size)] font-mono font-bold rounded-sm bg-[var(--surface-base)] text-[var(--text-primary)] border transition-all duration-fast focus-ring-step ${
              error
                ? 'border-[var(--status-danger)]'
                : 'border-[var(--border-subtle)] focus:border-[var(--border-strong)]'
            }`}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="text-[length:var(--type-caption-size)] text-[var(--status-danger)] font-medium animate-shake">
          {error}
        </p>
      )}
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import type { PinInputProps } from './pin-input.types';

/**
 * 4-Digit (or N-Digit) Keypad PIN Input Primitive Component
 * 
 * Auto-advancing digit input keypad supporting fast pasting, backspace navigation,
 * mask toggle, numeric keyboard support, micro-animations, and auto-completion trigger.
 */
export const PinInput: React.FC<PinInputProps> = ({
  length = 4,
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
    <div className={`flex flex-col gap-2 items-center ${className}`}>
      <div className="flex items-center gap-3">
        {digits.map((digit, index) => {
          const isFilled = Boolean(digit);
          return (
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
              aria-invalid={Boolean(error)}
              className={`w-[54px] h-[58px] text-center text-2xl font-mono font-bold rounded-xl transition-all duration-200 ease-out outline-none select-none ${
                error
                  ? 'border-2 border-red-500 bg-red-500/5 text-red-600 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-shake'
                  : isFilled
                  ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 shadow-[0_2px_8px_rgba(99,102,241,0.12)] scale-[1.02]'
                  : 'border border-[var(--border-default,#cbd5e1)] bg-[var(--surface-1,#ffffff)] text-[var(--text-primary,#0f172a)] hover:border-[var(--border-strong,#94a3b8)] focus:border-2 focus:border-indigo-600 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)] focus:scale-[1.04]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
            />
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500 font-semibold animate-shake mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

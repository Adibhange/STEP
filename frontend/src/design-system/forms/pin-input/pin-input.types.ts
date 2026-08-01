import React from 'react';

export interface PinInputProps {
  /** Length of the PIN code. Default: 6 */
  length?: number;
  /** Current PIN string value */
  value: string;
  /** Callback fired when PIN value changes */
  onChange: (value: string) => void;
  /** Callback fired automatically when all PIN digits are filled */
  onComplete?: (value: string) => void;
  /** Mask PIN digits (bullet dots vs plain numbers). Default: false */
  masked?: boolean;
  /** Error message string */
  error?: string;
  /** Disabled input state */
  disabled?: boolean;
  /** Auto focus the first PIN input box on mount */
  autoFocus?: boolean;
  /** Additional CSS class names */
  className?: string;
}

import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text rendered beside checkbox */
  label?: React.ReactNode;
  /** Helper text rendered below label */
  helperText?: string;
  /** Error message */
  error?: string;
}

import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label rendered above input field */
  label?: string;
  /** Helper descriptive text rendered below input field */
  helperText?: string;
  /** Error message (replaces helper text in red status color) */
  error?: string;
  /** Size token: 'sm' (28px), 'md' (36px), 'lg' (44px). Default: 'md' */
  sizeToken?: InputSize;
  /** Left slot node (icon or prefix text) */
  leftSlot?: React.ReactNode;
  /** Right slot node (icon or suffix action) */
  rightSlot?: React.ReactNode;
  /** Callback fired when user clicks the clear button (✕) */
  onClear?: () => void;
  /** Container CSS classes */
  containerClassName?: string;
}

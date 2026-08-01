import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant. Default: 'primary' */
  variant?: ButtonVariant;
  /** Size token: 'sm' (28px), 'md' (36px), 'lg' (44px). Default: 'md' */
  size?: ButtonSize;
  /** Shows inline loading spinner and preserves button dimensions */
  loading?: boolean;
  /** Disables interaction and lowers opacity */
  disabled?: boolean;
  /** Left slot element (typically an Icon) */
  leftSlot?: React.ReactNode;
  /** Right slot element (typically an Icon or Badge) */
  rightSlot?: React.ReactNode;
  /** Expands button width to fill parent container */
  fullWidth?: boolean;
}

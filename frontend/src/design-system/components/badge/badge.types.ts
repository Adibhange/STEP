import React from 'react';

/**
 * Badge Variant Type
 *
 * Variants are grouped into two categories:
 *
 * SEMANTIC STATUS — communicates system feedback
 *   neutral | success | warning | danger | info
 *
 * ACCENT PALETTE — contextual label color chosen by the page/feature
 *   indigo | violet | blue | cyan | green | orange | red
 *
 * There are NO module-specific variants (no 'overview', 'records', etc.).
 * Accent colors are contextual — pages decide which accent to use.
 * This follows the STEP Brand DNA v3.0 Color Restraint principle.
 */
export type BadgeVariant =
  // Semantic status
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  // Contextual accent palette
  | 'indigo'
  | 'violet'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'orange'
  | 'red';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variant token governing tag background, text, and dot indicator. Default: 'neutral' */
  variant?: BadgeVariant;
  /** Size token: 'sm' (tight tag) or 'md' (standard status badge). Default: 'md' */
  size?: BadgeSize;
  /** Renders a 6px status dot indicator on the left side of the badge */
  dot?: boolean;
  /** Optional icon displayed in slot */
  icon?: React.ReactNode;
}

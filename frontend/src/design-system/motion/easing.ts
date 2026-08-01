/**
 * STEP Enterprise Platform — Programmatic Easing Curves
 * 
 * Exports cubic-bezier cubic array tuples and CSS string format curves
 * matching CSS spatial easing tokens.
 */

export const EASING_CURVES = {
  /** Deceleration curve for entering elements: cubic-bezier(0.0, 0.0, 0.2, 1) */
  EASE_OUT: [0.0, 0.0, 0.2, 1] as const,
  /** Acceleration curve for exiting elements: cubic-bezier(0.4, 0.0, 1, 1) */
  EASE_IN: [0.4, 0.0, 1, 1] as const,
  /** Standard curve for spatial moves across the canvas: cubic-bezier(0.4, 0.0, 0.2, 1) */
  EASE_IN_OUT: [0.4, 0.0, 0.2, 1] as const,
  /** Tactile spring curve for energetic micro-interactions: cubic-bezier(0.16, 1, 0.3, 1) */
  EASE_SPRING: [0.16, 1, 0.3, 1] as const,
} as const;

export const EASING_CSS_STRINGS = {
  EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  EASE_SPRING: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

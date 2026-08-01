/**
 * STEP Enterprise Platform — Programmatic Motion Durations
 * 
 * Exports JavaScript animation duration constants in milliseconds, matching CSS motion tokens.
 * Used for programmatic JS animations and future animation adapters.
 */

export const MOTION_DURATIONS = {
  /** 75ms: Immediate visual toggles (checkboxes, switches, radio buttons) */
  INSTANT: 75,
  /** 150ms: Fast hover highlights, focus rings, tooltip entrances */
  FAST: 150,
  /** 200ms: Standard side-drawer slide-ins, modal entrances, tab indicators */
  STANDARD: 200,
  /** 300ms: Complex collapsible sidebar expand/collapse, accordions */
  COMPLEX: 300,
} as const;

export type MotionDurationKey = keyof typeof MOTION_DURATIONS;

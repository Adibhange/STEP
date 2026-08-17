import type { Variants } from 'framer-motion';
import { EASING_CURVES } from './easing';
import { MOTION_DURATIONS } from './durations';

/**
 * Standard container variant with staggered child orchestration
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

/**
 * Fast container for high-density lists & table rows
 */
export const staggerFastContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.01,
    },
  },
};

/**
 * Stagger item variant with tactile spring pop-in
 */
export const kpiCardVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 280,
      mass: 0.8,
    },
  },
};

/**
 * Tactile Spring Pop-In (Scale: 0.88-0.90 -> 1.0) for cards and primary workspace panels
 */
export const tactilePopCardVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 22 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 280,
      mass: 0.8,
    },
  },
};

/**
 * Tactile Spring Pop-In for list and table row items
 */
export const tactilePopItemVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 300,
      mass: 0.7,
    },
  },
};

/**
 * Clean fade-slide-up for general cards and panels
 */
export const fadeSlideUpVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.FAST / 1000,
      ease: EASING_CURVES.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: MOTION_DURATIONS.FAST / 1000,
      ease: EASING_CURVES.EASE_IN,
    },
  },
};

/**
 * Subtle scale pop for badges, avatars, and status icons
 */
export const scalePopVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.FAST / 1000,
      ease: EASING_CURVES.EASE_SPRING,
    },
  },
};

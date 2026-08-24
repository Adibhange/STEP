import type { Variants } from "framer-motion";
import { EASING_CURVES } from "./easing";
import { MOTION_DURATIONS } from "./durations";

/**
 * Standard container variant with staggered child orchestration
 */
export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.03,
			delayChildren: 0.01,
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
			staggerChildren: 0.018,
			delayChildren: 0.01,
		},
	},
};

/**
 * Stagger item variant with subtle, crisp enterprise spring pop-in
 */
export const kpiCardVariant: Variants = {
	hidden: { opacity: 0, scale: 0.97, y: 12 },
	show: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			damping: 24,
			stiffness: 320,
			mass: 0.6,
		},
	},
};

/**
 * Tactile Spring Pop-In (Scale: 0.97 -> 1.0) for cards and primary workspace panels
 */
export const tactilePopCardVariant: Variants = {
	hidden: { opacity: 0, scale: 0.97, y: 14 },
	show: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			damping: 24,
			stiffness: 320,
			mass: 0.6,
		},
	},
};

/**
 * Tactile Spring Pop-In for list and table row items
 */
export const tactilePopItemVariant: Variants = {
	hidden: { opacity: 0, scale: 0.98, y: 8 },
	show: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			damping: 22,
			stiffness: 340,
			mass: 0.5,
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

/**
 * Next-Level Elastic Blooming Spring variant for enterprise modals & dialogs
 * Features harmonic spring overshoot, visual center-point blooming, and exit retract.
 */
export const elasticDialogVariant: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.88,
		y: -20,
	},
	show: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 360,
			damping: 22,
			mass: 0.7,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		y: 12,
		transition: {
			duration: 0.2,
			ease: [0.16, 1, 0.3, 1],
		},
	},
};

/**
 * Smooth hardware-accelerated backdrop fade for dialog overlays
 */
export const dialogBackdropVariant: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { duration: 0.22, ease: [0.0, 0.0, 0.2, 1] },
	},
	exit: {
		opacity: 0,
		transition: { duration: 0.2, ease: [0.4, 0.0, 1, 1] },
	},
};

/**
 * Staggered content flourish variant for dialog headers, tabs, and body sections
 */
export const dialogContentBlossomVariant: Variants = {
	hidden: { opacity: 0, y: 8 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.22,
			ease: [0.16, 1, 0.3, 1],
		},
	},
};

/**
 * Standard tactile spring card variant for vacancy cards, stage flow cards, and dashboard panels
 */
export const cardVariants: Variants = {
	hidden: { opacity: 0, y: 16, scale: 0.98 },
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring" as const,
			damping: 26,
			stiffness: 320,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.96,
		transition: { duration: 0.15 },
	},
};

/**
 * Question card directional carousel slider variant for candidate exam assessments
 */
export const questionCardSliderVariant: Variants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 55 : -55,
		opacity: 0,
		scale: 0.98,
		filter: "blur(3px)",
	}),
	center: {
		x: 0,
		opacity: 1,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			x: { type: "spring" as const, stiffness: 360, damping: 28 },
			opacity: { duration: 0.28 },
			scale: { duration: 0.28 },
			filter: { duration: 0.2 },
		},
	},
	exit: (direction: number) => ({
		x: direction < 0 ? 55 : -55,
		opacity: 0,
		scale: 0.98,
		filter: "blur(3px)",
		transition: {
			x: { type: "spring" as const, stiffness: 360, damping: 28 },
			opacity: { duration: 0.2 },
			filter: { duration: 0.15 },
		},
	}),
};

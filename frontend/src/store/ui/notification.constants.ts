import type { NotificationVariant } from './notification.types';

/**
 * Default display durations in milliseconds per notification variant
 */
export const DEFAULT_NOTIFICATION_DURATIONS: Record<NotificationVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
  loading: 0, // Persistent until explicitly updated or dismissed
};

/**
 * Standard enterprise success messages
 */
export const ENTERPRISE_SUCCESS_MESSAGES = {
  AUTHENTICATED: 'Authenticated successfully.',
  DIRECTOR_CLEARANCE_VERIFIED: 'Director clearance verified.',
  CANDIDATE_CREATED: 'Candidate created successfully.',
  CANDIDATE_UPDATED: 'Candidate updated successfully.',
  CANDIDATE_DELETED: 'Candidate deleted successfully.',
  QUESTION_PAPER_PUBLISHED: 'Question paper published.',
  INTERVIEW_SCHEDULED: 'Interview scheduled successfully.',
  ASSIGNMENT_SUBMITTED: 'Assignment submitted successfully.',
  PREFERENCES_SAVED: 'User preferences saved.',
} as const;

/**
 * Standard enterprise error messages
 */
export const ENTERPRISE_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to service. Check your network connection.',
  UNAUTHORIZED: 'Authentication required. Please sign in.',
  FORBIDDEN: 'You do not have clearance for this operation.',
  NOT_FOUND: 'Requested resource was not found.',
  VALIDATION_FAILED: 'Please correct invalid fields before proceeding.',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred. Our team has been notified.',
  SESSION_EXPIRED: 'Session expired. Please sign in again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

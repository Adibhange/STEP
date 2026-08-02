/**
 * STEP Enterprise Platform — Status Configuration
 *
 * Canonical badge variant, icon, and display label for every candidate status.
 * Pages must never hardcode badge colors or labels — reference this config.
 * Future statuses only require adding a new entry here.
 */
import type { BadgeVariant } from '@/design-system';

export type CandidateStatus =
  | 'Screening'
  | 'Interview'
  | 'Offered'
  | 'On Hold'
  | 'Rejected'
  | 'Hired';

export interface StatusConfig {
  label: string;
  variant: BadgeVariant;
  icon: string;
  dot?: boolean;
  token: string; // CSS variable token for bottom indicator bars
}

export const CANDIDATE_STATUS_CONFIG: Record<CandidateStatus, StatusConfig> = {
  Screening: {
    label: 'Screening',
    variant: 'blue',
    icon: 'filter',
    dot: true,
    token: '--accent-blue',
  },
  Interview: {
    label: 'Interview',
    variant: 'indigo',
    icon: 'mic',
    dot: true,
    token: '--accent-indigo',
  },
  Offered: {
    label: 'Offered',
    variant: 'info',
    icon: 'send',
    dot: true,
    token: '--status-info',
  },
  'On Hold': {
    label: 'On Hold',
    variant: 'warning',
    icon: 'pause-circle',
    dot: true,
    token: '--status-warning',
  },
  Rejected: {
    label: 'Rejected',
    variant: 'danger',
    icon: 'x-circle',
    dot: true,
    token: '--status-danger',
  },
  Hired: {
    label: 'Hired',
    variant: 'success',
    icon: 'check-circle',
    dot: true,
    token: '--status-success',
  },
};

/** Stage display config */
export type CandidateStage =
  | 'Online Assessment'
  | 'Technical Screen'
  | 'Machine Round'
  | 'HR Verification'
  | 'Director Round'
  | 'Offer Released';

export interface StageConfig {
  label: string;
  shortLabel: string;
  step: number;
  variant: BadgeVariant;
}

export const CANDIDATE_STAGE_CONFIG: Record<CandidateStage, StageConfig> = {
  'Online Assessment': { label: 'Online Assessment', shortLabel: 'Assessment', step: 1, variant: 'blue' },
  'Technical Screen': { label: 'Technical Screen', shortLabel: 'Technical', step: 2, variant: 'indigo' },
  'Machine Round': { label: 'Machine Round', shortLabel: 'Machine', step: 3, variant: 'violet' },
  'HR Verification': { label: 'HR Verification', shortLabel: 'HR', step: 4, variant: 'cyan' },
  'Director Round': { label: 'Director Round', shortLabel: 'Director', step: 5, variant: 'orange' },
  'Offer Released': { label: 'Offer Released', shortLabel: 'Offered', step: 6, variant: 'success' },
};

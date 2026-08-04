/**
 * STEP Enterprise Platform — Centralized Dashboard Feature Type Definitions
 */

export interface KpiItem {
  id: string;
  title: string;
  count: number | string;
  trend: number;
  trendLabel: string;
  subMetric: string;
  icon: string;
  colorToken: string;
  bgToken: string;
}

export type CandidateSource = 'WalkIn' | 'HomeTest';
export type CandidateStage = 'Screening' | 'Technical' | 'Managerial' | 'HR' | 'Director' | 'Offered';
export type CandidateStatus = 'Screening' | 'Offered' | 'Rejected' | 'On Hold' | 'Joined';

export interface DashboardCandidate {
  id: number | string;
  code: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  experience: string;
  experienceYears?: number;
  source: CandidateSource;
  stage: CandidateStage;
  currentRound: string;
  assignedInterviewer: string;
  status: CandidateStatus;
  hiringLocation: string;
  testLocation: string;
  riskScore: number;
  city: string;
  appliedDate: string;
  avatarInitials?: string;
  avatarBg?: string;
}

export interface QuickNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
}

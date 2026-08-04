/**
 * STEP Enterprise Platform — Centralized Vacancies Feature Type Definitions
 *
 * Single source of truth for Vacancy Models, Assessment Sections, Pipeline Flow Versions, and Candidate Directory models.
 * Aligned 1:1 with C# ASP.NET Core DTOs and EF Core Domain Models.
 */

export interface AssessmentSectionConfig {
  id: string;
  sectionTitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  marksPerQuestion: number;
  totalMarks: number;
}

export interface PipelineRound {
  id: string;
  name: string;
  type: 'Aptitude' | 'Technical' | 'F2F' | 'HR' | 'Group Discussion';
  cutoffPercent: number;
}

export interface PipelineFlowVersion {
  id: string;
  versionName: string;
  isDefault?: boolean;
  assignedCandidateCount: number;
  description: string;
  rounds: PipelineRound[];
}

export interface CandidateBulkItem {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  flowVersion: string;
  status: 'Pending' | 'Assigned' | 'In Evaluation';
}

export interface VacancyItem {
  id: string;
  code: string;
  title: string;
  driveType?: 'Walk-in Drive' | 'Direct / Sourced Hiring';
  role: string;
  department: string;
  employmentType: string;
  experience: string;
  hiringLocation: string;
  testLocation: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  openPositions: number;
  positionsCount?: number;
  status: 'Open' | 'Draft' | 'Paused' | 'Closed' | 'Archived';
  createdAt: string;
  closingDate: string;
  assignedRecruiter: string;
  hiringManager: string;
  
  // Pipeline metrics
  appliedCount: number;
  assessmentCount: number;
  interviewCount: number;
  offeredCount: number;
  joinedCount: number;

  // Question paper
  questionPaperId?: string;
  questionPaperTitle?: string;
  assessmentDurationMinutes?: number;
  passingCriteriaPercentage?: number;

  // Walk-in Drive details
  walkInDrive?: {
    enabled: boolean;
    name: string;
    venue: string;
    date: string;
    time: string;
    capacity: number;
    registrationDeadline: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
  };

  // QR Registration analytics
  qrAnalytics?: {
    qrCodeUrl: string;
    registrationUrl: string;
    enabled: boolean;
    registrationDeadline: string;
    totalScans: number;
    successfulRegistrations: number;
    expiredRegistrations: number;
    conversionRate: number;
    lastScanTime: string;
  };

  // Activity feed
  activities: Array<{
    id: string;
    timestamp: string;
    user: string;
    type: 'create' | 'assign' | 'walkin' | 'qr' | 'status' | 'candidate';
    title: string;
    description: string;
  }>;
}

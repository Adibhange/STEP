/**
 * STEP Enterprise Platform — Centralized Vacancies Feature Type Definitions
 *
 * Single source of truth for Assessment Sections, Pipeline Flow Versions, and Candidate Directory models.
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

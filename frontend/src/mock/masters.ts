/**
 * STEP Enterprise Platform — Centralized Master Data Configuration Mock
 */

export interface MasterRecord {
  id: string;
  name: string;
  code?: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
}

export const MASTER_DATA: Record<string, MasterRecord[]> = {
  roles: [
    { id: 'role-1', name: 'Software Engineer', code: 'SE', status: 'Active', updatedAt: '2026-07-28' },
    { id: 'role-2', name: 'Senior Frontend Engineer', code: 'SFE', status: 'Active', updatedAt: '2026-07-29' },
    { id: 'role-3', name: 'DevOps Specialist', code: 'DE', status: 'Active', updatedAt: '2026-07-20' },
    { id: 'role-4', name: 'QA Automation Engineer', code: 'QA', status: 'Active', updatedAt: '2026-07-15' },
    { id: 'role-5', name: 'Data Analyst', code: 'DA', status: 'Active', updatedAt: '2026-08-01' },
    { id: 'role-6', name: 'Product Manager', code: 'PM', status: 'Inactive', updatedAt: '2026-06-10' },
  ],
  experiences: [
    { id: 'exp-1', name: 'Fresher / Entry Level', code: '0-1Y', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'exp-2', name: 'Junior (1.2–2.8 Years)', code: '1-3Y', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'exp-3', name: 'Mid-Senior (4–7 Years)', code: '4-7Y', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'exp-4', name: 'Lead / Principal (8+ Years)', code: '8+Y', status: 'Active', updatedAt: '2026-07-01' },
  ],
  hiringLocations: [
    { id: 'loc-1', name: 'Mumbai HQ', code: 'MUM', status: 'Active', updatedAt: '2026-07-25' },
    { id: 'loc-2', name: 'Pune Tech Park', code: 'PUN', status: 'Active', updatedAt: '2026-07-25' },
    { id: 'loc-3', name: 'Bengaluru Innovation Center', code: 'BLR', status: 'Active', updatedAt: '2026-07-25' },
    { id: 'loc-4', name: 'Remote India', code: 'REM', status: 'Active', updatedAt: '2026-07-25' },
  ],
  testLocations: [
    { id: 'tloc-1', name: 'Mumbai Test Center 1', code: 'TC-MUM', status: 'Active', updatedAt: '2026-07-10' },
    { id: 'tloc-2', name: 'Pune Assessment Hub', code: 'TC-PUN', status: 'Active', updatedAt: '2026-07-10' },
    { id: 'tloc-3', name: 'Online Remote Proctored', code: 'TC-ONL', status: 'Active', updatedAt: '2026-07-10' },
  ],
  departments: [
    { id: 'dept-1', name: 'Engineering', code: 'ENG', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'dept-2', name: 'Product Management', code: 'PRD', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'dept-3', name: 'Talent Acquisition', code: 'TA', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'dept-4', name: 'Quality Assurance', code: 'QA', status: 'Active', updatedAt: '2026-07-01' },
  ],
  employmentTypes: [
    { id: 'emp-1', name: 'Full-Time Permanent', code: 'FT', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'emp-2', name: 'Contractual (6-12 Months)', code: 'CON', status: 'Active', updatedAt: '2026-07-01' },
    { id: 'emp-3', name: 'Graduate Internship', code: 'INT', status: 'Active', updatedAt: '2026-07-01' },
  ],
  assessmentTitles: [
    { id: 'at-1', name: 'MCQ (Multiple Choice Questions)', code: 'MCQ', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-2', name: 'Coding & Algorithm Challenge', code: 'CODE', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-3', name: 'SQL & Database Queries', code: 'SQL', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-4', name: 'Subjective & Essay Questions', code: 'SUBJ', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-5', name: 'General Aptitude & Logical Test', code: 'APT', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-6', name: 'System Design & Architecture', code: 'ARCH', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-7', name: 'Technical F2F & Live Coding', code: 'F2F', status: 'Active', updatedAt: '2026-08-03' },
    { id: 'at-8', name: 'HR & Cultural Fit Round', code: 'HR', status: 'Active', updatedAt: '2026-08-03' },
  ],
};

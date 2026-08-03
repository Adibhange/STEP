/**
 * STEP Enterprise Platform — Master Data Configuration Mock
 *
 * Single unified mock dataset powering all 15 Configuration master entities.
 */

export interface MasterRecord {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
  count?: number;
}

export const MASTER_DATA: Record<string, MasterRecord[]> = {
  roles: [
    { id: 'role-1', name: 'Software Engineer', code: 'SE-01', description: 'Core application developer', status: 'Active', updatedAt: '2026-07-28', count: 42 },
    { id: 'role-2', name: 'Senior Frontend Engineer', code: 'SFE-02', description: 'React/TypeScript specialist', status: 'Active', updatedAt: '2026-07-29', count: 18 },
    { id: 'role-3', name: 'DevOps Specialist', code: 'DE-03', description: 'Cloud infrastructure & CI/CD', status: 'Active', updatedAt: '2026-07-20', count: 9 },
    { id: 'role-4', name: 'QA Automation Engineer', code: 'QA-04', description: 'Automated test suite author', status: 'Active', updatedAt: '2026-07-15', count: 12 },
    { id: 'role-5', name: 'Product Manager', code: 'PM-05', description: 'Product roadmap & strategy', status: 'Inactive', updatedAt: '2026-06-10', count: 4 },
  ],
  experiences: [
    { id: 'exp-1', name: 'Fresher / Entry Level', code: '0-1 Yrs', description: 'Recent graduates', status: 'Active', updatedAt: '2026-07-01', count: 85 },
    { id: 'exp-2', name: 'Junior (1.2–2.8 Years)', code: '1-3 Yrs', description: 'Foundational experience', status: 'Active', updatedAt: '2026-07-01', count: 140 },
    { id: 'exp-3', name: 'Mid-Senior (4–7 Years)', code: '4-7 Yrs', description: 'Independent contributor', status: 'Active', updatedAt: '2026-07-01', count: 210 },
    { id: 'exp-4', name: 'Lead / Principal (8+ Years)', code: '8+ Yrs', description: 'Architecture & technical leadership', status: 'Active', updatedAt: '2026-07-01', count: 65 },
  ],
  hiringLocations: [
    { id: 'loc-1', name: 'Mumbai HQ', code: 'BOM', description: 'Main Corporate Tower', status: 'Active', updatedAt: '2026-07-25', count: 180 },
    { id: 'loc-2', name: 'Pune Tech Park', code: 'PNQ', description: 'Hinjawadi IT Hub', status: 'Active', updatedAt: '2026-07-25', count: 220 },
    { id: 'loc-3', name: 'Bengaluru Innovation Center', code: 'BLR', description: 'Outer Ring Road Lab', status: 'Active', updatedAt: '2026-07-25', count: 95 },
    { id: 'loc-4', name: 'Remote India', code: 'REM', description: 'Work from Anywhere (India)', status: 'Active', updatedAt: '2026-07-25', count: 50 },
  ],
  testLocations: [
    { id: 'tloc-1', name: 'Mumbai Test Center 1', code: 'TC-BOM-1', description: 'Lab A & B', status: 'Active', updatedAt: '2026-07-10', count: 120 },
    { id: 'tloc-2', name: 'Pune Assessment Hub', code: 'TC-PNQ-1', description: 'Capacity 150', status: 'Active', updatedAt: '2026-07-10', count: 200 },
    { id: 'tloc-3', name: 'Online Remote Proctored', code: 'TC-ONLINE', description: 'Webcam AI Proctored', status: 'Active', updatedAt: '2026-07-10', count: 350 },
  ],
  departments: [
    { id: 'dept-1', name: 'Engineering', code: 'ENG', description: 'Core Tech & Development', status: 'Active', updatedAt: '2026-07-01', count: 320 },
    { id: 'dept-2', name: 'Product Management', code: 'PRD', description: 'UX & Product Strategy', status: 'Active', updatedAt: '2026-07-01', count: 35 },
    { id: 'dept-3', name: 'Talent Acquisition', code: 'TA', description: 'Recruitment & HR', status: 'Active', updatedAt: '2026-07-01', count: 20 },
    { id: 'dept-4', name: 'Quality Assurance', code: 'QA', description: 'Software Quality', status: 'Active', updatedAt: '2026-07-01', count: 45 },
  ],
  assessmentTitles: [
    { id: 'at-1', name: 'MCQ (Multiple Choice Questions)', code: 'MCQ', description: 'Objective choice evaluation', status: 'Active', updatedAt: '2026-08-03', count: 120 },
    { id: 'at-2', name: 'Coding & Algorithm Challenge', code: 'CODE', description: 'Live coding IDE test', status: 'Active', updatedAt: '2026-08-03', count: 85 },
    { id: 'at-3', name: 'SQL & Database Queries', code: 'SQL', description: 'Database schema & queries', status: 'Active', updatedAt: '2026-08-03', count: 64 },
    { id: 'at-4', name: 'Subjective & Essay Questions', code: 'SUBJ', description: 'Domain theory & essays', status: 'Active', updatedAt: '2026-08-03', count: 42 },
    { id: 'at-5', name: 'General Aptitude & Logical Test', code: 'APT', description: 'Quant & analytical logic', status: 'Active', updatedAt: '2026-08-03', count: 150 },
    { id: 'at-6', name: 'System Design & Architecture', code: 'ARCH', description: 'High-level system design', status: 'Active', updatedAt: '2026-08-03', count: 38 },
    { id: 'at-7', name: 'Technical F2F & Live Coding', code: 'F2F', description: 'In-person pair coding round', status: 'Active', updatedAt: '2026-08-03', count: 90 },
    { id: 'at-8', name: 'HR & Cultural Fit Round', code: 'HR', description: 'Culture & behavioral fit', status: 'Active', updatedAt: '2026-08-03', count: 110 },
  ],
  skills: [
    { id: 'skill-1', name: 'React.js', code: 'REACT', description: 'Frontend UI library', status: 'Active', updatedAt: '2026-07-30', count: 280 },
    { id: 'skill-2', name: 'TypeScript', code: 'TS', description: 'Typed JavaScript', status: 'Active', updatedAt: '2026-07-30', count: 310 },
    { id: 'skill-3', name: 'Node.js', code: 'NODE', description: 'Backend JavaScript runtime', status: 'Active', updatedAt: '2026-07-30', count: 190 },
    { id: 'skill-4', name: 'PostgreSQL', code: 'PG', description: 'Relational Database', status: 'Active', updatedAt: '2026-07-30', count: 160 },
    { id: 'skill-5', name: 'Docker & Kubernetes', code: 'K8S', description: 'Containerization', status: 'Active', updatedAt: '2026-07-30', count: 85 },
  ],
  employmentTypes: [
    { id: 'emp-1', name: 'Full-Time Permanent', code: 'FT', description: 'Standard employee contract', status: 'Active', updatedAt: '2026-07-01', count: 450 },
    { id: 'emp-2', name: 'Contractual (6-12 Months)', code: 'CON', description: 'Fixed term contract', status: 'Active', updatedAt: '2026-07-01', count: 35 },
    { id: 'emp-3', name: 'Graduate Internship', code: 'INT', description: '6 Months stipend program', status: 'Active', updatedAt: '2026-07-01', count: 15 },
  ],
};

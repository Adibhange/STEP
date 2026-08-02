/**
 * STEP Enterprise Platform — Master Data Configuration Mock
 *
 * Single unified mock dataset powering all 14 Configuration master entities.
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
  interviewTypes: [
    { id: 'itype-1', name: 'Technical Screening', code: 'TECH-1', description: 'Initial coding evaluation', status: 'Active', updatedAt: '2026-07-01', count: 143 },
    { id: 'itype-2', name: 'System Design', code: 'SYS-DES', description: 'Architecture & Scalability', status: 'Active', updatedAt: '2026-07-01', count: 52 },
    { id: 'itype-3', name: 'Culture & HR Fit', code: 'HR-FIT', description: 'Soft skills & team alignment', status: 'Active', updatedAt: '2026-07-01', count: 45 },
  ],
  interviewRounds: [
    { id: 'iround-1', name: 'Round 1: Online Assessment', code: 'R1-ASSESS', description: 'Automated test paper', status: 'Active', updatedAt: '2026-07-01', count: 500 },
    { id: 'iround-2', name: 'Round 2: Technical Live Coding', code: 'R2-CODE', description: '1-on-1 pair programming', status: 'Active', updatedAt: '2026-07-01', count: 143 },
    { id: 'iround-3', name: 'Round 3: System Design & Architecture', code: 'R3-ARCH', description: 'Senior panel interview', status: 'Active', updatedAt: '2026-07-01', count: 97 },
    { id: 'iround-4', name: 'Round 4: Leadership & HR', code: 'R4-HR', description: 'Director discussion', status: 'Active', updatedAt: '2026-07-01', count: 19 },
  ],
  candidateStatuses: [
    { id: 'st-1', name: 'New / Applied', code: 'NEW', description: 'Initial application received', status: 'Active', updatedAt: '2026-07-01', count: 120 },
    { id: 'st-2', name: 'Screening In Progress', code: 'SCREEN', description: 'Resume & test review', status: 'Active', updatedAt: '2026-07-01', count: 143 },
    { id: 'st-3', name: 'In Interview', code: 'INTERVIEW', description: 'Active interview rounds', status: 'Active', updatedAt: '2026-07-01', count: 97 },
    { id: 'st-4', name: 'Offered', code: 'OFFER', description: 'Offer letter released', status: 'Active', updatedAt: '2026-07-01', count: 19 },
    { id: 'st-5', name: 'Hired / Joined', code: 'HIRED', description: 'Onboarded employee', status: 'Active', updatedAt: '2026-07-01', count: 14 },
    { id: 'st-6', name: 'On Hold', code: 'HOLD', description: 'Awaiting opening confirmation', status: 'Active', updatedAt: '2026-07-01', count: 32 },
    { id: 'st-7', name: 'Rejected', code: 'REJECT', description: 'Not shortlisted', status: 'Active', updatedAt: '2026-07-01', count: 87 },
  ],
  questionCategories: [
    { id: 'qcat-1', name: 'Frontend Engineering', code: 'FE', description: 'DOM, React, CSS, Async JS', status: 'Active', updatedAt: '2026-07-01', count: 120 },
    { id: 'qcat-2', name: 'Backend & APIs', code: 'BE', description: 'REST, GraphQL, Databases', status: 'Active', updatedAt: '2026-07-01', count: 95 },
    { id: 'qcat-3', name: 'Data Structures & Algo', code: 'DSA', description: 'Arrays, Trees, Graphs', status: 'Active', updatedAt: '2026-07-01', count: 80 },
  ],
  questionDifficulty: [
    { id: 'qdiff-1', name: 'Easy (Level 1)', code: 'DIFF-1', description: 'Basic syntax & concepts', status: 'Active', updatedAt: '2026-07-01', count: 85 },
    { id: 'qdiff-2', name: 'Medium (Level 2)', code: 'DIFF-2', description: 'Practical problem solving', status: 'Active', updatedAt: '2026-07-01', count: 140 },
    { id: 'qdiff-3', name: 'Hard (Level 3)', code: 'DIFF-3', description: 'Complex algorithms & edge cases', status: 'Active', updatedAt: '2026-07-01', count: 65 },
  ],
  technologyStack: [
    { id: 'tech-1', name: 'Next.js 16', code: 'NEXT16', description: 'App Router & Turbopack', status: 'Active', updatedAt: '2026-07-01', count: 15 },
    { id: 'tech-2', name: 'Node.js & Express', code: 'NODE-EX', description: 'Backend microservices', status: 'Active', updatedAt: '2026-07-01', count: 22 },
    { id: 'tech-3', name: 'PostgreSQL & Prisma', code: 'PG-PRISMA', description: 'Relational data tier', status: 'Active', updatedAt: '2026-07-01', count: 18 },
  ],
  vacancyTemplates: [
    { id: 'tpl-1', name: 'Standard Fullstack Developer', code: 'TPL-FS', description: 'React + Node 4-round pipeline', status: 'Active', updatedAt: '2026-07-01', count: 8 },
    { id: 'tpl-2', name: 'Senior QA Engineer Template', code: 'TPL-QA', description: 'Automation focus with 3 rounds', status: 'Active', updatedAt: '2026-07-01', count: 5 },
  ],
};

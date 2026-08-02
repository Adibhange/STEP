/**
 * STEP Enterprise Platform — Dashboard Candidate Mock Data
 *
 * Extended version of the root candidate mock with:
 * - Per-round scores (assessment, technical, hr, director)
 * - Hiring location
 * - Test location
 * - On Hold status support
 *
 * This file is self-contained and does NOT modify the root candidate.mock.ts.
 */

export interface DashboardCandidate {
  id: number;
  code: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  experience: string;
  source: 'WalkIn' | 'HomeTest' | 'CampusDrive' | 'Referral' | 'Agency';
  experienceYears: number;
  stage: 'Screening' | 'Technical' | 'HR Interview' | 'Director Round';
  currentRound: 'Screening' | 'Technical' | 'HR Interview' | 'Director Round';
  assignedInterviewer: string;
  status: 'Screening' | 'Interview' | 'Offered' | 'On Hold' | 'Rejected' | 'Hired';
  hiringLocation: string;
  testLocation: string;
  riskScore: number;
  city: string;
  appliedDate: string;
}

const firstNames = ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram', 'Siddharth', 'Ananya', 'Rohan', 'Sneha', 'Karan', 'Pooja', 'Deepak', 'Meera', 'Aditya', 'Divya'];
const lastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Rao', 'Deshmukh', 'Joshi', 'Kulkarni', 'Mehta', 'Nair', 'Chopra', 'Bhatia', 'Iyer', 'Reddy'];
const roles = [
  'Senior Full Stack Engineer',
  'Backend Engineer (.NET)',
  'Frontend Engineer (React/Next.js)',
  'DevOps Architect',
  'QA Automation Engineer',
  'Data Engineer',
  'UI/UX Designer',
];
const expValues = ['Fresher', '1.2 Years', '2.8 Years', '4 Years', '7 Years', '3.5 Years', '5 Years'];
const currentRounds: DashboardCandidate['currentRound'][] = [
  'Screening',
  'Technical',
  'HR Interview',
  'Director Round',
];
const interviewers = [
  'Akshay Patil',
  'Meena Shah',
  'Rajesh Kulkarni',
  'Priya Nair',
  'Vikram Malhotra',
];
const statuses: DashboardCandidate['status'][] = [
  'Screening',
  'Interview',
  'Offered',
  'On Hold',
  'Rejected',
  'Hired',
];
const sources: DashboardCandidate['source'][] = ['WalkIn', 'HomeTest', 'CampusDrive', 'Referral', 'Agency'];
const hiringLocations = ['Mumbai', 'Pune', 'Bengaluru', 'Remote India'];
const testLocations = ['Mumbai HQ', 'Pune Office', 'Home (Remote)'];

export const DASHBOARD_CANDIDATES: DashboardCandidate[] = Array.from({ length: 500 }, (_, i) => {
  const id = i + 1;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const name = `${fn} ${ln}`;
  const code = `CND-${948100 + id}`;
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${id}@example.com`;
  const mobile = `+91 ${9800000000 + id}`;
  const role = roles[i % roles.length];
  const experience = expValues[i % expValues.length];
  const source = sources[i % sources.length];
  const experienceYears = Number((2 + (i % 10) * 0.7).toFixed(1));
  const currentRound = currentRounds[i % currentRounds.length];
  const assignedInterviewer = interviewers[i % interviewers.length];
  const status = statuses[i % statuses.length];
  const isRejected = status === 'Rejected';
  const riskScore = isRejected ? 12.5 : Number(((i % 5) * 0.25).toFixed(1));

  return {
    id,
    code,
    name,
    email,
    mobile,
    role,
    experience,
    source,
    experienceYears,
    stage: currentRound,
    currentRound,
    assignedInterviewer,
    status,
    hiringLocation: hiringLocations[i % hiringLocations.length],
    testLocation: testLocations[i % testLocations.length],
    riskScore,
    city: i % 2 === 0 ? 'Mumbai' : 'Pune',
    appliedDate: new Date(2026, 6, 1 + (i % 30)).toISOString().split('T')[0],
  };
});

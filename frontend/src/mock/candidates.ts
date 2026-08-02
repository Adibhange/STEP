/**
 * STEP Enterprise Platform — Centralized Candidates Mock Data
 */

export interface CandidateItem {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  location: string;
  status: string;
  appliedDate: string;
  score?: number;
}

export const CANDIDATES_MOCK: CandidateItem[] = [
  { id: 'cand-1', code: 'CAND-2026-089', name: 'Aditya Bhange', email: 'aditya.bhange@example.com', phone: '+91 98765 43210', role: 'Senior React Developer', experience: '4.5 Years', location: 'Pune', status: 'Screening', appliedDate: '2026-08-01', score: 88 },
  { id: 'cand-2', code: 'CAND-2026-090', name: 'Priya Verma', email: 'priya.v@example.com', phone: '+91 98765 43211', role: 'Node.js Lead', experience: '8 Years', location: 'Mumbai', status: 'In Interview', appliedDate: '2026-07-28', score: 92 },
];

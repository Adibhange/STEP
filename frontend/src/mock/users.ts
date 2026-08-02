/**
 * STEP Enterprise Platform — Centralized Users Mock Data
 */

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'Recruiter' | 'Interviewer' | 'HR Manager' | 'Director';
  department: string;
  status: 'Active' | 'Inactive' | 'Invited';
}

export const USERS_MOCK: UserItem[] = [
  { id: 'usr-1', name: 'Aditya Bhange', email: 'aditya.bhange@sthapatya.com', role: 'Director', department: 'Talent Acquisition', status: 'Active' },
  { id: 'usr-2', name: 'Rajesh Sharma', email: 'rajesh.sharma@sthapatya.com', role: 'Interviewer', department: 'Engineering', status: 'Active' },
  { id: 'usr-3', name: 'Sneha Kulkarni', email: 'sneha.kulkarni@sthapatya.com', role: 'Recruiter', department: 'Talent Acquisition', status: 'Active' },
  { id: 'usr-4', name: 'Vikram Mehta', email: 'vikram.mehta@sthapatya.com', role: 'HR Manager', department: 'Human Resources', status: 'Active' },
  { id: 'usr-5', name: 'Ananya Joshi', email: 'ananya.joshi@sthapatya.com', role: 'Interviewer', department: 'Engineering', status: 'Invited' },
];

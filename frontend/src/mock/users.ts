/**
 * STEP Enterprise Platform — Centralized Users Mock Data
 */

export type UserRole = 'Director' | 'HR' | 'Interviewer';
export type UserStatus = 'Active' | 'Inactive';

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  empId: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
}

export const USERS_MOCK: UserItem[] = [
  {
    id: 'usr-1',
    firstName: 'Aditya',
    lastName: 'Bhange',
    name: 'Aditya Bhange',
    empId: 'EMP-1001',
    email: 'aditya.bhange@sthapatya.com',
    role: 'Director',
    department: 'Talent Acquisition',
    status: 'Active',
  },
  {
    id: 'usr-2',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    name: 'Rajesh Sharma',
    empId: 'EMP-1002',
    email: 'rajesh.sharma@sthapatya.com',
    role: 'Interviewer',
    department: 'Engineering',
    status: 'Active',
  },
  {
    id: 'usr-3',
    firstName: 'Sneha',
    lastName: 'Kulkarni',
    name: 'Sneha Kulkarni',
    empId: 'EMP-1003',
    email: 'sneha.kulkarni@sthapatya.com',
    role: 'HR',
    department: 'Talent Acquisition',
    status: 'Active',
  },
  {
    id: 'usr-4',
    firstName: 'Vikram',
    lastName: 'Mehta',
    name: 'Vikram Mehta',
    empId: 'EMP-1004',
    email: 'vikram.mehta@sthapatya.com',
    role: 'HR',
    department: 'Human Resources',
    status: 'Active',
  },
  {
    id: 'usr-5',
    firstName: 'Ananya',
    lastName: 'Joshi',
    name: 'Ananya Joshi',
    empId: 'EMP-1005',
    email: 'ananya.joshi@sthapatya.com',
    role: 'Interviewer',
    department: 'Engineering',
    status: 'Inactive',
  },
];

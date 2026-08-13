import type { AuthResultData, UserSummaryData } from '@/store/services/api';

export interface MockUserAccount {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  department: string;
  pin?: string;
  permissions: string[];
}

export const MOCK_USER_ACCOUNTS: MockUserAccount[] = [
  {
    id: 1,
    employeeCode: 'EMP-1001',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@sci-pl.com',
    password: 'Admin@1234',
    role: 'Administrator',
    department: 'Administration',
    permissions: ['all', 'users.manage', 'vacancies.manage', 'candidates.manage', 'settings.manage', 'reports.view'],
  },
  {
    id: 2,
    employeeCode: 'EMP-1002',
    firstName: 'Rajesh',
    lastName: 'Kulkarni',
    email: 'director@sci-pl.com',
    password: 'Director@1234',
    role: 'Director',
    department: 'Administration',
    pin: '1234',
    permissions: ['all', 'offers.approve', 'candidates.evaluate', 'reports.view', 'vacancies.view'],
  },
  {
    id: 3,
    employeeCode: 'EMP-1003',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'hr@sci-pl.com',
    password: 'Hr@1234',
    role: 'HR',
    department: 'Human Resources',
    permissions: ['candidates.manage', 'vacancies.manage', 'interviews.schedule', 'offers.generate', 'reports.view'],
  },
  {
    id: 4,
    employeeCode: 'EMP-1004',
    firstName: 'Vikram',
    lastName: 'Deshmukh',
    email: 'interviewer@sci-pl.com',
    password: 'Interviewer@1234',
    role: 'Interviewer',
    department: 'Engineering',
    permissions: ['assessments.evaluate', 'interviews.evaluate', 'candidates.view'],
  },
  {
    id: 5,
    employeeCode: 'EMP-1005',
    firstName: 'Neha',
    lastName: 'Verma',
    email: 'neha.verma@sci-pl.com',
    password: 'User@1234',
    role: 'HR',
    department: 'Talent Acquisition',
    permissions: ['candidates.manage', 'vacancies.manage', 'interviews.schedule'],
  },
];

export function generateMockAuthPayload(user: MockUserAccount): AuthResultData {
  const userSummary: UserSummaryData = {
    id: user.id,
    employeeCode: user.employeeCode,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };

  return {
    accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
    expiresAtUtc: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    user: userSummary,
  };
}

/**
 * STEP Enterprise Platform — Centralized User Feature Type Definitions
 */

export type UserRole = 'Director' | 'HR' | 'Interviewer';

export type UserStatus = 'Active' | 'Inactive' | 'Pending';

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
  avatarInitials?: string;
  avatarBg?: string;
  createdAt?: string;
}

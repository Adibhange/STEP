/**
 * STEP Enterprise Platform — Sidebar Navigation Configuration (V2 Architecture)
 *
 * 3 logical sections: RECRUITMENT, ANALYTICS, ADMINISTRATION.
 */

export type NavItemId =
  | 'dashboard'
  | 'vacancies'
  | 'assessments'
  | 'reports'
  | 'users'
  | 'settings';

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  isDisabled?: boolean;
  section: 'recruitment' | 'analytics' | 'administration';
  allowedRoles?: Array<'Director' | 'HR' | 'Interviewer' | 'Administrator'>;
}

export const NAV_ITEMS: NavItem[] = [
  // ── RECRUITMENT ────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'layout-dashboard',
    section: 'recruitment',
    allowedRoles: ['Director', 'HR', 'Interviewer', 'Administrator'],
  },
  {
    id: 'vacancies',
    label: 'Vacancies',
    href: '/dashboard/vacancies',
    icon: 'briefcase',
    section: 'recruitment',
    allowedRoles: ['Director', 'HR', 'Administrator'],
  },
  {
    id: 'assessments',
    label: 'Assessments',
    href: '/dashboard/assessments',
    icon: 'clipboard-check',
    badge: 'Soon',
    isDisabled: true,
    section: 'recruitment',
    allowedRoles: ['Director', 'HR', 'Administrator'],
  },

  // ── ANALYTICS ──────────────────────────────────────────────────────────────
  {
    id: 'reports',
    label: 'Reports',
    href: '/dashboard/reports',
    icon: 'bar-chart-2',
    badge: 'Soon',
    isDisabled: true,
    section: 'analytics',
    allowedRoles: ['Director', 'HR', 'Administrator'],
  },

  // ── ADMINISTRATION ─────────────────────────────────────────────────────────
  {
    id: 'users',
    label: 'Users',
    href: '/dashboard/users',
    icon: 'user-cog',
    section: 'administration',
    allowedRoles: ['Director', 'HR', 'Administrator'],
  },
  {
    id: 'settings',
    label: 'Master Data',
    href: '/dashboard/settings',
    icon: 'grid',
    section: 'administration',
    allowedRoles: ['Director', 'HR', 'Administrator'],
  },
];

/** Frozen ordered section labels */
export const NAV_SECTIONS: Record<NavItem['section'], string> = {
  recruitment: 'RECRUITMENT',
  analytics: 'ANALYTICS',
  administration: 'ADMINISTRATION',
};

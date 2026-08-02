/**
 * STEP Enterprise Platform — Sidebar Navigation Configuration (Phase 1 Frozen)
 *
 * Architecture Freeze Policy:
 * 3 logical sections: RECRUITMENT, ANALYTICS, ADMINISTRATION.
 * No standalone database tables (Candidates, Walk-in Drives, Interview Schedule, Masters) in top-level sidebar.
 */

export type NavItemId =
  | 'dashboard'
  | 'vacancies'
  | 'question-papers'
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
  section: 'recruitment' | 'analytics' | 'administration';
}

export const NAV_ITEMS: NavItem[] = [
  // ── RECRUITMENT ────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'layout-dashboard',
    section: 'recruitment',
  },
  {
    id: 'vacancies',
    label: 'Vacancies',
    href: '/dashboard/vacancies',
    icon: 'briefcase',
    section: 'recruitment',
  },
  {
    id: 'question-papers',
    label: 'Question Papers',
    href: '/dashboard/question-papers',
    icon: 'file-text',
    section: 'recruitment',
  },
  {
    id: 'assessments',
    label: 'Assessments',
    href: '/dashboard/assessments',
    icon: 'clipboard-check',
    section: 'recruitment',
  },

  // ── ANALYTICS ──────────────────────────────────────────────────────────────
  {
    id: 'reports',
    label: 'Reports',
    href: '/dashboard/reports',
    icon: 'bar-chart-2',
    section: 'analytics',
  },

  // ── ADMINISTRATION ─────────────────────────────────────────────────────────
  {
    id: 'users',
    label: 'Users',
    href: '/dashboard/users',
    icon: 'user-cog',
    section: 'administration',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
    section: 'administration',
  },
];

/** Frozen ordered section labels */
export const NAV_SECTIONS: Record<NavItem['section'], string> = {
  recruitment: 'RECRUITMENT',
  analytics: 'ANALYTICS',
  administration: 'ADMINISTRATION',
};

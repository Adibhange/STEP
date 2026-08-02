/**
 * STEP Enterprise Platform — Centralized Dashboard Mock Data
 */

export interface DashboardNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
}

export interface PlatformStats {
  totalCandidates: number;
  activeVacancies: number;
  scheduledInterviewsToday: number;
  assessmentsPending: number;
}

export interface KpiItem {
  id: string;
  title: string;
  count: number;
  trend: number;
  trendLabel: string;
  subMetric?: string;
  icon: string;
  colorToken: string;
  bgToken: string;
}

export const CURRENT_USER: CurrentUser = {
  id: 'usr-aditya',
  name: 'Aditya Bhange',
  email: 'aditya.bhange@sthapatya.com',
  role: 'Recruitment Director',
  avatarInitials: 'AB',
};

export const PLATFORM_STATS: PlatformStats = {
  totalCandidates: 1420,
  activeVacancies: 7,
  scheduledInterviewsToday: 7,
  assessmentsPending: 143,
};

export const QUICK_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 'n-1',
    type: 'success',
    title: 'Candidate Registered via QR',
    description: 'Aditya Bhange registered at Pune Mega Walk-in Drive.',
    time: '5 mins ago',
    read: false,
  },
  {
    id: 'n-2',
    type: 'info',
    title: 'Interview Scheduled',
    description: 'Technical Round 2 scheduled for Senior React Architect.',
    time: '25 mins ago',
    read: false,
  },
  {
    id: 'n-3',
    type: 'warning',
    title: 'Walk-in QR Expiring Soon',
    description: 'Registration window for Pune Drive closes in 2 hours.',
    time: '1 hour ago',
    read: true,
  },
];

export const KPI_DATA: KpiItem[] = [
  {
    id: 'total',
    title: 'Total Candidates',
    count: 500,
    trend: 12,
    trendLabel: 'this week',
    subMetric: '18 Active Vacancies',
    icon: 'users',
    colorToken: '--accent-indigo',
    bgToken: '--accent-indigo-dim',
  },
  {
    id: 'screening',
    title: 'Screening',
    count: 143,
    trend: 29,
    trendLabel: '%',
    subMetric: '12 scheduled today',
    icon: 'filter',
    colorToken: '--accent-cyan',
    bgToken: '--accent-cyan-dim',
  },
  {
    id: 'in-interview',
    title: 'In Interview',
    count: 97,
    trend: 8,
    trendLabel: 'vs last week',
    subMetric: '7 interviews today',
    icon: 'mic',
    colorToken: '--accent-violet',
    bgToken: '--accent-violet-dim',
  },
  {
    id: 'offered',
    title: 'Offered',
    count: 19,
    trend: 4,
    trendLabel: 'vs last month',
    subMetric: '2 awaiting approval',
    icon: 'send',
    colorToken: '--accent-blue',
    bgToken: '--accent-blue-dim',
  },
  {
    id: 'on-hold',
    title: 'On Hold',
    count: 32,
    trend: 2,
    trendLabel: 'vs last month',
    subMetric: '5 pending feedback',
    icon: 'pause-circle',
    colorToken: '--status-warning',
    bgToken: '--status-warning-bg',
  },
  {
    id: 'rejected',
    title: 'Rejected',
    count: 87,
    trend: -11,
    trendLabel: 'vs last month',
    subMetric: '11 this week',
    icon: 'x-circle',
    colorToken: '--status-danger',
    bgToken: '--status-danger-bg',
  },
  {
    id: 'hired',
    title: 'Hired',
    count: 14,
    trend: 7,
    trendLabel: 'vs last month',
    subMetric: '3 joined today',
    icon: 'check-circle',
    colorToken: '--status-success',
    bgToken: '--status-success-bg',
  },
];

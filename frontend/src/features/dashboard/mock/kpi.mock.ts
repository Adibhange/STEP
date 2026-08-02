/**
 * STEP Enterprise Platform — KPI Mock Data
 *
 * Defines the KPI cards for the Dashboard overview.
 * Distinct color tokens per card for visual separation.
 */

export interface KpiItem {
  id: string;
  title: string;
  count: number;
  trend: number; // Positive = up, negative = down
  trendLabel: string;
  subMetric?: string;
  icon: string;
  colorToken: string;
  bgToken: string;
}

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

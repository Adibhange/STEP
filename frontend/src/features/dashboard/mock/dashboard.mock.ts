/**
 * STEP Enterprise Platform — Dashboard Meta Mock Data
 *
 * General dashboard configuration: current user, platform stats, notifications.
 */

export interface DashboardUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: string;
  avatarInitials: string;
  avatarColor: string; // CSS token for avatar background
}

export interface QuickNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export const CURRENT_USER: DashboardUser = {
  id: 'usr-001',
  name: 'Aditya Bhange',
  firstName: 'Aditya',
  email: 'aditya.bhange@sthapatya.com',
  role: 'Recruitment Director',
  avatarInitials: 'AB',
  avatarColor: '--accent-indigo',
};

export const QUICK_NOTIFICATIONS: QuickNotification[] = [
  {
    id: 'n1',
    title: 'Director Round Scheduled',
    description: 'Rahul Sharma is scheduled for Director round at 3:00 PM today.',
    time: '10 min ago',
    read: false,
    type: 'info',
  },
  {
    id: 'n2',
    title: 'Assessment Completed',
    description: 'Priya Patel completed online assessment with 94% score.',
    time: '32 min ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n3',
    title: 'Offer Letter Pending',
    description: '3 candidates are awaiting offer letters. Please take action.',
    time: '1 hr ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n4',
    title: 'New Vacancy Published',
    description: 'DevOps Architect vacancy is now live with 5 openings.',
    time: '2 hr ago',
    read: true,
    type: 'info',
  },
  {
    id: 'n5',
    title: 'Candidate Rejected',
    description: 'Vikram Singh was rejected at Director Round stage.',
    time: '3 hr ago',
    read: true,
    type: 'error',
  },
];

export const PLATFORM_STATS = {
  activeVacancies: 18,
  scheduledInterviewsToday: 7,
  pendingOfferLetters: 3,
  onboardingThisWeek: 2,
};

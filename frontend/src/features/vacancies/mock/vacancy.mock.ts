/**
 * STEP Enterprise Platform — Vacancy Mock Data & Hiring Hub Pipeline
 */

export interface VacancyItem {
  id: string;
  code: string;
  title: string;
  role: string;
  department: string;
  employmentType: string;
  experience: string;
  hiringLocation: string;
  testLocation: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  openPositions: number;
  status: 'Open' | 'Draft' | 'Paused' | 'Closed' | 'Archived';
  createdAt: string;
  closingDate: string;
  assignedRecruiter: string;
  hiringManager: string;
  
  // Pipeline metrics
  appliedCount: number;
  assessmentCount: number;
  interviewCount: number;
  offeredCount: number;
  joinedCount: number;

  // Question paper
  questionPaperId?: string;
  questionPaperTitle?: string;
  assessmentDurationMinutes?: number;
  passingCriteriaPercentage?: number;

  // Walk-in Drive details
  walkInDrive?: {
    enabled: boolean;
    name: string;
    venue: string;
    date: string;
    time: string;
    capacity: number;
    registrationDeadline: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
  };

  // QR Registration analytics
  qrAnalytics?: {
    qrCodeUrl: string;
    registrationUrl: string;
    enabled: boolean;
    registrationDeadline: string;
    totalScans: number;
    successfulRegistrations: number;
    expiredRegistrations: number;
    conversionRate: number;
    lastScanTime: string;
  };

  // Activity feed
  activities: Array<{
    id: string;
    timestamp: string;
    user: string;
    type: 'create' | 'assign' | 'walkin' | 'qr' | 'status' | 'candidate';
    title: string;
    description: string;
  }>;
}

export const VACANCIES_MOCK: VacancyItem[] = [
  {
    id: 'vac-101',
    code: 'VAC-2026-101',
    title: 'Senior React / Next.js Developer',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    employmentType: 'Full-Time Permanent',
    experience: '4-7 Yrs',
    hiringLocation: 'Pune Tech Park',
    testLocation: 'Pune Assessment Hub',
    workMode: 'Hybrid',
    openPositions: 12,
    status: 'Open',
    createdAt: '2026-07-10',
    closingDate: '2026-08-30',
    assignedRecruiter: 'Aditya Bhange',
    hiringManager: 'Rajesh Sharma (V.P. Engineering)',
    
    appliedCount: 500,
    assessmentCount: 143,
    interviewCount: 97,
    offeredCount: 19,
    joinedCount: 14,

    questionPaperId: 'qp-201',
    questionPaperTitle: 'Advanced React 19 & TypeScript Enterprise Paper A',
    assessmentDurationMinutes: 60,
    passingCriteriaPercentage: 70,

    walkInDrive: {
      enabled: true,
      name: 'Pune Mega Walk-in Hiring Drive 2026',
      venue: 'Sthapatya Tech Tower, Hinjawadi Phase 2, Pune',
      date: '2026-08-15',
      time: '09:00 AM - 05:00 PM IST',
      capacity: 300,
      registrationDeadline: '2026-08-14 06:00 PM',
      status: 'Scheduled',
    },

    qrAnalytics: {
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https://step.sthapatya.com/apply/vac-101',
      registrationUrl: 'https://step.sthapatya.com/apply/vac-101',
      enabled: true,
      registrationDeadline: '2026-08-14 06:00 PM',
      totalScans: 840,
      successfulRegistrations: 500,
      expiredRegistrations: 42,
      conversionRate: 59.5,
      lastScanTime: '12 mins ago',
    },

    activities: [
      { id: 'act-1', timestamp: '2026-08-01 10:30 AM', user: 'Aditya Bhange', type: 'create', title: 'Vacancy Opened', description: 'Senior React / Next.js Developer vacancy created with 12 open positions.' },
      { id: 'act-2', timestamp: '2026-08-01 11:15 AM', user: 'Rajesh Sharma', type: 'assign', title: 'Question Paper Assigned', description: 'Assigned "Advanced React 19 & TypeScript Enterprise Paper A" to vacancy.' },
      { id: 'act-3', timestamp: '2026-08-01 02:00 PM', user: 'Aditya Bhange', type: 'walkin', title: 'Walk-in Drive Scheduled', description: 'Scheduled Pune Mega Walk-in Drive for Aug 15th.' },
      { id: 'act-4', timestamp: '2026-08-01 02:05 PM', user: 'System Bot', type: 'qr', title: 'QR Code Generated', description: 'Flagship Walk-in QR Code and Registration URL generated.' },
      { id: 'act-5', timestamp: '2026-08-02 09:00 AM', user: 'Aditya Bhange', type: 'candidate', title: '14 Candidates Offered', description: '14 candidates reached Offered stage.' },
    ],
  },
  {
    id: 'vac-102',
    code: 'VAC-2026-102',
    title: 'Node.js Backend Microservices Lead',
    role: 'Software Engineer',
    department: 'Engineering',
    employmentType: 'Full-Time Permanent',
    experience: '8+ Yrs',
    hiringLocation: 'Mumbai HQ',
    testLocation: 'Mumbai Test Center 1',
    workMode: 'On-site',
    openPositions: 4,
    status: 'Open',
    createdAt: '2026-07-15',
    closingDate: '2026-09-01',
    assignedRecruiter: 'Sneha Kulkarni',
    hiringManager: 'Vikram Mehta',

    appliedCount: 220,
    assessmentCount: 65,
    interviewCount: 30,
    offeredCount: 5,
    joinedCount: 3,

    questionPaperId: 'qp-202',
    questionPaperTitle: 'Node.js & PostgreSQL System Architecture Paper',
    assessmentDurationMinutes: 75,
    passingCriteriaPercentage: 75,

    walkInDrive: {
      enabled: false,
      name: 'Mumbai Walk-in Drive',
      venue: 'Mumbai Corporate Tower',
      date: '2026-08-20',
      time: '10:00 AM',
      capacity: 100,
      registrationDeadline: '2026-08-19',
      status: 'Scheduled',
    },

    qrAnalytics: {
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https://step.sthapatya.com/apply/vac-102',
      registrationUrl: 'https://step.sthapatya.com/apply/vac-102',
      enabled: false,
      registrationDeadline: '2026-08-19',
      totalScans: 120,
      successfulRegistrations: 85,
      expiredRegistrations: 10,
      conversionRate: 70.8,
      lastScanTime: '1 hour ago',
    },

    activities: [
      { id: 'act-10', timestamp: '2026-07-15 09:00 AM', user: 'Sneha Kulkarni', type: 'create', title: 'Vacancy Opened', description: 'Node.js Backend Lead opened.' },
    ],
  },
];

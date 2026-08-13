export interface MockPipelineRound {
  id: number;
  roundNumber: number;
  roundTitle: string;
  roundType: 'Assessment' | 'Interview';
  durationMinutes: number;
  passingScore?: number;
  vacancyQuestionPaperId?: number;
  questionPaperTitle?: string;
  interviewerUserId?: number;
}

export interface MockPipelineFlow {
  id: number;
  flowName: string;
  isDefault: boolean;
  version: number;
  rounds: MockPipelineRound[];
}

export interface MockVacancy {
  id: number;
  vacancyCode: string;
  title: string;
  department: string;
  role: string;
  employmentType: string;
  experience: string;
  experienceYearsMin: number;
  experienceYearsMax: number;
  hiringLocation: string;
  testLocation: string;
  workMode: 'Onsite' | 'Hybrid' | 'Remote';
  openingsCount: number;
  positionsCount: number;
  status: 'Open' | 'Closed' | 'Draft';
  driveType: 'Walk-in Drive' | 'Direct / Sourced Hiring';
  createdAt: string;
  closingDate: string;
  assignedRecruiter: string;
  hiringManager: string;
  jobDescription?: string;
  requirements?: string[];
  appliedCount: number;
  assessmentCount: number;
  interviewCount: number;
  offeredCount: number;
  joinedCount: number;
  pipelineFlows: MockPipelineFlow[];
}

export const MOCK_VACANCIES: MockVacancy[] = [
  {
    id: 1,
    vacancyCode: 'VAC-2026-1',
    title: 'Senior .NET Core Architect',
    department: 'Engineering',
    role: 'Senior .NET Architect',
    employmentType: 'Full-Time Permanent',
    experience: '5-8 Years',
    experienceYearsMin: 5,
    experienceYearsMax: 8,
    hiringLocation: 'Mumbai HQ',
    testLocation: 'Mumbai Center',
    workMode: 'Hybrid',
    openingsCount: 3,
    positionsCount: 3,
    status: 'Open',
    driveType: 'Walk-in Drive',
    createdAt: '2026-01-15T09:00:00Z',
    closingDate: '2026-03-31T18:00:00Z',
    assignedRecruiter: 'Priya Sharma (HR)',
    hiringManager: 'Rajesh Kulkarni (Director)',
    jobDescription: 'Architect high-throughput ASP.NET Core 10 microservices, MediatR, CQRS, and Clean Architecture pipelines.',
    appliedCount: 14,
    assessmentCount: 8,
    interviewCount: 4,
    offeredCount: 2,
    joinedCount: 1,
    pipelineFlows: [
      {
        id: 101,
        flowName: 'Standard Architecture Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 1,
            roundNumber: 1,
            roundTitle: 'Core .NET & System Design Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
            vacancyQuestionPaperId: 1,
            questionPaperTitle: '.NET Core 10 & Distributed Systems Paper',
          },
          {
            id: 2,
            roundNumber: 2,
            roundTitle: 'Technical Architecture Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 4,
          },
          {
            id: 3,
            roundNumber: 3,
            roundTitle: 'Director & Leadership Round',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 2,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    vacancyCode: 'VAC-2026-2',
    title: 'Full Stack React / Node Lead Developer',
    department: 'Engineering',
    role: 'Full Stack React / Node Developer',
    employmentType: 'Full-Time Permanent',
    experience: '3-5 Years',
    experienceYearsMin: 3,
    experienceYearsMax: 5,
    hiringLocation: 'Pune Center (Hinjawadi)',
    testLocation: 'Pune Assessment Hub',
    workMode: 'Hybrid',
    openingsCount: 5,
    positionsCount: 5,
    status: 'Open',
    driveType: 'Walk-in Drive',
    createdAt: '2026-01-20T10:00:00Z',
    closingDate: '2026-04-15T18:00:00Z',
    assignedRecruiter: 'Neha Verma (HR)',
    hiringManager: 'Vikram Deshmukh (Lead Architect)',
    jobDescription: 'Build next-generation TypeScript, Next.js 16 App Router, React 19, Redux Toolkit, and Tailwind CSS design systems.',
    appliedCount: 18,
    assessmentCount: 11,
    interviewCount: 6,
    offeredCount: 3,
    joinedCount: 2,
    pipelineFlows: [
      {
        id: 102,
        flowName: 'Full Stack Engineering Flow',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 4,
            roundNumber: 1,
            roundTitle: 'Frontend & Full Stack Assessment',
            roundType: 'Assessment',
            durationMinutes: 45,
            passingScore: 65,
            vacancyQuestionPaperId: 2,
            questionPaperTitle: 'React 19 & Modern Web Architecture Paper',
          },
          {
            id: 5,
            roundNumber: 2,
            roundTitle: 'Coding & System Design Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 4,
          },
          {
            id: 6,
            roundNumber: 3,
            roundTitle: 'HR & Management Round',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 3,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    vacancyCode: 'VAC-2026-3',
    title: 'QA Automation Lead (Playwright & Selenium)',
    department: 'Quality Assurance',
    role: 'QA Automation Lead',
    employmentType: 'Full-Time Permanent',
    experience: '3-5 Years',
    experienceYearsMin: 3,
    experienceYearsMax: 5,
    hiringLocation: 'Bengaluru Tech Hub',
    testLocation: 'Bengaluru Assessment Center',
    workMode: 'Onsite',
    openingsCount: 2,
    positionsCount: 2,
    status: 'Open',
    driveType: 'Direct / Sourced Hiring',
    createdAt: '2026-02-01T09:30:00Z',
    closingDate: '2026-04-30T18:00:00Z',
    assignedRecruiter: 'Priya Sharma (HR)',
    hiringManager: 'Amit Patel (QA Manager)',
    jobDescription: 'Build scalable automated regression suites, API test harnesses, and CI/CD quality gates using Playwright, TypeScript, and C#.',
    appliedCount: 9,
    assessmentCount: 5,
    interviewCount: 2,
    offeredCount: 1,
    joinedCount: 0,
    pipelineFlows: [
      {
        id: 103,
        flowName: 'QA Automation Standard Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 7,
            roundNumber: 1,
            roundTitle: 'Automation & Testing Assessment',
            roundType: 'Assessment',
            durationMinutes: 45,
            passingScore: 60,
            vacancyQuestionPaperId: 3,
            questionPaperTitle: 'QA Automation & Test Strategy Paper',
          },
          {
            id: 8,
            roundNumber: 2,
            roundTitle: 'Hands-on Framework Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 6,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    vacancyCode: 'VAC-2026-4',
    title: 'Cloud DevOps & Kubernetes Specialist',
    department: 'Infrastructure & Cloud',
    role: 'DevOps & Cloud Engineer',
    employmentType: 'Full-Time Permanent',
    experience: '5-8 Years',
    experienceYearsMin: 5,
    experienceYearsMax: 8,
    hiringLocation: 'Mumbai HQ',
    testLocation: 'Online Remote Proctored',
    workMode: 'Hybrid',
    openingsCount: 2,
    positionsCount: 2,
    status: 'Open',
    driveType: 'Direct / Sourced Hiring',
    createdAt: '2026-02-05T11:00:00Z',
    closingDate: '2026-05-01T18:00:00Z',
    assignedRecruiter: 'Neha Verma (HR)',
    hiringManager: 'Rajesh Kulkarni (Director)',
    jobDescription: 'Design resilient Kubernetes clusters, Terraform IaC, ArgoCD GitOps, and Prometheus/Grafana observability suites.',
    appliedCount: 8,
    assessmentCount: 4,
    interviewCount: 2,
    offeredCount: 1,
    joinedCount: 1,
    pipelineFlows: [
      {
        id: 104,
        flowName: 'DevOps Specialist Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 9,
            roundNumber: 1,
            roundTitle: 'Cloud Architecture Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
          },
          {
            id: 10,
            roundNumber: 2,
            roundTitle: 'Live Infrastructure Debugging Interview',
            roundType: 'Interview',
            durationMinutes: 60,
            interviewerUserId: 7,
          },
        ],
      },
    ],
  },
];

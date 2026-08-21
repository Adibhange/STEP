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
  testLocation?: string;
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
    vacancyCode: 'VAC-2026-101',
    title: 'Senior .NET Core Architect',
    department: 'Engineering',
    role: 'Senior .NET Architect',
    employmentType: 'Full-Time Permanent',
    experience: '5-8 Years',
    experienceYearsMin: 5,
    experienceYearsMax: 8,
    hiringLocation: 'Mumbai HQ',
    testLocation: 'Mumbai Assessment Hub (Main Lab)',
    workMode: 'Hybrid',
    openingsCount: 4,
    positionsCount: 4,
    status: 'Open',
    driveType: 'Walk-in Drive',
    createdAt: '2026-01-15T09:00:00Z',
    closingDate: '2026-03-31T18:00:00Z',
    assignedRecruiter: 'Priya Sharma (HR)',
    hiringManager: 'Rajesh Kulkarni (Director)',
    jobDescription: 'Architect high-throughput ASP.NET Core 10 microservices, MediatR, CQRS, and Clean Architecture pipelines.',
    requirements: [
      'Expertise in C# .NET 10, ASP.NET Core WebAPI, Entity Framework Core',
      'Solid experience with Docker, Kubernetes, and Azure Cloud Architecture',
      'Strong knowledge of Event-Driven Microservices with RabbitMQ or Kafka',
    ],
    appliedCount: 24,
    assessmentCount: 14,
    interviewCount: 6,
    offeredCount: 2,
    joinedCount: 1,
    pipelineFlows: [
      {
        id: 101,
        flowName: 'Walk-in 4-Stage Architecture Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 1,
            roundNumber: 1,
            roundTitle: 'Aptitude & General Elimination',
            roundType: 'Assessment',
            durationMinutes: 45,
            passingScore: 70,
            vacancyQuestionPaperId: 10,
            questionPaperTitle: 'General Aptitude & Reasoning Elimination Paper',
          },
          {
            id: 2,
            roundNumber: 2,
            roundTitle: 'Core .NET & System Design Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
            vacancyQuestionPaperId: 1,
            questionPaperTitle: '.NET Core 10 & Distributed Systems Paper',
          },
          {
            id: 3,
            roundNumber: 3,
            roundTitle: 'Technical Architecture Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 4,
          },
          {
            id: 4,
            roundNumber: 4,
            roundTitle: 'Director & Final Offer Decision',
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
    vacancyCode: 'VAC-2026-102',
    title: 'Full Stack React / Node Lead Developer',
    department: 'Engineering',
    role: 'Full Stack React Lead',
    employmentType: 'Full-Time Permanent',
    experience: '3-6 Years',
    experienceYearsMin: 3,
    experienceYearsMax: 6,
    hiringLocation: 'Pune Center (Hinjawadi)',
    testLocation: 'Pune Assessment Hub',
    workMode: 'Hybrid',
    openingsCount: 5,
    positionsCount: 5,
    status: 'Open',
    driveType: 'Walk-in Drive',
    createdAt: '2026-01-20T10:00:00Z',
    closingDate: '2026-03-31T18:00:00Z',
    assignedRecruiter: 'Priya Sharma (HR)',
    hiringManager: 'Vikram Deshmukh (Lead Architect)',
    jobDescription: 'Lead enterprise frontend engineering with Next.js 15, React 19, TypeScript, Tailwind CSS, and Node.js micro-backends.',
    requirements: [
      'Advanced React 19, Next.js App Router, SSR, and State Management (Redux/Zustand)',
      'TypeScript proficiency and high-performance design system architecture',
      'REST APIs and GraphQL backend integration with Node.js',
    ],
    appliedCount: 38,
    assessmentCount: 22,
    interviewCount: 9,
    offeredCount: 3,
    joinedCount: 1,
    pipelineFlows: [
      {
        id: 102,
        flowName: 'Walk-in Frontend Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 5,
            roundNumber: 1,
            roundTitle: 'Aptitude & Logical Assessment',
            roundType: 'Assessment',
            durationMinutes: 45,
            passingScore: 70,
            vacancyQuestionPaperId: 10,
            questionPaperTitle: 'General Aptitude & Reasoning Elimination Paper',
          },
          {
            id: 6,
            roundNumber: 2,
            roundTitle: 'React & Full Stack Technical Exam',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
            vacancyQuestionPaperId: 2,
            questionPaperTitle: 'React 19 & TypeScript Frontend Architecture Paper',
          },
          {
            id: 7,
            roundNumber: 3,
            roundTitle: 'Live Coding & F2F Technical Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 4,
          },
          {
            id: 8,
            roundNumber: 4,
            roundTitle: 'Director Decision & Offer Rollout',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 2,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    vacancyCode: 'VAC-2026-103',
    title: 'Cloud & DevOps Architect',
    department: 'Infrastructure',
    role: 'Cloud & DevOps Architect',
    employmentType: 'Full-Time Permanent',
    experience: '5-9 Years',
    experienceYearsMin: 5,
    experienceYearsMax: 9,
    hiringLocation: 'Bangalore Tech Park',
    testLocation: 'Online Remote Proctored',
    workMode: 'Remote',
    openingsCount: 2,
    positionsCount: 2,
    status: 'Open',
    driveType: 'Direct / Sourced Hiring',
    createdAt: '2026-02-01T09:30:00Z',
    closingDate: '2026-04-15T18:00:00Z',
    assignedRecruiter: 'Neha Saxena (Lead Recruiter)',
    hiringManager: 'Sunil Rao (VP of Infrastructure)',
    jobDescription: 'Build scalable CI/CD automation, Terraform IaC, AWS/Azure multi-region clusters, and zero-trust security architecture.',
    requirements: [
      'Deep expertise in Kubernetes (EKS/AKS), Helm charts, and Istio Service Mesh',
      'Hands-on Terraform, Ansible, and GitOps (ArgoCD)',
      'Observability with Prometheus, Grafana, OpenTelemetry, and Datadog',
    ],
    appliedCount: 16,
    assessmentCount: 10,
    interviewCount: 4,
    offeredCount: 1,
    joinedCount: 0,
    pipelineFlows: [
      {
        id: 103,
        flowName: 'Direct Sourced Cloud Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 9,
            roundNumber: 1,
            roundTitle: 'HR Sourcing & Screening',
            roundType: 'Assessment',
            durationMinutes: 30,
            passingScore: 100,
          },
          {
            id: 10,
            roundNumber: 2,
            roundTitle: 'Cloud Architecture & Kubernetes Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 75,
            vacancyQuestionPaperId: 3,
            questionPaperTitle: 'DevOps & Cloud Infrastructure Paper',
          },
          {
            id: 11,
            roundNumber: 3,
            roundTitle: 'F2F DevOps Deep-Dive Interview',
            roundType: 'Interview',
            durationMinutes: 60,
            interviewerUserId: 5,
          },
          {
            id: 12,
            roundNumber: 4,
            roundTitle: 'Director Decision & Offer Rollout',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 2,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    vacancyCode: 'VAC-2026-104',
    title: 'Python & AI/ML Engineer',
    department: 'Data & AI',
    role: 'Python & AI/ML Engineer',
    employmentType: 'Full-Time Permanent',
    experience: '3-6 Years',
    experienceYearsMin: 3,
    experienceYearsMax: 6,
    hiringLocation: 'Pune Center (Hinjawadi)',
    testLocation: 'Pune Assessment Hub',
    workMode: 'Hybrid',
    openingsCount: 3,
    positionsCount: 3,
    status: 'Open',
    driveType: 'Direct / Sourced Hiring',
    createdAt: '2026-02-05T10:00:00Z',
    closingDate: '2026-04-30T18:00:00Z',
    assignedRecruiter: 'Neha Saxena (Lead Recruiter)',
    hiringManager: 'Dr. Sameer Sen (Head of AI)',
    jobDescription: 'Develop LLM integrations, retrieval-augmented generation (RAG) pipelines, LangChain agents, and high-performance FastAPI backends.',
    requirements: [
      'Advanced Python, PyTorch / TensorFlow, and HuggingFace ecosystems',
      'Hands-on RAG implementation with Vector DBs (Milvus, Pinecone, pgvector)',
      'Model quantization, fine-tuning, and production serving with vLLM / Triton',
    ],
    appliedCount: 22,
    assessmentCount: 12,
    interviewCount: 5,
    offeredCount: 1,
    joinedCount: 0,
    pipelineFlows: [
      {
        id: 104,
        flowName: 'Direct Sourced AI Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 13,
            roundNumber: 1,
            roundTitle: 'HR Sourcing & Screening',
            roundType: 'Assessment',
            durationMinutes: 30,
            passingScore: 100,
          },
          {
            id: 14,
            roundNumber: 2,
            roundTitle: 'Python & Machine Learning Algorithm Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
            vacancyQuestionPaperId: 4,
            questionPaperTitle: 'Python, ML & Algorithm Design Paper',
          },
          {
            id: 15,
            roundNumber: 3,
            roundTitle: 'AI System Design & Live Coding Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 4,
          },
          {
            id: 16,
            roundNumber: 4,
            roundTitle: 'Director Decision & Offer Rollout',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 2,
          },
        ],
      },
    ],
  },
  {
    id: 5,
    vacancyCode: 'VAC-2026-105',
    title: 'QA Lead & Test Automation Engineer',
    department: 'Quality Assurance',
    role: 'QA Automation Lead',
    employmentType: 'Full-Time Permanent',
    experience: '2-5 Years',
    experienceYearsMin: 2,
    experienceYearsMax: 5,
    hiringLocation: 'Pune Center (Hinjawadi)',
    testLocation: 'Pune Assessment Hub',
    workMode: 'Hybrid',
    openingsCount: 3,
    positionsCount: 3,
    status: 'Open',
    driveType: 'Walk-in Drive',
    createdAt: '2026-02-08T09:00:00Z',
    closingDate: '2026-03-31T18:00:00Z',
    assignedRecruiter: 'Priya Sharma (HR)',
    hiringManager: 'Vikram Deshmukh (Lead Architect)',
    jobDescription: 'Build enterprise-grade automated regression suites with Playwright, TypeScript, Cypress, and k6 performance testing.',
    appliedCount: 29,
    assessmentCount: 16,
    interviewCount: 6,
    offeredCount: 2,
    joinedCount: 1,
    pipelineFlows: [
      {
        id: 105,
        flowName: 'QA Automation Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 17,
            roundNumber: 1,
            roundTitle: 'Aptitude & Logic Elimination',
            roundType: 'Assessment',
            durationMinutes: 45,
            passingScore: 70,
            vacancyQuestionPaperId: 10,
            questionPaperTitle: 'General Aptitude & Reasoning Elimination Paper',
          },
          {
            id: 18,
            roundNumber: 2,
            roundTitle: 'Automation & Playwright Test Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
            vacancyQuestionPaperId: 5,
            questionPaperTitle: 'Test Automation & Quality Engineering Paper',
          },
          {
            id: 19,
            roundNumber: 3,
            roundTitle: 'Technical Interview',
            roundType: 'Interview',
            durationMinutes: 45,
            interviewerUserId: 4,
          },
          {
            id: 20,
            roundNumber: 4,
            roundTitle: 'Director Decision',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 2,
          },
        ],
      },
    ],
  },
  {
    id: 8,
    vacancyCode: 'VAC-2026-106',
    title: 'Associate Software Engineer (Fresher Drive 2026)',
    department: 'Engineering',
    role: 'Associate Software Engineer',
    employmentType: 'Full-Time Permanent',
    experience: 'Fresher (0 Years)',
    experienceYearsMin: 0,
    experienceYearsMax: 1,
    hiringLocation: 'Pune Center (Hinjawadi)',
    testLocation: 'Pune Assessment Hub',
    workMode: 'Onsite',
    openingsCount: 25,
    positionsCount: 25,
    status: 'Open',
    driveType: 'Walk-in Drive',
    createdAt: '2026-02-01T08:00:00Z',
    closingDate: '2026-04-30T18:00:00Z',
    assignedRecruiter: 'Priya Sharma (HR)',
    hiringManager: 'Rajesh Kulkarni (Director)',
    jobDescription: 'Campus and Walk-In Fresher Hiring for Batch of 2025/2026 across .NET, React, SQL, and Cloud Engineering.',
    appliedCount: 142,
    assessmentCount: 88,
    interviewCount: 30,
    offeredCount: 12,
    joinedCount: 4,
    pipelineFlows: [
      {
        id: 108,
        flowName: 'Campus & Walk-in Fresher Pipeline',
        isDefault: true,
        version: 1,
        rounds: [
          {
            id: 21,
            roundNumber: 1,
            roundTitle: 'Online Aptitude & Reasoning Elimination',
            roundType: 'Assessment',
            durationMinutes: 45,
            passingScore: 70,
            vacancyQuestionPaperId: 10,
            questionPaperTitle: 'General Aptitude & Reasoning Elimination Paper',
          },
          {
            id: 22,
            roundNumber: 2,
            roundTitle: 'Technical Programming Assessment',
            roundType: 'Assessment',
            durationMinutes: 60,
            passingScore: 70,
            vacancyQuestionPaperId: 6,
            questionPaperTitle: 'Fresher Aptitude & Basic Programming Test 2026',
          },
          {
            id: 23,
            roundNumber: 3,
            roundTitle: 'Technical Interview',
            roundType: 'Interview',
            durationMinutes: 30,
            interviewerUserId: 4,
          },
          {
            id: 24,
            roundNumber: 4,
            roundTitle: 'Director Decision',
            roundType: 'Interview',
            durationMinutes: 20,
            interviewerUserId: 2,
          },
        ],
      },
    ],
  },
];

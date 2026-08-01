export interface CandidateRecord {
  id: number;
  code: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  source: 'WalkIn' | 'HomeTest' | 'CampusDrive' | 'Referral' | 'Agency';
  experienceYears: number;
  stage: 'Online Assessment' | 'Technical Screen' | 'Machine Round' | 'HR Verification' | 'Director Round' | 'Offer Released';
  score: string;
  status: 'Registered' | 'PendingVerification' | 'Verified' | 'InAssessment' | 'InInterview' | 'Offered' | 'Hired' | 'Rejected';
  riskScore: number;
  city: string;
  appliedDate: string;
}

const firstNames = ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram', 'Siddharth', 'Ananya', 'Rohan', 'Sneha', 'Karan', 'Pooja', 'Deepak', 'Meera', 'Aditya', 'Divya'];
const lastNames = ['Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Rao', 'Deshmukh', 'Joshi', 'Kulkarni', 'Mehta', 'Nair', 'Chopra', 'Bhatia', 'Iyer', 'Reddy'];
const roles = ['Senior Full Stack Engineer', 'Backend Engineer (.NET)', 'Frontend Engineer (React/Next.js)', 'DevOps Architect', 'QA Automation Engineer', 'Data Engineer', 'UI/UX Designer'];
const stages: CandidateRecord['stage'][] = ['Online Assessment', 'Technical Screen', 'Machine Round', 'HR Verification', 'Director Round', 'Offer Released'];
const statuses: CandidateRecord['status'][] = ['InInterview', 'Verified', 'PendingVerification', 'Offered', 'Rejected', 'Hired'];
const sources: CandidateRecord['source'][] = ['WalkIn', 'HomeTest', 'CampusDrive', 'Referral', 'Agency'];

export const mockCandidates: CandidateRecord[] = Array.from({ length: 500 }, (_, i) => {
  const id = i + 1;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const name = `${fn} ${ln}`;
  const code = `CND-${948100 + id}`;
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${id}@example.com`;
  const mobile = `+91 ${9800000000 + id}`;
  const role = roles[i % roles.length];
  const source = sources[i % sources.length];
  const experienceYears = Number((2 + (i % 10) * 0.7).toFixed(1));
  const stage = stages[i % stages.length];
  const status = statuses[i % statuses.length];
  const riskScore = status === 'Rejected' ? 12.5 : Number(((i % 5) * 0.25).toFixed(1));
  const score = status === 'Rejected' ? 'Disqualified' : status === 'PendingVerification' ? 'Pending' : `${70 + (i % 28)}%`;

  return {
    id,
    code,
    name,
    email,
    mobile,
    role,
    source,
    experienceYears,
    stage,
    score,
    status,
    riskScore,
    city: i % 2 === 0 ? 'Mumbai' : 'Pune',
    appliedDate: new Date(2026, 6, 1 + (i % 30)).toISOString().split('T')[0],
  };
});

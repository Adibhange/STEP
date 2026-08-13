import type { DashboardCandidate } from '../types/dashboard.types';

export interface HiringStageProgress {
  id: number;
  name: string;
  roundType: 'Assessment' | 'Interview' | 'Director' | 'Offer';
  status: 'Passed' | 'In-Progress' | 'Pending' | 'Failed';
  statusType: 'passed' | 'warning' | 'rejected' | 'pending';
  date: string;
  interviewer: string;
  interviewerRole: string;
  interviewerInitials: string;
  feedback: string;
  score?: string;
}

export const getCandidateFlowStages = (candidate: DashboardCandidate): HiringStageProgress[] => {
  const currentRound = candidate.currentRound?.toLowerCase() || '';

  let s1Status: 'Passed' | 'In-Progress' | 'Pending' | 'Failed' = 'Passed';
  let s2Status: 'Passed' | 'In-Progress' | 'Pending' | 'Failed' = 'In-Progress';
  let s3Status: 'Passed' | 'In-Progress' | 'Pending' | 'Failed' = 'Pending';
  let s4Status: 'Passed' | 'In-Progress' | 'Pending' | 'Failed' = 'Pending';
  let s5Status: 'Passed' | 'In-Progress' | 'Pending' | 'Failed' = 'Pending';

  if (currentRound.includes('screening') || currentRound.includes('assessment')) {
    s1Status = 'In-Progress';
    s2Status = 'Pending';
  } else if (currentRound.includes('interview') || currentRound.includes('f2f')) {
    s1Status = 'Passed';
    s2Status = 'In-Progress';
  } else if (currentRound.includes('director')) {
    s1Status = 'Passed';
    s2Status = 'Passed';
    s3Status = 'In-Progress';
  } else if (currentRound.includes('offered') || currentRound.includes('offer') || currentRound.includes('hired') || currentRound.includes('joined')) {
    s1Status = 'Passed';
    s2Status = 'Passed';
    s3Status = 'Passed';
    s4Status = 'Passed';
    s5Status = currentRound.includes('joined') || currentRound.includes('hired') ? 'Passed' : 'In-Progress';
  } else if (currentRound.includes('reject') || currentRound.includes('fail')) {
    s1Status = 'Passed';
    s2Status = 'Failed';
  }

  const getStatusType = (st: string) => {
    if (st === 'Passed') return 'passed';
    if (st === 'In-Progress') return 'warning';
    if (st === 'Failed') return 'rejected';
    return 'pending';
  };

  return [
    {
      id: 1,
      name: `${candidate.role.split(' ')[0] || 'Technical'} & System Design Assessment`,
      roundType: 'Assessment',
      status: s1Status,
      statusType: getStatusType(s1Status),
      date: candidate.appliedDate || '19 Jan 2026',
      interviewer: 'Assigned Evaluator',
      interviewerRole: 'Lead Evaluator',
      interviewerInitials: 'AE',
      feedback: s1Status === 'Passed' ? 'Candidate Exam Score: 88% (Passed - Strong system design grasp)' : 'Awaiting assessment submission.',
      score: s1Status === 'Passed' ? '88%' : undefined,
    },
    {
      id: 2,
      name: 'Technical Architecture & Deep-Dive Interview',
      roundType: 'Interview',
      status: s2Status,
      statusType: getStatusType(s2Status),
      date: '22 Jan 2026',
      interviewer: candidate.assignedInterviewer || 'Vikram Deshmukh',
      interviewerRole: 'Principal Architect',
      interviewerInitials: (candidate.assignedInterviewer || 'VD').split(' ').map(w => w[0]).join(''),
      feedback: s2Status === 'Passed' ? 'Demonstrated solid architecture design patterns and microservices understanding.' : s2Status === 'In-Progress' ? 'Evaluation in progress with panel.' : 'Scheduled for review.',
    },
    {
      id: 3,
      name: 'Coding & Algorithm Problem Solving Round',
      roundType: 'Assessment',
      status: s3Status,
      statusType: getStatusType(s3Status),
      date: '24 Jan 2026',
      interviewer: 'Tech Lead Panel',
      interviewerRole: 'Engineering Manager',
      interviewerInitials: 'TL',
      feedback: s3Status === 'Passed' ? 'Solved 2 out of 2 DSA problems within optimal time complexity.' : 'Pending clearance of previous round.',
    },
    {
      id: 4,
      name: 'Director & Leadership Culture Interview',
      roundType: 'Director',
      status: s4Status,
      statusType: getStatusType(s4Status),
      date: '27 Jan 2026',
      interviewer: 'Rajesh Kulkarni',
      interviewerRole: 'Director of Engineering',
      interviewerInitials: 'RK',
      feedback: s4Status === 'Passed' ? 'Excellent leadership capability and culture fit alignment.' : 'Director interview round pending.',
    },
    {
      id: 5,
      name: 'Executive Offer Rollout & Background Check',
      roundType: 'Offer',
      status: s5Status,
      statusType: getStatusType(s5Status),
      date: 'Pending',
      interviewer: 'HR Talent Acquisition',
      interviewerRole: 'HR Operations Lead',
      interviewerInitials: 'HR',
      feedback: s5Status === 'Passed' ? 'Offer extended and accepted.' : s5Status === 'In-Progress' ? 'Offer letter generated and under candidate review.' : 'Awaiting pipeline clearance for offer rollout.',
    },
  ];
};

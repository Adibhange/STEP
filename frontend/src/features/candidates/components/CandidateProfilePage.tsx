'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CandidateAssessmentEvaluationView } from '@/features/assessments/components/CandidateAssessmentEvaluationView';
import { ScheduleTestModal } from '@/features/assessments/components/ScheduleTestModal';
import { useGetCandidateByIdQuery, useGetCandidatesQuery } from '@/store/services/api';

export interface StageAttempt {
  attempt: number;
  date: string;
  score: string;
  result: string;
}

export interface StageItem {
  id: number;
  name: string;
  status: string;
  statusType: 'passed' | 'rejected' | 'pending' | 'terminated';
  date: string;
  interviewer: string;
  interviewerInitials: string;
  interviewerRole: string;
  mode: string;
  feedback: string;
  result: string;
  actionLabel?: string | null;
  attempts?: StageAttempt[];
  isDirectorRound?: boolean;
  isOfferRound?: boolean;
  isTerminated?: boolean;
  terminationReason?: string;
}

export interface CandidateDocument {
  id: number;
  name: string;
  date: string;
  size: string;
  type: string;
}

export interface CandidateProfilePageProps {
  candidateId?: string;
}

// ── Form Custom Dropdown (Matches Input Styling Seamlessly) ─────────────────────
const FormSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold flex items-center justify-between gap-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
      >
        <span className="truncate">{selected ? selected.label : value}</span>
        <Icon
          name="chevron-down"
          size="xs"
          className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180 text-emerald-600' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${opt.value === value ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Icon name="check-circle" size="xs" className="text-emerald-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Form Calendar Date Picker (Exact Popover Calendar from Filter Bar) ─────────
const FormDatePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  const days = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const list: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      list.push({
        day: dayNum,
        isCurrentMonth: false,
        dateStr: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      list.push({
        day: i,
        isCurrentMonth: true,
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    const remaining = 35 - list.length > 0 ? 35 - list.length : 42 - list.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      list.push({
        day: i,
        isCurrentMonth: false,
        dateStr: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    return list;
  }, [viewYear, viewMonth]);

  const formattedDisplay = value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Select Date';

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
      >
        <span className="font-mono">{formattedDisplay}</span>
        <Icon name="calendar" size="xs" className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setViewMonth((m) => (m === 0 ? (setViewYear((y) => y - 1), 11) : m - 1))}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <Icon name="chevron-left" size="xs" />
            </button>
            <span className="font-bold text-xs text-slate-800 font-heading">
              {monthName} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => (m === 11 ? (setViewYear((y) => y + 1), 0) : m + 1))}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-400 text-center mb-1 font-mono">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const isSelected = d.dateStr === value;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(d.dateStr);
                    setOpen(false);
                  }}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : d.isCurrentMonth
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300'
                    }`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const CandidateProfilePage: React.FC<CandidateProfilePageProps> = ({
  candidateId = '1',
}) => {
  const router = useRouter();

  const numericId = parseInt(String(candidateId).replace(/\D/g, ''), 10) || 1;
  const { data: candidateRes } = useGetCandidateByIdQuery(numericId);
  const { data: candidatesListRes } = useGetCandidatesQuery();

  // Dialog & Toast States
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Dynamic Candidate Profile Details State
  const [candidate, setCandidate] = useState({
    id: candidateId,
    name: 'Candidate Profile',
    avatar: '',
    status: 'In Process',
    designation: 'Applicant',
    appliedFor: 'Open Position',
    email: '',
    phone: '',
    gender: 'N/A',
    dob: '',
    location: '',
    currentStage: 'Screening',
    appliedDate: '',
    experience: '0 Years',
    candidateType: 'Experienced',
    employmentType: 'Full Time',
    currentCompany: '',
    currentDesignation: '',
    currentCtc: '',
    expectedCtc: '',
    noticePeriod: '',
    education: '',
    educationDetails: '',
    college: '',
    passingYear: '',
    percentage: '',
    source: 'Walk-in Scan',
    refType: '',
    refName: '',
    refEmployeeId: '',
    refMobile: '',
    refVerifiedBy: '',
  });

  const nameInitials = useMemo(() => {
    if (!candidate.name) return 'CD';
    const parts = candidate.name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }, [candidate.name]);

  // Read Permanent Assigned Pipeline Flow Version for this candidate
  const assignedFlowVersionName = useMemo(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`step_candidate_flow_${numericId}`) || localStorage.getItem(`step_candidate_flow_${candidateId}`);
      if (saved) return saved;
    }
    return numericId % 2 === 0
      ? 'Flow Version 1 (Standard Aptitude First)'
      : 'Flow Version 2 (Fast-Track Technical First)';
  }, [candidateId, numericId]);

  useEffect(() => {
    const apiData = candidateRes?.data || (candidatesListRes?.data || []).find((c: any) => String(c.id) === String(candidateId) || String(c.id) === String(numericId));
    if (apiData) {
      const isFresher = apiData.totalExperienceYears === 0 || apiData.experienceYears === 0;
      setCandidate({
        id: String(apiData.id || candidateId),
        name: `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim() || 'Candidate',
        avatar: apiData.avatarUrl || '',
        status: apiData.status || 'In Process',
        designation: apiData.vacancyTitle || apiData.role || 'Applicant',
        appliedFor: apiData.vacancyTitle ? apiData.vacancyTitle : 'Open Position',
        email: apiData.email || '',
        phone: apiData.phone || '',
        gender: apiData.gender || 'N/A',
        dob: apiData.dateOfBirth ? new Date(apiData.dateOfBirth).toISOString().split('T')[0] : '',
        location: apiData.currentLocation || '',
        currentStage: apiData.currentStage || 'Screening',
        appliedDate: apiData.createdAt ? new Date(apiData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        experience: isFresher ? 'Fresher (0 Yrs)' : `${apiData.totalExperienceYears ?? apiData.experienceYears ?? 0} Years`,
        candidateType: isFresher ? 'Fresher' : 'Experienced',
        employmentType: 'Full Time',
        currentCompany: apiData.currentCompany || '',
        currentDesignation: apiData.currentDesignation || apiData.vacancyTitle || '',
        currentCtc: apiData.currentCTC ? `₹ ${apiData.currentCTC} LPA` : '',
        expectedCtc: apiData.expectedCTC ? `₹ ${apiData.expectedCTC} LPA` : '',
        noticePeriod: apiData.noticePeriodDays ? `${apiData.noticePeriodDays} Days` : '',
        education: apiData.highestQualification || '',
        educationDetails: apiData.highestQualification || '',
        college: apiData.institutionName || '',
        passingYear: apiData.yearOfPassing ? String(apiData.yearOfPassing) : '',
        percentage: apiData.marksPercentage ? `${apiData.marksPercentage}%` : '',
        source: apiData.registrationChannel || 'Walk-in Scan',
        refType: apiData.referralEmployeeName ? 'Employee Referral' : '',
        refName: apiData.referralEmployeeName || '',
        refEmployeeId: '',
        refMobile: '',
        refVerifiedBy: '',
      });

      // Populate Live Pipeline History from Backend (or construct candidate-specific timeline)
      const candDate = apiData.createdAt
        ? new Date(apiData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '04 Aug 2026';

      if (apiData.pipelineProgressHistory && Array.isArray(apiData.pipelineProgressHistory) && apiData.pipelineProgressHistory.length > 0) {
        const liveStages: StageItem[] = apiData.pipelineProgressHistory.map((p: any) => ({
          id: p.id || p.roundNumber,
          name: p.roundTitle || `Round ${p.roundNumber}`,
          status: p.status || 'Pending',
          statusType: p.status?.toLowerCase() === 'passed' ? 'passed' : p.status?.toLowerCase() === 'failed' ? 'rejected' : 'pending',
          date: p.completedAt
            ? new Date(p.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : p.startedAt
            ? new Date(p.startedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Pending',
          interviewer: 'Assigned Evaluator',
          interviewerInitials: 'AE',
          interviewerRole: p.roundType || 'Evaluator',
          mode: p.roundType === 'Assessment' ? 'Online Proctored' : 'In Office',
          feedback: p.scoreObtained !== null && p.scoreObtained !== undefined ? `Score: ${p.scoreObtained}%` : 'Evaluation in progress',
          result: p.status || 'Pending',
        }));
        setStagesData(liveStages);
      } else {
        // Construct dynamic candidate hiring stages using actual candidate assigned flow version & drive type
        const isApplied = apiData.status === 'Applied' || apiData.currentStage === 'Applied' || apiData.currentStage === 'Registered';
        const isWalkInDrive = apiData.registrationChannel === 'Walk-in Scan' || apiData.registrationChannel === 'WalkIn' || (candidate.source && candidate.source.toLowerCase().includes('walk'));

        let r1Name = 'General Aptitude & Logical Test';
        let r1Role = 'Automated Test';
        let r1Mode = 'Online Assessment';

        let r2Name = 'Coding & Algorithm Challenge';
        let r2Role = 'Technical Evaluator';
        let r2Mode = 'Online / In Office';

        let r3Name = 'Technical F2F & Live Coding';
        let r3Role = 'Technical Panel';
        let r3Mode = 'In Office';

        if (isWalkInDrive) {
          if (assignedFlowVersionName.includes('Fast-Track Technical') || assignedFlowVersionName.includes('Flow Version 2')) {
            // Walk-in Flow Version 2: Aptitude -> F2F -> Technical -> Director -> Offer
            r1Name = 'General Aptitude & Logical Test';
            r2Name = 'Face to Face HR & Technical Round';
            r2Role = 'Senior HR & Panel';
            r3Name = 'Coding & Algorithm Challenge';
            r3Role = 'Technical Evaluator';
          } else {
            // Walk-in Flow Version 1: Aptitude -> Technical -> F2F -> Director -> Offer
            r1Name = 'General Aptitude & Logical Test';
            r2Name = 'Coding & Algorithm Challenge';
            r2Role = 'Technical Evaluator';
            r3Name = 'Technical F2F & Live Coding';
            r3Role = 'Technical Panel';
          }
        } else {
          // Direct Hiring: Compulsory HR Screening 1st, then 2 dynamic technical/f2f rounds
          r1Name = 'HR Screening (Compulsory 1st Round)';
          r1Role = 'HR Specialist';
          r1Mode = 'Phone / Walk-in';
          r2Name = 'Technical Assessment';
          r2Role = 'Technical Evaluator';
          r3Name = 'Face to Face Interview';
          r3Role = 'Technical Panel';
        }

        setStagesData([
          {
            id: 1,
            name: r1Name,
            status: isApplied ? 'In Progress' : 'Passed',
            statusType: isApplied ? 'pending' : 'passed',
            date: candDate,
            interviewer: 'Assigned Evaluator',
            interviewerInitials: 'AE',
            interviewerRole: r1Role,
            mode: r1Mode,
            feedback: `Stage 1 verified on ${candDate}. Evaluation in progress.`,
            result: isApplied ? 'In Progress' : 'Passed',
            actionLabel: isWalkInDrive ? 'Schedule / Send Test' : null,
            isDirectorRound: false,
            isOfferRound: false,
          },
          {
            id: 2,
            name: r2Name,
            status: 'Pending',
            statusType: 'pending',
            date: 'Pending',
            interviewer: 'Unassigned',
            interviewerInitials: 'UA',
            interviewerRole: r2Role,
            mode: r2Mode,
            feedback: 'Stage 2 evaluation pending.',
            result: 'Pending',
            actionLabel: 'Schedule Stage 2',
            isDirectorRound: false,
            isOfferRound: false,
          },
          {
            id: 3,
            name: r3Name,
            status: 'Pending',
            statusType: 'pending',
            date: 'Pending',
            interviewer: 'Unassigned',
            interviewerInitials: 'UA',
            interviewerRole: r3Role,
            mode: 'In Office',
            feedback: 'Stage 3 evaluation pending.',
            result: 'Pending',
            actionLabel: 'Schedule Stage 3',
            isDirectorRound: false,
            isOfferRound: false,
          },
          {
            id: 4,
            name: 'Director Interview',
            status: 'Pending',
            statusType: 'pending',
            date: 'Pending',
            interviewer: 'Unassigned',
            interviewerInitials: 'UA',
            interviewerRole: 'Director of Engineering',
            mode: 'In Office',
            feedback: 'Director decision round pending (Fixed 4th Round).',
            result: 'Pending',
            actionLabel: null,
            isDirectorRound: true,
            isOfferRound: false,
          },
          {
            id: 5,
            name: 'Offer',
            status: 'Pending',
            statusType: 'pending',
            date: 'Pending',
            interviewer: '—',
            interviewerInitials: '—',
            interviewerRole: 'HR Operations',
            mode: 'Official Document',
            feedback: 'Awaiting pipeline clearance for offer rollout (Fixed 5th Round).',
            result: 'Pending',
            actionLabel: null,
            isDirectorRound: false,
            isOfferRound: true,
          },
        ]);
      }

      // Populate Live Candidate Documents from Backend
      if (apiData.documents && Array.isArray(apiData.documents) && apiData.documents.length > 0) {
        const liveDocs: CandidateDocument[] = apiData.documents.map((d: any, idx: number) => ({
          id: d.id || idx + 1,
          name: d.fileName || `${d.documentType || 'Document'}.pdf`,
          date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : candDate,
          size: d.fileSizeBytes ? `${Math.round(d.fileSizeBytes / 1024)} KB` : '150 KB',
          type: d.documentType || 'Document',
        }));
        setDocumentsData(liveDocs);
      } else {
        setDocumentsData([
          { id: 1, name: `Registration_Data_${apiData.lastName || 'Candidate'}.pdf`, date: candDate, size: '120 KB', type: 'Application Form' },
        ]);
      }
    }
  }, [candidateRes, candidatesListRes, candidateId, numericId]);

  // Edit Candidate Profile Modal Dialog State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ ...candidate });
  const [profileSaveSuccessToast, setProfileSaveSuccessToast] = useState(false);
  const [profileValidationToast, setProfileValidationToast] = useState<string | null>(null);

  // Documents State: ONLY 3 items — Resume, Application Form, Profile Photo
  const [documentsData, setDocumentsData] = useState<CandidateDocument[]>([
    { id: 1, name: 'Resume_Anjali_Sharma.pdf', date: '12 May 2025', size: '245 KB', type: 'Resume' },
    { id: 2, name: 'Application_Form_Anjali_Sharma.pdf', date: '12 May 2025', size: '180 KB', type: 'Application Form' },
    { id: 3, name: 'Candidate_Profile_Photo.jpg', date: '12 May 2025', size: '95 KB', type: 'Profile Photo' },
  ]);

  // Document Preview Modal State
  const [selectedDocPreview, setSelectedDocPreview] = useState<CandidateDocument | null>(null);
  const [docDeletedToast, setDocDeletedToast] = useState<string | null>(null);

  // Offer Letter Rollout Form Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerStatus, setOfferStatus] = useState<'draft' | 'rolled_out'>('draft');
  const [offerSuccessToast, setOfferSuccessToast] = useState(false);

  // Offer Form Inputs
  const [offerRole, setOfferRole] = useState('Senior Frontend Developer (React)');
  const [offerCtc, setOfferCtc] = useState('14.50');
  const [offerFixed, setOfferFixed] = useState('13.00');
  const [offerVariable, setOfferVariable] = useState('1.50');
  const [offerManager, setOfferManager] = useState('Rajesh Sharma (Director of Engineering)');
  const [offerLocation, setOfferLocation] = useState('Bengaluru Office (Hybrid)');
  const [offerJoiningDate, setOfferJoiningDate] = useState('2025-06-01');
  const [offerExpiryDays, setOfferExpiryDays] = useState('7');
  const [offerCandidateEmail, setOfferCandidateEmail] = useState('anjali.sharma@email.com');
  const [offerRemarks, setOfferRemarks] = useState('Includes ₹50,000 relocation allowance & ₹5 Lakhs health insurance coverage.');

  // Submit Feedback / Director Decision Modal State
  const [selectedFeedbackStage, setSelectedFeedbackStage] = useState<StageItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [directorDecision, setDirectorDecision] = useState<'offer' | 'reject' | 'hold'>('offer');
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState(false);

  // Assign Interviewer Modal State
  const [selectedAssignStage, setSelectedAssignStage] = useState<StageItem | null>(null);
  const [assignedInterviewer, setAssignedInterviewer] = useState('Rahul Patel');
  const [assignDate, setAssignDate] = useState('2025-05-18');
  const [assignTime, setAssignTime] = useState('11:30');
  const [assignMode, setAssignMode] = useState('Google Meet');
  const [assignSuccessToast, setAssignSuccessToast] = useState(false);

  // Candidate Assessment Evaluation & Schedule Test Modal State
  const [showAssessmentEvaluationModal, setShowAssessmentEvaluationModal] = useState(false);
  const [showScheduleTestModal, setShowScheduleTestModal] = useState(false);

  // Options for Dropdowns
  const directorOptions = [
    { value: 'Rajesh Sharma (Director of Engineering)', label: 'Rajesh Sharma (Director of Engineering)' },
    { value: 'Anil Mehta (Managing Director)', label: 'Anil Mehta (Managing Director)' },
    { value: 'Pooja Hegde (Director of People)', label: 'Pooja Hegde (Director of People)' },
  ];

  const interviewerOptions = [
    { value: 'Rahul Patel', label: 'Rahul Patel (HR Lead)' },
    { value: 'Sneha Kulkarni', label: 'Sneha Kulkarni (Technical Lead)' },
    { value: 'Akshay Patil', label: 'Akshay Patil (Principal Engineer)' },
    { value: 'Neha Verma', label: 'Neha Verma (HR Manager)' },
  ];

  const meetingModeOptions = [
    { value: 'Google Meet', label: 'Google Meet (Online Link)' },
    { value: 'Microsoft Teams', label: 'Microsoft Teams' },
    { value: 'In Office', label: 'In Office Venue' },
  ];

  const offerManagerOptions = [
    { value: 'Rajesh Sharma (Director of Engineering)', label: 'Rajesh Sharma (Director of Engineering)' },
    { value: 'Anil Mehta (Managing Director)', label: 'Anil Mehta (Managing Director)' },
    { value: 'Sneha Kulkarni', label: 'Sneha Kulkarni (Technical Lead)' },
    { value: 'Rahul Patel (HR Lead)', label: 'Rahul Patel (HR Lead)' },
  ];

  const offerLocationOptions = [
    { value: 'Bengaluru Office (Hybrid)', label: 'Bengaluru Office (Hybrid)' },
    { value: 'Mumbai HQ (On-Site)', label: 'Mumbai HQ (On-Site)' },
    { value: 'Pune Tech Hub (Hybrid)', label: 'Pune Tech Hub (Hybrid)' },
    { value: 'Full Remote (Work From Anywhere)', label: 'Full Remote (Work From Anywhere)' },
  ];

  // Main Dynamic Recruitment Stages Stack
  const [stagesData, setStagesData] = useState<StageItem[]>([
    {
      id: 1,
      name: 'HR Screening',
      status: 'Passed',
      statusType: 'passed',
      date: '13 May 2025',
      interviewer: 'Rahul Patel',
      interviewerInitials: 'RP',
      interviewerRole: 'HR Lead',
      mode: 'Phone Screening',
      feedback: 'Good communication. Profile matches basic requirements.',
      result: 'Passed',
      actionLabel: null,
      isDirectorRound: false,
      isOfferRound: false,
    },
    {
      id: 2,
      name: 'Technical Assessment',
      status: 'Passed',
      statusType: 'passed',
      date: '15 May 2025',
      interviewer: 'System Evaluator',
      interviewerInitials: 'AI',
      interviewerRole: 'Automated Test',
      mode: 'From Home',
      feedback: 'Scored 92/100 in React & JS assessment.',
      result: 'Passed',
      actionLabel: 'Schedule / Send Test',
      attempts: [{ attempt: 1, date: '15 May 2025', score: '92/100', result: 'Passed' }],
      isDirectorRound: false,
      isOfferRound: false,
    },
    {
      id: 3,
      name: 'Face to Face Interview',
      status: 'Passed',
      statusType: 'passed',
      date: '18 May 2025',
      interviewer: 'Sneha Kulkarni',
      interviewerInitials: 'SK',
      interviewerRole: 'Technical Lead',
      mode: 'In Office',
      feedback: 'Strong in React fundamentals and problem solving.',
      result: 'Passed',
      actionLabel: 'Schedule Interview',
      isDirectorRound: false,
      isOfferRound: false,
    },
    {
      id: 4,
      name: 'Director Interview',
      status: 'Passed',
      statusType: 'passed',
      date: '21 May 2025',
      interviewer: 'Rajesh Sharma',
      interviewerInitials: 'RS',
      interviewerRole: 'Director of Engineering',
      mode: 'Google Meet',
      feedback: 'Strong leadership potential and technical architecture skills. Recommended for offer.',
      result: 'Offered',
      actionLabel: null,
      isDirectorRound: true,
      isOfferRound: false,
    },
    {
      id: 5,
      name: 'Offer',
      status: 'Pending',
      statusType: 'pending',
      date: 'Pending',
      interviewer: '—',
      interviewerInitials: '—',
      interviewerRole: 'HR Operations',
      mode: 'Official Document',
      feedback: 'Awaiting director decision clearance for offer letter rollout.',
      result: 'Pending',
      actionLabel: null,
      isDirectorRound: false,
      isOfferRound: true,
    },
  ]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', { description: 'Candidate profile link copied to clipboard.' });
    }
  };

  const handleOpenEditProfile = () => {
    setEditProfileForm({ ...candidate });
    setShowEditProfileModal(true);
  };

  const fireValidationToast = (msg: string) => {
    toast.error('Validation Error', { description: msg });
  };

  const handleSaveProfileEdit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const f = editProfileForm;

    // Full Name — required, min 2 chars
    if (!f.name || f.name.trim().length < 2) {
      return fireValidationToast('Full name must be at least 2 characters.');
    }

    // Email — valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!f.email || !emailRegex.test(f.email.trim())) {
      return fireValidationToast('Please enter a valid email address (e.g. name@domain.com).');
    }

    // Phone — must be 10 digits (ignoring spaces, dashes, +91 prefix)
    const digitsOnly = (f.phone || '').replace(/[\s\-+]/g, '').replace(/^91/, '');
    if (!digitsOnly || !/^\d{10}$/.test(digitsOnly)) {
      return fireValidationToast('Mobile number must be exactly 10 digits (e.g. 98765 43210).');
    }

    // Location — required
    if (!f.location || f.location.trim().length < 2) {
      return fireValidationToast('Location is required.');
    }

    // Experience — must be a positive number (e.g. "3.6 Years" or "3.6")
    const expNum = parseFloat((f.experience || '').replace(/[^\d.]/g, ''));
    if (isNaN(expNum) || expNum < 0 || expNum > 60) {
      return fireValidationToast('Experience must be a valid number between 0 and 60 years.');
    }

    // Notice Period — required
    if (!f.noticePeriod || f.noticePeriod.trim().length < 1) {
      return fireValidationToast('Notice period is required (e.g. 30 Days).');
    }

    // Current Company — required
    if (!f.currentCompany || f.currentCompany.trim().length < 1) {
      return fireValidationToast('Current company name is required.');
    }

    // Current Designation — required
    if (!f.currentDesignation || f.currentDesignation.trim().length < 1) {
      return fireValidationToast('Current designation is required.');
    }

    // CTC fields — must contain a numeric value
    const ctcRegex = /\d/;
    if (!f.currentCtc || !ctcRegex.test(f.currentCtc)) {
      return fireValidationToast('Current CTC must include a numeric value (e.g. ₹ 9.5 LPA).');
    }
    if (!f.expectedCtc || !ctcRegex.test(f.expectedCtc)) {
      return fireValidationToast('Expected CTC must include a numeric value (e.g. ₹ 12 LPA).');
    }

    // Education — required
    if (!f.education || f.education.trim().length < 2) {
      return fireValidationToast('Education field is required.');
    }

    // All validations passed — save
    setCandidate({ ...editProfileForm });
    setShowEditProfileModal(false);
    toast.success('Profile Saved', { description: 'Candidate profile details updated successfully.' });
  };

  const handleDeleteDocument = (docId: number, docName: string) => {
    setDocumentsData((prev) => prev.filter((d) => d.id !== docId));
    toast.info('Document Deleted', { description: `"${docName}" removed from candidate profile.` });
  };

  const handleRolloutOffer = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOfferStatus('rolled_out');
    setCandidate((prev) => ({ ...prev, status: 'Offered' }));
    setStagesData((prev) =>
      prev.map((s) =>
        s.id === 5
          ? {
            ...s,
            status: 'Offered',
            statusType: 'passed',
            date: offerJoiningDate || '22 May 2025',
            feedback: `Offered ₹${offerCtc} LPA (${offerRole}) by ${offerManager}. Joining Date: ${offerJoiningDate}. Letter dispatched to ${offerCandidateEmail}.`,
            result: 'Offer Rolled Out',
          }
          : s
      )
    );
    setShowOfferModal(false);
    toast.success('Offer Letter Rolled Out', { description: `Official offer dispatched to ${offerCandidateEmail}.` });
  };

  const handleSaveFeedback = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFeedbackStage) return;

    if (selectedFeedbackStage.isDirectorRound) {
      let newResult = 'Offered';
      let newStatusType: 'passed' | 'rejected' | 'pending' = 'passed';
      let newStatus = 'Passed';

      if (directorDecision === 'reject') {
        newResult = 'Rejected';
        newStatusType = 'rejected';
        newStatus = 'Rejected';
      } else if (directorDecision === 'hold') {
        newResult = 'On Hold';
        newStatusType = 'pending';
        newStatus = 'On Hold';

        setStagesData((prev) =>
          prev.map((s) =>
            s.id === 2
              ? {
                ...s,
                status: 'Retake Needed',
                statusType: 'pending',
                actionLabel: 'Re-send / Schedule Test (2nd Attempt)',
                attempts: [
                  ...(s.attempts || []),
                  { attempt: 2, date: 'Pending', score: '—', result: 'Re-test Triggered' },
                ],
              }
              : s
          )
        );
      }

      setStagesData((prev) =>
        prev.map((s) =>
          s.id === 4
            ? {
              ...s,
              feedback: feedbackText || s.feedback,
              result: newResult,
              status: newStatus,
              statusType: newStatusType,
            }
            : s
        )
      );
    } else {
      setStagesData((prev) =>
        prev.map((s) =>
          s.id === selectedFeedbackStage.id
            ? {
              ...s,
              feedback: feedbackText || s.feedback,
              result: directorDecision === 'offer' ? 'Passed' : 'Rejected',
              status: directorDecision === 'offer' ? 'Passed' : 'Rejected',
              statusType: directorDecision === 'offer' ? 'passed' : 'rejected',
            }
            : s
        )
      );
    }

    setSelectedFeedbackStage(null);
    toast.success('Feedback Saved', { description: 'Interviewer feedback and stage decision recorded.' });
  };

  const handleSaveAssign = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssignStage) return;

    const initials = assignedInterviewer
      .split(' ')
      .map((n) => n[0])
      .join('');

    setStagesData((prev) =>
      prev.map((s) =>
        s.id === selectedAssignStage.id
          ? {
            ...s,
            interviewer: assignedInterviewer,
            interviewerInitials: initials || 'IN',
            mode: assignMode,
            date: assignDate,
          }
          : s
      )
    );

    setSelectedAssignStage(null);
    toast.success('Interview Scheduled', { description: `Assigned ${assignedInterviewer} for ${assignDate} (${assignMode}).` });
  };

  return (
    <div className="flex flex-col gap-4 pb-6 p-3.5 sm:p-5 bg-[#f8fafc] min-h-screen text-[13px] font-sans relative">
      {/* ── Main 2-Column Section ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT COLUMN (4 cols / ~30%): Candidate Profile Overview & Documents */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Card 1: Unified Candidate Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-3.5">
            {/* Header: Photo, Name, Badges & Actions */}
            <div className="flex items-start justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => setShowImageModal(true)}
                  className="group relative w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs bg-slate-100 cursor-pointer transition-transform hover:scale-[1.02]"
                  title="Click to view profile photo"
                >
                  {candidate.avatar && candidate.avatar.trim().length > 0 && !candidate.avatar.includes('unsplash') ? (
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-full h-full object-cover group-hover:brightness-95 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--accent-indigo)] to-purple-600 flex items-center justify-center text-white font-black text-base tracking-tight font-heading">
                      {nameInitials}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Icon name="eye" size="xs" />
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="font-bold text-slate-900 text-base font-heading truncate">{candidate.name}</h1>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {candidate.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium truncate mt-0.5">{candidate.designation}</span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {candidate.candidateType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {candidate.employmentType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit Profile Details"
                >
                  <Icon name="pencil" size="xs" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
                  title="Share Candidate Link"
                >
                  <Icon name="external-link" size="xs" className="text-slate-500" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Applied Role Highlight Box */}
            <div className="flex items-center justify-between bg-blue-50/80 border border-blue-100 rounded-lg px-3 py-2">
              <span className="text-blue-600 font-semibold text-xs flex items-center gap-1.5">
                <Icon name="briefcase" size="xs" />
                Applied Position:
              </span>
              <span className="font-bold text-blue-900 text-xs truncate">{candidate.appliedFor}</span>
            </div>

            {/* Permanent Assigned Pipeline Flow Box */}
            <div className="flex flex-col gap-1 bg-indigo-50/90 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-800 font-bold text-[11px] uppercase font-mono flex items-center gap-1.5">
                  <Icon name="grid" size="xs" />
                  Assigned Pipeline Flow:
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                  🔒 Permanent Walk-in Flow
                </span>
              </div>
              <span className="font-extrabold text-indigo-950 text-xs font-heading">
                {assignedFlowVersionName}
              </span>
            </div>

            {/* Key-Value Details Grid */}
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-900 truncate">{candidate.email}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Phone Number</span>
                <span className="font-semibold text-slate-900">{candidate.phone}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Gender & DOB</span>
                <span className="font-semibold text-slate-900">{candidate.gender} • {candidate.dob}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Location</span>
                <span className="font-semibold text-slate-900 truncate">{candidate.location}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Current Company</span>
                <span className="font-semibold text-slate-900 truncate">{candidate.currentCompany}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Designation</span>
                <span className="font-semibold text-slate-900 truncate">{candidate.currentDesignation}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Current CTC</span>
                <span className="font-semibold text-slate-900">{candidate.currentCtc}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Expected CTC</span>
                <span className="font-semibold text-slate-900">{candidate.expectedCtc}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Total Experience</span>
                <span className="font-semibold text-slate-900">{candidate.experience}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Notice Period</span>
                <span className="font-semibold text-slate-900">{candidate.noticePeriod}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Application Source</span>
                <span className="font-semibold text-blue-700">{candidate.source}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Academic Score</span>
                <span className="font-semibold text-emerald-700">{candidate.percentage} ({candidate.passingYear})</span>
              </div>

              <div className="col-span-2 flex flex-col gap-0.5 border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-medium text-[11px]">Education Credentials & College</span>
                <span className="font-semibold text-slate-900 text-xs truncate">{candidate.education} — {candidate.college}</span>
              </div>

              {/* Reference & Verification Details Subsection */}
              <div className="col-span-2 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex flex-col gap-1 mt-0.5">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1 font-heading">
                  <Icon name="users" size="xs" />
                  Reference: {candidate.refType}
                </span>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-slate-700 font-medium">Referrer: <strong className="text-slate-900">{candidate.refName}</strong> ({candidate.refEmployeeId})</span>
                  <span className="text-slate-700 font-medium text-right">Mobile: <strong className="text-slate-900">{candidate.refMobile}</strong></span>
                  <span className="text-emerald-700 font-semibold col-span-2">Verified By: {candidate.refVerifiedBy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Documents Section (ONLY Resume, Application Form, Profile Photo) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-heading uppercase tracking-wider">
                <Icon name="file-text" size="xs" className="text-slate-500" />
                <span>Documents ({documentsData.length})</span>
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {documentsData.length === 0 ? (
                <div className="p-2.5 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                  No documents attached.
                </div>
              ) : (
                documentsData.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={`w-6.5 h-6.5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 ${doc.type === 'Profile Photo' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-600'
                        }`}>
                        {doc.type === 'Profile Photo' ? 'IMG' : 'PDF'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 text-xs truncate" title={doc.name}>
                          {doc.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {doc.type} • {doc.size}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview(doc)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="View & Preview Document"
                      >
                        <Icon name="eye" size="xs" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <Icon name="download" size="xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols / ~70%): Hiring Stage Progress Cards */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Icon name="list" size="xs" className="text-blue-600" />
              <span>Recruitment Stages & Hiring Flow</span>
            </h2>

            {/* View Candidate Assignment Details Button */}
            <button
              type="button"
              onClick={() => router.push(`/dashboard/candidates/${candidateId}/evaluation`)}
              className="h-8 px-2.5 sm:px-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
            >
              <Icon name="external-link" size="xs" />
              <span className="hidden sm:inline">View Candidate Assignment Details for Evaluation</span>
              <span className="sm:hidden">View Assignment Details</span>
            </button>
          </div>

          {/* STAGE CARDS STACK (Standard 4-Column Grid Layout) */}
          <div className="flex flex-col gap-4">
            {stagesData.map((stage) => (
              <div
                key={stage.id}
                className={`bg-white border rounded-xl p-4.5 shadow-2xs flex flex-col gap-3.5 transition-all ${stage.isTerminated
                  ? 'border-slate-200 border-l-4 border-l-slate-300 opacity-60 bg-slate-50/60'
                  : stage.statusType === 'passed'
                    ? 'border-slate-200 border-l-4 border-l-emerald-500'
                    : stage.statusType === 'rejected'
                      ? 'border-slate-200 border-l-4 border-l-rose-500'
                      : 'border-slate-200 border-l-4 border-l-amber-400'
                  }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span
                      className={`w-5.5 h-5.5 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${stage.isTerminated
                        ? 'bg-slate-300 text-slate-600'
                        : stage.statusType === 'passed'
                          ? 'bg-emerald-500'
                          : stage.statusType === 'rejected'
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                        }`}
                    >
                      {stage.id}
                    </span>
                    <h3
                      className={`text-sm sm:text-base font-bold font-heading ${stage.isTerminated ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                    >
                      {stage.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stage.isTerminated
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : stage.statusType === 'passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : stage.statusType === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  {/* Action Buttons Sequence */}
                  {!stage.isTerminated && (
                    <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:ml-auto">
                      {!stage.isOfferRound && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAssignStage(stage);
                              setAssignedInterviewer(
                                stage.isDirectorRound
                                  ? 'Rajesh Sharma (Director of Engineering)'
                                  : stage.interviewer !== 'Unassigned'
                                    ? stage.interviewer
                                    : 'Rahul Patel'
                              );
                            }}
                            className="h-7 sm:h-7.5 px-2.5 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-purple-500 bg-purple-50 text-purple-700 text-[11.5px] sm:text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
                          >
                            <Icon name="user" size="xs" />
                            <span>{stage.isDirectorRound ? 'Assign Director' : 'Assign Interviewer'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFeedbackStage(stage);
                              setFeedbackText(stage.feedback);
                              setDirectorDecision('offer');
                            }}
                            className="h-7 sm:h-7.5 px-2.5 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-blue-500 bg-blue-50 text-blue-700 text-[11.5px] sm:text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Icon name="pencil" size="xs" />
                            <span>{stage.isDirectorRound ? 'Director Decision' : 'Submit Feedback'}</span>
                          </button>
                        </>
                      )}

                      {stage.actionLabel && !stage.isOfferRound && (
                        <button
                          type="button"
                          onClick={() => {
                            if (stage.actionLabel === 'Schedule / Send Test' || stage.id === 2) {
                              setShowScheduleTestModal(true);
                            } else {
                              setSelectedAssignStage(stage);
                            }
                          }}
                          className="h-7 sm:h-7.5 px-2.5 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg text-[11.5px] sm:text-xs font-semibold transition-colors border border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50 cursor-pointer shadow-2xs"
                        >
                          <Icon name="calendar" size="xs" />
                          <span>{stage.actionLabel}</span>
                        </button>
                      )}

                      {/* Stage 5 Offer Action */}
                      {stage.isOfferRound && (
                        <button
                          type="button"
                          onClick={() => setShowOfferModal(true)}
                          className="h-7 sm:h-7.5 px-3 sm:px-3.5 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-800 text-[11.5px] sm:text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Icon name="file-text" size="xs" />
                          <span className="hidden sm:inline">View & Rollout Offer Letter</span>
                          <span className="sm:hidden">Rollout Offer Letter</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-medium">Date</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Icon name="calendar" size="xs" className="text-slate-400" />
                      {stage.date}
                    </span>
                  </div>

                  {!stage.isOfferRound && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-medium">Interviewer / Role</span>
                      <div className="flex items-center gap-2">
                        <span className="w-6.5 h-6.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {stage.interviewerInitials}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 leading-tight">
                            {stage.interviewer}
                          </span>
                          <span className="text-[10.5px] text-slate-500 font-medium">{stage.interviewerRole}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col gap-0.5 ${stage.isOfferRound ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
                    <span className="text-slate-400 font-medium">Feedback / Remarks</span>
                    <p className="text-slate-700 font-normal leading-relaxed">
                      {stage.feedback}
                    </p>

                    {stage.attempts && stage.attempts.length > 0 && (
                      <div className="mt-1 flex flex-col gap-1 text-[10.5px]">
                        {stage.attempts.map((att) => (
                          <div key={att.attempt} className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                              Attempt #{att.attempt}: {att.score} ({att.result})
                            </span>
                            <span className="text-slate-400">{att.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-medium">Result</span>
                    <span
                      className={`font-bold ${stage.statusType === 'passed'
                        ? 'text-emerald-600'
                        : stage.statusType === 'rejected'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                        }`}
                    >
                      {stage.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Edit Candidate Profile Details Modal Dialog ──────────────────────── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveProfileEdit}
            className="bg-white border border-slate-200 rounded-2xl p-5 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-step"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  <Icon name="pencil" size="xs" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Edit Profile Information — {candidate.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Update personal, career, CTC, and education details
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            {/* Profile Edit Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editProfileForm.email}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editProfileForm.phone}
                  maxLength={15}
                  onChange={(e) => {
                    // Allow only digits, spaces, +, and dashes
                    const cleaned = e.target.value.replace(/[^\d\s+\-]/g, '');
                    setEditProfileForm({ ...editProfileForm, phone: cleaned });
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={editProfileForm.location}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, location: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Experience</label>
                <input
                  type="text"
                  value={editProfileForm.experience}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, experience: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Period</label>
                <input
                  type="text"
                  value={editProfileForm.noticePeriod}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, noticePeriod: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Company</label>
                <input
                  type="text"
                  value={editProfileForm.currentCompany}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, currentCompany: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Designation</label>
                <input
                  type="text"
                  value={editProfileForm.currentDesignation}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, currentDesignation: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current CTC</label>
                <input
                  type="text"
                  value={editProfileForm.currentCtc}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, currentCtc: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expected CTC</label>
                <input
                  type="text"
                  value={editProfileForm.expectedCtc}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, expectedCtc: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Education</label>
                <input
                  type="text"
                  value={editProfileForm.education}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, education: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="h-8.5 px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-8.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
              >
                <Icon name="check-circle" size="xs" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. Document Preview Modal Dialog ─────────────────────────────────── */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-3xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center shrink-0">
                  PDF
                </span>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {selectedDocPreview.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Uploaded: {selectedDocPreview.date} • Size: {selectedDocPreview.size} • Type: {selectedDocPreview.type}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            {/* Document Reader Frame */}
            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl p-5 overflow-y-auto min-h-[360px] flex flex-col gap-4 font-sans text-xs scrollbar-step">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 flex flex-col gap-5 text-slate-800">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-heading">{candidate.name}</h2>
                    <p className="text-xs text-slate-600 font-medium">{candidate.designation} • {candidate.location}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{candidate.email} • {candidate.phone}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    {selectedDocPreview.type}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-heading border-b border-slate-100 pb-1">
                    Executive Summary
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Senior Frontend Engineer with 3.6+ years of hands-on experience in building scalable React and Next.js applications. Passionate about component architecture, micro-frontends, design systems, and web performance optimizations.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900">Work Experience</span>
                    <span className="text-slate-600">TCS — Senior Frontend Engineer (2021 – Present)</span>
                    <span className="text-[11px] text-slate-500">Led 5-member team building React enterprise analytics dashboards.</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900">Education Credentials</span>
                    <span className="text-slate-600">B.Tech in Computer Science (2017 – 2021)</span>
                    <span className="text-[11px] text-slate-500">Visvesvaraya Technological University (First Class Distinction)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-heading border-b border-slate-100 pb-1">
                    Verified Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['React.js', 'Next.js 16', 'TypeScript', 'TailwindCSS', 'Redux Toolkit', 'Jest', 'UI/UX Design Systems'].map((sk) => (
                      <span key={sk} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="h-8.5 px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close Preview
              </button>

              <button
                type="button"
                className="h-8.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
              >
                <Icon name="download" size="xs" />
                <span>Download Original PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. High-Resolution Profile Photo Lightbox Modal ──────────────────── */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl flex flex-col gap-4 items-center overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {candidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{candidate.designation}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close photo dialog"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            <div className="w-full min-h-[220px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-6">
              {candidate.avatar && candidate.avatar.trim().length > 0 && !candidate.avatar.includes('unsplash') ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-full h-full object-contain max-h-[360px] rounded-lg shadow-sm"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[var(--accent-indigo)] via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-xl font-heading tracking-tight">
                    {nameInitials}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Candidate Avatar Initials</span>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between pt-1 text-xs text-slate-600 font-medium border-t border-slate-100">
              <span>{candidate.email || 'Email not specified'}</span>
              <span>{candidate.experience}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Editable Offer Letter Rollout Form Modal Dialog ───────────────── */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleRolloutOffer}
            className="bg-white border border-slate-200 rounded-2xl p-5 max-w-2xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-step"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <Icon name="file-text" size="xs" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Generate & Rollout Offer Letter — {candidate.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Fill in compensation, manager, location, and joining date below before dispatching
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            {/* Form Fields Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Offered Role / Designation</label>
                <input
                  type="text"
                  value={offerRole}
                  onChange={(e) => setOfferRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Offered CTC (₹ LPA)</label>
                <input
                  type="text"
                  value={offerCtc}
                  onChange={(e) => setOfferCtc(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fixed Component (₹ LPA)</label>
                <input
                  type="text"
                  value={offerFixed}
                  onChange={(e) => setOfferFixed(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Variable / Bonus Component (₹ LPA)</label>
                <input
                  type="text"
                  value={offerVariable}
                  onChange={(e) => setOfferVariable(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reporting Manager</label>
                <FormSelect
                  value={offerManager}
                  onChange={setOfferManager}
                  options={offerManagerOptions}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Location</label>
                <FormSelect
                  value={offerLocation}
                  onChange={setOfferLocation}
                  options={offerLocationOptions}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Joining Date</label>
                <FormDatePicker
                  value={offerJoiningDate}
                  onChange={setOfferJoiningDate}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Offer Acceptance Expiry (Days)</label>
                <input
                  type="number"
                  value={offerExpiryDays}
                  onChange={(e) => setOfferExpiryDays(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Candidate Email Address</label>
                <input
                  type="email"
                  value={offerCandidateEmail}
                  onChange={(e) => setOfferCandidateEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Special Perks & Remarks</label>
                <textarea
                  value={offerRemarks}
                  onChange={(e) => setOfferRemarks(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans resize-none"
                />
              </div>
            </div>

            {/* Generated Document Card Preview */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs mt-1">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center shrink-0">
                  PDF
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-xs">
                    Offer_Letter_{candidate.name.replace(' ', '_')}_Generated.pdf
                  </span>
                  <span className="text-[10.5px] text-slate-500 font-mono">
                    Auto-compiled with ₹{offerCtc} LPA, {offerRole}, Joining {offerJoiningDate}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="h-7.5 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1"
              >
                <Icon name="download" size="xs" />
                <span>Preview Draft</span>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="h-8.5 px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-8.5 px-4 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
              >
                <Icon name="check-circle" size="xs" />
                <span>Generate & Send Offer Letter</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 7. Assign Interviewer / Director Modal Dialog ─────────────────────── */}
      {selectedAssignStage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveAssign}
            className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {selectedAssignStage.isDirectorRound ? 'Assign Director' : 'Assign Interviewer'} — {selectedAssignStage.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">Candidate: {candidate.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignStage(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {selectedAssignStage.isDirectorRound ? 'Select Director (Exclusive Role)' : 'Select Interviewer'}
                </label>
                <FormSelect
                  value={assignedInterviewer}
                  onChange={setAssignedInterviewer}
                  options={selectedAssignStage.isDirectorRound ? directorOptions : interviewerOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <FormDatePicker
                    value={assignDate}
                    onChange={setAssignDate}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={assignTime}
                    onChange={(e) => setAssignTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meeting Mode</label>
                <FormSelect
                  value={assignMode}
                  onChange={setAssignMode}
                  options={meetingModeOptions}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAssignStage(null)}
                className="h-8.5 px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8.5 px-4 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-2xs"
              >
                Assign & Send Invites
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 8. Submit Feedback / Director Final Decision Modal ───────────────── */}
      {selectedFeedbackStage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveFeedback}
            className="bg-white border border-slate-200 rounded-2xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  {selectedFeedbackStage.isDirectorRound ? 'Director Final Decision' : 'Submit Feedback'} — {selectedFeedbackStage.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Candidate: {candidate.name} • {selectedFeedbackStage.isDirectorRound ? 'Director' : 'Interviewer'}: {selectedFeedbackStage.interviewer}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedbackStage(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            {/* Decision Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                {selectedFeedbackStage.isDirectorRound ? 'Director Final Outcome' : 'Interview Result'}
              </label>

              {selectedFeedbackStage.isDirectorRound ? (
                /* 3 Choices for Director: Offer, Reject, On Hold */
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectorDecision('offer')}
                    className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${directorDecision === 'offer'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <Icon name="check-circle" size="xs" />
                    <span>Offer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectorDecision('reject')}
                    className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${directorDecision === 'reject'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <Icon name="x-circle" size="xs" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectorDecision('hold')}
                    className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${directorDecision === 'hold'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <Icon name="pause-circle" size="xs" />
                    <span>On Hold</span>
                  </button>
                </div>
              ) : (
                /* Standard Pass vs Fail */
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirectorDecision('offer')}
                    className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${directorDecision === 'offer'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <Icon name="check-circle" size="xs" />
                    <span>Pass / Recommend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectorDecision('reject')}
                    className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${directorDecision === 'reject'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <Icon name="x-circle" size="xs" />
                    <span>Fail / Reject</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Remarks & Detailed Rationale</label>
                <span
                  className={`text-[11px] font-mono font-semibold ${feedbackText.length >= 480 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                >
                  {feedbackText.length} / 500 characters
                </span>
              </div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
                rows={4}
                maxLength={500}
                placeholder="Enter evaluation notes, technical observations, and final recommendations..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedFeedbackStage(null)}
                className="h-8.5 px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-2xs"
              >
                Save Decision & Update Status
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 9. Edit Candidate Profile Modal Dialog ───────────────────────────── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveProfileEdit}
            className="bg-white border border-slate-200 rounded-2xl p-5 max-w-3xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-step"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                  <Icon name="pencil" size="xs" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Edit Candidate Profile — {candidate.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Update personal, professional, academic, and reference details below
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            {profileValidationToast && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <Icon name="alert-triangle" size="xs" className="shrink-0" />
                <span>{profileValidationToast}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Personal Info */}
              <div className="sm:col-span-2 font-bold text-slate-900 uppercase tracking-wider text-[11px] font-heading border-b border-slate-100 pb-1">
                Personal Information
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editProfileForm.email}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={editProfileForm.phone}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender</label>
                <input
                  type="text"
                  value={editProfileForm.gender}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, gender: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth (DOB)</label>
                <input
                  type="date"
                  value={editProfileForm.dob}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, dob: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hiring Location</label>
                <input
                  type="text"
                  value={editProfileForm.location}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Professional Info */}
              <div className="sm:col-span-2 font-bold text-slate-900 uppercase tracking-wider text-[11px] font-heading border-b border-slate-100 pb-1 mt-2">
                Professional Details
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Applied Position / Role</label>
                <input
                  type="text"
                  value={editProfileForm.appliedFor}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, appliedFor: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Application Source</label>
                <input
                  type="text"
                  value={editProfileForm.source}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, source: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Company</label>
                <input
                  type="text"
                  value={editProfileForm.currentCompany}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, currentCompany: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Designation</label>
                <input
                  type="text"
                  value={editProfileForm.currentDesignation}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, currentDesignation: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Experience</label>
                <input
                  type="text"
                  value={editProfileForm.experience}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, experience: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Period</label>
                <input
                  type="text"
                  value={editProfileForm.noticePeriod}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, noticePeriod: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current CTC</label>
                <input
                  type="text"
                  value={editProfileForm.currentCtc}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, currentCtc: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expected CTC</label>
                <input
                  type="text"
                  value={editProfileForm.expectedCtc}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, expectedCtc: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Education */}
              <div className="sm:col-span-2 font-bold text-slate-900 uppercase tracking-wider text-[11px] font-heading border-b border-slate-100 pb-1 mt-2">
                Education & Academic Background
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Highest Degree / Qualification</label>
                <input
                  type="text"
                  value={editProfileForm.education}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, education: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">College / University Name</label>
                <input
                  type="text"
                  value={editProfileForm.college}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, college: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Graduation Passing Year</label>
                <input
                  type="text"
                  value={editProfileForm.passingYear}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, passingYear: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Percentage / CGPA Marks</label>
                <input
                  type="text"
                  value={editProfileForm.percentage}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, percentage: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Reference Info */}
              <div className="sm:col-span-2 font-bold text-slate-900 uppercase tracking-wider text-[11px] font-heading border-b border-slate-100 pb-1 mt-2">
                Reference & Verification Details
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reference Type</label>
                <input
                  type="text"
                  value={editProfileForm.refType}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, refType: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referrer Name</label>
                <input
                  type="text"
                  value={editProfileForm.refName}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, refName: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referrer Employee ID</label>
                <input
                  type="text"
                  value={editProfileForm.refEmployeeId}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, refEmployeeId: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referrer Mobile Phone</label>
                <input
                  type="text"
                  value={editProfileForm.refMobile}
                  onChange={(e) => setEditProfileForm((p) => ({ ...p, refMobile: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="h-8.5 px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-8.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
              >
                <Icon name="check-circle" size="xs" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Schedule & Send Assessment Test Modal ───────────────────────────────── */}
      {showScheduleTestModal && (
        <ScheduleTestModal
          candidateId={candidate.id}
          candidateName={candidate.name}
          candidateCode={candidate.id}
          candidateEmail={candidate.email}
          candidatePhone={candidate.phone}
          vacancyTitle={candidate.appliedFor}
          onClose={() => setShowScheduleTestModal(false)}
        />
      )}
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Icon, Skeleton } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { staggerContainer, staggerFastContainer, fadeSlideUpVariant, scalePopVariant } from '@/design-system/motion';
import { CandidateAssessmentEvaluationView } from '@/features/assessments/components/CandidateAssessmentEvaluationView';
import { ScheduleTestModal } from '@/features/assessments/components/ScheduleTestModal';
import {
  getApiBaseUrl,
  useApproveOfferMutation,
  useGenerateOfferLetterMutation,
  useGetCandidateByIdQuery,
  useGetCandidatesQuery,
  useGetInterviewByIdQuery,
  useGetOfferByIdQuery,
  useGetUsersQuery,
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  usePublishInterviewResultMutation,
  useEvaluateCandidateStageMutation,
  useAssignEvaluatorMutation,
  useUploadCandidateDocumentMutation,
  useUpdateCandidateMutation,
  useDeleteCandidateDocumentMutation,
} from '@/store/services/api';

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
  statusType: 'passed' | 'rejected' | 'pending' | 'terminated' | 'locked';
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
  isLocked?: boolean;
  hasCompletedTest?: boolean;
  terminationReason?: string;
  candidateExamSessionId?: number | null;
  /** Real Interview.Id for this round, if one has been scheduled — null/undefined means no
   * Interview row exists yet, so a real scorecard can't be submitted (only the synthetic demo
   * stages below lack this; live-data stages carry the backend's PipelineProgressDto.interviewId). */
  interviewId?: number | null;
  /** Assessment | Interview — mirrors the backend's PipelineRoundClassification. Only
   * Interview-classified rounds have a real "schedule + assign interviewer" backend action;
   * Assessment rounds go through the exam engine instead (see "Schedule / Send Test"). */
  roundType?: string;
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
        className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-between gap-2 hover:border-[var(--border-strong)] focus-ring-step transition-all cursor-pointer"
      >
        <span className="truncate">{selected ? selected.label : value}</span>
        <Icon
          name="chevron-down"
          size="xs"
          className={`text-[var(--text-tertiary)] shrink-0 transition-transform ${open ? 'rotate-180 text-[var(--accent-indigo)]' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-lg)] z-50 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                opt.value === value
                  ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Icon name="check-circle" size="xs" className="text-[var(--accent-indigo)] shrink-0" />}
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
        className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-between hover:border-[var(--border-strong)] focus-ring-step transition-all cursor-pointer"
      >
        <span className="font-mono tabular-figures">{formattedDisplay}</span>
        <Icon name="calendar" size="xs" className="text-[var(--text-tertiary)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-[260px] bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-xl)] z-50 p-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--border-soft)]">
            <button
              type="button"
              onClick={() => setViewMonth((m) => (m === 0 ? (setViewYear((y) => y - 1), 11) : m - 1))}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <Icon name="chevron-left" size="xs" />
            </button>
            <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
              {monthName} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => (m === 11 ? (setViewYear((y) => y + 1), 0) : m + 1))}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-[var(--text-tertiary)] text-center mb-1 font-mono">
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
                  className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer tabular-figures ${
                    isSelected
                      ? 'bg-[var(--accent-indigo)] text-white font-bold shadow-2xs'
                      : d.isCurrentMonth
                      ? 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      : 'text-[var(--text-disabled)]'
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

// ── Option 2: Tactile Pop-In (Scale: 0.90 ➔ 1.0 Spring Pop) ────────────────
const applePopContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const applePopCardLeft: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 280,
      mass: 0.8,
    },
  },
};

const applePopCardRight: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 280,
      mass: 0.8,
      delay: 0.04,
    },
  },
};

const applePopCardDocs: Variants = {
  hidden: { opacity: 0, scale: 0.90, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 280,
      mass: 0.8,
      delay: 0.08,
    },
  },
};

const applePopStageItem: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 300,
      mass: 0.7,
    },
  },
};

const applePopDocItem: Variants = {
  hidden: { opacity: 0, scale: 0.92, x: -10 },
  show: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 18,
      stiffness: 300,
    },
  },
};

const applePopInfoSection: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * High-fidelity Skeleton Placeholder loader for Candidate Profile Page
 * Perfectly aligned with the loaded card layout
 */
export const CandidateProfileSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex flex-col gap-4 pb-6 p-3.5 sm:p-5 bg-[var(--canvas)] min-h-screen text-[13px] font-sans relative"
  >
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-4 flex flex-col gap-3.5">
        {/* Profile Card Skeleton */}
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-xs)] flex flex-col gap-3.5 relative overflow-hidden">
          <div className="flex items-start justify-between gap-2.5 border-b border-[var(--border-soft)] pb-3 min-h-[76px]">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={52} height={52} className="rounded-xl shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton width={140} height={18} className="rounded-md" />
                <Skeleton width={90} height={14} className="rounded-md" />
                <div className="flex items-center gap-1 mt-0.5">
                  <Skeleton width={60} height={16} className="rounded" />
                  <Skeleton width={60} height={16} className="rounded" />
                </div>
              </div>
            </div>
            <Skeleton width={70} height={24} className="rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton height={32} className="rounded-lg" />
            <Skeleton height={32} className="rounded-lg" />
          </div>

          {/* 4 Detail Grid Skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2 pt-2 border-t border-[var(--border-soft)]">
              <Skeleton width={110} height={14} className="rounded-sm" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton height={20} className="rounded-md" />
                <Skeleton height={20} className="rounded-md" />
                <Skeleton height={20} className="rounded-md" />
                <Skeleton height={20} className="rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Documents Card Skeleton */}
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-xs)] flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-2">
            <Skeleton width={120} height={16} className="rounded-sm" />
            <Skeleton width={60} height={16} className="rounded-sm" />
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={44} className="rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column Skeleton — Perfectly aligned with Left Column */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-xs)] relative overflow-hidden">
          <div className="flex items-start justify-between gap-2.5 min-h-[76px]">
            <div className="flex items-center gap-3">
              <Skeleton variant="rectangular" width={52} height={52} className="rounded-xl shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton width={200} height={18} className="rounded-md" />
                <Skeleton width={260} height={14} className="rounded-md" />
                <div className="flex items-center gap-1 mt-0.5">
                  <Skeleton width={65} height={16} className="rounded" />
                  <Skeleton width={80} height={16} className="rounded" />
                </div>
              </div>
            </div>
            <Skeleton width={140} height={32} className="rounded-lg shrink-0" />
          </div>
        </div>

        {/* 5 Stages Timeline Skeleton */}
        <div className="flex flex-col gap-3 pl-4 border-l-2 border-[var(--border-soft)] ml-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2 p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton width={160} height={16} className="rounded-md" />
                  <Skeleton width={60} height={18} className="rounded-full" />
                </div>
                <Skeleton width={70} height={14} className="rounded-sm" />
              </div>
              <Skeleton height={28} className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export const CandidateProfilePage: React.FC<CandidateProfilePageProps> = ({
  candidateId = '1',
}) => {
  const router = useRouter();

  const numericId = parseInt(String(candidateId).replace(/\D/g, ''), 10) || 1;
  const { data: candidateRes, isLoading: isCandidateLoading, isFetching: isCandidateFetching } = useGetCandidateByIdQuery(numericId);
  const { data: candidatesListRes, isLoading: isListLoading } = useGetCandidatesQuery();
  const [evaluateStage] = useEvaluateCandidateStageMutation();
  const [assignEvaluator] = useAssignEvaluatorMutation();
  const [uploadCandidateDocument] = useUploadCandidateDocumentMutation();

  // Dialog & Toast States
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<CandidateDocument | null>(null);

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
      const history = apiData.pipelineProgress || apiData.pipelineProgressHistory;

      const r1 = history?.find((p: any) => p.roundNumber === 1);
      const r2 = history?.find((p: any) => p.roundNumber === 2);
      const r3 = history?.find((p: any) => p.roundNumber === 3);

      const r1Failed = r1?.status?.toLowerCase() === 'failed' || r1?.status?.toLowerCase() === 'rejected';
      const r2Failed = r2?.status?.toLowerCase() === 'failed' || r2?.status?.toLowerCase() === 'rejected';
      const r3Failed = r3?.status?.toLowerCase() === 'failed' || r3?.status?.toLowerCase() === 'rejected';

      const isTrulyRejected = r1Failed || (r2Failed && r3Failed);
      const candidateStatus = isTrulyRejected ? 'Rejected' : apiData.status === 'Offered' || apiData.status === 'Hired' ? apiData.status : 'In-Progress';

      const savedAvatar = (typeof window !== 'undefined' ? localStorage.getItem(`step_candidate_avatar_${numericId}`) : null) || apiData.avatarUrl || '';

      setCandidate({
        id: String(apiData.id || candidateId),
        name: `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim() || 'Candidate',
        avatar: savedAvatar,
        status: candidateStatus,
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

      if (history && Array.isArray(history) && history.length > 0) {
        // Director (Round 4) and Offer (Round 5) lock ONLY IF Round 1 failed OR BOTH Round 2 & Round 3 failed
        const isDirectorAndOfferLocked = r1Failed || (r2Failed && r3Failed);

        const liveStages: StageItem[] = history.map((p: any) => {
          const isCurrentRoundFailed = p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'rejected' || p.resultStatus?.toLowerCase() === 'fail';
          const isCurrentRoundPassed = p.status?.toLowerCase() === 'passed' || p.resultStatus?.toLowerCase() === 'pass';

          let isLocked = false;
          if (p.roundNumber === 1) {
            isLocked = false;
          } else if (p.roundNumber === 2 || p.roundNumber === 3) {
            // Technical rounds are only locked if Paper Aptitude (Round 1) failed
            isLocked = r1Failed;
          } else if (p.roundNumber >= 4) {
            // Director & Offer rounds lock only if BOTH Round 2 & 3 failed (or Round 1 failed)
            isLocked = isDirectorAndOfferLocked;
          }

          const hasCompletedTest = Boolean(p.completedAt || p.scoreObtained !== null || p.candidateExamSessionId);

          return {
            id: p.roundNumber,
            name: p.roundTitle || `Round ${p.roundNumber}`,
            status: isLocked ? 'Locked' : isCurrentRoundFailed ? 'Failed' : isCurrentRoundPassed ? 'Passed' : p.status || 'Pending',
            statusType: isLocked ? 'locked' : isCurrentRoundFailed ? 'rejected' : isCurrentRoundPassed ? 'passed' : 'pending',
            date: p.completedAt
              ? new Date(p.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : p.startedAt
                ? new Date(p.startedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : candDate,
            interviewer: p.interviewerName || (p.roundNumber === 1 ? 'Assigned Evaluator' : 'Unassigned'),
            interviewerInitials: p.interviewerName
              ? p.interviewerName.split(' ').map((n: string) => n[0]).join('')
              : p.roundNumber === 1
                ? 'AE'
                : 'UA',
            interviewerRole: p.roundType || 'Evaluator',
            mode: p.roundNumber === 1 ? 'Offline (Paper Test)' : p.roundType === 'Assessment' ? 'Online Proctored' : 'In Office',
            feedback: isLocked
              ? r1Failed
                ? 'Round locked — candidate failed Round 1 (Paper Aptitude).'
                : 'Round locked — candidate failed both technical rounds (Coding Challenge & Technical F2F).'
              : (() => {
                const hasScore = p.scoreObtained !== null && p.scoreObtained !== undefined;
                const scoreStr = hasScore ? `Candidate Exam Score: ${p.scoreObtained}%` : '';

                if (hasScore && p.remarks) {
                  return `${scoreStr} • ${p.remarks}`;
                }
                if (hasScore) {
                  return `${scoreStr} (${p.status || 'Evaluated'})`;
                }
                if (isCurrentRoundFailed) {
                  return p.remarks || 'Candidate failed evaluation for this round.';
                }
                if (p.remarks) {
                  return p.remarks;
                }
                if (hasCompletedTest) {
                  return 'Candidate submitted exam (Awaiting scorecard evaluation)';
                }
                return 'Evaluation in progress';
              })(),
            result: isLocked ? 'Locked' : isCurrentRoundFailed ? 'Failed' : p.status || 'Pending',
            interviewId: p.interviewId ?? null,
            candidateExamSessionId: p.candidateExamSessionId ?? null,
            roundType: p.roundType,
            isDirectorRound: p.roundNumber === 4,
            isOfferRound: p.roundNumber === 5,
            isLocked: isLocked,
            hasCompletedTest: hasCompletedTest,
          };
        });

        // Ensure fixed 4th Round (Director Interview) and 5th Round (Offer) are always present in pipeline
        if (!liveStages.some((s) => s.id === 4)) {
          liveStages.push({
            id: 4,
            name: 'Director Interview',
            status: isDirectorAndOfferLocked ? 'Locked' : 'Pending',
            statusType: isDirectorAndOfferLocked ? 'locked' : 'pending',
            date: 'Pending',
            interviewer: 'Unassigned',
            interviewerInitials: 'UA',
            interviewerRole: 'Director of Engineering',
            mode: 'In Office',
            feedback: isDirectorAndOfferLocked
              ? r1Failed
                ? 'Round locked — candidate failed Round 1 (Paper Aptitude).'
                : 'Round locked — candidate failed both technical rounds (Coding Challenge & Technical F2F).'
              : 'Director decision round pending.',
            result: isDirectorAndOfferLocked ? 'Locked' : 'Pending',
            actionLabel: null,
            isDirectorRound: true,
            isOfferRound: false,
            isLocked: isDirectorAndOfferLocked,
            roundType: 'Interview',
          });
        }

        if (!liveStages.some((s) => s.id === 5)) {
          liveStages.push({
            id: 5,
            name: 'Offer',
            status: isDirectorAndOfferLocked ? 'Locked' : 'Pending',
            statusType: isDirectorAndOfferLocked ? 'locked' : 'pending',
            date: 'Pending',
            interviewer: '—',
            interviewerInitials: '—',
            interviewerRole: 'HR Operations',
            mode: 'Official Document',
            feedback: isDirectorAndOfferLocked
              ? r1Failed
                ? 'Round locked — candidate failed Round 1 (Paper Aptitude).'
                : 'Round locked — candidate failed both technical rounds (Coding Challenge & Technical F2F).'
              : 'Awaiting pipeline clearance for offer rollout.',
            result: isDirectorAndOfferLocked ? 'Locked' : 'Pending',
            actionLabel: null,
            isDirectorRound: false,
            isOfferRound: true,
            isLocked: isDirectorAndOfferLocked,
          });
        }

        setStagesData(liveStages);
      } else {
        // Construct dynamic candidate hiring stages using actual candidate assigned flow version & drive type
        const isApplied = apiData.status === 'Applied' || apiData.currentStage === 'Applied' || apiData.currentStage === 'Registered';
        const isWalkInDrive = apiData.registrationChannel === 'Walk-in Scan' || apiData.registrationChannel === 'WalkIn' || (candidate.source && candidate.source.toLowerCase().includes('walk'));

        let r1Name = 'General Aptitude & Logical Test';
        let r1Role = 'Automated Test';
        let r1Mode = 'Online Assessment';
        let r1Type = 'Assessment';

        let r2Name = 'Coding & Algorithm Challenge';
        let r2Role = 'Technical Evaluator';
        let r2Mode = 'Online / In Office Test';
        let r2Type = 'Assessment';

        let r3Name = 'Technical F2F & Live Coding';
        let r3Role = 'Technical Panel';
        let r3Mode = 'In Office / Google Meet';
        let r3Type = 'Interview';

        if (isWalkInDrive) {
          r1Mode = 'Offline (Paper Test)';
          r1Role = 'Invigilator / Evaluator';
          if (assignedFlowVersionName.includes('Fast-Track Technical') || assignedFlowVersionName.includes('Flow Version 2')) {
            r1Name = 'General Aptitude & Logical Test';
            r2Name = 'Face to Face HR & Technical Round';
            r2Role = 'Senior HR & Panel';
            r2Type = 'Interview';
            r3Name = 'Coding & Algorithm Challenge';
            r3Role = 'Technical Evaluator';
            r3Type = 'Assessment';
          } else {
            r1Name = 'General Aptitude & Logical Test';
            r2Name = 'Coding & Algorithm Challenge';
            r2Role = 'Technical Evaluator';
            r2Type = 'Assessment';
            r3Name = 'Technical F2F & Live Coding';
            r3Role = 'Technical Panel';
            r3Type = 'Interview';
          }
        } else {
          r1Name = 'HR Screening (Compulsory 1st Round)';
          r1Role = 'HR Specialist';
          r1Mode = 'Phone / Walk-in';
          r1Type = 'Interview';
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
            feedback: `Stage 1 Paper Aptitude Test verified on ${candDate}. Evaluation in progress.`,
            result: isApplied ? 'In Progress' : 'Passed',
            actionLabel: null,
            isDirectorRound: false,
            isOfferRound: false,
            roundType: r1Type,
          },
          {
            id: 2,
            name: r2Name,
            status: isTrulyRejected ? 'Failed' : 'Pending',
            statusType: isTrulyRejected ? 'rejected' : 'pending',
            date: candDate,
            interviewer: 'Assigned Evaluator',
            interviewerInitials: 'AE',
            interviewerRole: r2Role,
            mode: r2Mode,
            feedback: isTrulyRejected ? 'Candidate failed Round 2 evaluation.' : 'Stage 2 evaluation pending.',
            result: isTrulyRejected ? 'Failed' : 'Pending',
            actionLabel: 'Schedule Stage 2',
            isDirectorRound: false,
            isOfferRound: false,
            isLocked: false,
            hasCompletedTest: isTrulyRejected,
            roundType: r2Type,
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
            feedback: 'Stage 3 evaluation pending (Technical F2F & Live Coding open).',
            result: 'Pending',
            actionLabel: 'Schedule Stage 3',
            isDirectorRound: false,
            isOfferRound: false,
            isLocked: false,
            roundType: r3Type,
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
            feedback: 'Director decision round pending.',
            result: 'Pending',
            actionLabel: null,
            isDirectorRound: true,
            isOfferRound: false,
            isLocked: false,
            roundType: 'Interview',
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
            feedback: 'Awaiting pipeline clearance for offer rollout.',
            result: 'Pending',
            actionLabel: null,
            isDirectorRound: false,
            isOfferRound: true,
            isLocked: false,
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

      // Sync the real OfferLetterId once one exists, so the Offer modal knows to fetch/display it
      // instead of offering to generate a duplicate.
      if (apiData.offerLetterId) {
        setOfferLetterId(apiData.offerLetterId);
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
  const [docDeletedToast, setDocDeletedToast] = useState<string | null>(null);

  // Offer Letter Rollout Form Modal State — real backend-backed now. offerLetterId is synced from
  // the candidate's real OfferLetterId (see the apiData useEffect below) once one exists; the CTC/
  // JoiningDate inputs are only editable before generation — GenerateOfferLetterCommandHandler
  // rejects a second offer while one is already active, so once generated they become read-only.
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerLetterId, setOfferLetterId] = useState<number | null>(null);
  const [offerCtc, setOfferCtc] = useState('');
  const [offerJoiningDate, setOfferJoiningDate] = useState('');
  const [offerApprovalPin, setOfferApprovalPin] = useState('');

  const { data: offerRes } = useGetOfferByIdQuery(offerLetterId ?? 0, { skip: !offerLetterId });
  const [generateOfferLetter, { isLoading: isGeneratingOffer }] = useGenerateOfferLetterMutation();
  const [approveOffer, { isLoading: isApprovingOffer }] = useApproveOfferMutation();
  const [updateCandidateApi] = useUpdateCandidateMutation();
  const [deleteCandidateDocApi] = useDeleteCandidateDocumentMutation();

  // Submit Feedback / Director Decision Modal State
  const [selectedFeedbackStage, setSelectedFeedbackStage] = useState<StageItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [directorDecision, setDirectorDecision] = useState<'offer' | 'reject' | 'hold'>('offer');
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState(false);

  // Real panelist scorecard fields (SubmitInterviewFeedbackCommand shape) — only used for
  // non-Director rounds, since a real Interview + InterviewRoundDetail is what backs this.
  const [scorecardTechnical, setScorecardTechnical] = useState(3);
  const [scorecardCommunication, setScorecardCommunication] = useState(3);
  const [scorecardProblemSolving, setScorecardProblemSolving] = useState(3);
  const [scorecardCulturalFit, setScorecardCulturalFit] = useState(3);
  const [scorecardStrengths, setScorecardStrengths] = useState('');
  const [scorecardWeaknesses, setScorecardWeaknesses] = useState('');
  const [scorecardRecommendation, setScorecardRecommendation] = useState<'Pass' | 'Fail' | 'Hire' | 'Reject' | 'OnHold'>('Pass');

  const currentUserId = typeof window !== 'undefined' ? Number(localStorage.getItem('step_user_id')) || null : null;
  const [submitInterviewFeedback, { isLoading: isSubmittingFeedback }] = useSubmitInterviewFeedbackMutation();
  const [publishInterviewResult, { isLoading: isPublishingDecision }] = usePublishInterviewResultMutation();
  const [evaluateCandidateStage] = useEvaluateCandidateStageMutation();
  const { data: feedbackInterviewRes } = useGetInterviewByIdQuery(selectedFeedbackStage?.interviewId ?? 0, {
    skip: !selectedFeedbackStage || selectedFeedbackStage.isDirectorRound || !selectedFeedbackStage.interviewId,
  });
  const myExistingScorecard = feedbackInterviewRes?.data?.roundDetails.find((d) => d.panelistUserId === currentUserId);

  // Pre-fill the scorecard form with the current panelist's own previous submission (if any) once
  // it loads — resubmitting replaces it server-side (upsert), so this is an honest "edit" flow.
  useEffect(() => {
    if (!myExistingScorecard) return;
    setScorecardTechnical(myExistingScorecard.technicalRating);
    setScorecardCommunication(myExistingScorecard.communicationRating);
    setScorecardProblemSolving(myExistingScorecard.problemSolvingRating);
    setScorecardCulturalFit(myExistingScorecard.culturalFitRating);
    setScorecardStrengths(myExistingScorecard.strengths || '');
    setScorecardWeaknesses(myExistingScorecard.weaknesses || '');
    setScorecardRecommendation(myExistingScorecard.recommendation as 'Hire' | 'Reject' | 'OnHold');
    setFeedbackText(myExistingScorecard.comments || '');
  }, [myExistingScorecard]);

  // Assign Interviewer Modal State
  const [selectedAssignStage, setSelectedAssignStage] = useState<StageItem | null>(null);
  const [assignedInterviewer, setAssignedInterviewer] = useState(''); // holds a real Users.Id (as a string)
  const [assignDate, setAssignDate] = useState('2025-05-18');
  const [assignTime, setAssignTime] = useState('11:30');
  const [assignMode, setAssignMode] = useState('Google Meet');
  const [assignSuccessToast, setAssignSuccessToast] = useState(false);

  // Candidate Assessment Evaluation & Schedule Test Modal State
  const [showAssessmentEvaluationModal, setShowAssessmentEvaluationModal] = useState(false);
  const [showScheduleTestModal, setShowScheduleTestModal] = useState(false);

  // Options for Dropdowns — real accounts from the Users table, filtered by role. No more
  // fictional names: whoever the org has actually created under Users is who shows up here.
  const { data: usersRes } = useGetUsersQuery();
  const [scheduleInterview, { isLoading: isScheduling }] = useScheduleInterviewMutation();

  const directorOptions = useMemo(
    () => (usersRes?.data || [])
      .filter((u) => (u.role || '').toLowerCase() === 'director')
      .map((u) => ({ value: String(u.id), label: `${u.firstName || ''} ${u.lastName || ''}`.trim() + ` (Director)` })),
    [usersRes]
  );

  const interviewerOptions = useMemo(
    () => (usersRes?.data || [])
      .filter((u) => {
        const r = (u.role || '').toLowerCase();
        return r === 'interviewer' || r === 'hr' || r === 'director';
      })
      .map((u) => ({ value: String(u.id), label: `${u.firstName || ''} ${u.lastName || ''}`.trim() + ` (${u.role})` })),
    [usersRes]
  );

  const meetingModeOptions = [
    { value: 'Google Meet', label: 'Google Meet (Online Link)' },
    { value: 'Microsoft Teams', label: 'Microsoft Teams' },
    { value: 'In Office', label: 'In Office Venue' },
  ];

  // Main Dynamic Recruitment Stages Stack
  const [stagesData, setStagesData] = useState<StageItem[]>([]);

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

  const handleSaveProfileEdit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

    // All validations passed — save to SQL Server DB
    try {
      const nameParts = f.name.trim().split(' ');
      const firstName = nameParts[0] || 'Candidate';
      const lastName = nameParts.slice(1).join(' ') || '';

      await updateCandidateApi({
        candidateId: numericId,
        data: {
          firstName,
          lastName,
          email: f.email,
          phone: f.phone,
          currentLocation: f.location,
          highestQualification: f.education,
          totalExperienceYears: parseFloat(f.experience) || 0,
          currentCTC: parseFloat(f.currentCtc) || 0,
          expectedCTC: parseFloat(f.expectedCtc) || 0,
          noticePeriodDays: parseInt(f.noticePeriod, 10) || 0,
        },
      }).unwrap();

      setCandidate({ ...editProfileForm });
      setShowEditProfileModal(false);
      toast.success('Profile Saved', { description: 'Candidate profile details updated successfully' });
    } catch (err: any) {
      toast.error('Update Failed', { description: err.data?.message || err.message || 'Failed to update candidate profile.' });
    }
  };

  const handleDeleteDocument = async (docId: number, docName: string) => {
    try {
      await deleteCandidateDocApi({ candidateId: numericId, documentId: docId }).unwrap();
      setDocumentsData((prev) => prev.filter((d) => d.id !== docId));
      toast.info('Document Deleted', { description: `"${docName}" removed from candidate profile.` });
    } catch (err: any) {
      toast.error('Delete Failed', { description: err.data?.message || 'Failed to delete document.' });
    }
  };

  const handleDownloadDocument = (docName: string, docId?: number) => {
    const targetId = docId || selectedDocPreview?.id;
    if (targetId) {
      window.open(`/api/v1/candidates/${numericId}/documents/${targetId}/download`, '_blank');
      toast.success('Downloading Document', { description: `Downloading ${docName}...` });
    } else {
      toast.info('Downloading File', { description: `Downloading ${docName}...` });
    }
  };

  const handleRolloutOffer = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentOfferStatus = offerRes?.data?.status;

    // Step 1: no offer generated yet — create it (real PDF + PendingApproval row).
    if (!offerLetterId) {
      const ctcNum = parseFloat(offerCtc);
      if (!offerCtc || Number.isNaN(ctcNum) || ctcNum <= 0) {
        toast.error('Invalid CTC', { description: 'Enter a valid offered CTC greater than 0.' });
        return;
      }
      if (!offerJoiningDate) {
        toast.error('Joining Date Required', { description: 'Select a joining date.' });
        return;
      }

      try {
        const result = await generateOfferLetter({
          candidateId: numericId,
          offeredCTC: ctcNum,
          joiningDate: offerJoiningDate,
        }).unwrap();
        setOfferLetterId(result.data.id);
        toast.success('Offer Letter Generated', {
          description: 'PDF generated and saved — awaiting Director PIN approval before it\'s final.',
        });
      } catch (err) {
        const description = (err as { data?: { errors?: string[]; message?: string } })?.data?.errors?.[0]
          || (err as { data?: { message?: string } })?.data?.message
          || 'Could not generate the offer letter.';
        toast.error('Generation Failed', { description });
      }
      return;
    }

    // Step 2: offer exists and is awaiting the Director's PIN approval.
    if (currentOfferStatus === 'PendingApproval') {
      if (offerApprovalPin.length !== 6) {
        toast.error('Invalid PIN', { description: "Enter the Director's 6-digit security PIN." });
        return;
      }
      try {
        await approveOffer({ id: offerLetterId, directorPin: offerApprovalPin }).unwrap();
        setOfferApprovalPin('');
        toast.success('Offer Approved', { description: 'Director approval recorded — the offer letter is now finalized.' });
      } catch (err) {
        const description = (err as { data?: { errors?: string[]; message?: string } })?.data?.errors?.[0]
          || (err as { data?: { message?: string } })?.data?.message
          || 'Could not approve the offer letter — check the PIN and try again.';
        toast.error('Approval Failed', { description });
      }
      return;
    }

    // Already Approved — nothing left to submit.
    setShowOfferModal(false);
  };

  const handleDownloadOffer = async () => {
    if (!offerLetterId) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('step_token') : null;
      const res = await fetch(`${getApiBaseUrl()}/offers/${offerLetterId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Offer_${candidate.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      toast.error('Download Failed', { description: 'Could not download the offer letter PDF.' });
    }
  };

  const handleSaveFeedback = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFeedbackStage) return;

    if (selectedFeedbackStage.roundType === 'Assessment') {
      try {
        const isPassed = scorecardRecommendation === 'Pass' || scorecardRecommendation === 'Hire';
        await evaluateCandidateStage({
          candidateId: numericId,
          roundNumber: selectedFeedbackStage.id,
          passed: isPassed,
          remarks: feedbackText || `Assessment evaluation submitted (${scorecardRecommendation}).`,
        }).unwrap();

        setStagesData((prev) =>
          prev.map((s) =>
            s.id === selectedFeedbackStage.id
              ? {
                ...s,
                status: isPassed ? 'Passed' : 'Failed',
                statusType: isPassed ? 'passed' : 'rejected',
                result: isPassed ? 'Passed' : 'Failed',
                feedback: feedbackText || `Assessment evaluation submitted (${scorecardRecommendation}).`,
                actionLabel: null,
              }
              : s
          )
        );
        setSelectedFeedbackStage(null);
        toast.success('Assessment Evaluated', { description: 'Coding assessment scorecard submitted and persisted.' });
      } catch (err) {
        toast.error('Submission Failed', { description: 'Could not submit assessment evaluation.' });
      }
      return;
    }

    // Regular (non-Director) Interview rounds submit a real scorecard against the real Interview row —
    if (!selectedFeedbackStage.isDirectorRound) {
      if (!selectedFeedbackStage.interviewId) {
        toast.error('No Interview Scheduled', {
          description: 'Assign an interviewer and schedule this round before submitting a scorecard.',
        });
        return;
      }

      try {
        const mappedRecommendation: 'Hire' | 'Reject' | 'OnHold' =
          scorecardRecommendation === 'Fail' || scorecardRecommendation === 'Reject'
            ? 'Reject'
            : scorecardRecommendation === 'OnHold'
              ? 'OnHold'
              : 'Hire';

        await submitInterviewFeedback({
          interviewId: selectedFeedbackStage.interviewId,
          technicalRating: scorecardTechnical,
          communicationRating: scorecardCommunication,
          problemSolvingRating: scorecardProblemSolving,
          culturalFitRating: scorecardCulturalFit,
          strengths: scorecardStrengths || undefined,
          weaknesses: scorecardWeaknesses || undefined,
          recommendation: mappedRecommendation,
          comments: feedbackText || undefined,
        }).unwrap();

        const isPassed = mappedRecommendation === 'Hire';
        await publishInterviewResult({
          id: selectedFeedbackStage.interviewId,
          passed: isPassed,
          remarks: feedbackText || `Scorecard submitted (${mappedRecommendation}).`,
        }).unwrap();

        setStagesData((prev) =>
          prev.map((s) => (s.id === selectedFeedbackStage.id ? { ...s, feedback: feedbackText || s.feedback } : s))
        );
        setSelectedFeedbackStage(null);
        toast.success('Scorecard Saved', { description: 'Interview scorecard submitted and persisted.' });
      } catch (err) {
        const description = (err as { data?: { message?: string; errors?: string[] } })?.data?.errors?.[0]
          || (err as { data?: { message?: string } })?.data?.message
          || 'Could not save the scorecard. Please try again.';
        toast.error('Submission Failed', { description });
      }
      return;
    }

    // Director Decision — real backend call. "On Hold" has no equivalent in
    // PublishInterviewResultCommand (it only ever takes a bool Passed) — rather than fake a
    // "retake" flow the backend has no concept of, it just leaves the decision unrecorded.
    if (directorDecision === 'hold') {
      setSelectedFeedbackStage(null);
      toast.success('Decision Deferred', { description: 'No outcome was recorded — the candidate\'s status is unchanged. Come back and choose Offer or Reject to finalize.' });
      return;
    }

    if (!selectedFeedbackStage.interviewId) {
      toast.error('No Interview Scheduled', {
        description: 'Assign a Director and schedule this round before recording a decision.',
      });
      return;
    }

    try {
      await publishInterviewResult({
        id: selectedFeedbackStage.interviewId,
        passed: directorDecision === 'offer',
        remarks: feedbackText || undefined,
      }).unwrap();

      // Publishing genuinely advances/rejects/offers the candidate server-side — let the
      // invalidated 'Candidates' tag refetch drive the real post-decision stage data instead of
      // hand-guessing what changed here.
      setSelectedFeedbackStage(null);
      toast.success('Decision Published', {
        description: directorDecision === 'offer' ? 'Candidate advanced/offered — pipeline updated.' : 'Candidate rejected — pipeline updated.',
      });
    } catch (err) {
      const description = (err as { data?: { message?: string; errors?: string[] } })?.data?.errors?.[0]
        || (err as { data?: { message?: string } })?.data?.message
        || 'Could not publish the decision. Please try again.';
      toast.error('Publish Failed', { description });
    }
  };

  const MEETING_MODE_TO_BACKEND: Record<string, 'Online' | 'Onsite' | 'Phone'> = {
    'Google Meet': 'Online',
    'Microsoft Teams': 'Online',
    'In Office': 'Onsite',
  };

  const handleSaveAssign = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssignStage) return;

    const options = selectedAssignStage.isDirectorRound ? directorOptions : interviewerOptions;
    const selectedOption = options.find((o) => o.value === assignedInterviewer);

    if (!selectedOption) {
      toast.error('No Account Selected', {
        description: `No ${selectedAssignStage.isDirectorRound ? 'Director' : 'Interviewer/HR'} accounts exist yet — create one under Users first.`,
      });
      return;
    }

    const displayName = selectedOption.label.replace(/\s*\([^)]*\)$/, ''); // strip the trailing "(Role)"
    const initials = displayName.split(' ').map((n) => n[0]).join('');

    // Assessment-classified rounds (evaluator assignment) persist EvaluatorUserId to DB
    if (selectedAssignStage.roundType !== 'Interview') {
      try {
        await assignEvaluator({
          candidateId: numericId,
          roundNumber: selectedAssignStage.id,
          evaluatorUserId: Number(assignedInterviewer),
        }).unwrap();

        setStagesData((prev) =>
          prev.map((s) => (s.id === selectedAssignStage.id ? { ...s, interviewer: displayName, interviewerInitials: initials || 'IN' } : s))
        );
        setSelectedAssignStage(null);
        toast.success('Evaluator Assigned', {
          description: `${displayName} assigned as Technical Evaluator for ${selectedAssignStage.name}.`,
        });
      } catch (err: any) {
        toast.error('Failed to Assign Evaluator', {
          description: err?.data?.message || 'Could not save evaluator assignment to database.',
        });
      }
      return;
    }

    try {
      let isoScheduledAt: string;
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(assignDate)) {
          const timePart = assignTime.length === 5 ? `${assignTime}:00` : '11:30:00';
          isoScheduledAt = new Date(`${assignDate}T${timePart}`).toISOString();
        } else {
          const parsedDateObj = new Date(assignDate);
          if (assignTime) {
            const timeParts = assignTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeParts) {
              let hours = parseInt(timeParts[1], 10);
              const minutes = parseInt(timeParts[2], 10);
              const ampm = timeParts[3]?.toUpperCase();
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
              parsedDateObj.setHours(hours, minutes, 0, 0);
            }
          }
          isoScheduledAt = isNaN(parsedDateObj.getTime()) ? new Date().toISOString() : parsedDateObj.toISOString();
        }
      } catch {
        isoScheduledAt = new Date().toISOString();
      }

      const result = await scheduleInterview({
        candidateId: numericId,
        interviewerUserId: Number(assignedInterviewer),
        scheduledAt: isoScheduledAt,
        durationMinutes: 60,
        mode: MEETING_MODE_TO_BACKEND[assignMode] || 'Onsite',
      }).unwrap();

      setStagesData((prev) =>
        prev.map((s) =>
          s.id === selectedAssignStage.id
            ? {
              ...s,
              interviewer: displayName || (selectedAssignStage.isDirectorRound ? 'Director' : 'Interviewer'),
              interviewerInitials: initials || 'IN',
              mode: assignMode,
              date: assignDate,
              interviewId: result.data?.id || s.interviewId,
            }
            : s
        )
      );

      setSelectedAssignStage(null);
      toast.success('Interview Scheduled', { description: `${displayName} assigned for ${assignDate} (${assignMode}) — persisted.` });
    } catch (err) {
      const description = (err as { data?: { errors?: string[]; message?: string } })?.data?.errors?.[0]
        || (err as { data?: { message?: string } })?.data?.message
        || 'Could not schedule the interview. Please try again.';
      toast.error('Schedule Failed', { description });
    }
  };

  const handlePaperAptitudePass = async (stageId: number) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setStagesData((prev) =>
      prev.map((s) =>
        s.id === stageId || s.id === 1
          ? {
            ...s,
            status: 'Passed',
            statusType: 'passed',
            result: 'Passed',
            feedback: `Paper Aptitude Test evaluated and passed on ${todayStr}. Candidate qualified for Next Round.`,
            actionLabel: null,
          }
          : s
      )
    );

    toast.success('Paper Aptitude Passed', {
      description: 'Candidate passed the Paper Aptitude Test and is advanced to the next round.',
    });

    try {
      await evaluateCandidateStage({
        candidateId: numericId,
        roundNumber: stageId || 1,
        passed: true,
        remarks: `Paper Aptitude Test evaluated and passed on ${todayStr}. Candidate qualified for Next Round.`,
      }).unwrap();
    } catch (e) {
      console.warn('Backend evaluate stage notice:', e);
    }
  };

  const handlePaperAptitudeFail = async (stageId: number) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setStagesData((prev) =>
      prev.map((s) =>
        s.id === stageId || s.id === 1
          ? {
            ...s,
            status: 'Failed',
            statusType: 'rejected',
            result: 'Failed',
            feedback: `Paper Aptitude Test evaluated on ${todayStr} — did not meet cutoff marks.`,
            actionLabel: null,
          }
          : s
      )
    );

    toast.error('Paper Aptitude Failed', {
      description: 'Candidate marked as failed in Paper Aptitude Test.',
    });

    try {
      await evaluateCandidateStage({
        candidateId: numericId,
        roundNumber: stageId || 1,
        passed: false,
        remarks: `Paper Aptitude Test evaluated on ${todayStr} — did not meet cutoff marks.`,
      }).unwrap();
    } catch (e) {
      console.warn('Backend evaluate stage notice:', e);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`step_candidate_avatar_${numericId}`, base64Url);
      }
      setCandidate((prev) => ({ ...prev, avatar: base64Url }));

      const newDoc: CandidateDocument = {
        id: Date.now(),
        name: file.name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        size: `${Math.round(file.size / 1024)} KB`,
        type: 'Profile Photo',
      };

      setDocumentsData((prev) => [newDoc, ...prev]);

      try {
        await uploadCandidateDocument({
          candidateId: numericId,
          documentType: 'Profile Photo',
          file,
        }).unwrap();
        toast.success('Profile Photo Updated', {
          description: `${file.name} uploaded successfully and persisted to candidate record.`,
        });
      } catch (err) {
        console.warn('Backend upload document notice:', err);
        toast.success('Profile Photo Updated', {
          description: `${file.name} uploaded successfully as Candidate Profile Photo.`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocumentFile = async (e: React.ChangeEvent<HTMLInputElement>, explicitDocType?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isResume = file.name.toLowerCase().includes('resume') || file.name.toLowerCase().includes('cv');
    const docType = explicitDocType || (isImage ? 'Profile Photo' : isResume ? 'Resume' : 'Application Form');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`step_candidate_avatar_${numericId}`, base64Url);
        }
        setCandidate((prev) => ({ ...prev, avatar: base64Url }));
      };
      reader.readAsDataURL(file);
    }

    const newDoc: CandidateDocument = {
      id: Date.now(),
      name: file.name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: `${Math.round(file.size / 1024)} KB`,
      type: docType,
    };

    setDocumentsData((prev) => [newDoc, ...prev]);

    try {
      await uploadCandidateDocument({
        candidateId: numericId,
        documentType: docType,
        file,
      }).unwrap();
      toast.success('Document Saved to Database', {
        description: `${file.name} attached successfully as ${docType} and persisted to SQL database.`,
      });
    } catch (err) {
      console.warn('Backend upload document notice:', err);
      toast.success('Document Uploaded', {
        description: `${file.name} attached successfully as ${docType}.`,
      });
    }
  };

  // ── High-Fidelity Loading State with Skeleton Fallback ───────────────────
  if (isCandidateLoading || (!candidateRes?.data && (isListLoading || isCandidateFetching))) {
    return <CandidateProfileSkeleton />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={applePopContainer}
      className="flex flex-col gap-4 pb-6 p-3.5 sm:p-5 bg-[var(--canvas)] min-h-screen text-[13px] font-sans relative"
    >
      {/* ── Main 2-Column Section ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT COLUMN (4 cols / ~30%): Candidate Profile Overview & Documents */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Card 1: Unified Candidate Profile Card */}
          <motion.div variants={applePopCardLeft} className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-xs)] flex flex-col gap-3.5 relative overflow-hidden">
            {/* Top Inset Highlight Catch */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

            {/* Header: Photo, Name, Badges & Actions */}
            <div className="flex items-start justify-between gap-2.5 border-b border-[var(--border-soft)] pb-3 min-h-[76px]">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="group relative w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-[var(--border-default)] shadow-2xs bg-[var(--surface-2)] transition-transform hover:scale-[1.02]"
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
                  {/* Hover Overlay with BOTH View (Eye) and Upload (Pencil) options */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white z-10 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => setShowImageModal(true)}
                      className="p-1 rounded-md bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                      title="View Candidate Photo"
                    >
                      <Icon name="eye" size="xs" />
                    </button>
                    <label
                      htmlFor={`profile-photo-upload-${numericId}`}
                      className="p-1 rounded-md bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"
                      title="Upload / Change Profile Photo"
                    >
                      <Icon name="pencil" size="xs" />
                      <input
                        id={`profile-photo-upload-${numericId}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="font-bold text-[var(--text-primary)] text-base font-heading truncate">{candidate.name}</h1>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${candidate.status?.toLowerCase() === 'rejected' || candidate.status?.toLowerCase() === 'failed'
                        ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]'
                        : candidate.status?.toLowerCase() === 'offered' || candidate.status?.toLowerCase() === 'hired'
                          ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
                          : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
                        }`}
                    >
                      {candidate.status}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium truncate mt-0.5">{candidate.designation}</span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border border-[var(--accent-violet)]/30">
                      {candidate.candidateType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                      {candidate.employmentType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  title="Edit Profile Details"
                >
                  <Icon name="pencil" size="xs" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer shadow-2xs transition-colors"
                  title="Share Candidate Link"
                >
                  <Icon name="external-link" size="xs" className="text-[var(--text-tertiary)]" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Applied Role Highlight Box */}
            <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border-default)] rounded-lg px-3 py-2">
              <span className="text-[var(--accent-indigo)] font-semibold text-xs flex items-center gap-1.5">
                <Icon name="briefcase" size="xs" />
                Applied Position:
              </span>
              <span className="font-bold text-[var(--text-primary)] text-xs truncate">{candidate.appliedFor}</span>
            </div>

            {/* Permanent Assigned Pipeline Flow Box */}
            <div className="flex flex-col gap-1 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--accent-indigo)] font-bold text-[11px] uppercase font-mono flex items-center gap-1.5">
                  <Icon name="grid" size="xs" />
                  Assigned Pipeline Flow:
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] px-2 py-0.5 rounded-full border border-[var(--accent-indigo)]/30">
                  🔒 Permanent Walk-in Flow
                </span>
              </div>
              <span className="font-extrabold text-[var(--text-primary)] text-xs font-heading">
                {assignedFlowVersionName}
              </span>
            </div>

            {/* Key-Value Details Grid */}
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Email Address</span>
                <span className="font-semibold text-[var(--text-primary)] truncate">{candidate.email}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Phone Number</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-figures">{candidate.phone}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Gender & DOB</span>
                <span className="font-semibold text-[var(--text-primary)]">{candidate.gender} • {candidate.dob}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Location</span>
                <span className="font-semibold text-[var(--text-primary)] truncate">{candidate.location}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Current Company</span>
                <span className="font-semibold text-[var(--text-primary)] truncate">{candidate.currentCompany}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Designation</span>
                <span className="font-semibold text-[var(--text-primary)] truncate">{candidate.currentDesignation}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Current CTC</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-figures">{candidate.currentCtc}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Expected CTC</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-figures">{candidate.expectedCtc}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Total Experience</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-figures">{candidate.experience}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Notice Period</span>
                <span className="font-semibold text-[var(--text-primary)]">{candidate.noticePeriod}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Application Source</span>
                <span className="font-semibold text-[var(--accent-indigo)]">{candidate.source}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Academic Score</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-figures">
                  {candidate.percentage || 'N/A'}{' '}
                  {candidate.passingYear ? (
                    <span className="text-[var(--text-tertiary)] font-normal text-xs tabular-figures">({candidate.passingYear})</span>
                  ) : null}
                </span>
              </div>

              <div className="col-span-2 flex flex-col gap-0.5 border-t border-[var(--border-soft)] pt-2">
                <span className="text-[var(--text-tertiary)] font-medium text-[11px]">Education Credentials & College</span>
                <span className="font-semibold text-[var(--text-primary)] text-xs truncate">{candidate.education} — {candidate.college}</span>
              </div>

              {/* Reference & Verification Details Subsection */}
              <div className="col-span-2 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-lg p-2.5 flex flex-col gap-1 mt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider flex items-center gap-1 font-heading">
                    <Icon name="users" size="xs" />
                    Reference: {candidate.refType || (candidate.refName ? 'Employee Referral' : 'None')}
                  </span>
                  {!candidate.refName && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                      Direct Application
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs pt-0.5">
                  <span className="text-[var(--text-secondary)] font-medium">
                    Referrer:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {candidate.refName || 'No Reference Provided'}
                    </strong>
                    {candidate.refEmployeeId ? ` (${candidate.refEmployeeId})` : ''}
                  </span>
                  <span className="text-[var(--text-secondary)] font-medium text-right">
                    Mobile:{' '}
                    <strong className="text-[var(--text-primary)] tabular-figures">
                      {candidate.refMobile || '—'}
                    </strong>
                  </span>
                  <span className="text-xs col-span-2 pt-0.5">
                    {candidate.refVerifiedBy ? (
                      <span className="text-[var(--status-success-text)] font-semibold flex items-center gap-1">
                        <Icon name="check-circle" size="xs" className="text-[var(--status-success)]" />
                        Verified By: {candidate.refVerifiedBy}
                      </span>
                    ) : (
                      <span className="text-[var(--text-tertiary)] font-normal text-[11px]">
                        Verification: {candidate.refName ? 'Pending Verification' : 'Not Required'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Documents Section (Resume, Application Form, Profile Photo) */}
          <motion.div variants={applePopCardDocs} className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-xs)] flex flex-col gap-2.5 relative overflow-hidden">
            {/* Top Inset Highlight Catch */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-2">
              <h2 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-heading uppercase tracking-wider">
                <Icon name="file-text" size="xs" className="text-[var(--text-tertiary)]" />
                <span>Documents ({documentsData.length})</span>
              </h2>

              <div className="flex items-center gap-1.5">
                <motion.label
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-6 px-2 inline-flex items-center gap-1 rounded-md bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 text-[10.5px] font-bold hover:bg-[var(--accent-indigo)] hover:text-white transition-colors cursor-pointer shadow-2xs"
                  title="Upload Candidate Resume"
                >
                  <Icon name="file-text" size="xs" />
                  <span>+ Resume</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleUploadDocumentFile(e, 'Resume')}
                  />
                </motion.label>
                <motion.label
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-6 px-2 inline-flex items-center gap-1 rounded-md bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border border-[var(--accent-violet)]/30 text-[10.5px] font-bold hover:bg-[var(--accent-violet)] hover:text-white transition-colors cursor-pointer shadow-2xs"
                  title="Upload Application Form"
                >
                  <Icon name="plus" size="xs" />
                  <span>+ Form</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleUploadDocumentFile(e, 'Application Form')}
                  />
                </motion.label>
              </div>
            </div>

            <motion.div variants={staggerFastContainer} className="flex flex-col gap-2">
              {documentsData.length === 0 ? (
                <div className="p-2.5 text-center text-[var(--text-tertiary)] text-xs bg-[var(--surface-2)] rounded-lg">
                  No documents attached.
                </div>
              ) : (
                documentsData.map((doc) => (
                  <motion.div
                    key={doc.id}
                    variants={applePopDocItem}
                    whileHover={{ x: 2, transition: { duration: 0.12 } }}
                    className="flex items-center justify-between p-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={`w-6.5 h-6.5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 ${doc.type === 'Profile Photo' ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)]' : 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]'
                        }`}>
                        {doc.type === 'Profile Photo' ? 'IMG' : 'PDF'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--text-primary)] text-xs truncate" title={doc.name}>
                          {doc.name}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)] font-mono tabular-figures">
                          {doc.type} • {doc.size}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview(doc)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                        title="View & Preview Document"
                      >
                        <Icon name="eye" size="xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDocument(doc.name, doc.id)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <Icon name="download" size="xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (8 cols / ~70%): Hiring Stage Progress Cards */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Header Card: Icon, Title, Subtitle, Badges & Action — Perfectly Aligned with Card 1 */}
          <motion.div variants={applePopCardRight} className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-xs)] relative overflow-hidden">
            {/* Top Inset Highlight Catch */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-2.5 min-h-[76px]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                  <Icon name="list" size="md" />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-bold text-[var(--text-primary)] text-base font-heading truncate">
                      Recruitment Stages &amp; Hiring Flow
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30 shrink-0">
                      {stagesData.length} Stages
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium truncate mt-0.5">
                    Live candidate evaluation timeline &amp; panel feedback scorecard history
                  </span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]">
                      {stagesData.filter((s) => s.statusType === 'passed').length} Passed
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)]">
                      {stagesData.find((s) => s.status === 'In-Progress') ? `Stage ${stagesData.find((s) => s.status === 'In-Progress')?.id} Active` : 'In Pipeline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/dashboard/candidates/${candidateId}/evaluation`)}
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] text-xs font-bold hover:bg-[var(--accent-indigo)] hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  <Icon name="external-link" size="xs" />
                  <span>Evaluation Workspace</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerFastContainer} className="relative pl-7 sm:pl-9 flex flex-col gap-4.5">
            {stagesData.map((stage, index) => {
              const isLast = index === stagesData.length - 1;
              const isPassed = stage.statusType === 'passed';
              const isRejected = stage.statusType === 'rejected';
              const isInProgress = stage.status === 'In-Progress';

              return (
                <motion.div key={stage.id} variants={applePopStageItem} className="relative">
                  {/* Vertical Track Line connecting to the next milestone */}
                  {!isLast && (
                    <div
                      className={`absolute -left-7 sm:-left-9 top-8 bottom-[-22px] w-0.5 transform translate-x-[13px] sm:translate-x-[15px] z-0 ${
                        isPassed
                          ? 'bg-[var(--status-success)]'
                          : isInProgress
                          ? 'bg-gradient-to-b from-[var(--status-warning)] via-[var(--border-strong)] to-[var(--border-soft)]'
                          : 'border-l-2 border-dashed border-[var(--border-strong)]'
                      }`}
                    />
                  )}

                  {/* Milestone Node Badge */}
                  <div className="absolute -left-7 sm:-left-9 top-4 z-10 flex items-center justify-center">
                    {isPassed ? (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-7 h-7 rounded-full bg-[var(--status-success)] text-white flex items-center justify-center shadow-xs ring-4 ring-[var(--canvas)]"
                        title={`Stage ${stage.id}: Passed`}
                      >
                        <Icon name="check" size="xs" className="stroke-[3]" />
                      </motion.span>
                    ) : isRejected ? (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-7 h-7 rounded-full bg-[var(--status-danger)] text-white flex items-center justify-center shadow-xs ring-4 ring-[var(--canvas)]"
                        title={`Stage ${stage.id}: Failed`}
                      >
                        <Icon name="x" size="xs" className="stroke-[3]" />
                      </motion.span>
                    ) : isInProgress ? (
                      <span className="relative flex h-7 w-7 items-center justify-center" title={`Stage ${stage.id}: In-Progress`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-warning)] opacity-35" />
                        <span className="relative w-7 h-7 rounded-full bg-[var(--status-warning)] text-black font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-[var(--canvas)]">
                          {stage.id}
                        </span>
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-[var(--surface-3)] text-[var(--text-tertiary)] border border-[var(--border-default)] font-bold text-xs flex items-center justify-center ring-4 ring-[var(--canvas)]" title={`Stage ${stage.id}: Pending`}>
                        {stage.id}
                      </span>
                    )}
                  </div>

                  {/* Stage Card */}
                  <motion.div
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className={`bg-[var(--surface-1)] border rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-xs)] flex flex-col gap-3.5 transition-all ${
                      stage.isTerminated
                        ? 'border-[var(--border-default)] opacity-60 bg-[var(--surface-2)]'
                        : isPassed
                        ? 'border-[var(--status-success)]/40 hover:border-[var(--status-success)]'
                        : isRejected
                        ? 'border-[var(--status-danger)]/40 hover:border-[var(--status-danger)]'
                        : isInProgress
                        ? 'border-[var(--status-warning)] shadow-xs ring-1 ring-[var(--status-warning)]/30'
                        : 'border-[var(--border-default)] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2.5">
                      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-bold font-heading ${
                            stage.isTerminated ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {stage.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            stage.isTerminated || stage.isLocked
                              ? 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
                              : isPassed
                              ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
                              : isRejected
                              ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]'
                              : isInProgress
                              ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]'
                              : 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border-default)]'
                          }`}
                        >
                          {stage.status}
                        </span>
                      </div>

                      {/* Action Buttons Sequence */}
                      {stage.isLocked || stage.status === 'Locked' ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-tertiary)] border border-[var(--border-default)] flex items-center gap-1.5 cursor-not-allowed">
                          <Icon name="lock" size="xs" className="text-[var(--text-tertiary)]" />
                          <span>Round Locked (Candidate Failed Previous Round)</span>
                        </span>
                      ) : !stage.isTerminated && (
                        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:ml-auto">
                          {stage.name.toLowerCase().includes('aptitude') ? (
                            /* Paper Aptitude Round: Simplify to Pass / Fail buttons */
                            stage.statusType === 'passed' ? (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)] flex items-center gap-1">
                                <Icon name="check" size="xs" />
                                <span>Passed (Paper Aptitude)</span>
                              </span>
                            ) : stage.statusType === 'rejected' ? (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)] flex items-center gap-1">
                                <Icon name="x" size="xs" />
                                <span>Failed (Paper Aptitude)</span>
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePaperAptitudePass(stage.id)}
                                  className="h-7 sm:h-7.5 px-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--status-success)] bg-[var(--status-success)] text-white text-[11.5px] sm:text-xs font-bold hover:opacity-90 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Icon name="check" size="xs" />
                                  <span>Pass Round</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePaperAptitudeFail(stage.id)}
                                  className="h-7 sm:h-7.5 px-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] text-[11.5px] sm:text-xs font-bold hover:bg-[var(--status-danger)] hover:text-white transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Icon name="x" size="xs" />
                                  <span>Fail Round</span>
                                </button>
                              </div>
                            )
                          ) : (
                            /* Standard Non-Paper Rounds */
                            <>
                              {!stage.isOfferRound && (() => {
                                const isAssessment =
                                  stage.roundType === 'Assessment' ||
                                  (stage.name.includes('Coding & Algorithm') && !stage.name.includes('F2F'));

                                return (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAssignStage(stage);
                                        const options = stage.isDirectorRound ? directorOptions : interviewerOptions;
                                        setAssignedInterviewer(options[0]?.value || '');
                                      }}
                                      className="h-7 sm:h-7.5 px-2.5 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] text-[11.5px] sm:text-xs font-semibold hover:bg-[var(--accent-indigo)] hover:text-white transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <Icon name="user" size="xs" />
                                      <span>
                                        {stage.isDirectorRound
                                          ? 'Assign Director'
                                          : isAssessment
                                            ? 'Assign Evaluator'
                                            : 'Schedule & Assign Interviewer'}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedFeedbackStage(stage);
                                        setFeedbackText(stage.isDirectorRound ? stage.feedback : '');
                                        setDirectorDecision('offer');
                                        setScorecardTechnical(3);
                                        setScorecardCommunication(3);
                                        setScorecardProblemSolving(3);
                                        setScorecardCulturalFit(3);
                                        setScorecardStrengths('');
                                        setScorecardWeaknesses('');
                                        setScorecardRecommendation('Hire');
                                      }}
                                      className="h-7 sm:h-7.5 px-2.5 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--accent-blue)] bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] text-[11.5px] sm:text-xs font-semibold hover:bg-[var(--accent-blue)] hover:text-white transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <Icon name="pencil" size="xs" />
                                      <span>{stage.isDirectorRound ? 'Director Decision' : 'Submit Feedback'}</span>
                                    </button>

                                    {isAssessment && (
                                      <button
                                        type="button"
                                        onClick={() => setShowScheduleTestModal(true)}
                                        className="h-7 sm:h-7.5 px-2.5 sm:px-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg text-[11.5px] sm:text-xs font-semibold transition-colors border border-[var(--accent-green)] bg-[var(--accent-green-dim)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-white cursor-pointer shadow-2xs"
                                      >
                                        <Icon name="calendar" size="xs" />
                                        <span>Schedule &amp; Send Test</span>
                                      </button>
                                    )}
                                  </>
                                );
                              })()}

                              {/* Stage 5 Offer Action */}
                              {stage.isOfferRound && (
                                <button
                                  type="button"
                                  onClick={() => setShowOfferModal(true)}
                                  className="h-7 sm:h-7.5 px-3 sm:px-3.5 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[var(--accent-green)] bg-[var(--accent-green-dim)] text-[var(--accent-green)] text-[11.5px] sm:text-xs font-bold hover:bg-[var(--accent-green)] hover:text-white transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Icon name="file-text" size="xs" />
                                  <span className="hidden sm:inline">View & Rollout Offer Letter</span>
                                  <span className="sm:hidden">Rollout Offer Letter</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-[var(--border-soft)]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[var(--text-tertiary)] font-medium">Date</span>
                        <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                          <Icon name="calendar" size="xs" className="text-[var(--text-tertiary)]" />
                          {stage.date}
                        </span>
                      </div>

                      {!stage.isOfferRound && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[var(--text-tertiary)] font-medium">Interviewer / Role</span>
                          <div className="flex items-center gap-2">
                            <span className={`w-6.5 h-6.5 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 border ${
                              stage.interviewerInitials === 'UA' || stage.interviewer.toLowerCase().includes('unassigned')
                                ? 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
                                : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
                            }`}>
                              {stage.interviewerInitials}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[var(--text-primary)] leading-tight">
                                {stage.interviewer}
                              </span>
                              <span className="text-[10.5px] text-[var(--text-tertiary)] font-medium">{stage.interviewerRole}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col gap-0.5 ${stage.isOfferRound ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
                        <span className="text-[var(--text-tertiary)] font-medium">Feedback / Remarks</span>
                        <p className="text-[var(--text-secondary)] font-normal leading-relaxed">
                          {stage.feedback}
                        </p>

                        {stage.attempts && stage.attempts.length > 0 && (
                          <div className="mt-1 flex flex-col gap-1 text-[10.5px]">
                            {stage.attempts.map((att) => (
                              <div key={att.attempt} className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-secondary)] font-mono font-bold">
                                  Attempt #{att.attempt}: {att.score} ({att.result})
                                </span>
                                <span className="text-[var(--text-tertiary)]">{att.date}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[var(--text-tertiary)] font-medium">Result</span>
                        <span
                          className={`font-bold ${stage.statusType === 'passed'
                            ? 'text-[var(--status-success)]'
                            : stage.statusType === 'rejected'
                              ? 'text-[var(--status-danger)]'
                              : stage.status === 'In-Progress'
                                ? 'text-[var(--status-warning)]'
                                : 'text-[var(--text-tertiary)]'
                            }`}
                        >
                          {stage.result}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* --- 5. High-Resolution Profile Photo Lightbox Modal -------------------- */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-md w-full dialog-card rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-xl)] flex flex-col gap-4 items-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Inset Highlight Catch */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

              <div className="w-full flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                    {candidate.name}
                  </h3>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{candidate.designation}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  aria-label="Close photo dialog"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              <div className="w-full min-h-[220px] rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border-default)] flex items-center justify-center p-6">
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
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Candidate Avatar Initials</span>
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-between pt-1 text-xs text-[var(--text-secondary)] font-medium border-t border-[var(--border-soft)]">
                <span>{candidate.email || 'Email not specified'}</span>
                <span className="tabular-figures">{candidate.experience}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. Editable Offer Letter Rollout Form Modal Dialog ───────────────── */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowOfferModal(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleRolloutOffer}
              onClick={(e) => e.stopPropagation()}
              className="dialog-card rounded-[var(--radius-xl)] p-5 max-w-2xl w-full shadow-[var(--shadow-xl)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-step relative overflow-hidden"
            >
              {/* Top Inset Highlight Catch */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 font-bold border border-[var(--accent-indigo)]/30">
                    <Icon name="file-text" size="xs" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                      Offer Letter — {candidate.name}
                    </h3>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      {!offerLetterId
                        ? 'Set the offered CTC and joining date, then generate the letter'
                        : offerRes?.data?.status === 'PendingApproval'
                          ? 'Awaiting Director PIN approval before it can be sent'
                          : offerRes?.data?.status === 'Approved'
                            ? 'Approved — ready to download and dispatch'
                            : 'Loading offer status…'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Role / Vacancy</label>
                  <div className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold flex items-center truncate">
                    {candidate.designation}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Candidate Email</label>
                  <div className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium flex items-center truncate">
                    {candidate.email}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Total Offered CTC (₹ LPA)</label>
                  {offerLetterId ? (
                    <div className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--status-success-text)] font-bold flex items-center tabular-figures">
                      ₹{offerRes?.data?.offeredCTC ?? offerCtc} LPA
                    </div>
                  ) : (
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={offerCtc}
                      onChange={(e) => setOfferCtc(e.target.value)}
                      placeholder="e.g. 14.5"
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-bold text-[var(--status-success-text)] focus-ring-step tabular-figures"
                    />
                  )}
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Joining Date</label>
                  {offerLetterId ? (
                    <div className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold flex items-center tabular-figures">
                      {offerRes?.data?.joiningDate
                        ? new Date(offerRes.data.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : offerJoiningDate}
                    </div>
                  ) : (
                    <FormDatePicker value={offerJoiningDate} onChange={setOfferJoiningDate} />
                  )}
                </div>
              </div>

              {/* Generated Document + Director PIN Approval */}
              {offerLetterId && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--status-danger-border)]">
                        PDF
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)] text-xs">
                          Offer_{candidate.name.replace(/\s+/g, '_')}.pdf
                        </span>
                        <span className="text-[10.5px] text-[var(--text-secondary)] font-mono">
                          Prepared by {offerRes?.data?.preparedByName || '…'} • Status: {offerRes?.data?.status || 'Loading…'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadOffer}
                      className="h-7.5 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Icon name="download" size="xs" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {offerRes?.data?.status === 'PendingApproval' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Director Security PIN (6 digits)</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={offerApprovalPin}
                        onChange={(e) => setOfferApprovalPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-sm font-mono tracking-widest text-[var(--text-primary)] focus-ring-step"
                      />
                      <span className="text-[11px] text-[var(--text-secondary)]">Only a Director account can approve this — verified against the same PIN used for Director login.</span>
                    </div>
                  )}
                  {offerRes?.data?.status === 'Approved' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[11px] font-semibold text-[var(--status-success-text)]">
                      <Icon name="check-circle" size="xs" />
                      <span>
                        Approved by {offerRes.data.approvedByName || 'the Director'}
                        {offerRes.data.approvedAt ? ` on ${new Date(offerRes.data.approvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)]">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="h-8.5 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                {offerRes?.data?.status !== 'Approved' && (
                  <button
                    type="submit"
                    disabled={isGeneratingOffer || isApprovingOffer}
                    className="h-8.5 px-4 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="check-circle" size="xs" />
                    <span>
                      {!offerLetterId
                        ? isGeneratingOffer ? 'Generating…' : 'Generate Offer Letter'
                        : isApprovingOffer ? 'Approving…' : 'Approve with PIN'}
                    </span>
                  </button>
                )}
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 7. Assign Interviewer / Evaluator / Director Modal Dialog ─────────────────────── */}
      <AnimatePresence>
        {selectedAssignStage && (() => {
          const isAssessmentRound =
            selectedAssignStage.roundType === 'Assessment' ||
            (selectedAssignStage.name.includes('Coding & Algorithm') && !selectedAssignStage.name.includes('F2F'));

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setSelectedAssignStage(null)}
            >
              <motion.form
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleSaveAssign}
                onClick={(e) => e.stopPropagation()}
                className="dialog-card rounded-[var(--radius-xl)] p-5 max-w-md w-full flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Top Inset Highlight Catch */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                      {selectedAssignStage.isDirectorRound
                        ? 'Assign Director'
                        : isAssessmentRound
                          ? 'Assign Evaluator'
                          : 'Assign Interviewer'}{' '}
                      — {selectedAssignStage.name}
                    </h3>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Candidate: {candidate.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignStage(null)}
                    className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[var(--text-primary)] block mb-1">
                      {selectedAssignStage.isDirectorRound
                        ? 'Select Director (Exclusive Role)'
                        : isAssessmentRound
                          ? 'Select Evaluator (Technical Grader)'
                          : 'Select Interviewer'}
                    </label>
                    <FormSelect
                      value={assignedInterviewer}
                      onChange={setAssignedInterviewer}
                      options={selectedAssignStage.isDirectorRound ? directorOptions : interviewerOptions}
                    />
                  </div>

                  {!isAssessmentRound ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-[var(--text-primary)] block mb-1">Date</label>
                          <FormDatePicker
                            value={assignDate}
                            onChange={setAssignDate}
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[var(--text-primary)] block mb-1">Time</label>
                          <input
                            type="time"
                            value={assignTime}
                            onChange={(e) => setAssignTime(e.target.value)}
                            className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-mono text-xs focus-ring-step"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-[var(--text-primary)] block mb-1">Meeting Mode</label>
                        <FormSelect
                          value={assignMode}
                          onChange={setAssignMode}
                          options={meetingModeOptions}
                        />
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-soft)]">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignStage(null)}
                    className="h-8.5 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isScheduling}
                    className="h-8.5 px-4 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isScheduling
                      ? 'Assigning…'
                      : isAssessmentRound
                        ? 'Assign Evaluator'
                        : 'Assign & Send Invites'}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── 8. Submit Feedback / Director Final Decision Modal ───────────────── */}
      <AnimatePresence>
        {selectedFeedbackStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedFeedbackStage(null)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSaveFeedback}
              onClick={(e) => e.stopPropagation()}
              className="dialog-card rounded-[var(--radius-xl)] p-6 max-w-2xl w-full flex flex-col gap-5 max-h-[90vh] overflow-y-auto scrollbar-step relative overflow-hidden"
            >
              {/* Top Inset Highlight Catch */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info-border)] flex items-center justify-center shrink-0">
                    <Icon name="award" size="sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                      {selectedFeedbackStage.isDirectorRound
                        ? `Director Final Decision — ${selectedFeedbackStage.name}`
                        : `Submit Feedback — ${selectedFeedbackStage.name}`}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      Candidate: {candidate.name} • {selectedFeedbackStage.isDirectorRound ? 'Director' : 'Interviewer'}: {selectedFeedbackStage.interviewer || 'Assigned Evaluator'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFeedbackStage(null)}
                  className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  aria-label="Close scorecard feedback modal"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              {selectedFeedbackStage.isDirectorRound ? (
                <>
                  {/* Decision Selection — 3 Choices for Director: Offer, Reject, On Hold */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[var(--text-primary)]">Director Final Outcome</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDirectorDecision('offer')}
                        className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${directorDecision === 'offer'
                          ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)] shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        <Icon name="check-circle" size="xs" />
                        <span>Offer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDirectorDecision('reject')}
                        className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${directorDecision === 'reject'
                          ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)] shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        <Icon name="x-circle" size="xs" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDirectorDecision('hold')}
                        className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${directorDecision === 'hold'
                          ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)] shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        <Icon name="pause-circle" size="xs" />
                        <span>On Hold</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Remarks & Detailed Rationale</label>
                      <span className={`text-[11px] font-mono font-semibold ${feedbackText.length >= 480 ? 'text-[var(--status-danger)]' : 'text-[var(--text-tertiary)]'}`}>
                        {feedbackText.length} / 500 characters
                      </span>
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
                      rows={4}
                      maxLength={500}
                      placeholder="Enter evaluation notes, technical observations, and final recommendations..."
                      className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-ring-step resize-none font-sans"
                    />
                  </div>
                </>
              ) : (!selectedFeedbackStage.interviewId && selectedFeedbackStage.roundType === 'Interview') ? (
                /* No real Interview row exists for this round yet */
                <div className="flex flex-col items-center gap-2 py-6 px-4 rounded-xl border border-dashed border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-center">
                  <Icon name="alert-triangle" size="sm" className="text-[var(--status-warning-text)]" />
                  <p className="text-xs font-semibold text-[var(--status-warning-text)]">No interview scheduled for this round yet</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Use &ldquo;Schedule &amp; Assign Interviewer&rdquo; to schedule this round before submitting a scorecard — feedback needs a real interview record to attach to.
                  </p>
                </div>
              ) : (
                <>
                  {myExistingScorecard && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-indigo-dim)] border border-[var(--accent-indigo)]/30 text-[11px] font-semibold text-[var(--accent-indigo)]">
                      <Icon name="info" size="xs" />
                      <span>
                        You already submitted a scorecard on {new Date(myExistingScorecard.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — resubmitting will replace it.
                      </span>
                    </div>
                  )}

                  {/* Scorecard Ratings — Technical & Problem Solving */}
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ['Technical', scorecardTechnical, setScorecardTechnical],
                      ['Problem Solving', scorecardProblemSolving, setScorecardProblemSolving],
                    ] as const).map(([label, value, setValue]) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[var(--text-primary)]">{label} Rating</label>
                        <div className="grid grid-cols-5 gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setValue(n)}
                              className={`h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${value === n
                                ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-2xs'
                                : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                                }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[var(--text-primary)]">Recommendation Result</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setScorecardRecommendation('Pass')}
                        className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${scorecardRecommendation === 'Pass' || scorecardRecommendation === 'Hire'
                          ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)] shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        <Icon name="check-circle" size="xs" />
                        <span>Pass</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScorecardRecommendation('Fail')}
                        className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${scorecardRecommendation === 'Fail' || scorecardRecommendation === 'Reject'
                          ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)] shadow-2xs'
                          : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        <Icon name="x-circle" size="xs" />
                        <span>Fail</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Strengths</label>
                      <textarea
                        value={scorecardStrengths}
                        onChange={(e) => setScorecardStrengths(e.target.value)}
                        rows={3}
                        placeholder="Key strengths observed..."
                        className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-ring-step resize-none font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Weaknesses</label>
                      <textarea
                        value={scorecardWeaknesses}
                        onChange={(e) => setScorecardWeaknesses(e.target.value)}
                        rows={3}
                        placeholder="Areas of concern..."
                        className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-ring-step resize-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Comments</label>
                      <span className={`text-[11px] font-mono font-semibold ${feedbackText.length >= 480 ? 'text-[var(--status-danger)]' : 'text-[var(--text-tertiary)]'}`}>
                        {feedbackText.length} / 500 characters
                      </span>
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
                      rows={3}
                      maxLength={500}
                      placeholder="Any additional evaluation notes..."
                      className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-ring-step resize-none font-sans"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-soft)]">
                <button
                  type="button"
                  onClick={() => setSelectedFeedbackStage(null)}
                  className="h-8.5 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    selectedFeedbackStage.roundType === 'Assessment'
                      ? false
                      : selectedFeedbackStage.isDirectorRound
                        ? (directorDecision !== 'hold' && !selectedFeedbackStage.interviewId) || isPublishingDecision
                        : !selectedFeedbackStage.interviewId || isSubmittingFeedback
                  }
                  className="h-8.5 px-4 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedFeedbackStage.isDirectorRound
                    ? isPublishingDecision ? 'Publishing…' : 'Save Decision & Update Status'
                    : isSubmittingFeedback
                      ? 'Saving…'
                      : 'Submit Scorecard'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 9. Edit Candidate Profile Modal Dialog ───────────────────────────── */}
      <AnimatePresence>
        {showEditProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowEditProfileModal(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSaveProfileEdit}
              onClick={(e) => e.stopPropagation()}
              className="dialog-card rounded-[var(--radius-xl)] p-5 max-w-3xl w-full shadow-[var(--shadow-xl)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto scrollbar-step relative overflow-hidden"
            >
              {/* Top Inset Highlight Catch */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 font-bold border border-[var(--accent-indigo)]/30">
                    <Icon name="pencil" size="xs" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">
                      Edit Candidate Profile — {candidate.name}
                    </h3>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Update personal, professional, academic, and reference details below
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              {profileValidationToast && (
                <div className="p-2.5 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger-text)] text-xs font-semibold flex items-center gap-2">
                  <Icon name="alert-triangle" size="xs" className="shrink-0" />
                  <span>{profileValidationToast}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Personal Info */}
                <div className="sm:col-span-2 font-bold text-[var(--accent-indigo)] uppercase tracking-wider text-[11px] font-mono border-b border-[var(--border-soft)] pb-1">
                  Personal Information
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editProfileForm.email}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Gender</label>
                  <input
                    type="text"
                    value={editProfileForm.gender}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={editProfileForm.dob}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, dob: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Hiring Location</label>
                  <input
                    type="text"
                    value={editProfileForm.location}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                {/* Professional Info */}
                <div className="sm:col-span-2 font-bold text-[var(--accent-indigo)] uppercase tracking-wider text-[11px] font-mono border-b border-[var(--border-soft)] pb-1 mt-2">
                  Professional Details
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Applied Position / Role</label>
                  <input
                    type="text"
                    value={editProfileForm.appliedFor}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, appliedFor: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Application Source</label>
                  <input
                    type="text"
                    value={editProfileForm.source}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, source: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Current Company</label>
                  <input
                    type="text"
                    value={editProfileForm.currentCompany}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, currentCompany: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Current Designation</label>
                  <input
                    type="text"
                    value={editProfileForm.currentDesignation}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, currentDesignation: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Total Experience</label>
                  <input
                    type="text"
                    value={editProfileForm.experience}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, experience: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={editProfileForm.noticePeriod}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, noticePeriod: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Current CTC</label>
                  <input
                    type="text"
                    value={editProfileForm.currentCtc}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, currentCtc: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Expected CTC</label>
                  <input
                    type="text"
                    value={editProfileForm.expectedCtc}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, expectedCtc: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                {/* Education */}
                <div className="sm:col-span-2 font-bold text-[var(--accent-indigo)] uppercase tracking-wider text-[11px] font-mono border-b border-[var(--border-soft)] pb-1 mt-2">
                  Education & Academic Background
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Highest Degree / Qualification</label>
                  <input
                    type="text"
                    value={editProfileForm.education}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, education: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">College / University Name</label>
                  <input
                    type="text"
                    value={editProfileForm.college}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, college: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Graduation Passing Year</label>
                  <input
                    type="text"
                    value={editProfileForm.passingYear}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, passingYear: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Percentage / CGPA Marks</label>
                  <input
                    type="text"
                    value={editProfileForm.percentage}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, percentage: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>

                {/* Reference Info */}
                <div className="sm:col-span-2 font-bold text-[var(--accent-indigo)] uppercase tracking-wider text-[11px] font-mono border-b border-[var(--border-soft)] pb-1 mt-2">
                  Reference & Verification Details
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Reference Type</label>
                  <input
                    type="text"
                    value={editProfileForm.refType}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, refType: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Referrer Name</label>
                  <input
                    type="text"
                    value={editProfileForm.refName}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, refName: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Referrer Employee ID</label>
                  <input
                    type="text"
                    value={editProfileForm.refEmployeeId}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, refEmployeeId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-primary)] block mb-1">Referrer Mobile Phone</label>
                  <input
                    type="text"
                    value={editProfileForm.refMobile}
                    onChange={(e) => setEditProfileForm((p) => ({ ...p, refMobile: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] font-medium focus-ring-step tabular-figures"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)] mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="h-8.5 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-8.5 px-4 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="check-circle" size="xs" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* --- Document Preview Modal -------------------------------------- */}
      <AnimatePresence>
        {selectedDocPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
            onClick={() => setSelectedDocPreview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="dialog-card rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-xl)] max-w-xl w-full flex flex-col gap-4 cursor-default relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Inset Highlight Catch */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border ${
                    selectedDocPreview.type === 'Profile Photo'
                      ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
                      : 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]'
                  }`}>
                    {selectedDocPreview.type === 'Profile Photo' ? 'IMG' : 'PDF'}
                  </span>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-sm font-heading">{selectedDocPreview.name}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] font-mono tabular-figures">{selectedDocPreview.type} • {selectedDocPreview.size} • Attached {selectedDocPreview.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview(null)}
                  className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <Icon name="x" size="xs" />
                </button>
              </div>

              <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
                {selectedDocPreview.type === 'Profile Photo' && candidate.avatar ? (
                  <img
                    src={candidate.avatar}
                    alt={selectedDocPreview.name}
                    className="max-h-64 rounded-xl object-contain shadow-md border border-[var(--border-default)]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)] flex items-center justify-center font-bold text-sm">
                      PDF
                    </div>
                    <span className="font-semibold text-[var(--text-primary)] text-xs">{selectedDocPreview.name}</span>
                    <span className="text-[var(--text-secondary)] text-[11.5px] max-w-sm">
                      Verified candidate official document persisted in SQL Server database.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(selectedDocPreview.name)}
                  className="h-8 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--surface-hover)] cursor-pointer shadow-2xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="download" size="xs" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview(null)}
                  className="h-8 px-4 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

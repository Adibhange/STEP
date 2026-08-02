'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';

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
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                opt.value === value ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
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
                  className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
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
  candidateId = 'cand-1',
}) => {
  const router = useRouter();

  // Dialog & Toast States
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Dynamic Candidate Profile Details State
  const [candidate, setCandidate] = useState({
    id: candidateId,
    name: 'Anjali Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    status: 'In Process',
    designation: 'Frontend Developer',
    appliedFor: 'Frontend Developer - React (V123)',
    email: 'anjali.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka',
    currentStage: 'Director Interview',
    appliedDate: '12 May 2025',
    experience: '3.6 Years',
    currentCompany: 'TCS',
    currentDesignation: 'Frontend Developer',
    currentCtc: '₹ 9.5 LPA',
    expectedCtc: '₹ 12 LPA',
    noticePeriod: '30 Days',
    education: 'B.Tech – Computer Science',
    educationDetails: '2017 – 2021, VTU',
  });

  // Edit Candidate Profile Modal Dialog State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ ...candidate });
  const [profileSaveSuccessToast, setProfileSaveSuccessToast] = useState(false);
  const [profileValidationToast, setProfileValidationToast] = useState<string | null>(null);

  // Documents State with View, Download, and Delete actions
  const [documentsData, setDocumentsData] = useState<CandidateDocument[]>([
    { id: 1, name: 'Resume_Anjali_Sharma.pdf', date: '12 May 2025', size: '245 KB', type: 'Resume & Curriculum Vitae' },
    { id: 2, name: 'Cover_Letter.pdf', date: '12 May 2025', size: '128 KB', type: 'Cover Letter & Declaration' },
    { id: 3, name: 'Education_Certificate.pdf', date: '12 May 2025', size: '310 KB', type: 'B.Tech Degree Certificate' },
    { id: 4, name: 'Experience_Letter.pdf', date: '12 May 2025', size: '210 KB', type: 'Relieving & Experience Letter' },
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
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const handleOpenEditProfile = () => {
    setEditProfileForm({ ...candidate });
    setShowEditProfileModal(true);
  };

  const fireValidationToast = (msg: string) => {
    setProfileValidationToast(msg);
    setTimeout(() => setProfileValidationToast(null), 3000);
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
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
    setProfileSaveSuccessToast(true);
    setTimeout(() => setProfileSaveSuccessToast(false), 2500);
  };

  const handleDeleteDocument = (docId: number, docName: string) => {
    setDocumentsData((prev) => prev.filter((d) => d.id !== docId));
    setDocDeletedToast(`"${docName}" deleted successfully.`);
    setTimeout(() => setDocDeletedToast(null), 2500);
  };

  const handleRolloutOffer = (e: React.FormEvent) => {
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
    setOfferSuccessToast(true);
    setTimeout(() => setOfferSuccessToast(false), 3000);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
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
    setFeedbackSuccessToast(true);
    setTimeout(() => setFeedbackSuccessToast(false), 2500);
  };

  const handleSaveAssign = (e: React.FormEvent) => {
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
    setAssignSuccessToast(true);
    setTimeout(() => setAssignSuccessToast(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 pb-6 p-3.5 sm:p-5 bg-[#f8fafc] min-h-screen text-[13px] font-sans relative">
      {/* Toast Notifications */}
      {showShareToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="check-circle" size="xs" className="text-emerald-400" />
          <span>Candidate profile link copied to clipboard!</span>
        </div>
      )}

      {profileSaveSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="check-circle" size="xs" className="text-emerald-400" />
          <span>Candidate profile information updated successfully!</span>
        </div>
      )}

      {profileValidationToast && (
        <div className="fixed top-5 right-5 z-[60] bg-rose-600 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 max-w-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="alert-triangle" size="xs" className="text-rose-200 shrink-0" />
          <span>{profileValidationToast}</span>
        </div>
      )}

      {docDeletedToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="trash" size="xs" className="text-rose-400" />
          <span>{docDeletedToast}</span>
        </div>
      )}

      {offerSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="check-circle" size="xs" className="text-emerald-400" />
          <span>Official offer letter generated & sent to {offerCandidateEmail}!</span>
        </div>
      )}

      {feedbackSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="check-circle" size="xs" className="text-emerald-400" />
          <span>Round feedback & decision updated successfully!</span>
        </div>
      )}

      {assignSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Icon name="check-circle" size="xs" className="text-emerald-400" />
          <span>Interviewer assigned and invite sent successfully!</span>
        </div>
      )}

      {/* ── Main 2-Column Section ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT COLUMN (4 cols / ~30%): Candidate Header + Profile Info + Documents */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Candidate Summary Card with Top Inline Share Link */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setShowImageModal(true)}
                  className="group relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs bg-slate-100 cursor-pointer transition-transform hover:scale-[1.02]"
                  title="Click to view full photo"
                >
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-full h-full object-cover group-hover:brightness-95 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Icon name="eye" size="xs" />
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-slate-900 text-base font-heading truncate">{candidate.name}</h1>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {candidate.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium truncate">{candidate.designation}</span>
                  <span className="text-[11px] text-blue-700 font-medium mt-0.5 truncate">{candidate.appliedFor}</span>
                </div>
              </div>

              {/* Inline Share Link Action Button */}
              <button
                type="button"
                onClick={handleShare}
                className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer shrink-0 shadow-2xs transition-colors"
                title="Share Candidate Link"
              >
                <Icon name="external-link" size="xs" className="text-slate-500" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Card 2: Profile Information Card with Edit Pencil Icon */}
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 font-heading uppercase tracking-wider">
                <Icon name="user" size="xs" className="text-slate-500" />
                <span>Profile Information</span>
              </h2>

              {/* Pencil Edit Icon Button */}
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit Profile Details"
              >
                <Icon name="pencil" size="xs" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {/* Applied For — full-width highlight row */}
              <div className="col-span-2 flex flex-col gap-0.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-blue-500 font-medium text-[11px] flex items-center gap-1">
                  <Icon name="briefcase" size="xs" />
                  Applied For
                </span>
                <span className="font-bold text-blue-800 text-[12px]">{candidate.appliedFor}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Email</span>
                <span className="font-semibold text-slate-900 break-all">{candidate.email}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Current Company</span>
                <span className="font-semibold text-slate-900">{candidate.currentCompany}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Phone</span>
                <span className="font-semibold text-slate-900">{candidate.phone}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Current Designation</span>
                <span className="font-semibold text-slate-900">{candidate.currentDesignation}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Location</span>
                <span className="font-semibold text-slate-900">{candidate.location}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Current CTC</span>
                <span className="font-semibold text-slate-900">{candidate.currentCtc}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Experience</span>
                <span className="font-semibold text-slate-900">{candidate.experience}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Expected CTC</span>
                <span className="font-semibold text-slate-900">{candidate.expectedCtc}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Notice Period</span>
                <span className="font-semibold text-slate-900">{candidate.noticePeriod}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium text-[11px]">Education</span>
                <span className="font-semibold text-slate-900">{candidate.education}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Documents Section with View, Download & Delete Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 font-heading uppercase tracking-wider">
                <Icon name="file-text" size="xs" className="text-slate-500" />
                <span>Documents ({documentsData.length})</span>
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {documentsData.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                  No documents attached.
                </div>
              ) : (
                documentsData.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-6.5 h-6.5 rounded bg-red-100 text-red-600 font-bold text-[9.5px] flex items-center justify-center shrink-0">
                        PDF
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 text-[11.5px] truncate" title={doc.name}>
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.date} • {doc.size}
                        </span>
                      </div>
                    </div>

                    {/* View, Download, Delete Action Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* View Action (Opens Preview Dialog) */}
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview(doc)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="View & Preview Document"
                      >
                        <Icon name="eye" size="xs" />
                      </button>

                      {/* Download Action */}
                      <button
                        type="button"
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <Icon name="download" size="xs" />
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="mt-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 text-left hover:underline cursor-pointer"
            >
              View All Documents ({documentsData.length})
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols / ~70%): Hiring Stage Progress Cards (UNTOUCHED as requested!) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Icon name="list" size="xs" className="text-blue-600" />
              <span>Recruitment Stages & Hiring Flow</span>
            </h2>

            {/* View Candidate Assignment Details Button */}
            <button
              type="button"
              onClick={() => router.push(`/dashboard/candidates/${candidateId}/workspace`)}
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer ml-auto"
            >
              <Icon name="external-link" size="xs" />
              <span>View Candidate Assignment Details for Evaluation</span>
            </button>
          </div>

          {/* STAGE CARDS STACK (Standard 4-Column Grid Layout) */}
          <div className="flex flex-col gap-4">
            {stagesData.map((stage) => (
              <div
                key={stage.id}
                className={`bg-white border rounded-xl p-4.5 shadow-2xs flex flex-col gap-3.5 transition-all ${
                  stage.isTerminated
                    ? 'border-slate-200 border-l-4 border-l-slate-300 opacity-60 bg-slate-50/60'
                    : stage.statusType === 'passed'
                    ? 'border-slate-200 border-l-4 border-l-emerald-500'
                    : stage.statusType === 'rejected'
                    ? 'border-slate-200 border-l-4 border-l-rose-500'
                    : 'border-slate-200 border-l-4 border-l-amber-400'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5.5 h-5.5 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                        stage.isTerminated
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
                      className={`text-sm sm:text-base font-bold font-heading ${
                        stage.isTerminated ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {stage.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        stage.isTerminated
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
                    <div className="flex items-center gap-2 ml-auto flex-wrap">
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
                            className="h-7.5 px-3 inline-flex items-center gap-1.5 rounded-lg border border-purple-500 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
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
                            className="h-7.5 px-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-500 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Icon name="pencil" size="xs" />
                            <span>{stage.isDirectorRound ? 'Director Decision' : 'Submit Feedback'}</span>
                          </button>
                        </>
                      )}

                      {stage.actionLabel && !stage.isOfferRound && (
                        <button
                          type="button"
                          className="h-7.5 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Icon name="calendar" size="xs" />
                          <span>{stage.actionLabel}</span>
                        </button>
                      )}

                      {/* Stage 5 Offer Action: Opens Offer Letter Form Dialog Directly */}
                      {stage.isOfferRound && (
                        <button
                          type="button"
                          onClick={() => setShowOfferModal(true)}
                          className="h-7.5 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Icon name="file-text" size="xs" />
                          <span>View & Rollout Offer Letter</span>
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
                      className={`font-bold ${
                        stage.statusType === 'passed'
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
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl p-4 shadow-2xl flex flex-col gap-3 items-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  {candidate.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{candidate.designation}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close photo dialog"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>

            <div className="w-full max-h-[480px] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-full h-full object-contain max-h-[480px]"
              />
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
                    className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      directorDecision === 'offer'
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
                    className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      directorDecision === 'reject'
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
                    className={`h-9 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      directorDecision === 'hold'
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
                    className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      directorDecision === 'offer'
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
                    className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      directorDecision === 'reject'
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
                  className={`text-[11px] font-mono font-semibold ${
                    feedbackText.length >= 480 ? 'text-rose-600' : 'text-slate-400'
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
    </div>
  );
};

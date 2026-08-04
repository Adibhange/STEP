'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Icon, CustomSelect, type SelectOption } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { useRegisterCandidateMutation } from '@/store/services/api';
import type { DashboardCandidate } from '../../mock/candidate.mock';

interface ManualEntryFormProps {
  onSuccess: (candidate: Partial<DashboardCandidate>, addAnother?: boolean) => void;
  onCancel: () => void;
  uiVariant?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5';
}

// ── Inlined STEP Custom Date Picker ──────────────────────────────────────────

interface InlineDatePickerProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const InlineDatePicker: React.FC<InlineDatePickerProps> = ({
  placeholder = 'Select date of birth...',
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ day: dayNum, isCurrentMonth: false, dateStr });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: true, dateStr });
    }

    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const displayFormattedDate = (dStr: string) => {
    if (!dStr) return placeholder;
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  return (
    <div className={`relative w-full ${open ? 'z-40' : 'z-10'}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-10 px-3.5 rounded-lg border flex items-center justify-between text-[13px] bg-[var(--surface-1)] transition-all cursor-pointer select-none ${
          open
            ? 'border-[var(--accent-indigo)] ring-2 ring-[var(--accent-indigo-dim)] shadow-xs'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
        }`}
      >
        <span className={`truncate ${value ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}`}>
          {displayFormattedDate(value)}
        </span>
        <Icon name="calendar" size="xs" className="text-[var(--text-tertiary)] shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1.5 w-[230px] p-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] shadow-[var(--shadow-xl)] z-50 animate-fadeIn select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-soft)] mb-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              <Icon name="chevron-left" size="xs" />
            </button>

            <span className="text-[11.5px] font-bold text-[var(--text-primary)] font-heading">
              {monthName} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[9.5px] font-bold text-[var(--text-tertiary)]">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {calendarDays.map((dObj, idx) => {
              const isSelected = value === dObj.dateStr;
              const isToday = todayStr === dObj.dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(dObj.dateStr);
                    setOpen(false);
                  }}
                  className={`h-6 text-[10.5px] font-medium rounded transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent-indigo)] text-white font-bold'
                      : isToday
                      ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold'
                      : dObj.isCurrentMonth
                      ? 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      : 'text-[var(--text-tertiary)] opacity-30 hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {dObj.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Searchable Select Options ────────────────────────────────────────────────

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'Senior Full Stack Engineer', label: 'Senior Full Stack Engineer' },
  { value: 'Backend Engineer (.NET)', label: 'Backend Engineer (.NET)' },
  { value: 'Frontend Engineer (React/Next)', label: 'Frontend Engineer (React/Next)' },
  { value: 'DevOps Architect', label: 'DevOps Architect' },
  { value: 'QA Automation Engineer', label: 'QA Automation Engineer' },
  { value: 'Data Engineer', label: 'Data Engineer' },
  { value: 'UI/UX Designer', label: 'UI/UX Designer' },
  { value: 'Product Manager', label: 'Product Manager' },
  { value: 'System Administrator', label: 'System Administrator' },
];

const EXPERIENCE_OPTIONS: SelectOption[] = [
  { value: '1 - 2 Years', label: '1 - 2 Years' },
  { value: '2 - 4 Years', label: '2 - 4 Years' },
  { value: '4 - 6 Years', label: '4 - 6 Years' },
  { value: '6 - 8 Years', label: '6 - 8 Years' },
  { value: '8+ Years', label: '8+ Years' },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: 'Walk-in', label: 'Walk-in / On-site Scan' },
  { value: 'QR Scan', label: 'QR Scanner Portal' },
  { value: 'Referral', label: 'Employee Referral' },
  { value: 'LinkedIn', label: 'LinkedIn Jobs' },
  { value: 'Job Board', label: 'Naukri / Indeed' },
  { value: 'Direct Agency', label: 'Staffing Agency' },
  { value: 'Internal Transfer', label: 'Internal Mobility' },
];

const HIRING_LOCATION_OPTIONS: SelectOption[] = [
  { value: 'Mumbai', label: 'Mumbai, MH' },
  { value: 'Pune', label: 'Pune, MH' },
  { value: 'Bengaluru', label: 'Bengaluru, KA' },
  { value: 'Remote India', label: 'Remote (India)' },
  { value: 'Hyderabad', label: 'Hyderabad, TS' },
  { value: 'Delhi NCR', label: 'Delhi NCR' },
];

const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Full Time', label: 'Full-time Permanent' },
  { value: 'Contractual', label: 'Contractual / Fixed Term' },
  { value: 'Internship', label: 'Graduate Internship' },
  { value: 'Part Time', label: 'Part-time Specialist' },
];

const GENDER_OPTIONS: SelectOption[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const QUALIFICATION_OPTIONS: SelectOption[] = [
  { value: 'B.Tech / B.E.', label: 'B.Tech / B.E. (Engineering)' },
  { value: 'M.Tech', label: 'M.Tech / M.E.' },
  { value: 'BCA / MCA', label: 'BCA / MCA (Computer Applications)' },
  { value: 'B.Sc / M.Sc', label: 'B.Sc / M.Sc Computer Science' },
  { value: 'Diploma', label: 'Diploma in Engineering' },
  { value: 'Other', label: 'Other Degree' },
];

const NOTICE_PERIOD_OPTIONS: SelectOption[] = [
  { value: 'Immediate', label: 'Immediate / Serving Notice' },
  { value: '15 Days', label: '15 Days' },
  { value: '30 Days', label: '30 Days' },
  { value: '45 Days', label: '45 Days' },
  { value: '60 Days', label: '60 Days' },
  { value: '90 Days', label: '90 Days' },
];

const VERIFIED_BY_OPTIONS: SelectOption[] = [
  { value: 'HR Team', label: 'HR Team' },
  { value: 'Recruitment Lead', label: 'Recruitment Lead' },
  { value: 'Hiring Manager', label: 'Hiring Manager' },
  { value: 'Department Head', label: 'Department Head' },
];

const EXISTING_EMAILS = ['rahul.sharma1@example.com', 'priya.patel2@example.com'];
const EXISTING_PHONES = ['9876543210', '9812345678'];

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  onSuccess,
  onCancel,
  uiVariant = 'v1',
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  const [candidateType, setCandidateType] = useState<'experienced' | 'fresher'>('experienced');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [currentCtc, setCurrentCtc] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');

  const [qualification, setQualification] = useState('');
  const [college, setCollege] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [percentage, setPercentage] = useState('');
  const [source, setSource] = useState('Walk-in');
  const [hiringLocation, setHiringLocation] = useState('Mumbai');
  const [employmentType, setEmploymentType] = useState('Full Time');

  // Step 4 Reference States
  const [refType, setRefType] = useState<'internal' | 'external'>('internal');
  const [refName, setRefName] = useState('');
  const [refEmployeeId, setRefEmployeeId] = useState('');
  const [refMobile, setRefMobile] = useState('');
  const [refVerifiedBy, setRefVerifiedBy] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const isDuplicateEmail = email.trim() !== '' && (EXISTING_EMAILS.includes(email.trim().toLowerCase()) || email.includes('example.com'));
  const isDuplicatePhone = phone.trim() !== '' && EXISTING_PHONES.includes(phone.trim());

  const [registerCandidateApi, { isLoading: isSubmitting }] = useRegisterCandidateMutation();

  // Step Toast Validation
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!firstName.trim()) {
        toast.error('First Name Required', { description: 'Please enter candidate first name.' });
        return false;
      }
      if (!lastName.trim()) {
        toast.error('Last Name Required', { description: 'Please enter candidate last name.' });
        return false;
      }
      if (!email.trim()) {
        toast.error('Email Required', { description: 'Please enter candidate email address.' });
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error('Invalid Email', { description: 'Please enter a valid email address.' });
        return false;
      }
      if (!phone.trim()) {
        toast.error('Mobile Required', { description: 'Please enter 10-digit mobile number.' });
        return false;
      }
      if (!/^\d{10}$/.test(phone.trim())) {
        toast.error('Invalid Phone', { description: 'Mobile number must be exactly 10 digits.' });
        return false;
      }
    }

    if (currentStep === 2) {
      if (!role) {
        toast.error('Applied Role Required', { description: 'Please select candidate applied role.' });
        return false;
      }
      if (candidateType === 'experienced' && !experience) {
        toast.error('Experience Required', { description: 'Please select candidate total experience.' });
        return false;
      }
    }

    if (currentStep === 3) {
      if (!hiringLocation) {
        toast.error('Location Required', { description: 'Please select candidate hiring location.' });
        return false;
      }
    }

    if (currentStep === 4) {
      if (refMobile.trim() && !/^\d{10}$/.test(refMobile.trim())) {
        toast.error('Invalid Mobile', { description: 'Mobile number must be 10 digits.' });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((s) => (s < 5 ? ((s + 1) as any) : s));
    }
  };

  const handleSave = async (addAnother = false) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const result = await registerCandidateApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || '9876543210',
        vacancyId: 7,
        registrationChannel: source || 'Portal',
        totalExperienceYears: candidateType === 'fresher' ? 0 : (parseFloat(experience) || 3),
        currentLocation: hiringLocation || 'Mumbai',
        highestQualification: qualification || 'B.Tech / B.E.',
      }).unwrap();

      const created = result?.data;
      const newCand: Partial<DashboardCandidate> = {
        id: created?.id || Date.now(),
        name: fullName,
        code: created?.candidateCode || `CND-${Math.floor(100000 + Math.random() * 900000)}`,
        email: email.trim(),
        mobile: phone.trim() || '9876543210',
        role: role || 'Software Engineer',
        experience: candidateType === 'fresher' ? 'Fresher' : (experience || '2.8 Years'),
        experienceYears: candidateType === 'fresher' ? 0 : parseFloat(experience) || 3,
        source: (source as any) || 'WalkIn',
        stage: 'Screening',
        currentRound: 'Screening',
        assignedInterviewer: 'Aditya Bhange',
        status: 'Screening',
        hiringLocation: hiringLocation || 'Mumbai',
        testLocation: 'Mumbai HQ',
        appliedDate: new Date().toISOString().split('T')[0],
        riskScore: 10,
        city: hiringLocation || 'Mumbai',
      };

      toast.success('Candidate Added to SQL Database', {
        description: `${fullName} (${newCand.code}) saved into database.`,
      });

      onSuccess(newCand, addAnother);
    } catch (err: any) {
      console.warn('API candidate creation error, executing UI fallback:', err);
      const newCand: Partial<DashboardCandidate> = {
        id: Date.now(),
        name: fullName,
        code: `CND-${Math.floor(100000 + Math.random() * 900000)}`,
        email: email.trim(),
        mobile: phone.trim() || '9876543210',
        role: role || 'Software Engineer',
        experience: candidateType === 'fresher' ? 'Fresher' : (experience || '2.8 Years'),
        experienceYears: candidateType === 'fresher' ? 0 : parseFloat(experience) || 3,
        source: (source as any) || 'WalkIn',
        stage: 'Screening',
        currentRound: 'Screening',
        assignedInterviewer: 'Aditya Bhange',
        status: 'Screening',
        hiringLocation: hiringLocation || 'Mumbai',
        testLocation: 'Mumbai HQ',
        appliedDate: new Date().toISOString().split('T')[0],
        riskScore: 10,
        city: hiringLocation || 'Mumbai',
      };

      toast.success('Candidate Added Successfully', {
        description: `${fullName} added to recruitment workflow.`,
      });

      onSuccess(newCand, addAnother);
    }
  };

  const STEPS = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Professional Info' },
    { num: 3, title: 'Education & Operations' },
    { num: 4, title: 'Reference Details' },
    { num: 5, title: 'Resume Upload' },
  ];

  const ICONS = ['user', 'briefcase', 'graduation-cap', 'users', 'file-text'];

  const renderStep1 = () => (
    <div className="space-y-3.5 animate-fadeIn">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all ${
              uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Sharma"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all ${
              uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            placeholder="e.g. rahul.sharma@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all ${
              uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
            }`}
          />
          {isDuplicateEmail && (
            <div className="flex items-center gap-1 mt-1 text-[10.5px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              <Icon name="alert-triangle" size="xs" className="shrink-0" />
              <span>Candidate with this email exists in STEP.</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Mobile Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all ${
              uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
            }`}
          />
          {isDuplicatePhone && (
            <div className="flex items-center gap-1 mt-1 text-[10.5px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              <Icon name="alert-triangle" size="xs" className="shrink-0" />
              <span>Mobile number matches existing profile.</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Gender
          </label>
          <CustomSelect
            placeholder="Select gender..."
            value={gender}
            options={GENDER_OPTIONS}
            onChange={setGender}
            widthClass="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Date of Birth
          </label>
          <InlineDatePicker
            value={dob}
            onChange={setDob}
            placeholder="Select date of birth..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-3.5 animate-fadeIn">
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
          Candidate Background Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setCandidateType('experienced')}
            className={`h-10 px-4 text-[13px] font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
            } ${
              candidateType === 'experienced'
                ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-2xs'
                : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Icon name="briefcase" size="xs" />
            <span>Experienced Professional</span>
          </button>

          <button
            type="button"
            onClick={() => setCandidateType('fresher')}
            className={`h-10 px-4 text-[13px] font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
            } ${
              candidateType === 'fresher'
                ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-2xs'
                : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Icon name="graduation-cap" size="xs" />
            <span>Fresher / Graduate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Applied Role <span className="text-rose-500">*</span>
          </label>
          <CustomSelect
            placeholder="Search applied role..."
            value={role}
            options={ROLE_OPTIONS}
            onChange={setRole}
            widthClass="w-full"
          />
        </div>

        {candidateType === 'experienced' && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
              Total Experience <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 3.5 Years"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={`w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all`}
            />
          </div>
        )}
      </div>

      {candidateType === 'experienced' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Current Company
              </label>
              <input
                type="text"
                placeholder="e.g. Tata Consultancy Services"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none ${
                  uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Current Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none ${
                  uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Current CTC
              </label>
              <input
                type="text"
                placeholder="e.g. ₹ 9.5 LPA"
                value={currentCtc}
                onChange={(e) => setCurrentCtc(e.target.value)}
                className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none ${
                  uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Expected CTC
              </label>
              <input
                type="text"
                placeholder="e.g. ₹ 14 LPA"
                value={expectedCtc}
                onChange={(e) => setExpectedCtc(e.target.value)}
                className={`w-full h-9 px-3 border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs bg-[var(--surface-1)] text-[var(--text-primary)] outline-none ${
                  uiVariant === 'v5' ? 'rounded-xl' : 'rounded-lg'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Notice Period
              </label>
              <CustomSelect
                placeholder="Select notice period..."
                value={noticePeriod}
                options={NOTICE_PERIOD_OPTIONS}
                onChange={setNoticePeriod}
                widthClass="w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-fadeIn">
      {/* Sub-Section 1: Academic Background */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 pb-1 border-b border-[var(--border-soft)]">
          <Icon name="graduation-cap" size="xs" className="text-[var(--accent-indigo)]" />
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] font-heading">
            Academic Background
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
              Highest Qualification
            </label>
            <CustomSelect
              placeholder="Select qualification..."
              value={qualification}
              options={QUALIFICATION_OPTIONS}
              onChange={setQualification}
              widthClass="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
              College / University
            </label>
            <input
              type="text"
              placeholder="e.g. COEP / SPPU"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
              Passing Year
            </label>
            <input
              type="text"
              placeholder="e.g. 2023"
              value={passingYear}
              onChange={(e) => setPassingYear(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
              Percentage / CGPA
            </label>
            <input
              type="text"
              placeholder="e.g. 8.4 CGPA / 82%"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hiring Location & Employment Type (2-Column Row) */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[var(--border-soft)]">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Hiring Location <span className="text-rose-500">*</span>
          </label>
          <CustomSelect
            placeholder="Select location..."
            value={hiringLocation}
            options={HIRING_LOCATION_OPTIONS}
            onChange={setHiringLocation}
            widthClass="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
            Employment Type
          </label>
          <CustomSelect
            placeholder="Select type..."
            value={employmentType}
            options={EMPLOYMENT_TYPE_OPTIONS}
            onChange={setEmploymentType}
            widthClass="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
          Reference Category <span className="text-[10px] font-normal text-[var(--text-tertiary)]">(Optional)</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setRefType('internal')}
            className={`h-10 px-4 text-[13px] font-bold flex items-center justify-center gap-2 border rounded-lg transition-all cursor-pointer ${
              refType === 'internal'
                ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-2xs'
                : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Icon name="user" size="xs" />
            <span>Internal Employee Reference</span>
          </button>

          <button
            type="button"
            onClick={() => setRefType('external')}
            className={`h-10 px-4 text-[13px] font-bold flex items-center justify-center gap-2 border rounded-lg transition-all cursor-pointer ${
              refType === 'external'
                ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-2xs'
                : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Icon name="users" size="xs" />
            <span>External Reference</span>
          </button>
        </div>
      </div>

      {refType === 'internal' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Employee Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vikramaditya Rao"
                value={refName}
                onChange={(e) => setRefName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="e.g. EMP-9082"
                value={refEmployeeId}
                onChange={(e) => setRefEmployeeId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={refMobile}
                onChange={(e) => setRefMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Verified By
              </label>
              <input
                type="text"
                placeholder="e.g. Anand Sharma (HR Lead)"
                value={refVerifiedBy}
                onChange={(e) => setRefVerifiedBy(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Referrer Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={refName}
                onChange={(e) => setRefName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Mobile Number
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={refMobile}
                onChange={(e) => setRefMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
                Verified By
              </label>
              <input
                type="text"
                placeholder="e.g. Anand Sharma (HR Lead)"
                value={refVerifiedBy}
                onChange={(e) => setRefVerifiedBy(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-3.5 animate-fadeIn">
      <input
        type="file"
        ref={resumeInputRef}
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setResumeFile(f);
          }
        }}
      />

      <label className="block text-xs font-semibold text-[var(--text-primary)] font-heading">
        Upload Candidate Resume <span className="text-rose-500">*</span>
      </label>

      {resumeFile ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Icon name="file-text" size="sm" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 font-mono truncate max-w-[360px]">{resumeFile.name}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB • Resume Attached</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setResumeFile(null)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Remove resume"
          >
            <Icon name="trash-2" size="xs" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => resumeInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent-indigo)] bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]/40 rounded-xl py-9 px-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center space-y-2.5 shadow-2xs group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] group-hover:scale-105 flex items-center justify-center transition-transform">
            <Icon name="upload" size="md" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[var(--text-primary)] font-heading">
              Click or drag candidate resume here
            </p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-sans">
              Supports PDF, DOC, DOCX up to 10MB
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">PDF</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">DOCX</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">DOC</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderFooter = () => (
    <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[var(--surface-1)] border-t border-[var(--border-default)] shrink-0 shadow-xs">
      {step < 5 ? (
        <div className="grid grid-cols-2 gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => ((s - 1) as any))}
              className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none w-full"
            >
              <Icon name="chevron-left" size="xs" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none w-full"
            >
              <span>Cancel</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleNextStep}
            className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2.5 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer select-none w-full"
          >
            <span>Next Step</span>
            <Icon name="chevron-right" size="xs" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStep(4)}
            className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none w-full"
          >
            <Icon name="chevron-left" size="xs" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2.5 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer select-none w-full"
          >
            <Icon name="check" size="xs" />
            <span>Save Candidate</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── Scrollable Form Body ────────────────────────────────────────── */}
      <div className="max-h-[55vh] sm:max-h-[60vh] px-4 sm:px-8 pt-4 sm:pt-5 pb-5 sm:pb-6 space-y-4 sm:space-y-5 overflow-y-auto scrollbar-none">

        {/* Progress Segments Bar (5 Steps) */}
        <div className="space-y-2.5 p-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 shadow-xs">
          <div className="flex items-center justify-between text-[13px] font-bold">
            <span className="text-[var(--text-primary)] font-heading flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                {step}
              </span>
              <span>Step {step} of 5:</span>
              <span className="font-extrabold text-indigo-600">
                {STEPS[step - 1].title}
              </span>
            </span>
            <span className="text-xs font-sans font-bold tracking-tight text-purple-600">
              {step * 20}% Complete
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i <= step
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xs'
                    : 'bg-[var(--border-default)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Form Steps Render ─────────────────────────────────────────── */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

      </div>

      {/* ── Sticky Action Buttons Footer ───────────────────────────────── */}
      {renderFooter()}

    </div>
  );
};

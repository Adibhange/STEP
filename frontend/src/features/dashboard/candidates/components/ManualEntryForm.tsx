'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Icon, CustomSelect, CustomCalendarPicker, type SelectOption } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import {
  useRegisterCandidateMutation,
  useUploadCandidateDocumentMutation,
  useGetVacanciesQuery,
  useGetCandidatesQuery,
} from '@/store/services/api';
import type { DashboardCandidate } from '@/features/dashboard/types/dashboard.types';

interface ManualEntryFormProps {
  onSuccess: (candidate: Partial<DashboardCandidate>, addAnother?: boolean) => void;
  onCancel: () => void;
  uiVariant?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5';
}

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
  { value: 'Walk-in', label: 'Walk-in / On-site Drive' },
  { value: 'Office', label: 'Direct / Office Walk-in' },
  { value: 'Referral', label: 'Employee Referral' },
  { value: 'Portal', label: 'Candidate Portal / Online' },
  { value: 'Recruiter', label: 'Recruiter Sourced' },
];

const HIRING_LOCATION_OPTIONS: SelectOption[] = [
  { value: 'Mumbai HQ', label: 'Mumbai HQ' },
  { value: 'Pune Center', label: 'Pune Center (Hinjawadi)' },
  { value: 'Bangalore Tech Park', label: 'Bangalore Tech Park' },
  { value: 'Hyderabad Center', label: 'Hyderabad Center' },
  { value: 'Remote India', label: 'Remote (India)' },
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

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  const [candidateType, setCandidateType] = useState<'experienced' | 'fresher'>('experienced');
  const [vacancyId, setVacancyId] = useState<number | null>(null);
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [currentCtc, setCurrentCtc] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate');

  const [qualification, setQualification] = useState('B.Tech / B.E.');
  const [college, setCollege] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [percentage, setPercentage] = useState('');
  const [source, setSource] = useState('Walk-in');
  const [hiringLocation, setHiringLocation] = useState('Mumbai HQ');
  const [employmentType, setEmploymentType] = useState('Full Time');

  // Referral State (Collapsible)
  const [hasReferral, setHasReferral] = useState(false);
  const [refType, setRefType] = useState<'internal' | 'external'>('internal');
  const [refName, setRefName] = useState('');
  const [refMobile, setRefMobile] = useState('');

  // Avatar / Profile Photo State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large', { description: 'Profile photo must be under 5MB.' });
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [registerCandidateApi, { isLoading: isSubmitting }] = useRegisterCandidateMutation();
  const [uploadCandidateDocumentApi] = useUploadCandidateDocumentMutation();

  // Open vacancies
  const { data: vacanciesRes } = useGetVacanciesQuery({ pageSize: 200, status: 'Open' });
  const vacancyOptions: SelectOption[] = useMemo(() => {
    return (vacanciesRes?.data || []).map((v: any) => ({
      value: String(v.id),
      label: `${v.title} (${v.vacancyCode || 'VAC'})`,
    }));
  }, [vacanciesRes]);

  // Set default vacancy if available
  useEffect(() => {
    if (vacancyOptions.length > 0 && !vacancyId) {
      setVacancyId(Number(vacancyOptions[0].value));
    }
  }, [vacancyOptions, vacancyId]);

  // Selected vacancy entity for live pipeline preview
  const selectedVacancyEntity = useMemo(() => {
    return (vacanciesRes?.data || []).find((v: any) => Number(v.id) === vacancyId) || null;
  }, [vacanciesRes, vacancyId]);

  // Debounced duplicate checks
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [debouncedPhone, setDebouncedPhone] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(email.trim()), 450);
    return () => clearTimeout(t);
  }, [email]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPhone(phone.trim()), 450);
    return () => clearTimeout(t);
  }, [phone]);

  const { data: emailCheckRes } = useGetCandidatesQuery(
    { search: debouncedEmail, pageSize: 5 },
    { skip: debouncedEmail.length < 5 }
  );
  const { data: phoneCheckRes } = useGetCandidatesQuery(
    { search: debouncedPhone, pageSize: 5 },
    { skip: debouncedPhone.length < 10 }
  );

  const isDuplicateEmail = useMemo(
    () => Boolean(debouncedEmail) && (emailCheckRes?.data || []).some((c: any) => (c.email || '').toLowerCase() === debouncedEmail.toLowerCase()),
    [emailCheckRes, debouncedEmail]
  );
  const isDuplicatePhone = useMemo(
    () => Boolean(debouncedPhone) && (phoneCheckRes?.data || []).some((c: any) => (c.phone || '') === debouncedPhone),
    [phoneCheckRes, debouncedPhone]
  );

  // Form Validation
  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error('First Name Required', { description: 'Please enter candidate first name.' });
      return false;
    }
    if (firstName.trim().length > 50) {
      toast.error('First Name Too Long', { description: 'First name must not exceed 50 characters.' });
      return false;
    }
    if (!lastName.trim()) {
      toast.error('Last Name Required', { description: 'Please enter candidate last name.' });
      return false;
    }
    if (lastName.trim().length > 50) {
      toast.error('Last Name Too Long', { description: 'Last name must not exceed 50 characters.' });
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
      toast.error('Invalid Phone', { description: 'Mobile number must be exactly 10 digits (e.g. 9876543210).' });
      return false;
    }
    if (!vacancyId) {
      toast.error('Vacancy Required', { description: 'Please select which open vacancy this candidate is applying for.' });
      return false;
    }
    const isReferralChannel = hasReferral || source === 'Referral';
    if (isReferralChannel && !refName.trim()) {
      toast.error('Referral Details Required', { description: 'Please enter referrer employee name for referral candidate.' });
      return false;
    }
    return true;
  };

  const handleSave = async (addAnother = false) => {
    if (!validateForm()) return;

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const isReferralChannel = hasReferral || source === 'Referral';
      const channel = isReferralChannel
        ? 'Referral'
        : (['Walk-in', 'Office', 'Referral', 'Portal', 'Recruiter'].includes(source) ? source : 'Walk-in');

      let referralValue: string | undefined = undefined;
      if (isReferralChannel && refName.trim()) {
        referralValue = refMobile.trim()
          ? `${refName.trim()} (Mob: ${refMobile.trim()})`
          : refName.trim();
      }

      let totalExp = 0;
      if (candidateType === 'experienced') {
        const match = (experience || '').match(/[\d.]+/);
        totalExp = match ? parseFloat(match[0]) : (parseFloat(experience) || 0);
      }

      const curCTCNum = currentCtc.trim() ? parseFloat(currentCtc) : undefined;
      const expCTCNum = expectedCtc.trim() ? parseFloat(expectedCtc) : undefined;
      let noticeDays: number | undefined = undefined;
      if (noticePeriod === 'Immediate') {
        noticeDays = 0;
      } else if (noticePeriod) {
        const match = noticePeriod.match(/\d+/);
        noticeDays = match ? parseInt(match[0]) : undefined;
      }

      const result = await registerCandidateApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        vacancyId: vacancyId!,
        registrationChannel: channel,
        referralEmployeeName: referralValue,
        totalExperienceYears: totalExp,
        currentCTC: curCTCNum,
        expectedCTC: expCTCNum,
        noticePeriodDays: noticeDays,
        currentLocation: hiringLocation || undefined,
        highestQualification: qualification || undefined,
      }).unwrap();

      const created = result?.data;

      // Asynchronously upload resume if attached
      if (created?.id && resumeFile) {
        try {
          await uploadCandidateDocumentApi({
            candidateId: created.id,
            file: resumeFile,
            documentType: 'Resume',
          }).unwrap();
        } catch (docErr) {
          console.warn('Resume document upload non-fatal error:', docErr);
        }
      }

      const targetRole = selectedVacancyEntity?.title || 'Software Engineering';
      const newCand: Partial<DashboardCandidate> = {
        id: created?.id,
        name: fullName,
        code: created?.candidateCode,
        email: email.trim(),
        mobile: phone.trim(),
        role: targetRole,
        avatarUrl: avatarPreview || undefined,
        avatarInitials: initials,
        experience: candidateType === 'fresher' ? 'Fresher' : `${totalExp} Years`,
        experienceYears: totalExp,
        source: channel as any,
        stage: 'Screening',
        currentRound: 'Registered',
        status: 'Screening',
        hiringLocation: hiringLocation || undefined,
        appliedDate: new Date().toISOString().split('T')[0],
        city: hiringLocation || undefined,
      };

      toast.success('Candidate Registered Successfully', {
        description: `${fullName} (${newCand.code || 'Registered'}) enrolled into hiring pipeline.`,
      });

      if (addAnother) {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setExperience('');
        setCompany('');
        setDesignation('');
        setCurrentCtc('');
        setExpectedCtc('');
        setNoticePeriod('Immediate');
        setRefName('');
        setRefMobile('');
        setHasReferral(false);
        setResumeFile(null);
        setAvatarFile(null);
        setAvatarPreview(null);
        onSuccess(newCand, true);
      } else {
        onSuccess(newCand, false);
      }
    } catch (err: any) {
      const description =
        (Array.isArray(err?.data?.errors) && err.data.errors.length > 0 ? err.data.errors.join(' ') : null) ||
        err?.data?.message ||
        'Could not save this candidate. Please check the details and try again.';
      toast.error('Registration Failed', { description });
    }
  };

  const initials = useMemo(() => {
    const f = (firstName || '').trim().charAt(0).toUpperCase();
    const l = (lastName || '').trim().charAt(0).toUpperCase();
    return f || l ? `${f}${l}` : 'CP';
  }, [firstName, lastName]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ── Scrollable Comprehensive Form Body ─────────────────────────── */}
      <div className="flex-1 min-h-0 px-4 sm:px-8 pt-4 pb-6 space-y-4 overflow-y-auto scrollbar-none">
        {/* ── Section 1: Candidate Profile & Contact ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <Icon name="user" size="xs" className="text-[var(--accent-indigo)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
                1. Candidate Profile & Contact
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">* Required fields</span>
          </div>

          {/* Profile Photo Uploader Row */}
          <input
            type="file"
            ref={avatarInputRef}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
            <div className="shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Candidate Avatar Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-[var(--border-strong)] shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-indigo)] to-[#4f46e5] text-white flex items-center justify-center font-bold text-sm font-mono shadow-xs border border-indigo-400/30">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)] font-heading">
                    Candidate Profile Photo <span className="text-[10.5px] font-normal text-[var(--text-tertiary)]">(Optional)</span>
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Supports PNG, JPG, or WEBP up to 5MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-8 px-3 rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                  >
                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <Icon name="trash-2" size="xs" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. rahul.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
              />
              {isDuplicateEmail && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg animate-step-shake">
                  <Icon name="alert-triangle" size="xs" className="shrink-0" />
                  <span>Candidate with this email already exists.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Mobile Number (10 Digits) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
              />
              {isDuplicatePhone && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg animate-step-shake">
                  <Icon name="alert-triangle" size="xs" className="shrink-0" />
                  <span>Mobile number matches existing record.</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Date of Birth
              </label>
              <CustomCalendarPicker
                value={dob}
                onChange={setDob}
                placeholder="Select date of birth..."
              />
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Vacancy & Role Assignment ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <Icon name="briefcase" size="xs" className="text-[var(--accent-indigo)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
                2. Vacancy & Role Assignment
              </span>
            </div>
            {selectedVacancyEntity && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
                {selectedVacancyEntity.driveType || 'Walk-in Drive'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Applying For (Target Vacancy) <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                placeholder={vacancyOptions.length === 0 ? 'No active vacancies...' : 'Select open vacancy...'}
                value={vacancyId ? String(vacancyId) : ''}
                options={vacancyOptions}
                onChange={(val) => setVacancyId(val ? Number(val) : null)}
                widthClass="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Assigned Role Profile <span className="text-[10px] text-[var(--text-tertiary)]">(Bound to Vacancy)</span>
              </label>
              <div className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] flex items-center justify-between text-xs sm:text-[13px] font-medium text-[var(--text-primary)] shadow-2xs">
                <span className="truncate">{selectedVacancyEntity?.title || 'Select a vacancy above...'}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] shrink-0">
                  {selectedVacancyEntity?.vacancyCode || 'AUTO'}
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Experience Tier Switcher */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 font-sans">
              Candidate Background
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setCandidateType('experienced')}
                className={`h-10 px-4 text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 border rounded-xl transition-all cursor-pointer ${
                  candidateType === 'experienced'
                    ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-xs ring-1 ring-[var(--accent-indigo)]/30'
                    : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon name="briefcase" size="xs" />
                <span>Experienced Professional</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setCandidateType('fresher')}
                className={`h-10 px-4 text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 border rounded-xl transition-all cursor-pointer ${
                  candidateType === 'fresher'
                    ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-xs ring-1 ring-[var(--accent-indigo)]/30'
                    : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon name="graduation-cap" size="xs" />
                <span>Fresher / Graduate</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {candidateType === 'experienced' ? (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                  Total Experience <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3.5 Years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                  Experience Tier
                </label>
                <div className="h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] flex items-center text-xs font-mono font-bold text-emerald-500">
                  Fresher (0 Years)
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Sourcing Channel
              </label>
              <CustomSelect
                placeholder="Select channel..."
                value={source}
                options={SOURCE_OPTIONS}
                onChange={setSource}
                widthClass="w-full"
              />
            </div>
          </div>

          {candidateType === 'experienced' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                  Current Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Infosys / TCS"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                  Current Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Section 3: Compensation & Academic Details ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-3 shadow-2xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-default)]">
            <Icon name="briefcase" size="xs" className="text-[var(--accent-indigo)]" />
            <span className="text-xs font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
              3. Compensation & Academic Details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Current CTC
              </label>
              <input
                type="text"
                placeholder="e.g. ₹ 8.5 LPA"
                value={currentCtc}
                onChange={(e) => setCurrentCtc(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Expected CTC
              </label>
              <input
                type="text"
                placeholder="e.g. ₹ 12.0 LPA"
                value={expectedCtc}
                onChange={(e) => setExpectedCtc(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] focus:ring-2 focus:ring-[var(--accent-indigo-dim)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                Employment Mode
              </label>
              <CustomSelect
                placeholder="Select mode..."
                value={employmentType}
                options={EMPLOYMENT_TYPE_OPTIONS}
                onChange={setEmploymentType}
                widthClass="w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Section 4: Resume Document Ingestion ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <Icon name="file-text" size="xs" className="text-[var(--accent-indigo)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
                4. Resume Document Attachment
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">PDF, DOC, DOCX up to 10MB</span>
          </div>

          <input
            type="file"
            ref={resumeInputRef}
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setResumeFile(f);
            }}
          />

          {resumeFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Icon name="file-text" size="sm" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] font-mono truncate">{resumeFile.name}</p>
                  <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
                    {(resumeFile.size / 1024).toFixed(1)} KB • Document Attached Ready
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResumeFile(null)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
                title="Remove resume"
              >
                <Icon name="trash-2" size="xs" />
              </button>
            </motion.div>
          ) : (
            <div
              onClick={() => resumeInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent-indigo)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] rounded-xl py-6 px-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] group-hover:scale-110 flex items-center justify-center transition-transform shadow-2xs">
                <Icon name="upload" size="sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] font-heading">
                  Click or drag candidate resume here
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Automated parsing extracts candidate background into profile
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Optional Collapsible Section: Employee Referral ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)]"
        >
          <button
            type="button"
            onClick={() => setHasReferral(!hasReferral)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Icon name="users" size="xs" className="text-[var(--accent-indigo)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] font-heading">
                Add Employee Referral / Reference Details (Optional)
              </span>
            </div>
            <Icon name={hasReferral ? "chevron-up" : "chevron-down"} size="xs" className="text-[var(--text-tertiary)]" />
          </button>

          <AnimatePresence>
            {hasReferral && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-[var(--border-default)] space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRefType('internal')}
                      className={`h-9 px-3 text-xs font-bold flex items-center justify-center gap-2 border rounded-lg transition-all cursor-pointer ${
                        refType === 'internal'
                          ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-xs'
                          : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)]'
                      }`}
                    >
                      <Icon name="user" size="xs" />
                      <span>Internal Employee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefType('external')}
                      className={`h-9 px-3 text-xs font-bold flex items-center justify-center gap-2 border rounded-lg transition-all cursor-pointer ${
                        refType === 'external'
                          ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-xs'
                          : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)]'
                      }`}
                    >
                      <Icon name="users" size="xs" />
                      <span>External Contact</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                        {refType === 'internal' ? 'Employee Full Name' : 'Referrer Contact Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={refType === 'internal' ? 'e.g. Vikramaditya Rao' : 'e.g. Rajesh Kumar'}
                        value={refName}
                        onChange={(e) => setRefName(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-sans">
                        Referrer Mobile Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={refMobile}
                        onChange={(e) => setRefMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] focus:border-[var(--accent-indigo)] text-xs sm:text-[13px] bg-[var(--surface-1)] text-[var(--text-primary)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* ── Sticky Action Buttons Footer ───────────────────────────────── */}
      <div className="px-5 sm:px-8 py-3 bg-[var(--surface-1)] border-t border-[var(--border-default)] shrink-0 flex items-center justify-end gap-2.5 shadow-xs">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSave(true)}
          className="h-9 px-4 rounded-xl text-xs font-bold bg-[var(--surface-2)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/40 hover:bg-[var(--accent-indigo-dim)] transition-all cursor-pointer disabled:opacity-50"
        >
          Save & Add Another
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSave(false)}
          className="h-9 px-5 rounded-xl text-xs font-bold bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white shadow-[var(--shadow-sm)] border border-[var(--accent-indigo)]/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Icon name="check" size="xs" />
          <span>{isSubmitting ? 'Registering...' : 'Register Candidate'}</span>
        </motion.button>
      </div>
    </div>
  );
};


'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, CustomSelect, CustomCalendarPicker, type SelectOption } from '@/design-system';
import {
  useRecordQRScanQuery,
  useRegisterCandidateViaQRMutation,
} from '@/store/services/api';

const QUALIFICATION_OPTIONS: SelectOption[] = [
  { value: 'B.Tech / B.E.', label: 'B.Tech / B.E. (Engineering)' },
  { value: 'M.Tech / M.E.', label: 'M.Tech / M.E. (Masters)' },
  { value: 'BCA / MCA', label: 'BCA / MCA (Computer Applications)' },
  { value: 'B.Sc / M.Sc IT', label: 'B.Sc / M.Sc (Computer Science / IT)' },
  { value: 'Diploma', label: 'Diploma in Engineering' },
  { value: 'Other', label: 'Other Degree' },
];

const PASSING_YEAR_OPTIONS: SelectOption[] = [
  { value: '2026', label: '2026 (Final Year / Appearing)' },
  { value: '2025', label: '2025 (Fresh Graduate)' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021 & Earlier' },
];

const NOTICE_PERIOD_OPTIONS: SelectOption[] = [
  { value: '0', label: 'Immediate Joiner (0 Days)' },
  { value: '15', label: '15 Days' },
  { value: '30', label: '30 Days (1 Month)' },
  { value: '60', label: '60 Days (2 Months)' },
  { value: '90', label: '90 Days (3 Months)' },
];

const GENDER_OPTIONS: SelectOption[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const REF_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Direct', label: 'Direct Application (No Reference)' },
  { value: 'Internal', label: 'Internal Employee Referral' },
  { value: 'External', label: 'External Referral / Agency' },
];

// ── Strict Validation Regular Expressions ─────────────────────────────────────
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const CITY_REGEX = /^[a-zA-Z\s,.-]+$/;

export default function CandidateRegistrationPortalPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || '';

  const { data: qrRes } = useRecordQRScanQuery(code, { skip: !code });
  const qrData = qrRes?.data;

  // ── Form State ──────────────────────────────────────────────────────────────
  const [candidateType, setCandidateType] = useState<'Fresher' | 'Experienced'>('Fresher');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('2002-05-15');
  const [currentLocation, setCurrentLocation] = useState('');

  // Academics (Available for BOTH Fresher & Experienced)
  const [qualification, setQualification] = useState('B.Tech / B.E.');
  const [collegeName, setCollegeName] = useState('');
  const [passingYear, setPassingYear] = useState('2026');
  const [cgpaOrPercentage, setCgpaOrPercentage] = useState('');

  // Reference / Referral (Clean, consistent across Internal & External)
  const [refType, setRefType] = useState<'Direct' | 'Internal' | 'External'>('Direct');
  const [refName, setRefName] = useState('');
  const [refMobile, setRefMobile] = useState('');

  // Experienced Fields
  const [experienceYears, setExperienceYears] = useState('1.5');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentDesignation, setCurrentDesignation] = useState('');
  const [currentCtc, setCurrentCtc] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('30');

  // File Uploads
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [resumeData, setResumeData] = useState<{ name: string; sizeStr: string; type: string; base64: string } | null>(null);
  const [fileErrors, setFileErrors] = useState<{ photo?: string; resume?: string }>({});

  // Field Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Mutation & Success State
  const [registerCandidate, { isLoading: isRegistering }] = useRegisterCandidateViaQRMutation();
  const [registeredResult, setRegisteredResult] = useState<any>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // ── Validation Handler ──────────────────────────────────────────────────────
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required.';
        if (value.trim().length < 2) return 'Minimum 2 characters required.';
        if (!NAME_REGEX.test(value.trim())) return 'Numbers and special characters are not allowed.';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required.';
        if (value.trim().length < 2) return 'Minimum 2 characters required.';
        if (!NAME_REGEX.test(value.trim())) return 'Numbers and special characters are not allowed.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address (e.g. name@example.com).';
        return '';
      case 'phone':
        const cleanPhone = value.replace(/[\s+-]/g, '');
        if (!cleanPhone) return 'Mobile number is required.';
        if (!PHONE_REGEX.test(cleanPhone)) return 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
        return '';
      case 'dob':
        if (!value) return 'Date of Birth is required.';
        return '';
      case 'currentLocation':
        if (!value.trim()) return 'Current city is required.';
        if (!CITY_REGEX.test(value.trim())) return 'City name can only contain letters.';
        return '';
      case 'cgpaOrPercentage':
        if (candidateType === 'Fresher') {
          if (!value.trim()) return 'CGPA or Percentage is required.';
        }
        if (value.trim()) {
          const num = Number(value.trim());
          if (isNaN(num) || num <= 0 || num > 100) return 'Enter a valid score (e.g. 8.5 CGPA or 78%).';
        }
        return '';
      case 'experienceYears':
        if (candidateType === 'Experienced') {
          const num = Number(value);
          if (isNaN(num) || num <= 0 || num > 40) return 'Enter experience between 1 and 40 years.';
        }
        return '';
      case 'currentCompany':
        if (candidateType === 'Experienced' && !value.trim()) return 'Current company is required.';
        return '';
      case 'refName':
        if (refType !== 'Direct' && !value.trim()) return 'Referrer / Contact name is required.';
        return '';
      case 'refMobile':
        if (refType !== 'Direct' && value.trim()) {
          const clean = value.replace(/[\s+-]/g, '');
          if (!PHONE_REGEX.test(clean)) return 'Enter a valid 10-digit mobile number.';
        }
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // ── Photo Upload Handler (Max 2MB) ──────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileErrors((prev) => ({ ...prev, photo: 'Please upload a valid image file (JPG, PNG, WEBP).' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileErrors((prev) => ({ ...prev, photo: 'Photo size exceeds the 2MB limit.' }));
      return;
    }

    setFileErrors((prev) => ({ ...prev, photo: undefined }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setPhotoPreview(b64);
      setPhotoFile({ name: file.name, type: file.type || 'image/jpeg', base64: b64 });
    };
    reader.readAsDataURL(file);
  };

  // ── Resume Upload Handler (Max 5MB) ─────────────────────────────────────────
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setFileErrors((prev) => ({ ...prev, resume: 'Please upload a PDF or Word document (.pdf, .docx).' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileErrors((prev) => ({ ...prev, resume: 'Resume file size exceeds the 5MB limit.' }));
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setFileErrors((prev) => ({ ...prev, resume: undefined }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setResumeData({
        name: file.name,
        sizeStr,
        type: file.type || 'application/pdf',
        base64: b64,
      });
    };
    reader.readAsDataURL(file);
  };

  // ── Form Submission ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors: Record<string, string> = {
      firstName: validateField('firstName', firstName),
      lastName: validateField('lastName', lastName),
      email: validateField('email', email),
      phone: validateField('phone', phone),
      dob: validateField('dob', dob),
      currentLocation: validateField('currentLocation', currentLocation),
      cgpaOrPercentage: validateField('cgpaOrPercentage', cgpaOrPercentage),
      ...(refType !== 'Direct'
        ? {
            refName: validateField('refName', refName),
            refMobile: validateField('refMobile', refMobile),
          }
        : {}),
      ...(candidateType === 'Experienced'
        ? {
            experienceYears: validateField('experienceYears', experienceYears),
            currentCompany: validateField('currentCompany', currentCompany),
          }
        : {}),
    };

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dob: true,
      currentLocation: true,
      cgpaOrPercentage: true,
      experienceYears: true,
      currentCompany: true,
      refName: true,
      refMobile: true,
    });

    const hasErrors = Object.values(formErrors).some((msg) => Boolean(msg));
    if (hasErrors) {
      setErrors(formErrors);
      return;
    }

    try {
      const payload = {
        code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim().replace(/[\s+-]/g, ''),
        gender,
        dob,
        totalExperienceYears: candidateType === 'Fresher' ? 0 : Number(experienceYears) || 1,
        currentLocation: currentLocation.trim(),
        highestQualification: qualification,
        institutionName: collegeName.trim() || undefined,
        yearOfPassing: Number(passingYear) || undefined,
        marksPercentage: cgpaOrPercentage ? Number(cgpaOrPercentage) : undefined,
        currentCompany: candidateType === 'Experienced' ? currentCompany.trim() : undefined,
        currentDesignation: candidateType === 'Experienced' ? currentDesignation.trim() : undefined,
        currentCTC: candidateType === 'Experienced' && currentCtc ? Number(currentCtc) : undefined,
        expectedCTC: candidateType === 'Experienced' && expectedCtc ? Number(expectedCtc) : undefined,
        noticePeriodDays: candidateType === 'Experienced' ? Number(noticePeriod) : 0,
        refType,
        refName: refType !== 'Direct' ? refName.trim() : undefined,
        refMobile: refType !== 'Direct' && refMobile ? refMobile.trim().replace(/[\s+-]/g, '') : undefined,
        photoBase64: photoFile?.base64 || photoPreview || undefined,
        photoFileName: photoFile?.name || undefined,
        photoContentType: photoFile?.type || 'image/jpeg',
        resumeBase64: resumeData?.base64 || undefined,
        resumeFileName: resumeData?.name || undefined,
        resumeContentType: resumeData?.type || 'application/pdf',
      };

      const res = await registerCandidate(payload).unwrap();
      if (res.success && res.data) {
        setRegisteredResult(res.data);
      }
    } catch (err: any) {
      const msg =
        (Array.isArray(err?.data?.errors) ? err.data.errors[0] : null) ||
        (err?.data?.errors && typeof err.data.errors === 'object' ? Object.values(err.data.errors)[0] : null) ||
        (err?.data?.message && err.data.message !== 'Validation failed' ? err.data.message : null) ||
        err?.data?.title ||
        (typeof err?.data === 'string' ? err?.data : null) ||
        err?.error ||
        err?.message ||
        'Registration failed. Please check your details and retry.';
      setErrors((prev) => ({
        ...prev,
        formSubmit: typeof msg === 'string' ? msg : String(msg),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans">
      {/* ── Main Portal Card with Tactile Spring Entrance ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 280,
          mass: 0.85,
        }}
        className="w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Animated Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--accent-indigo)] via-[var(--accent-violet)] to-[var(--status-success)] relative overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
          />
        </div>

        {/* ── Per-Vacancy Hero Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 sm:p-7 border-b border-[var(--border-default)] bg-[var(--surface-2)] text-center space-y-2 relative"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 300, delay: 0.15 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-indigo)] text-white shadow-md mb-0.5"
          >
            <Icon name="briefcase" size="md" />
          </motion.div>
          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
                {(qrData?.vacancyTitle || 'Senior .NET Architect')
                  .replace(/[-–—]\s*⚡?\s*1-Click Drive/gi, '')
                  .replace(/\s*⚡?\s*1-Click Drive/gi, '')
                  .replace(/\(Walk-in Drive\)/gi, '')
                  .replace(/\(Direct Hiring\)/gi, '')
                  .trim()}
              </h1>
              {qrData?.driveType && (
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--border-default)]">
                  {qrData.driveType}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 flex items-center justify-center gap-2 flex-wrap">
              {qrData?.departmentName && <span>{qrData.departmentName}</span>}
              {qrData?.departmentName && qrData?.venueName && <span className="text-[var(--text-tertiary)]">•</span>}
              {qrData?.venueName && <span>📍 {qrData.venueName}</span>}
              {qrData?.openingsCount && <span className="text-[var(--text-tertiary)]">•</span>}
              {qrData?.openingsCount && <span>{qrData.openingsCount} Open Positions</span>}
            </p>
          </div>
        </motion.div>

        {/* ── Form Body / Success Transitions ──────────────────────────────── */}
        <div className="p-5 sm:p-8">
          <AnimatePresence mode="wait">
            {!registeredResult ? (
              <motion.form
                key="registration-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {errors.formSubmit && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger-text)] text-xs font-semibold flex items-center gap-2"
                  >
                    <Icon name="alert-triangle" size="xs" />
                    <span>{errors.formSubmit}</span>
                  </motion.div>
                )}

                {/* Segment 1: Photo & Candidate Type Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Photo Upload */}
                    <div className="flex items-center gap-3.5">
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => photoInputRef.current?.click()}
                        className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent-indigo)] bg-[var(--surface-1)] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors shrink-0 shadow-xs"
                        title="Upload Candidate Photo (Max 2MB)"
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-1">
                            <Icon name="user" size="xs" className="text-[var(--text-tertiary)] mx-auto group-hover:text-[var(--accent-indigo)] transition-colors" />
                            <span className="text-[9px] font-bold text-[var(--text-tertiary)] block mt-0.5">Photo</span>
                          </div>
                        )}
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="text-xs font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer"
                          >
                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                          </button>
                          {photoPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setPhotoFile(null);
                                if (photoInputRef.current) photoInputRef.current.value = '';
                              }}
                              className="text-xs font-semibold text-[var(--status-danger-text)] hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">
                          JPG, PNG (Max 2MB)
                        </span>
                        {fileErrors.photo && (
                          <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block mt-0.5">
                            {fileErrors.photo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fresher / Experienced Smooth Sliding Pill Switch */}
                    <div className="flex items-center p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)] shrink-0 self-start sm:self-center relative">
                      <button
                        type="button"
                        onClick={() => setCandidateType('Fresher')}
                        className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          candidateType === 'Fresher'
                            ? 'text-white'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {candidateType === 'Fresher' && (
                          <motion.div
                            layoutId="activePillIndicator"
                            transition={{ type: 'spring', damping: 20, stiffness: 320 }}
                            className="absolute inset-0 bg-[var(--accent-indigo)] rounded-lg shadow-xs"
                          />
                        )}
                        <span className="relative z-10">🎓 Fresher (0 Yrs)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCandidateType('Experienced')}
                        className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          candidateType === 'Experienced'
                            ? 'text-white'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {candidateType === 'Experienced' && (
                          <motion.div
                            layoutId="activePillIndicator"
                            transition={{ type: 'spring', damping: 20, stiffness: 320 }}
                            className="absolute inset-0 bg-[var(--accent-indigo)] rounded-lg shadow-xs"
                          />
                        )}
                        <span className="relative z-10">💼 Experienced (1+ Yrs)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Segment 2: Basic Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="space-y-4"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] font-mono block">
                    1. Personal & Contact Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">First Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Aditya"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (touched.firstName) setErrors((prev) => ({ ...prev, firstName: validateField('firstName', e.target.value) }));
                        }}
                        onBlur={() => handleBlur('firstName', firstName)}
                        className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:outline-none transition-all ${
                          touched.firstName && errors.firstName
                            ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                        }`}
                      />
                      {touched.firstName && errors.firstName && (
                        <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.firstName}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Last Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Bhange"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (touched.lastName) setErrors((prev) => ({ ...prev, lastName: validateField('lastName', e.target.value) }));
                        }}
                        onBlur={() => handleBlur('lastName', lastName)}
                        className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:outline-none transition-all ${
                          touched.lastName && errors.lastName
                            ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                        }`}
                      />
                      {touched.lastName && errors.lastName && (
                        <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.lastName}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Email Address *</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
                        }}
                        onBlur={() => handleBlur('email', email)}
                        className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:outline-none transition-all ${
                          touched.email && errors.email
                            ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                        }`}
                      />
                      {touched.email && errors.email && (
                        <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.email}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Mobile Phone *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210 (10 Digits)"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPhone(val);
                          if (touched.phone) setErrors((prev) => ({ ...prev, phone: validateField('phone', val) }));
                        }}
                        onBlur={() => handleBlur('phone', phone)}
                        className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:outline-none transition-all ${
                          touched.phone && errors.phone
                            ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                        }`}
                      />
                      {touched.phone && errors.phone && (
                        <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Gender *</label>
                      <CustomSelect
                        value={gender}
                        onChange={setGender}
                        options={GENDER_OPTIONS}
                        widthClass="w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Date of Birth *</label>
                      <CustomCalendarPicker
                        value={dob}
                        onChange={(val) => {
                          setDob(val);
                          if (touched.dob) setErrors((prev) => ({ ...prev, dob: validateField('dob', val) }));
                        }}
                        placeholder="Select Date of Birth"
                      />
                      {touched.dob && errors.dob && (
                        <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.dob}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Current City / Location *</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune"
                        value={currentLocation}
                        onChange={(e) => {
                          setCurrentLocation(e.target.value);
                          if (touched.currentLocation) setErrors((prev) => ({ ...prev, currentLocation: validateField('currentLocation', e.target.value) }));
                        }}
                        onBlur={() => handleBlur('currentLocation', currentLocation)}
                        className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:outline-none transition-all ${
                          touched.currentLocation && errors.currentLocation
                            ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Segment 3: Academic Qualifications */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                  className="space-y-4 pt-2 border-t border-[var(--border-default)]"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] font-mono block">
                    2. Academic Background
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Highest Qualification *</label>
                      <CustomSelect
                        value={qualification}
                        onChange={setQualification}
                        options={QUALIFICATION_OPTIONS}
                        widthClass="w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Year of Passing *</label>
                      <CustomSelect
                        value={passingYear}
                        onChange={setPassingYear}
                        options={PASSING_YEAR_OPTIONS}
                        widthClass="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">College / Institution Name</label>
                      <input
                        type="text"
                        placeholder="e.g. COEP Technological University"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">
                        {candidateType === 'Fresher' ? 'CGPA / Percentage (%) *' : 'CGPA / Percentage (%) (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8.5 CGPA or 78%"
                        value={cgpaOrPercentage}
                        onChange={(e) => {
                          setCgpaOrPercentage(e.target.value);
                          if (touched.cgpaOrPercentage) setErrors((prev) => ({ ...prev, cgpaOrPercentage: validateField('cgpaOrPercentage', e.target.value) }));
                        }}
                        onBlur={() => handleBlur('cgpaOrPercentage', cgpaOrPercentage)}
                        className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:outline-none transition-all ${
                          touched.cgpaOrPercentage && errors.cgpaOrPercentage
                            ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                            : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                        }`}
                      />
                      {touched.cgpaOrPercentage && errors.cgpaOrPercentage && (
                        <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.cgpaOrPercentage}</span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Segment 4: Reference / Referral Details (Unified Clean DB Schema: Name & 10-digit Mobile) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.22 }}
                  className="space-y-4 pt-2 border-t border-[var(--border-default)]"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] font-mono block">
                    3. Reference & Referral (Optional)
                  </span>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Application Reference Type</label>
                    <CustomSelect
                      value={refType}
                      onChange={(val) => setRefType(val as any)}
                      options={REF_TYPE_OPTIONS}
                      widthClass="w-full"
                    />
                  </div>

                  <AnimatePresence>
                    {refType !== 'Direct' && (
                      <motion.div
                        key="referral-inputs"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-hidden"
                      >
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">
                            {refType === 'Internal' ? 'Referrer Employee Name *' : 'Referrer / Agency Name *'}
                          </label>
                          <input
                            type="text"
                            placeholder={refType === 'Internal' ? 'e.g. Rahul Sharma' : 'e.g. ABC Staffing / Amit Verma'}
                            value={refName}
                            onChange={(e) => {
                              setRefName(e.target.value);
                              if (touched.refName) setErrors((prev) => ({ ...prev, refName: validateField('refName', e.target.value) }));
                            }}
                            onBlur={() => handleBlur('refName', refName)}
                            className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:outline-none ${
                              touched.refName && errors.refName
                                ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                                : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                            }`}
                          />
                          {touched.refName && errors.refName && (
                            <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.refName}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">
                            Referrer Mobile Number (10 Digits)
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="e.g. 9876543210"
                            value={refMobile}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/\D/g, '');
                              setRefMobile(clean);
                              if (touched.refMobile) setErrors((prev) => ({ ...prev, refMobile: validateField('refMobile', clean) }));
                            }}
                            onBlur={() => handleBlur('refMobile', refMobile)}
                            className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:outline-none ${
                              touched.refMobile && errors.refMobile
                                ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                                : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                            }`}
                          />
                          {touched.refMobile && errors.refMobile && (
                            <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.refMobile}</span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Segment 5: Experienced Details (Fluid Animated Expansion) */}
                <AnimatePresence>
                  {candidateType === 'Experienced' && (
                    <motion.div
                      key="experienced-fields"
                      initial={{ opacity: 0, height: 0, scale: 0.98 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4 pt-2 border-t border-[var(--border-default)] overflow-hidden"
                    >
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] font-mono block">
                        4. Work Experience & Compensation
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">Total Experience (Years) *</label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="40"
                            placeholder="e.g. 3.5"
                            value={experienceYears}
                            onChange={(e) => {
                              setExperienceYears(e.target.value);
                              if (touched.experienceYears) setErrors((prev) => ({ ...prev, experienceYears: validateField('experienceYears', e.target.value) }));
                            }}
                            onBlur={() => handleBlur('experienceYears', experienceYears)}
                            className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:outline-none ${
                              touched.experienceYears && errors.experienceYears
                                ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                                : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                            }`}
                          />
                          {touched.experienceYears && errors.experienceYears && (
                            <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.experienceYears}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">Current Company *</label>
                          <input
                            type="text"
                            placeholder="e.g. Infosys Ltd"
                            value={currentCompany}
                            onChange={(e) => {
                              setCurrentCompany(e.target.value);
                              if (touched.currentCompany) setErrors((prev) => ({ ...prev, currentCompany: validateField('currentCompany', e.target.value) }));
                            }}
                            onBlur={() => handleBlur('currentCompany', currentCompany)}
                            className={`w-full h-10 px-3.5 rounded-xl border bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:outline-none ${
                              touched.currentCompany && errors.currentCompany
                                ? 'border-[var(--status-danger-border)] focus:border-[var(--status-danger-border)]'
                                : 'border-[var(--border-default)] focus:border-[var(--accent-indigo)]'
                            }`}
                          />
                          {touched.currentCompany && errors.currentCompany && (
                            <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">{errors.currentCompany}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">Current CTC (₹ LPA)</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="e.g. 6.5"
                            value={currentCtc}
                            onChange={(e) => setCurrentCtc(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">Expected CTC (₹ LPA)</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="e.g. 9.0"
                            value={expectedCtc}
                            onChange={(e) => setExpectedCtc(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[var(--text-secondary)]">Notice Period</label>
                          <CustomSelect
                            value={noticePeriod}
                            onChange={setNoticePeriod}
                            options={NOTICE_PERIOD_OPTIONS}
                            widthClass="w-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Segment 6: Resume File Upload (Max 5MB) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.25 }}
                  className="space-y-2 pt-2 border-t border-[var(--border-default)]"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] font-mono block">
                    {candidateType === 'Experienced' ? '5. Resume Document' : '4. Resume Document'}
                  </span>

                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleResumeChange}
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                  />

                  {!resumeData ? (
                    <motion.div
                      whileHover={{ scale: 1.01, borderColor: 'var(--accent-indigo)' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => resumeInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-center cursor-pointer transition-colors space-y-1 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Icon name="upload" size="sm" />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        Click to upload or drag & drop Resume
                      </span>
                      <span className="text-[10.5px] text-[var(--text-tertiary)] block">
                        PDF, DOCX, DOC format (Max 5MB)
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-xl bg-[var(--accent-indigo-dim)] border border-[var(--border-default)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-indigo)] text-white flex items-center justify-center shrink-0">
                          <Icon name="file-text" size="xs" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                            {resumeData.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {resumeData.sizeStr} • Attached
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResumeData(null);
                          if (resumeInputRef.current) resumeInputRef.current.value = '';
                        }}
                        className="text-xs font-bold text-[var(--status-danger-text)] hover:underline cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </motion.div>
                  )}

                  {fileErrors.resume && (
                    <span className="text-[10.5px] font-semibold text-[var(--status-danger-text)] block">
                      {fileErrors.resume}
                    </span>
                  )}
                </motion.div>

                {/* Submit CTA with Tactile Hover & Tap Feedback */}
                <motion.button
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isRegistering}
                  className="group w-full h-11 sm:h-12 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                >
                  {isRegistering ? (
                    <>
                      <Icon name="spinner" size="xs" className="animate-spin" />
                      <span>Registering Candidate...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit & Proceed to Aptitude Test</span>
                      <Icon name="arrow-right" size="xs" className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              /* ── Clean Post-Registration Screen with Celebratory Spring Animation ── */
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.9, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="space-y-6 text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--status-success)] text-white shadow-xl"
                >
                  <Icon name="check" size="md" />
                </motion.div>

                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-heading">
                    Registration Successful! 🎉
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                    Welcome, <span className="font-bold text-[var(--text-primary)]">{registeredResult.firstName} {registeredResult.lastName}</span>. Your details have been registered.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] text-left flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="info" size="xs" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-[var(--text-primary)] block">Round 1: Aptitude Assessment</span>
                    <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                      Click the button below to start your online aptitude test immediately. Upon completion, the HR team will review your score.
                    </p>
                  </div>
                </motion.div>

                {/* Direct Launch CTA */}
                <motion.button
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/exam?code=${encodeURIComponent(registeredResult.candidateCode || '')}&pass=${encodeURIComponent(registeredResult.passcode || '1234')}`
                    )
                  }
                  className="group w-full h-12 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 flex items-center justify-center gap-2"
                >
                  <span>Start Round 1: Aptitude Test</span>
                  <Icon name="arrow-right" size="xs" className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { useRegisterCandidateViaQRMutation } from '@/store/services/api';

interface DriveInfo {
  code: string;
  vacancyId?: number;
  vacancyTitle?: string;
  venueName?: string;
  isOpen?: boolean;
  message?: string;
}

interface CandidateQRRegistrationFormProps {
  driveInfo: DriveInfo;
}

export const CandidateQRRegistrationForm: React.FC<CandidateQRRegistrationFormProps> = ({ driveInfo }) => {
  const [registerCandidate, { isLoading }] = useRegisterCandidateViaQRMutation();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Candidate type: Fresher vs Experienced
  const [isFresher, setIsFresher] = useState<boolean>(false);

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  const [highestQualification, setHighestQualification] = useState('B.Tech / B.E.');
  const [totalExperienceYears, setTotalExperienceYears] = useState<string>('0');
  const [currentCTC, setCurrentCTC] = useState<string>('');
  const [expectedCTC, setExpectedCTC] = useState<string>('');
  const [noticePeriodDays, setNoticePeriodDays] = useState<string>('30');

  // Validation & Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredCandidate, setRegisteredCandidate] = useState<any>(null);

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      newErrors.phone = 'Phone must be exactly 10 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2 & Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: Record<string, string> = {};
    if (!isFresher) {
      const expNum = parseFloat(totalExperienceYears);
      if (isNaN(expNum) || expNum < 0) {
        newErrors.totalExperienceYears = 'Please enter a valid experience (years).';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        code: driveInfo.code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        currentLocation: currentLocation.trim() || undefined,
        highestQualification: highestQualification || undefined,
        totalExperienceYears: isFresher ? 0 : parseFloat(totalExperienceYears) || 0,
        currentCTC: !isFresher && currentCTC ? parseFloat(currentCTC) : undefined,
        expectedCTC: expectedCTC ? parseFloat(expectedCTC) : undefined,
        noticePeriodDays: !isFresher && noticePeriodDays ? parseInt(noticePeriodDays, 10) : undefined,
      };

      const res = await registerCandidate(payload).unwrap();
      if (res?.data) {
        setRegisteredCandidate(res.data);
      } else {
        // Fallback simulated success object if mock endpoint wrapper
        setRegisteredCandidate({
          candidateCode: `CND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          vacancyTitle: driveInfo.vacancyTitle || 'Walk-in Drive Vacancy',
          currentStage: 'Registered',
          status: 'Applied',
        });
      }
    } catch (err: any) {
      const serverMsg = err?.data?.message || err?.message || 'Registration failed. Please check your details and try again.';
      setSubmitError(serverMsg);
    }
  };

  // ----------------------------------------------------
  // CONFIRMATION VIEW (Post Registration Success)
  // ----------------------------------------------------
  if (registeredCandidate) {
    return (
      <div className="w-full max-w-md mx-auto bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] shadow-xl overflow-hidden p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-[var(--status-success-bg)] text-[var(--status-success)] flex items-center justify-center mx-auto mb-4 border border-[var(--status-success-border)]">
          <Icon name="check-circle" size="xl" />
        </div>

        <span className="px-3 py-1 rounded-[var(--radius-full)] text-[11px] font-bold bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)] uppercase tracking-wider">
          Registration Complete
        </span>

        <h2 className="text-xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight mt-3">
          Welcome, {registeredCandidate.firstName}!
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 font-sans">
          You have successfully registered for the Walk-in Recruitment Drive.
        </p>

        {/* Candidate Registration Token Badge */}
        <div className="my-5 p-4 rounded-[var(--radius-xl)] bg-[var(--surface-2)] border border-[var(--border-default)] shadow-xs text-left">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--accent-indigo)] font-mono">
            Candidate Token ID
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-mono tracking-tight mt-0.5">
            {registeredCandidate.candidateCode || 'CND-2026-1042'}
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--border-soft)] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[11px] text-[var(--text-tertiary)] block">Vacancy</span>
              <span className="font-bold text-[var(--text-primary)] truncate block">
                {registeredCandidate.vacancyTitle || driveInfo.vacancyTitle || 'Software Engineer'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-tertiary)] block">Drive Venue</span>
              <span className="font-bold text-[var(--text-primary)] truncate block">
                {driveInfo.venueName || 'Main Assessment Center'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--border-soft)] text-left text-xs text-[var(--text-secondary)] space-y-1.5 mb-6">
          <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Icon name="info" size="xs" />
            <span>Next Steps at the Venue:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11.5px] text-[var(--text-tertiary)]">
            <li>Show this Registration Token to the coordinators at the entrance.</li>
            <li>You will receive your computer node assignment for Round 1 assessment.</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => {
            setRegisteredCandidate(null);
            setCurrentStep(1);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
          }}
          className="w-full h-11 rounded-[var(--radius-xl)] text-xs font-bold bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Register Another Candidate</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // FORM WIZARD VIEW
  // ----------------------------------------------------
  return (
    <div className="w-full max-w-md mx-auto bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] shadow-xl overflow-hidden">
      {/* Header Banner using colors.css tokens */}
      <div className="bg-gradient-to-r from-[var(--accent-indigo)] via-[var(--accent-indigo-hover)] to-[var(--accent-violet)] p-5 text-[var(--text-on-accent)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-[var(--radius-full)] text-[10.5px] font-bold bg-white/20 text-[var(--text-on-accent)] backdrop-blur-xs uppercase tracking-wider">
            Walk-In Registration
          </span>
          <span className="text-[11px] font-mono opacity-90">Ref: {driveInfo.code}</span>
        </div>

        <h1 className="text-xl font-extrabold font-heading tracking-tight text-[var(--text-on-accent)]">
          {driveInfo.vacancyTitle || 'Walk-in Hiring Drive'}
        </h1>
        <p className="text-xs opacity-90 font-sans mt-0.5 flex items-center gap-1 text-[var(--text-on-accent)]">
          <Icon name="map-pin" size="xs" />
          <span>{driveInfo.venueName || 'Main Assessment Center'}</span>
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="px-5 py-3 border-b border-[var(--border-default)] bg-[var(--surface-2)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              currentStep === 1
                ? 'bg-[var(--accent-indigo)] text-[var(--text-on-accent)]'
                : 'bg-[var(--status-success)] text-[var(--text-on-accent)]'
            }`}
          >
            {currentStep === 1 ? '1' : '✓'}
          </span>
          <span className="font-bold text-[var(--text-primary)]">
            {currentStep === 1 ? 'Step 1: Contact Details' : 'Step 2: Profile & Experience'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-tertiary)] font-bold">
          Step {currentStep} of 2
        </span>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="m-4 p-3 rounded-[var(--radius-xl)] bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger-text)] text-xs flex items-start gap-2">
          <Icon name="alert-triangle" size="xs" className="shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* STEP 1: CONTACT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                First Name <span className="text-[var(--accent-red)]">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors({ ...errors, firstName: '' });
                }}
                placeholder="e.g. Rahul"
                className={`w-full h-10 px-3.5 rounded-[var(--radius-xl)] border bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none transition-all ${
                  errors.firstName
                    ? 'border-[var(--status-danger-border)] text-[var(--status-danger-text)] focus:ring-2 focus:ring-[var(--accent-red-dim)]'
                    : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)]'
                }`}
              />
              {errors.firstName && (
                <span className="text-[11px] text-[var(--status-danger-text)] font-medium mt-0.5 block">{errors.firstName}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Last Name <span className="text-[var(--accent-red)]">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors({ ...errors, lastName: '' });
                }}
                placeholder="e.g. Sharma"
                className={`w-full h-10 px-3.5 rounded-[var(--radius-xl)] border bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none transition-all ${
                  errors.lastName
                    ? 'border-[var(--status-danger-border)] text-[var(--status-danger-text)] focus:ring-2 focus:ring-[var(--accent-red-dim)]'
                    : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)]'
                }`}
              />
              {errors.lastName && (
                <span className="text-[11px] text-[var(--status-danger-text)] font-medium mt-0.5 block">{errors.lastName}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Email Address <span className="text-[var(--accent-red)]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="e.g. rahul.sharma@example.com"
                className={`w-full h-10 px-3.5 rounded-[var(--radius-xl)] border bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none transition-all ${
                  errors.email
                    ? 'border-[var(--status-danger-border)] text-[var(--status-danger-text)] focus:ring-2 focus:ring-[var(--accent-red-dim)]'
                    : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)]'
                }`}
              />
              {errors.email && (
                <span className="text-[11px] text-[var(--status-danger-text)] font-medium mt-0.5 block">{errors.email}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Mobile Number (10 Digits) <span className="text-[var(--accent-red)]">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhone(val);
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="9876543210"
                className={`w-full h-10 px-3.5 rounded-[var(--radius-xl)] border bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none font-mono transition-all ${
                  errors.phone
                    ? 'border-[var(--status-danger-border)] text-[var(--status-danger-text)] focus:ring-2 focus:ring-[var(--accent-red-dim)]'
                    : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)]'
                }`}
              />
              {errors.phone && (
                <span className="text-[11px] text-[var(--status-danger-text)] font-medium mt-0.5 block">{errors.phone}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Current Location / City
              </label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. Pune, Mumbai, Bangalore"
                className="w-full h-10 px-3.5 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)] transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (validateStep1()) {
                  setCurrentStep(2);
                }
              }}
              className="w-full h-11 rounded-[var(--radius-xl)] text-xs font-bold bg-gradient-to-r from-[var(--accent-indigo)] to-[var(--accent-violet)] text-[var(--text-on-accent)] shadow-md hover:from-[var(--accent-indigo-hover)] hover:to-[var(--accent-violet-hover)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>Next Step: Profile Details</span>
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>
        )}

        {/* STEP 2: EDUCATION & PROFILE */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Candidate Type Selector */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                Candidate Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFresher(true);
                    setTotalExperienceYears('0');
                  }}
                  className={`h-11 rounded-[var(--radius-xl)] border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFresher
                      ? 'border-[var(--accent-indigo)] bg-[var(--surface-selected)] text-[var(--accent-indigo)] shadow-2xs'
                      : 'border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span className="text-base">🎓</span>
                  <span>Fresher (0 Yrs)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFresher(false);
                    if (totalExperienceYears === '0') setTotalExperienceYears('1');
                  }}
                  className={`h-11 rounded-[var(--radius-xl)] border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isFresher
                      ? 'border-[var(--accent-indigo)] bg-[var(--surface-selected)] text-[var(--accent-indigo)] shadow-2xs'
                      : 'border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span className="text-base">💼</span>
                  <span>Experienced</span>
                </button>
              </div>
            </div>

            {/* Highest Qualification */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Highest Qualification <span className="text-[var(--accent-red)]">*</span>
              </label>
              <select
                value={highestQualification}
                onChange={(e) => setHighestQualification(e.target.value)}
                className="w-full h-10 px-3.5 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)] transition-all"
              >
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="BCA / MCA">BCA / MCA</option>
                <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                <option value="B.Sc / M.Sc">B.Sc / M.Sc</option>
                <option value="Diploma">Diploma in Engineering</option>
                <option value="MBA / PGDM">MBA / PGDM</option>
                <option value="Other Graduate">Other Graduate Degree</option>
              </select>
            </div>

            {/* Experienced Fields */}
            {!isFresher && (
              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Total Experience (Years) <span className="text-[var(--accent-red)]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={totalExperienceYears}
                    onChange={(e) => setTotalExperienceYears(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full h-10 px-3.5 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)] transition-all font-mono"
                  />
                  {errors.totalExperienceYears && (
                    <span className="text-[11px] text-[var(--status-danger-text)] font-medium mt-0.5 block">
                      {errors.totalExperienceYears}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Current CTC (LPA)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={currentCTC}
                      onChange={(e) => setCurrentCTC(e.target.value)}
                      placeholder="e.g. 6.5"
                      className="w-full h-10 px-3.5 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Notice Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={noticePeriodDays}
                      onChange={(e) => setNoticePeriodDays(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full h-10 px-3.5 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)] transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Expected CTC (Shared) */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Expected CTC (LPA)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={expectedCTC}
                onChange={(e) => setExpectedCTC(e.target.value)}
                placeholder="e.g. 8.0"
                className="w-full h-10 px-3.5 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--focus-glow)] transition-all font-mono"
              />
            </div>

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-11 px-4 rounded-[var(--radius-xl)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-11 rounded-[var(--radius-xl)] text-xs font-bold bg-gradient-to-r from-[var(--accent-indigo)] to-[var(--accent-violet)] text-[var(--text-on-accent)] shadow-md hover:from-[var(--accent-indigo-hover)] hover:to-[var(--accent-violet-hover)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Icon name="spinner" size="xs" className="animate-spin" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" size="xs" />
                    <span>Complete Walk-In Registration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

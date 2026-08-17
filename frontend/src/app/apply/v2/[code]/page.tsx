'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import {
  useRecordQRScanQuery,
  useRegisterCandidateViaQRMutation,
} from '@/store/services/api';

export default function ApplyV2Page() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || '';

  const { data: qrRes, isLoading: isQRLoading } = useRecordQRScanQuery(code, { skip: !code });
  const qrData = qrRes?.data;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState<number>(0);
  const [qualification, setQualification] = useState('B.Tech / B.E.');

  const [registerCandidate, { isLoading: isRegistering }] = useRegisterCandidateViaQRMutation();
  const [registeredResult, setRegisteredResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await registerCandidate({
        code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        totalExperienceYears: Number(experience) || 0,
        highestQualification: qualification,
      }).unwrap();

      if (res.success && res.data) {
        setRegisteredResult(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Registration failed. Please verify your details.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500" />

        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-[var(--border-default)] bg-[var(--surface-2)] text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md mb-1">
            <Icon name="zap" size="md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-heading">
            {qrData?.vacancyTitle || 'Recruitment Drive Registration'}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] max-w-md mx-auto">
            {qrData?.venueName ? `Venue: ${qrData.venueName}` : 'Fast-Track Walk-in Registration & Online Assessment'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!registeredResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] text-xs font-semibold flex items-center gap-2">
                  <Icon name="alert-triangle" size="xs" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Aditya"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bhange"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aditya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Highest Qualification</label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                    <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                    <option value="B.Sc / M.Sc IT">B.Sc / M.Sc IT</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full h-11 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isRegistering ? (
                  <>
                    <Icon name="spinner" size="xs" className="animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check-circle" size="xs" />
                    <span>Register & Take Online Assessment</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg">
                <Icon name="check" size="md" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-emerald-700 font-heading">
                  Registration Confirmed!
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Welcome, {registeredResult.firstName} {registeredResult.lastName}. Your assessment credentials have been generated.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--surface-2)] border border-[var(--border-default)]">
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">Candidate Code</span>
                  <span className="text-sm font-mono font-black text-[var(--text-primary)]">
                    {registeredResult.candidateCode || 'CAN-2026-LIVE'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">4-Digit Passcode</span>
                  <span className="text-sm font-mono font-black text-amber-600">
                    {registeredResult.passcode || '1234'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/exam/v2?code=${registeredResult.candidateCode || ''}&pass=${registeredResult.passcode || '1234'}`
                  )
                }
                className="w-full h-11 rounded-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Icon name="zap" size="xs" />
                <span>⚡ Launch Online Test Portal Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

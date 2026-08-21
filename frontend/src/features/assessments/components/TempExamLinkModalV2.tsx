'use client';

import React, { useState } from 'react';
import { Icon, EnterpriseModal } from '@/design-system';
import {
  useGenerateTempExamPassV2Mutation,
  useGetMasterDataByCategoryQuery,
  type TempExamPassData,
} from '@/store/services/api';
import { useAppDispatch, notifySuccess, notifyError } from '@/store';
import { getAppOrigin } from '@/lib/utils/url-helper';

interface TempExamLinkModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  defaultVacancyId?: number;
}

export const TempExamLinkModalV2: React.FC<TempExamLinkModalV2Props> = ({
  isOpen,
  onClose,
  defaultVacancyId,
}) => {
  const dispatch = useAppDispatch();
  const { data: rolesRes } = useGetMasterDataByCategoryQuery('roles', { skip: !isOpen });
  const roles = rolesRes?.data || [];

  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [validityHours, setValidityHours] = useState<number>(24);

  const [generatePass, { isLoading }] = useGenerateTempExamPassV2Mutation();
  const [passData, setPassData] = useState<TempExamPassData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      dispatch(notifyError({ title: 'Validation Error', description: 'Please provide the candidate name.' }));
      return;
    }

    try {
      const res = await generatePass({
        candidateName: candidateName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        vacancyId: defaultVacancyId,
        masterRoleId: selectedRoleId > 0 ? selectedRoleId : undefined,
        validityHours,
      }).unwrap();

      if (res.success && res.data) {
        setPassData(res.data);
        dispatch(
          notifySuccess({
            title: 'Spot Pass Generated',
            description: `24-Hour test link generated for ${res.data.candidateName}.`,
          })
        );
      }
    } catch (err: any) {
      dispatch(
        notifyError({
          title: 'Generation Failed',
          description: err?.data?.message || 'Failed to generate temporary exam pass.',
        })
      );
    }
  };

  const resolvedExamUrl = React.useMemo(() => {
    if (!passData) return '';
    if (passData.candidateCode && passData.passcode) {
      return `${getAppOrigin()}/exam?code=${passData.candidateCode}&pass=${passData.passcode}`;
    }
    return passData.examUrl || '';
  }, [passData]);

  const handleCopy = () => {
    if (resolvedExamUrl) {
      navigator.clipboard.writeText(resolvedExamUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      dispatch(notifySuccess({ title: 'Copied', description: 'Exam link copied to clipboard.' }));
    }
  };

  const handleReset = () => {
    setPassData(null);
    setCandidateName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={handleReset}
      title="Instant Spot Exam Pass"
      subtitle="Generate a 24-hour test link for walk-ins without setting up a vacancy."
      icon="link"
      maxWidth="lg"
      hideFooter
    >
      <div>
        {!passData ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Candidate Full Name *</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Aditya Bhange"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Email Address</label>
                <input
                  type="email"
                  placeholder="aditya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Test Role Track</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                >
                  <option value={0}>Auto-Detect / General Track</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Pass Validity</label>
                <select
                  value={validityHours}
                  onChange={(e) => setValidityHours(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                >
                  <option value={12}>12 Hours (Same Day)</option>
                  <option value={24}>24 Hours (Standard)</option>
                  <option value={48}>48 Hours (Weekend)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={handleReset}
                className="h-10 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isLoading ? 'Generating…' : 'Generate Spot Pass'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Icon name="check-circle" size="md" />
              </div>
              <h3 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-heading">
                Spot Pass Ready for {passData.candidateName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Expires: {new Date(passData.expiresAtUtc).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)]">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">Candidate Code</span>
                <span className="text-sm font-mono font-black text-[var(--text-primary)]">{passData.candidateCode}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)]">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">4-Digit Passcode</span>
                <span className="text-sm font-mono font-black text-amber-500">{passData.passcode}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Instant Exam URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resolvedExamUrl}
                  className="flex-1 h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-primary)]'
                  }`}
                >
                  <Icon name={copied ? 'check' : 'copy'} size="xs" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setPassData(null)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline cursor-pointer"
              >
                Generate Another
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer shadow-md active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </EnterpriseModal>
  );
};

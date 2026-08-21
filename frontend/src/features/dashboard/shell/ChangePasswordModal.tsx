'use client';

import React, { useState, useEffect } from 'react';
import {
  Input,
  PinInput,
  Icon,
  EnterpriseModal,
} from '@/design-system';
import { toast } from '@/design-system/feedback/toast';

import { useChangePasswordMutation, useChangePinMutation } from '@/store/services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDirector?: boolean;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, isDirector = false }) => {
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // PIN fields (4-Digit Director PIN)
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [maskPin, setMaskPin] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [changePasswordApi] = useChangePasswordMutation();
  const [changePinApi] = useChangePinMutation();

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setCurrentPin(''); setNewPin(''); setConfirmPin('');
      setError(null); setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isDirector) {
      if (!currentPin) { setError('Please enter your current 4-digit PIN.'); return; }
      if (!newPin) { setError('Please enter a new 4-digit PIN.'); return; }
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setError('New PIN must be exactly 4 numeric digits.'); return; }
      if (newPin !== confirmPin) { setError('New PIN and confirm PIN do not match.'); return; }
    } else {
      if (!currentPassword) { setError('Please enter your current password.'); return; }
      if (!newPassword || newPassword.length < 6) { setError('New password must be at least 6 characters long.'); return; }
      if (newPassword !== confirmPassword) { setError('New password and confirm password do not match.'); return; }
    }

    setIsSubmitting(true);
    try {
      if (isDirector) {
        await changePinApi({ currentPin, newPin }).unwrap();
        toast.success('Director 4-digit PIN updated successfully!');
      } else {
        await changePasswordApi({ currentPassword, newPassword }).unwrap();
        toast.success('Password updated successfully!');
      }
      onClose();
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to update credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isDirector ? 'Change Director PIN' : 'Change Password';
  const subtitle = isDirector
    ? 'Update your 4-digit executive security PIN'
    : 'Update your account credentials securely';

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={isDirector ? 'shield' : 'lock'}
      iconColorClass={isDirector ? 'text-amber-500' : 'text-[var(--accent-indigo)]'}
      iconBgClass={isDirector ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[var(--accent-indigo)]/10 border-[var(--accent-indigo)]/30'}
      maxWidth="md"
      submitText={isDirector ? 'Update 4-Digit PIN' : 'Update Password'}
      cancelText="Cancel"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <Icon name="alert-triangle" size="xs" className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {isDirector ? (
          /* ── 4-Digit PIN Mode ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Security Keypad Mode</span>
              <button
                type="button"
                onClick={() => setMaskPin(!maskPin)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Icon name={maskPin ? 'eye' : 'unlock'} size="xs" />
                <span>{maskPin ? 'Show Digits' : 'Mask Digits'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-center">
                Current 4-Digit PIN
              </label>
              <PinInput length={4} value={currentPin} onChange={setCurrentPin} masked={maskPin} autoFocus />
            </div>

            <div className="pt-2 border-t border-[var(--border-default)]">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-center">
                New 4-Digit PIN
              </label>
              <PinInput length={4} value={newPin} onChange={setNewPin} masked={maskPin} />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-center">
                Confirm New PIN
              </label>
              <PinInput length={4} value={confirmPin} onChange={setConfirmPin} masked={maskPin} />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
              <Icon name="info" size="xs" className="shrink-0 mt-0.5" />
              <span>Your PIN must be exactly <strong>4 numeric digits</strong> (e.g. 1234) and is required for secure candidate review and offer rollouts.</span>
            </div>
          </div>
        ) : (
          /* ── Password Mode ── */
          <div className="space-y-3.5">
            <Input
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              sizeToken="lg"
              rightSlot={
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                  <Icon name={showCurrent ? 'unlock' : 'lock'} size="xs" />
                </button>
              }
            />

            <Input
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 chars)"
              sizeToken="lg"
              rightSlot={
                <button type="button" onClick={() => setShowNew(!showNew)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                  <Icon name={showNew ? 'unlock' : 'lock'} size="xs" />
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              sizeToken="lg"
              rightSlot={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                  <Icon name={showConfirm ? 'unlock' : 'lock'} size="xs" />
                </button>
              }
            />
          </div>
        )}
      </div>
    </EnterpriseModal>
  );
};

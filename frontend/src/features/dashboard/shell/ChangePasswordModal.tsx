'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
  Input,
  PinInput,
  Icon,
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

  // PIN fields
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

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
      if (!currentPin) { setError('Please enter your current PIN.'); return; }
      if (!newPin) { setError('Please enter a new PIN.'); return; }
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
        toast.success('PIN updated successfully in SQL Server!');
      } else {
        await changePasswordApi({ currentPassword, newPassword }).unwrap();
        toast.success('Password updated successfully in SQL Server!');
      }
      onClose();
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to update credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isDirector ? 'Change Security PIN' : 'Change Password';
  const subtitle = isDirector
    ? 'Update your 6-digit Director security PIN'
    : 'Update your account credentials securely';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDirector ? 'bg-amber-100 text-amber-600' : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)]'}`}>
              <Icon name={isDirector ? 'shield' : 'lock'} size="sm" />
            </div>
            <DialogHeader className="mb-0 gap-0">
              <DialogTitle className="text-base font-bold font-heading">{title}</DialogTitle>
              <DialogDescription className="text-xs text-[var(--text-tertiary)]">{subtitle}</DialogDescription>
            </DialogHeader>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Icon name="x" size="sm" />
            </button>
          </DialogClose>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger-border,#feccae)] text-[var(--status-danger)] text-xs font-semibold flex items-center gap-2">
              <Icon name="alert-triangle" size="xs" className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isDirector ? (
            /* ── PIN Mode ── */
            <>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Current PIN</label>
                <PinInput value={currentPin} onChange={setCurrentPin} masked />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">New PIN</label>
                <PinInput value={newPin} onChange={setNewPin} masked />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Confirm New PIN</label>
                <PinInput value={confirmPin} onChange={setConfirmPin} masked />
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                Your PIN must be exactly 6 numeric digits and is used for high-privilege approvals.
              </p>
            </>
          ) : (
            /* ── Password Mode ── */
            <>
              <Input
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                sizeToken="lg"
                rightSlot={
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                    <Icon name="eye" size="xs" />
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
                    <Icon name="eye" size="xs" />
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
                    <Icon name="eye" size="xs" />
                  </button>
                }
              />
            </>
          )}

          {/* Action Buttons */}
          <DialogFooter className="pt-3 mt-0 border-t border-[var(--border-default)]">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              className={isDirector ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {isDirector ? 'Update PIN' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

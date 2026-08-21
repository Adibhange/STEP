'use client';

import React, { useState, useEffect } from 'react';
import { Icon, EnterpriseModal } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { useGenerateDirectorAccessLinkMutation } from '@/store/services/api';

export interface DirectorAccessShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
  candidateName: string;
  candidateCode: string;
  vacancyTitle: string;
}

export const DirectorAccessShareModal: React.FC<DirectorAccessShareModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  candidateCode,
  vacancyTitle,
}) => {
  const [generateLink, { isLoading }] = useGenerateDirectorAccessLinkMutation();
  const [copied, setCopied] = useState(false);
  const [generatedLinkData, setGeneratedLinkData] = useState<{
    token: string;
    accessUrl: string;
    expiresAt: string;
    isExisting?: boolean;
  } | null>(null);

  const fetchLink = (regenerate = false) => {
    if (!candidateId) return;
    generateLink({ candidateId, regenerate })
      .unwrap()
      .then((res) => {
        if (res?.data) setGeneratedLinkData(res.data);
      })
      .catch((err) => {
        toast.error('Failed to generate link', {
          description: err?.data?.message || 'Could not generate director access link.',
        });
      });
  };

  useEffect(() => {
    if (isOpen && candidateId) fetchLink(false);
    if (!isOpen) setGeneratedLinkData(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, candidateId]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const fullUrl = generatedLinkData
    ? generatedLinkData.accessUrl.startsWith('http')
      ? generatedLinkData.accessUrl
      : `${origin}${generatedLinkData.accessUrl.startsWith('/') ? '' : '/'}${generatedLinkData.accessUrl}`
    : '';

  const handleCopyLink = () => {
    if (!fullUrl) return;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Director Link Copied', {
        description: '24-hour PIN-protected access link copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRegenerate = () => {
    fetchLink(true);
    toast.success('Regenerating Link', {
      description: 'Old link revoked. A fresh 24-hour link is being created.',
    });
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Executive Review Candidate Access: ${candidateName} (${candidateCode})`);
    const body = encodeURIComponent(
      `Dear Director,\n\nPlease review candidate ${candidateName} (${candidateCode}) for the position of ${vacancyTitle}.\n\nAccess Link (Valid for 24 Hours):\n${fullUrl}\n\nSecurity Notice: You will be prompted to enter your Director PIN (4-digit) to access this profile directly.\n\nBest Regards,\nHR Recruitment Operations`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `*Director Candidate Review Gateway*\n\nCandidate: *${candidateName}* (${candidateCode})\nPosition: ${vacancyTitle}\n\n*Secure 24-Hour Access Link:*\n${fullUrl}\n\n_Note: Requires Director PIN to access._`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const formattedExpiry = generatedLinkData?.expiresAt
    ? new Date(generatedLinkData.expiresAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'In 24 Hours';

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Director Access Gateway"
      subtitle="Generate secure one-time gateway link for executive evaluation"
      icon="shield-check"
      iconColorClass="text-cyan-400"
      iconBgClass="bg-cyan-500/10 border-cyan-500/30"
      headerAction={
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          24h Expiry
        </span>
      }
      maxWidth="lg"
      hideFooter
    >
      <div className="flex flex-col gap-4">
        {/* Candidate Context Pill */}
        <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/30 font-heading">
              {candidateName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-[var(--text-primary)] truncate">
                {candidateName}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)] truncate">
                {candidateCode} • {vacancyTitle}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-default)] shrink-0">
            Direct Target
          </span>
        </div>

        {/* Gateway Link Input Field with Instant Copy */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
            <span>Director Access Link (24-Hour)</span>
            {generatedLinkData?.isExisting ? (
              <span className="text-[11px] text-amber-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Active — Existing Link Reused
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                New Link Generated
              </span>
            )}
          </label>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative flex items-center bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl overflow-hidden px-3 h-10 shadow-2xs">
              {isLoading ? (
                <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                  <Icon name="spinner" size="xs" className="animate-spin text-cyan-400" />
                  <span>Checking active links…</span>
                </div>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  className="w-full text-xs font-mono text-[var(--text-primary)] bg-transparent outline-none select-all"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={isLoading || !fullUrl}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black active:scale-95'
              }`}
            >
              <Icon name={copied ? 'check' : 'clipboard-check'} size="xs" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {generatedLinkData?.isExisting && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isLoading}
                title="Revoke existing link and generate a fresh 24-hour link"
                className="h-10 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black active:scale-95"
              >
                <Icon name="refresh" size="xs" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </div>

        {/* Expiry & Security Callout */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Icon name="lock" size="xs" />
            <span>Security & Expiration Policy</span>
          </div>
          <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
            • <strong className="text-[var(--text-primary)]">24-Hour Expiration:</strong> Valid until{' '}
            <span className="font-mono text-cyan-300 font-semibold">{formattedExpiry}</span>. Auto-expires after that.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={!fullUrl}
            className="flex-1 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Icon name="phone" size="xs" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={!fullUrl}
            className="flex-1 h-9 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Icon name="mail" size="xs" />
            <span>Send via Email</span>
          </button>
        </div>
      </div>
    </EnterpriseModal>
  );
};

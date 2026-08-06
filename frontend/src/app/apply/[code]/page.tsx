'use client';

import React, { use } from 'react';
import { useRecordQRScanQuery, useGetVacancyByIdQuery } from '@/store/services/api';
import { CandidateQRRegistrationForm } from '@/features/candidates';
import { Icon } from '@/design-system';

interface ApplyPageProps {
  params: Promise<{ code: string }>;
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  // Try QR scan lookup first
  const { data: qrData, isLoading: isQrLoading } = useRecordQRScanQuery(code, {
    skip: !code,
  });

  // If code is numeric (Vacancy ID), fallback lookup
  const isNumericCode = /^\d+$/.test(code);
  const { data: vacancyData, isLoading: isVacLoading } = useGetVacancyByIdQuery(Number(code), {
    skip: !isNumericCode,
  });

  const isLoading = isQrLoading || (isNumericCode && isVacLoading);

  // Determine drive info from API response or fallback
  const scanResult = qrData?.data;
  const vacancyResult = vacancyData?.data;

  const driveInfo = {
    code: code || 'WALK-IN',
    vacancyId: scanResult?.vacancyId || vacancyResult?.id || 1,
    vacancyTitle: scanResult?.vacancyTitle || vacancyResult?.title || 'Senior Software Engineer (Walk-in Drive)',
    venueName: scanResult?.venueName || vacancyResult?.hiringLocation || 'Pune Assessment Hub (Hinjawadi Phase 2)',
    isOpen: scanResult?.isOpenForRegistration ?? true,
    message: scanResult?.message ?? undefined,
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows referencing design system accent tokens */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[var(--accent-indigo-dim)] rounded-full blur-3xl pointer-events-none opacity-70" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[var(--accent-violet-dim)] rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-[var(--accent-blue-dim)] rounded-full blur-3xl pointer-events-none opacity-50" />

      {/* Header Bar */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[var(--radius-xl)] bg-gradient-to-tr from-[var(--accent-indigo)] to-[var(--accent-violet)] flex items-center justify-center text-[var(--text-on-accent)] shadow-md font-bold">
            <Icon name="briefcase" size="sm" />
          </div>
          <div>
            <span className="text-sm font-black font-heading tracking-tight text-[var(--text-primary)] block leading-tight">
              STEP
            </span>
            <span className="text-[10.5px] text-[var(--text-tertiary)] font-sans block">Sthapatya Talent Excellence Platform</span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-[var(--radius-full)] text-[10.5px] font-bold bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20 flex items-center gap-1.5 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] animate-pulse" />
          <span>SCIPL Walk-In Drive</span>
        </span>
      </header>

      {/* Main Form Content */}
      <main className="w-full max-w-md mx-auto my-auto py-6 relative z-10">
        {isLoading ? (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] p-8 text-center shadow-xl">
            <Icon name="spinner" size="lg" className="animate-spin text-[var(--accent-indigo)] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">Loading Recruitment Drive Info...</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 font-sans">Verifying QR registration code ({code})</p>
          </div>
        ) : driveInfo.isOpen === false ? (
          <div className="bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] rounded-[var(--radius-2xl)] p-6 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-red-dim)] text-[var(--status-danger-text)] flex items-center justify-center mx-auto mb-3">
              <Icon name="alert-triangle" size="md" />
            </div>
            <h3 className="text-base font-bold text-[var(--status-danger-title)] font-heading">Registration Closed</h3>
            <p className="text-xs text-[var(--status-danger-text)] mt-1 font-sans">
              {driveInfo.message || 'This walk-in recruitment drive is no longer accepting registrations.'}
            </p>
          </div>
        ) : (
          <CandidateQRRegistrationForm driveInfo={driveInfo} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-4 text-[11px] text-[var(--text-tertiary)] relative z-10 border-t border-[var(--border-soft)] mt-4">
        <span>© 2026 Sthapatya Consultants (I) Pvt. Ltd. (SCIPL) • STEP</span>
      </footer>
    </div>
  );
}

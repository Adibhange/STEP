'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CandidateExamPortal } from '@/features/assessments/components/CandidateExamPortal';
import { Icon } from '@/design-system';

function ExamContent() {
  const searchParams = useSearchParams();
  const candidateIdParam = searchParams?.get('id');
  const tokenParam = searchParams?.get('token');
  const testModeParam = searchParams?.get('mode');

  // Parameter Validation: If both token AND candidateId are missing, reject invalid access
  if (!tokenParam && !candidateIdParam) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] flex items-center justify-center p-6 text-center">
        <div className="bg-[var(--surface-1)] border border-[var(--status-danger-border)] rounded-[var(--radius-2xl)] p-8 shadow-2xl max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)] flex items-center justify-center mx-auto mb-4">
            <Icon name="alert-triangle" size="lg" />
          </div>
          <h2 className="text-lg font-extrabold text-[var(--status-danger-title)] font-heading">
            Invalid Assessment Access
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2 font-sans leading-relaxed">
            No valid exam session token or candidate ID was found in the link. Please use the official exam link sent to your registered email or venue station.
          </p>
        </div>
      </div>
    );
  }

  const isOfficeMode = testModeParam === 'office' || (searchParams?.has('token') && testModeParam !== 'home');
  const testMode = isOfficeMode ? 'In Office' : 'From Home';

  return (
    <CandidateExamPortal
      sessionToken={tokenParam || ''}
      testMode={testMode}
      candidateCode={candidateIdParam || ''}
    />
  );
}

export default function CandidateExamPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Loading Assessment Portal...</div>}>
      <ExamContent />
    </Suspense>
  );
}

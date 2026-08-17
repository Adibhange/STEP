'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CandidateExamPortalV2 } from '@/features/assessments/components/v2/CandidateExamPortalV2';

function ExamContent() {
  const searchParams = useSearchParams();
  const candidateCode = searchParams.get('code') || '';
  const passcode = searchParams.get('pass') || '';

  return <CandidateExamPortalV2 initialCandidateCode={candidateCode} initialPasscode={passcode} />;
}

export default function ExamV2Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
          <div className="text-xs font-bold text-[var(--text-tertiary)] animate-pulse">
            Loading STEP V2 Assessment Portal...
          </div>
        </div>
      }
    >
      <ExamContent />
    </Suspense>
  );
}

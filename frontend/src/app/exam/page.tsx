'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CandidateExamPortal } from '@/features/assessments/components/CandidateExamPortal';

function ExamContent() {
  const searchParams = useSearchParams();
  const candidateIdParam = searchParams?.get('id') || 'CND-2026-1042';
  const tokenParam = searchParams?.get('token') || 'EXAM-MUM-2026-X89';
  const testModeParam = searchParams?.get('mode');

  const isOfficeMode = testModeParam === 'office' || (searchParams?.has('token') && testModeParam !== 'home');
  const testMode = isOfficeMode ? 'In Office' : 'From Home';

  return (
    <CandidateExamPortal
      sessionToken={tokenParam}
      testMode={testMode}
      candidateCode={candidateIdParam}
      candidateName="Anjali Sharma"
      candidateEmail="anjali.sharma@email.com"
      vacancyTitle="Frontend Developer - React (V123)"
      paperTitle="Advanced React 19 & Next.js Enterprise Assessment"
      durationMinutes={60}
      passingPercentage={70}
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

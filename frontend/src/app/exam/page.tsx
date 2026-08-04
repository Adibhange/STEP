'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { CandidateExamPortal } from '@/features/assessments/components/CandidateExamPortal';

export default function CandidateExamPage() {
  const searchParams = useSearchParams();
  const candidateIdParam = searchParams?.get('id') || 'CND-2026-1042';
  const tokenParam = searchParams?.get('token') || 'EXAM-MUM-2026-X89';
  const testModeParam = searchParams?.get('mode');

  // Determine test execution mode based on URL query parameters
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

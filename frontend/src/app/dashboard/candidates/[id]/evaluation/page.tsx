'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CandidateAssessmentEvaluationView } from '@/features/assessments/components/CandidateAssessmentEvaluationView';

export default function CandidateAssessmentEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '1';

  return (
    <CandidateAssessmentEvaluationView
      candidateId={id}
      candidateName="Anjali Sharma"
      candidateCode="CND-2026-1042"
      vacancyTitle="Senior React / Next.js Developer"
      onBack={() => router.push(`/dashboard/candidates/${id}`)}
    />
  );
}

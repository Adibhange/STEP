'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CandidateAssessmentEvaluationView } from '@/features/assessments/components/CandidateAssessmentEvaluationView';
import { useGetCandidateByIdQuery } from '@/store/services/api';
import { Icon } from '@/design-system';

export default function CandidateAssessmentEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = (params?.id as string) || '';
  const candidateId = Number(idParam);

  const { data: candidateRes, isLoading, isError } = useGetCandidateByIdQuery(candidateId, { skip: !candidateId });
  const candidate = candidateRes?.data;

  const handleBack = () => router.push(`/dashboard/candidates/${idParam}`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--canvas,#f7f8fb) flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
          <Icon name="spinner" size="lg" className="animate-spin text-blue-600" />
          <span>Loading candidate assessment…</span>
        </div>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="min-h-screen bg-(--canvas,#f7f8fb) flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-xl max-w-md w-full flex flex-col items-center gap-3">
          <Icon name="alert-triangle" size="lg" className="text-rose-600" />
          <h2 className="text-lg font-extrabold text-rose-700 font-heading">Candidate Not Found</h2>
          <p className="text-xs text-slate-500">
            This candidate could not be loaded. They may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  // Find all assessment rounds (e.g. Aptitude & Technical)
  const assessmentRounds = (candidate.pipelineProgress || []).filter(
    (p: any) => p.roundType === 'Assessment' && p.candidateExamSessionId
  );

  const sessionParam = searchParams?.get('session');
  const roundParam = searchParams?.get('round');

  let targetSessionId: number | null = null;
  if (sessionParam) {
    targetSessionId = Number(sessionParam);
  } else if (roundParam === 'aptitude') {
    const apt = assessmentRounds.find((r: any) => r.roundTitle?.toLowerCase().includes('aptitude'));
    targetSessionId = apt?.candidateExamSessionId ?? null;
  } else if (roundParam === 'technical') {
    const tech = assessmentRounds.find((r: any) => !r.roundTitle?.toLowerCase().includes('aptitude'));
    targetSessionId = tech?.candidateExamSessionId ?? null;
  }

  if (!targetSessionId && assessmentRounds.length > 0) {
    targetSessionId = assessmentRounds[0].candidateExamSessionId;
  }

  return (
    <CandidateAssessmentEvaluationView
      candidateId={idParam}
      candidateName={`${candidate.firstName} ${candidate.lastName}`.trim()}
      candidateCode={candidate.candidateCode}
      vacancyTitle={candidate.vacancyTitle}
      candidateExamSessionId={targetSessionId}
      assessmentRounds={assessmentRounds}
      onBack={handleBack}
    />
  );
}

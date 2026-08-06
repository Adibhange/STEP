'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CandidateAssessmentEvaluationView } from '@/features/assessments/components/CandidateAssessmentEvaluationView';
import { useGetCandidateByIdQuery } from '@/store/services/api';
import { Icon } from '@/design-system';

export default function CandidateAssessmentEvaluationPage() {
  const params = useParams();
  const router = useRouter();
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

  // The most recent Assessment-round pipeline entry is what this screen evaluates — a candidate
  // may have multiple rounds (Assessment, Interview, ...); only Assessment rounds have an exam
  // session to review here.
  const assessmentRound = [...candidate.pipelineProgress]
    .reverse()
    .find((p: any) => p.roundType === 'Assessment' && p.candidateExamSessionId);

  return (
    <CandidateAssessmentEvaluationView
      candidateId={idParam}
      candidateName={`${candidate.firstName} ${candidate.lastName}`.trim()}
      candidateCode={candidate.candidateCode}
      vacancyTitle={candidate.vacancyTitle}
      candidateExamSessionId={assessmentRound?.candidateExamSessionId ?? null}
      onBack={handleBack}
    />
  );
}

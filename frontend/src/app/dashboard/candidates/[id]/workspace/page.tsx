'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecruitmentWorkspace } from '@/features/candidates/components/RecruitmentWorkspace';

export default function CandidateWorkspacePage() {
  const params = useParams();
  const id = (params?.id as string) || 'cand-1';

  return <RecruitmentWorkspace candidateId={id} />;
}

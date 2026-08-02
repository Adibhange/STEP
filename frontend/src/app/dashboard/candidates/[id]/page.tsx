'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CandidateDetailView } from '@/features/candidates/components/CandidateDetailView';

export default function CandidateDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'cand-1';

  return <CandidateDetailView candidateId={id} />;
}

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CandidateProfilePage } from '@/features/candidates/components/CandidateProfilePage';

export default function CandidateDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'cand-1';

  return <CandidateProfilePage candidateId={id} />;
}

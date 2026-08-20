'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CandidateProfilePage, CandidateProfileSkeleton } from '@/features/candidates/components/CandidateProfilePage';

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  if (!id) {
    return <CandidateProfileSkeleton />;
  }

  return <CandidateProfilePage candidateId={id} />;
}

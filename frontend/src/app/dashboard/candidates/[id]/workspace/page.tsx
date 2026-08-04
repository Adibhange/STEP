'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { RecruitmentWorkspace } from '@/features/candidates/components/RecruitmentWorkspace';

function WorkspaceContent() {
  const params = useParams();
  const id = (params?.id as string) || 'cand-1';
  return <RecruitmentWorkspace candidateId={id} />;
}

export default function CandidateWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Loading Workspace...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}

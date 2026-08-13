'use client';

import React from 'react';
import { CandidateWorkspace } from '@/features/dashboard';

/**
 * STEP Enterprise Candidates Directory Page
 */
export default function CandidatesPage() {
  return (
    <div className="flex flex-col gap-3.5 p-3.5 sm:p-5">
      <CandidateWorkspace />
    </div>
  );
}

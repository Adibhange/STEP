'use client';

import { useGetCandidatesQuery } from '@/store/baseApi';
import { CandidateRecord } from '@/mock/candidate.mock';

export function useCandidates() {
  const { data: candidates = [], isLoading, isError, refetch } = useGetCandidatesQuery();

  return {
    candidates,
    isLoading,
    isError,
    refetch,
    getCandidateById: (id: number): CandidateRecord | undefined =>
      candidates.find((c) => c.id === id),
  };
}

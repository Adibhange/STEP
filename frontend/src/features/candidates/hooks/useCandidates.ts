'use client';

import { useGetCandidatesQuery } from '@/store/services/api';

export const useCandidates = () => {
  const { data: apiResponse, isLoading, error, refetch } = useGetCandidatesQuery();
  const candidates = apiResponse?.data || [];
  return { candidates, isLoading, error, refetch };
};

import { mockCandidates } from '@/mock/candidate.mock';

export function useCandidates() {
  return { candidates: mockCandidates };
}

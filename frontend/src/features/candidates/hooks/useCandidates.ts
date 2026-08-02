'use client';

import { useState } from 'react';
import { CANDIDATES_MOCK } from '@/mock/candidates';

export const useCandidates = () => {
  const [candidates] = useState(CANDIDATES_MOCK);
  return { candidates };
};

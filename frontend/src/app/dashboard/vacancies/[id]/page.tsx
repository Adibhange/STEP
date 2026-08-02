'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { VacancyWorkspace } from '@/features/vacancies/components/VacancyWorkspace';
import { VACANCIES_MOCK } from '@/mock/vacancies';

export default function VacancyDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'vac-101';

  const vacancy = VACANCIES_MOCK.find((v) => v.id === id) || VACANCIES_MOCK[0];

  return <VacancyWorkspace vacancy={vacancy} />;
}

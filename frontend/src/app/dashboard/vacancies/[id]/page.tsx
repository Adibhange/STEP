'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { VacancyDetailView } from '@/features/vacancies/components/VacancyDetailView';
import { VACANCIES_MOCK } from '@/features/vacancies/mock/vacancy.mock';

export default function VacancyDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'vac-101';

  const vacancy = VACANCIES_MOCK.find((v) => v.id === id) || VACANCIES_MOCK[0];

  return <VacancyDetailView vacancy={vacancy} />;
}

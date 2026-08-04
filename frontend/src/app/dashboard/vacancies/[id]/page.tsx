'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { VacancyWorkspace } from '@/features/vacancies/components/VacancyWorkspace';
import { useGetVacancyByIdQuery, useGetVacanciesQuery } from '@/store/services/api';
import type { VacancyItem } from '@/features/vacancies/types/vacancy.types';

export default function VacancyDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '1';
  const numericId = parseInt(rawId.replace(/\D/g, ''), 10) || 1;

  const { data: vacancyByIdRes, isLoading: isLoadingSingle } = useGetVacancyByIdQuery(numericId);
  const { data: vacanciesListRes, isLoading: isLoadingList } = useGetVacanciesQuery();

  const vacancy: VacancyItem | null = useMemo(() => {
    const v = vacancyByIdRes?.data || (vacanciesListRes?.data || []).find((item: any) => String(item.id) === String(rawId) || String(item.id) === String(numericId));
    if (!v) return null;

    return {
      id: String(v.id),
      code: v.vacancyCode || `VAC-2026-${v.id}`,
      title: v.title || 'Untitled Vacancy',
      role: v.title || 'Engineering',
      department: v.department || 'Engineering',
      employmentType: v.employmentType || 'Full-Time Permanent',
      experience: v.experience || '3-5 Years',
      hiringLocation: v.hiringLocation || 'Mumbai HQ',
      testLocation: v.testLocation || 'Mumbai Center',
      workMode: (v.workMode || 'Hybrid') as any,
      openPositions: v.openingsCount || v.positionsCount || 1,
      positionsCount: v.openingsCount || v.positionsCount || 1,
      status: (v.status || 'Open') as any,
      driveType: v.driveType || 'Walk-in Drive',
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString().split('T')[0] : '',
      closingDate: v.closingDate ? new Date(v.closingDate).toISOString().split('T')[0] : '',
      assignedRecruiter: v.assignedRecruiter || 'Recruitment Team',
      hiringManager: v.hiringManager || 'Engineering Lead',
      appliedCount: v.appliedCount || 0,
      assessmentCount: v.assessmentCount || 0,
      interviewCount: v.interviewCount || 0,
      offeredCount: v.offeredCount || 0,
      joinedCount: v.joinedCount || 0,
      activities: [],
    };
  }, [vacancyByIdRes, vacanciesListRes, rawId, numericId]);

  if (isLoadingSingle || isLoadingList) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[var(--text-tertiary)] animate-pulse">
        Loading vacancy details from database...
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-[var(--text-secondary)]">
        Vacancy not found in database.
      </div>
    );
  }

  return <VacancyWorkspace vacancy={vacancy} />;
}

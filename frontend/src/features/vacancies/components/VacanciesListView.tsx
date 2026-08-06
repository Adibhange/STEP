'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { CreateVacancyModal } from './CreateVacancyModal';
import { VacancyDetailDialog } from './VacancyDetailDialog';
import type { VacancyItem } from '../types/vacancy.types';
import {
  useGetVacanciesQuery,
  useCreateVacancyMutation,
  useCreateQuestionPaperMutation,
  useImportQuestionPaperExcelMutation,
  useGetCandidatesQuery,
} from '@/store/services/api';
import { useAppDispatch, notifySuccess, notifyError } from '@/store';
import { buildCreateVacancyCommand } from '../utils/buildCreateVacancyCommand';

/**
 * STEP Enterprise VacanciesListView
 *
 * Primary Vacancy List overview.
 * Displays drive type badges (Walk-in Drive vs Direct Hiring) and opens Hiring Hub Workspace.
 * Sourced 100% dynamically from backend database API.
 */
export const VacanciesListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: apiVacanciesResponse, isLoading, isError } = useGetVacanciesQuery();
  const { data: candidatesRes } = useGetCandidatesQuery();
  const [createVacancyApi] = useCreateVacancyMutation();
  const [createQuestionPaperApi] = useCreateQuestionPaperMutation();
  const [importQuestionPaperExcelApi] = useImportQuestionPaperExcelMutation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [driveFilter, setDriveFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);

  const apiVacancies: VacancyItem[] = useMemo(() => {
    const allCandidates = candidatesRes?.data || [];
    return (apiVacanciesResponse?.data || []).map((v: any) => {
      const vacancyCandidates = allCandidates.filter((c: any) => {
        const cVacId = c.vacancyId ?? c.vacancy?.id;
        return cVacId !== null && cVacId !== undefined && String(cVacId) === String(v.id);
      });
      const dynamicApplied = vacancyCandidates.length;
      const dynamicScreening = vacancyCandidates.filter((c: any) => c.currentStage === 'Screening' || c.currentStage === 'Applied').length;
      const dynamicInterview = vacancyCandidates.filter((c: any) => c.currentStage?.toLowerCase().includes('interview')).length;
      const dynamicOffered = vacancyCandidates.filter((c: any) => c.status === 'Offered').length;
      const dynamicJoined = vacancyCandidates.filter((c: any) => c.status === 'Joined').length;

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
        appliedCount: v.appliedCount && v.appliedCount > 0 ? v.appliedCount : dynamicApplied,
        assessmentCount: v.assessmentCount && v.assessmentCount > 0 ? v.assessmentCount : dynamicScreening,
        interviewCount: v.interviewCount && v.interviewCount > 0 ? v.interviewCount : dynamicInterview,
        offeredCount: v.offeredCount && v.offeredCount > 0 ? v.offeredCount : dynamicOffered,
        joinedCount: v.joinedCount && v.joinedCount > 0 ? v.joinedCount : dynamicJoined,
        activities: [],
      };
    });
  }, [apiVacanciesResponse, candidatesRes]);

  const filteredVacancies = useMemo(() => {
    return apiVacancies.filter((v) => {
      const matchSearch =
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.code.toLowerCase().includes(search.toLowerCase()) ||
        v.role.toLowerCase().includes(search.toLowerCase()) ||
        v.hiringLocation.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchDrive =
        driveFilter === 'All' ||
        (driveFilter === 'Walk-in Drive' && (v.driveType === 'Walk-in Drive' || !v.driveType)) ||
        (driveFilter === 'Direct Hiring' && v.driveType === 'Direct / Sourced Hiring');

      return matchSearch && matchStatus && matchDrive;
    });
  }, [apiVacancies, search, statusFilter, driveFilter]);

  const handleSaveVacancy = async (vacancyData: any) => {
    let vacancy: any;
    try {
      const command = buildCreateVacancyCommand({
        ...vacancyData,
        jobDescription: `${vacancyData.title} - ${vacancyData.department}`,
      });
      const vacancyRes = await createVacancyApi(command).unwrap();
      vacancy = vacancyRes.data;
    } catch (err: any) {
      dispatch(
        notifyError({
          title: 'Vacancy Creation Failed',
          description: err?.data?.message || 'Failed to save vacancy to backend.',
        })
      );
      throw err;
    }

    // The vacancy itself is saved at this point — a failure past here (question paper creation
    // or Excel import) shouldn't be reported as "vacancy creation failed", since it wasn't. It's
    // surfaced as its own distinct warning instead, and doesn't re-throw: the modal should still
    // close and the vacancy should still show up, with question-paper setup retryable afterward
    // from the Assessment Pattern Builder tab.
    try {
      // A question paper (and any staged Excel import) is only meaningful once at least one
      // assessment section was configured — an empty pattern has nothing to attach questions to.
      if (vacancyData.assessmentSections?.length) {
        const paperRes = await createQuestionPaperApi({
          vacancyId: vacancy.id,
          title: vacancyData.questionPaperTitle,
          durationMinutes: vacancyData.assessmentDurationMinutes,
          passingPercentage: vacancyData.passingCriteriaPercentage,
        }).unwrap();
        const paper = paperRes.data;

        if (vacancyData.assessmentExcelFile) {
          const importRes = await importQuestionPaperExcelApi({
            id: paper.id,
            file: vacancyData.assessmentExcelFile,
          }).unwrap();
          const imported = importRes.data;
          dispatch(
            notifySuccess({
              title: 'Questions Imported',
              description: `${imported?.totalQuestionsImported ?? 0} question(s) imported into "${vacancy.title}"'s question paper.`,
            })
          );
        }
      }
    } catch (err: any) {
      dispatch(
        notifyError({
          title: 'Question Paper Setup Incomplete',
          description:
            `"${vacancy.title}" was created, but its question paper could not be fully set up: ` +
            `${err?.data?.message || 'an error occurred'}. You can retry the upload from its Assessment Pattern tab.`,
        })
      );
    }

    dispatch(
      notifySuccess({
        title: 'Vacancy Created',
        description: `"${vacancy.title}" created successfully.`,
      })
    );
    setIsCreateOpen(false);
  };

  const statusVariantMap: Record<string, string> = {
    Open: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]',
    Draft: 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]',
    Paused: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning)]',
    Closed: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger)]',
    Archived: 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]',
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            Vacancies & Hiring Hubs
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Manage enterprise job openings, walk-in drives, QR registrations, and hiring pipelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12.5px] font-bold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer shadow-2xs"
        >
          <Icon name="plus" size="xs" />
          <span>Create Vacancy</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] border border-[var(--border-default)] p-3 rounded-[var(--radius-lg)] shadow-2xs">
        <div className="relative flex items-center h-8 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-64">
          <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
          <input
            type="search"
            placeholder="Search vacancies by title, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] font-semibold text-[var(--text-tertiary)] uppercase font-mono">Model:</span>
            {[
              { id: 'All', label: 'All Models' },
              { id: 'Walk-in Drive', label: 'Walk-in Drives' },
              { id: 'Direct Hiring', label: 'Direct Hiring' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDriveFilter(d.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                  driveFilter === d.id
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-transparent hover:bg-[var(--surface-hover)]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-l border-[var(--border-default)] pl-3">
            <span className="text-[11.5px] font-semibold text-[var(--text-tertiary)] uppercase font-mono">Status:</span>
            {['All', 'Open', 'Draft', 'Paused', 'Closed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-[var(--surface-2)] rounded-[var(--radius-lg)] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] text-xs font-semibold">
          Failed to fetch vacancies from backend database.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredVacancies.length === 0 && (
        <div className="p-12 text-center bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center gap-2">
          <Icon name="briefcase" size="lg" className="text-[var(--text-tertiary)] opacity-40" />
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">No vacancies found</h3>
          <p className="text-xs text-[var(--text-tertiary)] max-w-sm">
            {search || statusFilter !== 'All' || driveFilter !== 'All'
              ? 'No vacancies match your search and filter criteria.'
              : 'There are no job vacancies stored in the database yet. Click Create Vacancy to add one.'}
          </p>
        </div>
      )}

      {/* Vacancy Cards List */}
      {!isLoading && !isError && filteredVacancies.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredVacancies.map((v) => {
            const driveType = v.driveType || 'Walk-in Drive';
            const isDirect = driveType === 'Direct / Sourced Hiring';

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVacancy(v)}
                className="group bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--accent-indigo)] rounded-[var(--radius-lg)] p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border ${
                      isDirect
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/20'
                    }`}>
                      <Icon name={isDirect ? 'users' : 'briefcase'} size="md" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading group-hover:text-[var(--accent-indigo)] transition-colors">
                          {v.title}
                        </h3>
                        <span className="font-mono text-[11px] text-[var(--text-tertiary)]">({v.code})</span>

                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                          isDirect
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {driveType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)] mt-1 flex-wrap font-sans">
                        <span>Role: <strong>{v.role}</strong></span>
                        <span>•</span>
                        <span>Hiring Location: <strong>{v.hiringLocation}</strong></span>
                        <span>•</span>
                        <span>Exp: <strong>{v.experience}</strong></span>
                        <span>•</span>
                        <span className="font-semibold text-[var(--text-secondary)]">{v.openPositions} Open Positions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono uppercase ${statusVariantMap[v.status] || statusVariantMap.Open}`}>
                      {v.status}
                    </span>
                    <Icon name="chevron-right" size="sm" className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-indigo)] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-[var(--border-default)] bg-[var(--surface-2)] -mx-5 -mb-5 px-5 py-3 rounded-b-[var(--radius-lg)]">
                  <div>
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Applied</span>
                    <span className="text-sm font-black font-mono text-[var(--text-primary)]">{v.appliedCount}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Screening</span>
                    <span className="text-sm font-black font-mono text-[var(--text-primary)]">{v.assessmentCount}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Interview</span>
                    <span className="text-sm font-black font-mono text-[var(--text-primary)]">{v.interviewCount}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Offered</span>
                    <span className="text-sm font-black font-mono text-[var(--status-info-text)]">{v.offeredCount}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Hired</span>
                    <span className="text-sm font-black font-mono text-[var(--status-success-text)]">{v.joinedCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Vacancy Wizard Modal */}
      <CreateVacancyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveVacancy}
      />

      {/* Vacancy Hiring Hub Detail Dialog Modal */}
      <VacancyDetailDialog
        vacancy={selectedVacancy}
        isOpen={!!selectedVacancy}
        onClose={() => setSelectedVacancy(null)}
      />
    </div>
  );
};

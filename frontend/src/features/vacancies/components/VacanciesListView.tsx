'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Icon } from '@/design-system';
import { VacancyDetailDialog } from './VacancyDetailDialog';
import { InstantDriveModalV2 } from './InstantDriveModalV2';
import type { VacancyItem } from '../types/vacancy.types';
import {
  useGetVacanciesQuery,
  useGetCandidatesQuery,
} from '@/store/services/api';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 26,
      stiffness: 320,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

/**
 * STEP Enterprise VacanciesListView
 *
 * Primary Vacancy List overview.
 * Displays drive type badges (Walk-in Drive vs Direct Hiring) and opens Hiring Hub Workspace.
 * Sourced 100% dynamically from backend database API.
 */
export const VacanciesListView: React.FC = () => {
  const { data: apiVacanciesResponse, isLoading, isError } = useGetVacanciesQuery();
  const { data: candidatesRes } = useGetCandidatesQuery();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [driveFilter, setDriveFilter] = useState<string>('All');
  const [isInstantDriveOpen, setIsInstantDriveOpen] = useState(false);
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

      const rawTitle = v.title || 'Untitled Vacancy';
      const roleName = v.masterRole || v.roleName || (rawTitle.includes(' - ') ? rawTitle.split(' - ')[0] : rawTitle);

      let expText = v.experienceText || v.experience;
      if (!expText) {
        if (v.minExperienceYears !== undefined && v.maxExperienceYears !== undefined) {
          if (v.minExperienceYears === 0 && v.maxExperienceYears <= 0) expText = 'Fresher (0 Years)';
          else if (v.minExperienceYears === 0 && v.maxExperienceYears <= 1) expText = 'Junior (0-1 Year)';
          else if (v.maxExperienceYears >= 90) expText = `${v.minExperienceYears}+ Years`;
          else expText = `${v.minExperienceYears}-${v.maxExperienceYears} Years`;
        } else {
          expText = '0-1 Years';
        }
      }

      const totalPositions = v.totalOpenings ?? v.openingsCount ?? v.positionsCount ?? 5;

      return {
        id: String(v.id),
        code: v.vacancyCode || `VAC-2026-${v.id}`,
        title: rawTitle,
        role: roleName,
        department: v.department || 'Engineering',
        employmentType: v.employmentType || 'Full-Time Permanent',
        experience: expText,
        hiringLocation: v.hiringLocation || 'Pune Office',
        testLocation: v.testLocation || 'Pune Office Hub',
        workMode: (v.workMode || 'On-site') as any,
        openPositions: totalPositions,
        positionsCount: totalPositions,
        status: (v.status || 'Active') as any,
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

  const statusVariantMap: Record<string, string> = {
    Open: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]',
    Draft: 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]',
    Paused: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning)]',
    Closed: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger)]',
    Archived: 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]',
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header Bar with Motion */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            Vacancies & Hiring Hubs
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Manage enterprise job openings, walk-in drives, QR registrations, and hiring pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsInstantDriveOpen(true)}
            className="h-9 px-4 flex items-center gap-2 rounded-xl bg-gradient-to-b from-[var(--accent-indigo)] to-[#4f46e5] hover:from-[#6b6ff5] hover:to-[#4338ca] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_2px_8px_rgba(99,102,241,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] border border-indigo-400/30 hover:border-indigo-300/50"
          >
            <Icon name="zap" size="xs" className="text-amber-300" />
            <span>Create Vacancy / 1-Click Drive</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filter & Search Bar with Motion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] border border-[var(--border-default)] p-3 rounded-[var(--radius-lg)] shadow-2xs"
      >
        <div className="relative flex items-center h-8 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-64 focus-within:border-[var(--accent-indigo)] transition-colors">
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
                    ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/40 shadow-2xs'
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
      </motion.div>

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

      {/* Empty State with Animation */}
      <AnimatePresence mode="wait">
        {!isLoading && !isError && filteredVacancies.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="p-12 text-center bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center gap-2 shadow-2xs"
          >
            <Icon name="briefcase" size="lg" className="text-[var(--text-tertiary)] opacity-40" />
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">No vacancies found</h3>
            <p className="text-xs text-[var(--text-tertiary)] max-w-sm">
              {search || statusFilter !== 'All' || driveFilter !== 'All'
                ? 'No vacancies match your search and filter criteria.'
                : 'There are no job vacancies stored in the database yet. Click Create Vacancy to add one.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vacancy Cards List with Staggered Motion */}
      {!isLoading && !isError && filteredVacancies.length > 0 && (
        <motion.div
          key="list"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-3.5 sm:gap-4"
        >
          {filteredVacancies.map((v) => {
            const driveType = v.driveType || 'Walk-in Drive';
            const isDirect = driveType === 'Direct / Sourced Hiring';

            return (
              <motion.div
                key={v.id}
                layout
                variants={cardVariants}
                whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
                whileTap={{ scale: 0.995 }}
                onClick={() => setSelectedVacancy(v)}
                className="group bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--accent-indigo)] rounded-[var(--radius-lg)] p-5 cursor-pointer shadow-2xs hover:shadow-[0_12px_30px_-10px_rgba(99,102,241,0.15)] flex flex-col gap-4 transition-colors duration-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                      isDirect
                        ? 'bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border-[var(--accent-violet)]/30'
                        : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
                    }`}>
                      <Icon name={isDirect ? 'users' : 'briefcase'} size="md" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading group-hover:text-[var(--accent-indigo)] transition-colors truncate">
                          {v.title}
                        </h3>
                        <span className="font-mono text-[11px] text-[var(--text-tertiary)] shrink-0">({v.code})</span>

                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border font-mono shrink-0 ${
                          isDirect
                            ? 'bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border-[var(--accent-violet)]/30'
                            : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
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

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono uppercase ${statusVariantMap[v.status] || statusVariantMap.Open}`}>
                      {v.status}
                    </span>
                    <Icon name="chevron-right" size="sm" className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-indigo)] group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-[var(--border-default)] bg-[var(--surface-2)] -mx-5 -mb-5 px-5 py-3 rounded-b-[var(--radius-lg)]">
                  <div className="group/stat">
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Applied</span>
                    <span className="text-sm font-black font-mono text-[var(--text-primary)] group-hover/stat:text-[var(--accent-indigo)] transition-colors">{v.appliedCount}</span>
                  </div>
                  <div className="group/stat">
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Screening</span>
                    <span className="text-sm font-black font-mono text-[var(--text-primary)] group-hover/stat:text-[var(--accent-indigo)] transition-colors">{v.assessmentCount}</span>
                  </div>
                  <div className="group/stat">
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Interview</span>
                    <span className="text-sm font-black font-mono text-[var(--text-primary)] group-hover/stat:text-[var(--accent-indigo)] transition-colors">{v.interviewCount}</span>
                  </div>
                  <div className="group/stat">
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Offered</span>
                    <span className="text-sm font-black font-mono text-[var(--status-info-text)] group-hover/stat:scale-105 transition-transform inline-block">{v.offeredCount}</span>
                  </div>
                  <div className="group/stat">
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Hired</span>
                    <span className="text-sm font-black font-mono text-[var(--status-success-text)] group-hover/stat:scale-105 transition-transform inline-block">{v.joinedCount}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* 1-Click Instant Drive V2 Modal */}
      <InstantDriveModalV2
        isOpen={isInstantDriveOpen}
        onClose={() => setIsInstantDriveOpen(false)}
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


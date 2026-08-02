'use client';

import React, { useState } from 'react';
import useRouter from 'next/navigation';
import { Icon } from '@/design-system';
import { CreateVacancyModal } from './CreateVacancyModal';
import { VACANCIES_MOCK, type VacancyItem } from '../mock/vacancy.mock';

/**
 * STEP Enterprise VacanciesListView
 *
 * Primary Vacancy List overview.
 * Clicking any vacancy navigates to its individual Hiring Hub (/dashboard/vacancies/[id]).
 */
export const VacanciesListView: React.FC = () => {
  const [vacancies, setVacancies] = useState<VacancyItem[]>(VACANCIES_MOCK);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredVacancies = vacancies.filter((v) => {
    const matchSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.role.toLowerCase().includes(search.toLowerCase()) ||
      v.hiringLocation.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateSave = (newVac: any) => {
    const created: VacancyItem = {
      ...newVac,
      id: `vac-${Date.now()}`,
      code: `VAC-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
      appliedCount: 0,
      assessmentCount: 0,
      interviewCount: 0,
      offeredCount: 0,
      joinedCount: 0,
      activities: [
        { id: `act-${Date.now()}`, timestamp: 'Just now', user: 'Aditya Bhange', type: 'create', title: 'Vacancy Created', description: `${newVac.title} published.` },
      ],
    };
    setVacancies([created, ...vacancies]);
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
        <div className="relative flex items-center h-8 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-72">
          <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
          <input
            type="search"
            placeholder="Search vacancies by title, code, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[var(--text-tertiary)]">Status:</span>
          {['All', 'Open', 'Draft', 'Paused', 'Closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-[11.5px] font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancy Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVacancies.map((v) => (
          <div
            key={v.id}
            onClick={() => { window.location.href = `/dashboard/vacancies/${v.id}`; }}
            className="group bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--accent-indigo)] rounded-[var(--radius-lg)] p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md flex flex-col gap-4"
          >
            {/* Top Info */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center font-bold shrink-0">
                  <Icon name="briefcase" size="md" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading group-hover:text-[var(--accent-indigo)] transition-colors">
                      {v.title}
                    </h3>
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">({v.code})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[var(--text-tertiary)] mt-0.5 flex-wrap">
                    <span>{v.role}</span>
                    <span>•</span>
                    <span>{v.hiringLocation}</span>
                    <span>•</span>
                    <span>{v.experience}</span>
                    <span>•</span>
                    <span className="font-semibold text-[var(--text-secondary)]">{v.openPositions} Positions</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono uppercase ${statusVariantMap[v.status]}`}>
                  {v.status}
                </span>
                <Icon name="chevron-right" size="sm" className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-indigo)] transition-colors" />
              </div>
            </div>

            {/* Pipeline Stats Summary */}
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
        ))}
      </div>

      {/* Modal */}
      <CreateVacancyModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleCreateSave} />
    </div>
  );
};

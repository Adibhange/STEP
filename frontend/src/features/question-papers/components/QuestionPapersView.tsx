'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { MOCK_PAPERS_100 } from '../utils/questionMock';
import { QuestionPaper, PaperStatus } from '../types/question-paper.types';
import { QuestionPaperViewDialog } from './QuestionPaperViewDialog';

const PAGE_SIZE = 20;

const ALL_CATEGORIES = ['All Categories', ...Array.from(new Set(MOCK_PAPERS_100.map((p) => p.category)))];

const SECTION_TYPE_COLORS: Record<string, string> = {
  SINGLE_CHOICE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  MULTI_CHOICE: 'bg-violet-50 text-violet-700 border-violet-200',
  CODING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SQL: 'bg-amber-50 text-amber-700 border-amber-200',
  SUBJECTIVE: 'bg-purple-50 text-purple-700 border-purple-200',
};

const SECTION_TYPE_SHORT: Record<string, string> = {
  SINGLE_CHOICE: 'MCQ',
  MULTI_CHOICE: 'MCQ+',
  CODING: 'Code',
  SQL: 'SQL',
  SUBJECTIVE: 'Essay',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Frontend Engineering': 'text-sky-700 bg-sky-50',
  'Backend Engineering': 'text-indigo-700 bg-indigo-50',
  'Quality Assurance': 'text-emerald-700 bg-emerald-50',
  Aptitude: 'text-amber-700 bg-amber-50',
  Engineering: 'text-purple-700 bg-purple-50',
  DevOps: 'text-rose-700 bg-rose-50',
  'Product Management': 'text-teal-700 bg-teal-50',
};

export const QuestionPapersView: React.FC = () => {
  const [papers, setPapers] = useState<QuestionPaper[]>(MOCK_PAPERS_100);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState<'All' | PaperStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);

  const filtered = useMemo(() => {
    setCurrentPage(1);
    return papers.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.vacancyTitle.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All Categories' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [papers, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleToggleStatus = (paperId: string) => {
    setPapers((prev) =>
      prev.map((p) =>
        p.id === paperId ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
      )
    );
  };

  return (
    <>
      <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            Question Papers Library
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Reusable test papers linked to vacancy assessment patterns. Papers are uploaded via the Assessment Builder in each Vacancy workspace.
          </p>
        </div>

        {/* Toolbar — stacked rows for mobile */}
        <div className="flex flex-col gap-2 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl px-4 py-3 shadow-2xs">

          {/* Row 1: Search + Count */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search papers or vacancy..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full h-9 pl-9 pr-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                <Icon name="search" size="xs" />
              </div>
            </div>
            <span className="text-[11.5px] font-mono font-bold text-[var(--text-tertiary)] shrink-0">
              {filtered.length} / {papers.length}
            </span>
          </div>

          {/* Row 2: Status + Category — scrollable on one line */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {/* Status pills */}
            {(['All', 'Active', 'Inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`h-7 px-3 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  statusFilter === s
                    ? s === 'Active'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : s === 'Inactive'
                      ? 'bg-slate-400 text-white border-slate-400'
                      : 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)]'
                    : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--accent-indigo)]'
                }`}
              >
                {s === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
                {s === 'Inactive' && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />}
                {s}
              </button>
            ))}

            {/* Divider */}
            <div className="h-5 w-px bg-[var(--border-default)] shrink-0 mx-1" />

            {/* Category pills */}
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                className={`h-7 px-3 rounded-full text-[11px] font-bold border whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)]'
                    : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Papers Grid — 4 per row on xl, 2 on md, 1 on mobile */}
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((qp) => (
                <div
                  key={qp.id}
                  className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  {/* Card Header: Category + Status Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded truncate max-w-[140px] ${CATEGORY_COLORS[qp.category] ?? 'text-indigo-700 bg-indigo-50'}`}>
                      {qp.category}
                    </span>
                    {/* Status Toggle button */}
                    <button
                      type="button"
                      title={`Status: ${qp.status} — Click to toggle`}
                      onClick={() => handleToggleStatus(qp.id)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold font-mono border cursor-pointer transition-all shrink-0 ${
                        qp.status === 'Active'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${qp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {qp.status}
                      <Icon name={qp.status === 'Active' ? 'check-circle' : 'pause-circle'} size="xs" />
                    </button>
                  </div>

                  {/* Vacancy Link */}
                  <div className="flex items-center gap-1 text-[10.5px] font-mono text-[var(--text-tertiary)] truncate">
                    <Icon name="link" size="xs" />
                    <span className="truncate">{qp.vacancyTitle}</span>
                  </div>

                  {/* Paper Title */}
                  <h3 className="text-[12.5px] font-extrabold text-[var(--text-primary)] font-heading leading-snug group-hover:text-[var(--accent-indigo)] transition-colors line-clamp-2">
                    {qp.title}
                  </h3>

                  {/* Section Type Badges */}
                  <div className="flex flex-wrap gap-1">
                    {qp.sections.map((sec) => (
                      <span
                        key={sec.id}
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${SECTION_TYPE_COLORS[sec.questionType]}`}
                      >
                        {SECTION_TYPE_SHORT[sec.questionType]} · {sec.totalQuestions}Q
                      </span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="border-t border-[var(--border-default)] pt-2.5 flex items-center gap-2 text-[10.5px] font-mono font-semibold text-[var(--text-tertiary)] flex-wrap">
                    <span>{qp.totalQuestions}Q</span>
                    <span>·</span>
                    <span>{qp.totalMarks}M</span>
                    <span>·</span>
                    <span>{qp.durationMins} min</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{qp.lastUpdated}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPaper(qp)}
                      className="text-[11px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>View Details</span>
                      <Icon name="chevron-right" size="xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-[12px] font-mono text-[var(--text-tertiary)]">
                  Page {currentPage} of {totalPages} · Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="h-8 w-8 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <Icon name="chevron-left" size="xs" />
                  </button>

                  {/* Page number pills */}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)]'
                            : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--accent-indigo)]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 7 && (
                    <span className="text-[12px] text-[var(--text-tertiary)] font-mono px-1">…{totalPages}</span>
                  )}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="h-8 w-8 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <Icon name="chevron-right" size="xs" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)]">
              <Icon name="file-text" size="lg" />
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-[var(--text-primary)] font-heading">No question papers found</p>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Adjust your search or filter to find papers.</p>
            </div>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      {selectedPaper && (
        <QuestionPaperViewDialog
          paper={selectedPaper}
          mode="library"
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </>
  );
};

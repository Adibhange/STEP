'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { QuestionPaper, PaperStatus } from '../types/question-paper.types';
import { QuestionPaperViewDialog } from './QuestionPaperViewDialog';
import { useGetVacanciesQuery } from '@/store/services/api';

const PAGE_SIZE = 20;

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
  const { data: vacanciesRes, isLoading, isError } = useGetVacanciesQuery();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState<'All' | PaperStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);

  const papers: QuestionPaper[] = useMemo(() => {
    return (vacanciesRes?.data || [])
      .filter((v: any) => v.title)
      .map((v: any) => ({
        id: `qp-${v.id}`,
        title: v.questionPaperTitle || `${v.title} Assessment Paper`,
        category: v.department || 'Engineering',
        vacancyId: String(v.id),
        vacancyTitle: v.title,
        status: (v.status === 'Closed' ? 'Inactive' : 'Active') as PaperStatus,
        totalQuestions: 25,
        totalMarks: 100,
        durationMins: 45,
        lastUpdated: v.createdAt ? new Date(v.createdAt).toISOString().split('T')[0] : '',
        sections: [
          {
            id: `sec-${v.id}-1`,
            sectionTitle: 'Technical MCQs',
            questionType: 'SINGLE_CHOICE',
            totalQuestions: 15,
            timeLimitMinutes: 20,
            marksPerQuestion: 2,
            totalMarks: 30,
            questions: [],
          },
          {
            id: `sec-${v.id}-2`,
            sectionTitle: 'Coding Task',
            questionType: 'CODING',
            totalQuestions: 2,
            timeLimitMinutes: 25,
            marksPerQuestion: 35,
            totalMarks: 70,
            questions: [],
          },
        ],
      }));
  }, [vacanciesRes]);

  const allCategories = useMemo(() => {
    return ['All Categories', ...Array.from(new Set(papers.map((p) => p.category)))];
  }, [papers]);

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.vacancyTitle.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All Categories' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [papers, search, categoryFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            Question Papers Library
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Create, manage, and inspect vacancy assessment question papers and section breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {filtered.length} Total Papers
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] border border-[var(--border-default)] p-3 rounded-[var(--radius-lg)] shadow-2xs">
        <div className="relative flex items-center h-8 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-64">
          <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
          <input
            type="search"
            placeholder="Search papers by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-[11.5px] font-semibold text-[var(--text-tertiary)] uppercase font-mono mr-1">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[11.5px] font-bold text-[var(--text-primary)] outline-none"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 border-l border-[var(--border-default)] pl-3">
            <span className="text-[11.5px] font-semibold text-[var(--text-tertiary)] uppercase font-mono mr-1">Status:</span>
            {['All', 'Active', 'Inactive'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st as any)}
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

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-[var(--surface-2)] rounded-[var(--radius-lg)] animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] text-xs font-semibold">
          Failed to load question papers from database.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="p-12 text-center bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center gap-2">
          <Icon name="file-text" size="lg" className="text-[var(--text-tertiary)] opacity-40" />
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">No question papers found</h3>
          <p className="text-xs text-[var(--text-tertiary)] max-w-sm">
            There are no question papers available in the database matching your filter criteria.
          </p>
        </div>
      )}

      {/* Grid of Question Papers */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((paper) => {
            const catColor = CATEGORY_COLORS[paper.category] || 'text-indigo-700 bg-indigo-50';
            return (
              <div
                key={paper.id}
                onClick={() => setSelectedPaper(paper)}
                className="group bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--accent-indigo)] rounded-[var(--radius-lg)] p-5 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full font-mono ${catColor}`}>
                      {paper.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                      {paper.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading group-hover:text-[var(--accent-indigo)] transition-colors leading-snug">
                    {paper.title}
                  </h3>
                  <p className="text-[11.5px] text-[var(--text-tertiary)] truncate">
                    Vacancy: <strong className="text-[var(--text-secondary)]">{paper.vacancyTitle}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-[11px] font-mono text-[var(--text-tertiary)]">
                  <span>{paper.totalQuestions} Questions</span>
                  <span>•</span>
                  <span>{paper.durationMins} Mins</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-600">{paper.totalMarks} Marks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPaper && (
        <QuestionPaperViewDialog
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
};

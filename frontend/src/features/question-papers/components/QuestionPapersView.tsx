'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { QuestionPaper, PaperStatus } from '../types/question-paper.types';
import { QuestionPaperViewDialog } from './QuestionPaperViewDialog';
import { useGetVacanciesQuery, useGetQuestionPapersQuery } from '@/store/services/api';

const PAGE_SIZE = 20;

const CATEGORY_COLORS: Record<string, string> = {
  'Frontend Engineering': 'text-[var(--accent-cyan)] bg-[var(--accent-cyan-dim)] border border-[var(--accent-cyan)]/30',
  'Backend Engineering': 'text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] border border-[var(--accent-indigo)]/30',
  'Quality Assurance': 'text-[var(--status-success-text)] bg-[var(--status-success-bg)] border border-[var(--status-success-border)]',
  Aptitude: 'text-[var(--status-warning-text)] bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)]',
  Engineering: 'text-[var(--accent-violet)] bg-[var(--accent-violet-dim)] border border-[var(--accent-violet)]/30',
  DevOps: 'text-[var(--status-danger-text)] bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)]',
  'Product Management': 'text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] border border-[var(--accent-indigo)]/30',
};

export const QuestionPapersView: React.FC = () => {
  const { data: qpRes, isLoading: isLoadingQP } = useGetQuestionPapersQuery();
  const { data: vacanciesRes, isLoading: isLoadingVacancies, isError } = useGetVacanciesQuery();
  const isLoading = isLoadingQP || isLoadingVacancies;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState<'All' | PaperStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);

  const papers: QuestionPaper[] = useMemo(() => {
    if (qpRes?.data && qpRes.data.length > 0) {
      return qpRes.data.map((qp: any) => ({
        id: String(qp.id),
        title: qp.title || `Paper #${qp.id}`,
        category: qp.category || 'Engineering',
        vacancyId: String(qp.vacancyId || ''),
        vacancyTitle: qp.paperCode || `Vacancy #${qp.vacancyId}`,
        status: (qp.status || 'Active') as PaperStatus,
        totalQuestions: qp.totalQuestions || (qp.questions?.length ?? 25),
        totalMarks: qp.totalMarks || 100,
        durationMins: qp.durationMinutes || 45,
        lastUpdated: qp.publishedAt ? new Date(qp.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        sections: [
          {
            id: `sec-${qp.id}-1`,
            sectionTitle: 'Questions',
            questionType: 'SINGLE_CHOICE',
            totalQuestions: qp.totalQuestions || 25,
            timeLimitMinutes: qp.durationMinutes || 45,
            marksPerQuestion: 4,
            totalMarks: qp.totalMarks || 100,
            // Normalize the real API shape (optionLabel/optionText/isCorrect) into what
            // QuestionPaperViewDialog expects (label/text/correctOption) — passing the raw
            // objects through left every option's text blank (wrong field names).
            questions: (qp.questions || []).map((q: any) => ({
              id: String(q.id),
              questionType: q.questionType,
              questionText: q.questionText,
              options: (q.options || []).map((o: any) => ({ label: o.optionLabel, text: o.optionText })),
              correctOption: (q.options || [])
                .filter((o: any) => o.isCorrect)
                .map((o: any) => o.optionLabel)
                .join(','),
              language: q.programmingLanguage || undefined,
              problemStatement: q.sqlSchema || undefined,
              maxWordCount: q.maxWordCount || undefined,
            })),
          },
        ],
      }));
    }

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
  }, [qpRes, vacanciesRes]);

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
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
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
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] font-semibold text-[var(--text-tertiary)] uppercase font-mono mr-1">Category:</span>
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val || 'All Categories')}
              options={allCategories.map((cat) => ({ value: cat, label: cat }))}
              placeholder="All Categories"
              widthClass="w-48"
            />
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
            const catColor = CATEGORY_COLORS[paper.category] || 'text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] border border-[var(--accent-indigo)]/30';
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

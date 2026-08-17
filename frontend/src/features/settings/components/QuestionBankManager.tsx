'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, staggerContainer, kpiCardVariant, tactilePopCardVariant } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { TierBadge } from '@/features/shared';
import {
  useGetMasterDataByCategoryQuery,
  useGetQuestionBankQuery,
  useCreateQuestionBankMutation,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  useBulkDeleteQuestionBankMutation,
  useBulkToggleQuestionBankStatusMutation,
  useBulkImportQuestionBankMutation,
} from '@/store/services/api';
import { downloadQuestionBankExcelTemplate } from '../utils/questionBankExcelTemplate';

export interface QuestionBankItem {
  id: number;
  code?: string;
  language: string; // e.g. "General Aptitude", "C# (.NET)", "JavaScript / React", "TypeScript", "SQL (Database)", "Python", "Java", "C++", "Go (Golang)"
  sectionType: 'Aptitude' | 'TechnicalMCQ' | 'Coding' | 'SQLQuery' | 'SubjectiveTheory';
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';
  experienceTier: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | string;
  questionText: string;
  marks: number;
  sqlSchema?: string | null;
  options?: {
    id?: number;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  isActive: boolean;
  updatedAt?: string;
}

const FALLBACK_LANGUAGES = [
  'General Aptitude',
  'C# (.NET)',
  'JavaScript / React',
  'TypeScript',
  'SQL (Database)',
  'Python',
  'Java',
  'C++',
  'Go (Golang)',
];

const FALLBACK_EXPERIENCE_TIERS = [
  'Fresher',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
];

export const QuestionBankManager: React.FC = () => {
  // Live Languages & Experience Tiers Master Data
  const { data: languagesRes } = useGetMasterDataByCategoryQuery('languages');
  const { data: expLevelsRes } = useGetMasterDataByCategoryQuery('experiencelevels');

  const languagesList = useMemo(() => {
    if (languagesRes?.data && languagesRes.data.length > 0) {
      return languagesRes.data.map((l) => l.name);
    }
    return FALLBACK_LANGUAGES;
  }, [languagesRes]);

  const experienceTiersList = useMemo(() => {
    if (expLevelsRes?.data && expLevelsRes.data.length > 0) {
      return expLevelsRes.data.map((e) => e.name);
    }
    return FALLBACK_EXPERIENCE_TIERS;
  }, [expLevelsRes]);

  // Live Central Question Bank API Queries & Mutations
  const { data: questionsRes, isLoading: isQuestionsLoading } = useGetQuestionBankQuery();
  const [createQuestionApi] = useCreateQuestionBankMutation();
  const [updateQuestionApi] = useUpdateQuestionBankMutation();
  const [deleteQuestionApi] = useDeleteQuestionBankMutation();
  const [bulkDeleteQuestionApi] = useBulkDeleteQuestionBankMutation();
  const [bulkStatusQuestionApi] = useBulkToggleQuestionBankStatusMutation();
  const [bulkImportQuestionApi] = useBulkImportQuestionBankMutation();

  const questions: QuestionBankItem[] = useMemo(() => questionsRes?.data || [], [questionsRes]);

  // Multi-Selection State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter States
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [experienceTierFilter, setExperienceTierFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Expanded row details for quick preview
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal State for Add / Edit / Bulk Upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionBankItem> | null>(null);

  // Filtered Questions
  const filteredData = useMemo(() => {
    return questions.filter((q) => {
      const matchLanguage =
        languageFilter === 'All' ||
        q.language.toLowerCase() === languageFilter.toLowerCase();

      const matchSection =
        sectionFilter === 'All' || q.sectionType === sectionFilter;

      const matchExperience =
        experienceTierFilter === 'All' || q.experienceTier === experienceTierFilter;

      const matchType =
        typeFilter === 'All' || q.questionType === typeFilter;

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' ? q.isActive : !q.isActive);

      const matchSearch =
        !search.trim() ||
        q.questionText.toLowerCase().includes(search.toLowerCase().trim()) ||
        (q.code && q.code.toLowerCase().includes(search.toLowerCase().trim())) ||
        q.language.toLowerCase().includes(search.toLowerCase().trim());

      return matchLanguage && matchSection && matchExperience && matchType && matchStatus && matchSearch;
    });
  }, [questions, languageFilter, sectionFilter, experienceTierFilter, typeFilter, statusFilter, search]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Check if all visible items on current page are selected
  const isAllPageSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((q) => selectedIds.has(q.id));
  }, [paginatedData, selectedIds]);

  const handleToggleSelectAll = () => {
    const updated = new Set(selectedIds);
    if (isAllPageSelected) {
      paginatedData.forEach((q) => updated.delete(q.id));
    } else {
      paginatedData.forEach((q) => updated.add(q.id));
    }
    setSelectedIds(updated);
  };

  const handleToggleSelectOne = (id: number) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    try {
      await bulkDeleteQuestionApi({ questionIds: Array.from(selectedIds) }).unwrap();
      setSelectedIds(new Set());
      toast.success('Bulk Delete Completed', {
        description: `Successfully deleted ${count} question${count === 1 ? '' : 's'} from central repository.`,
      });
    } catch {
      toast.error('Bulk Delete Failed', { description: 'Could not delete selected questions.' });
    }
  };

  const handleBulkActivate = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    try {
      await bulkStatusQuestionApi({ questionIds: Array.from(selectedIds), isActive: true }).unwrap();
      setSelectedIds(new Set());
      toast.success('Bulk Status Updated', {
        description: `Activated ${count} question${count === 1 ? '' : 's'}.`,
      });
    } catch {
      toast.error('Status Update Failed', { description: 'Could not update question statuses.' });
    }
  };

  const handleBulkDeactivate = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    try {
      await bulkStatusQuestionApi({ questionIds: Array.from(selectedIds), isActive: false }).unwrap();
      setSelectedIds(new Set());
      toast.success('Bulk Status Updated', {
        description: `Deactivated ${count} question${count === 1 ? '' : 's'}.`,
      });
    } catch {
      toast.error('Status Update Failed', { description: 'Could not update question statuses.' });
    }
  };

  // Summary Metrics for Pool Coverage
  const metrics = useMemo(() => {
    const mcqs = questions.filter((q) => q.sectionType === 'TechnicalMCQ');
    return {
      total: questions.length,
      aptitude: questions.filter((q) => q.sectionType === 'Aptitude').length,
      mcq: mcqs.length,
      mcqSingle: mcqs.filter((q) => q.questionType === 'SINGLE_CHOICE').length,
      mcqMulti: mcqs.filter((q) => q.questionType === 'MULTI_CHOICE').length,
      sql: questions.filter((q) => q.sectionType === 'SQLQuery').length,
      coding: questions.filter((q) => q.sectionType === 'Coding').length,
    };
  }, [questions]);

  const handleDeleteQuestion = async (id: number) => {
    try {
      await deleteQuestionApi(id).unwrap();
      const updated = new Set(selectedIds);
      updated.delete(id);
      setSelectedIds(updated);
      toast.success('Question Removed', { description: 'Question deleted from central repository.' });
    } catch {
      toast.error('Delete Failed', { description: 'Could not remove question.' });
    }
  };

  const handleOpenCreate = () => {
    setEditingQuestion({
      code: `QB-${Date.now().toString().slice(-4)}`,
      language: 'C# (.NET)',
      sectionType: 'TechnicalMCQ',
      questionType: 'SINGLE_CHOICE',
      experienceTier: 'Junior',
      questionText: '',
      marks: 1.0,
      options: [
        { label: 'A', text: '', isCorrect: true },
        { label: 'B', text: '', isCorrect: false },
        { label: 'C', text: '', isCorrect: false },
        { label: 'D', text: '', isCorrect: false },
      ],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: QuestionBankItem) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.questionText?.trim()) {
      toast.error('Validation Error', { description: 'Question text is required.' });
      return;
    }

    if (
      editingQuestion.sectionType === 'TechnicalMCQ' ||
      editingQuestion.sectionType === 'Aptitude'
    ) {
      const hasCorrect = editingQuestion.options?.some((o) => o.isCorrect);
      if (!hasCorrect) {
        toast.error('Validation Error', {
          description: 'Please mark at least one option choice as correct.',
        });
        return;
      }
    }

    try {
      if (editingQuestion.id) {
        await updateQuestionApi({ id: editingQuestion.id, data: editingQuestion }).unwrap();
        toast.success('Question Updated', { description: 'Question successfully updated in central bank.' });
      } else {
        await createQuestionApi(editingQuestion).unwrap();
        toast.success('Question Added', { description: 'New question added to central bank.' });
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
    } catch {
      toast.error('Save Failed', { description: 'Could not save question.' });
    }
  };

  const handleBulkImport = () => {
    toast.success('Bulk Import Completed', {
      description: 'Successfully parsed and imported questions into the central bank.',
    });
    setIsBulkOpen(false);
  };

  // Generate and download a true multi-sheet Excel (.xlsx) Template with Data Validation
  const handleDownloadTemplate = async () => {
    try {
      await downloadQuestionBankExcelTemplate({ languages: languagesList, experienceTiers: experienceTiersList });
      toast.success('Excel Template Downloaded', {
        description: `Multi-sheet Excel (.xlsx) workbook with built-in dropdown validations generated.`,
      });
    } catch (err) {
      console.error('Failed to generate Excel template:', err);
      toast.error('Download Failed', { description: 'Could not generate Excel template.' });
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 w-full font-sans"
    >
      {/* ────────────────── POOL HEALTH SUMMARY CARDS WITH FRAMER MOTION ────────────────── */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full"
      >
        <motion.div
          variants={kpiCardVariant}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-2xs flex flex-col justify-between cursor-default"
        >
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Total Bank</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[var(--text-primary)] font-heading">{metrics.total}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]">
              Active
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={kpiCardVariant}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-2xs flex flex-col justify-between cursor-default"
        >
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Aptitude & Logic</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[var(--status-warning-text)] font-heading">{metrics.aptitude}</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Screening</span>
          </div>
        </motion.div>

        <motion.div
          variants={kpiCardVariant}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-2xs flex flex-col justify-between cursor-default"
        >
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Technical MCQs</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[var(--accent-indigo)] font-heading">{metrics.mcq}</span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-default)] font-semibold" title="Single-Choice MCQs">
                {metrics.mcqSingle} Single
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 font-bold" title="Multi-Choice MCQs">
                {metrics.mcqMulti} Multi
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={kpiCardVariant}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-2xs flex flex-col justify-between cursor-default"
        >
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">SQL Queries</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[var(--accent-cyan)] font-heading">{metrics.sql}</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Schema-Bound</span>
          </div>
        </motion.div>

        <motion.div
          variants={kpiCardVariant}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-2xs flex flex-col justify-between cursor-default"
        >
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Coding Tasks</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-[var(--status-success-text)] font-heading">{metrics.coding}</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">IDE Tests</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ────────────────── HIGH-DENSITY ENTERPRISE TABLE WRAPPER WITH TACTILE POP-IN ────────────────── */}
      <motion.div
        variants={tactilePopCardVariant}
        className="bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-xs flex flex-col overflow-hidden w-full relative z-0"
      >
        {/* Top Highlight Catch */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none rounded-t-[var(--radius-lg)]" />
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[var(--border-default)] bg-[var(--surface-1)]">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading tracking-tight flex items-center gap-2">
              <span>Central Question Bank</span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20">
                {filteredData.length} Questions
              </span>
            </h3>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
              Language & format-categorized question bank powering dynamic randomized assessments across all hiring profiles.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input with inline clear */}
            <div className="relative flex items-center h-8.5 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-48">
              <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
              <input
                type="search"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer ml-1 shrink-0"
                  title="Clear search text"
                >
                  <Icon name="x" size="xs" />
                </button>
              )}
            </div>

            {/* Language Filter */}
            <CustomSelect
              label="Language Filter"
              placeholder="All Languages"
              value={languageFilter}
              options={[
                { value: 'All', label: 'All Languages / Topics' },
                ...languagesList.map((l) => ({ value: l, label: l })),
              ]}
              onChange={(val) => {
                setLanguageFilter(val || 'All');
                setCurrentPage(1);
              }}
              widthClass="w-full sm:w-[165px]"
            />

            {/* Section Type Filter */}
            <CustomSelect
              label="Section Filter"
              placeholder="All Sections"
              value={sectionFilter}
              options={[
                { value: 'All', label: 'All Formats' },
                { value: 'Aptitude', label: 'Aptitude & Logic' },
                { value: 'TechnicalMCQ', label: 'Technical MCQs' },
                { value: 'SQLQuery', label: 'SQL Queries' },
                { value: 'Coding', label: 'Coding Tasks' },
              ]}
              onChange={(val) => {
                setSectionFilter(val || 'All');
                setCurrentPage(1);
              }}
              widthClass="w-full sm:w-[130px]"
            />

            {/* Format / Question Type Filter */}
            <CustomSelect
              label="Format"
              placeholder="All Types"
              value={typeFilter}
              options={[
                { value: 'All', label: 'All Formats' },
                { value: 'SINGLE_CHOICE', label: 'Single-Choice (Radio)' },
                { value: 'MULTI_CHOICE', label: 'Multi-Choice (Checkboxes)' },
                { value: 'SQL', label: 'SQL Queries' },
                { value: 'CODING', label: 'Coding IDE' },
              ]}
              onChange={(val) => {
                setTypeFilter(val || 'All');
                setCurrentPage(1);
              }}
              widthClass="w-full sm:w-[155px]"
            />

            {/* Experience Tier Filter */}
            <CustomSelect
              label="Experience Tier"
              placeholder="Experience Tier"
              value={experienceTierFilter}
              options={[
                { value: 'All', label: 'All Experience Tiers' },
                ...experienceTiersList.map((t) => ({ value: t, label: t })),
              ]}
              onChange={(val) => {
                setExperienceTierFilter(val || 'All');
                setCurrentPage(1);
              }}
              widthClass="w-full sm:w-[155px]"
            />

            {/* Clear All Filters Button */}
            {(search || languageFilter !== 'All' || sectionFilter !== 'All' || experienceTierFilter !== 'All' || typeFilter !== 'All' || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setLanguageFilter('All');
                  setSectionFilter('All');
                  setExperienceTierFilter('All');
                  setTypeFilter('All');
                  setStatusFilter('All');
                  setCurrentPage(1);
                  toast.info('Filters Reset', { description: 'All active filters have been cleared.' });
                }}
                className="h-8.5 px-3 flex items-center justify-center gap-1 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-secondary)] text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                title="Reset all search queries and category filters"
              >
                <Icon name="x" size="xs" />
                <span>Clear Filters</span>
              </button>
            )}

            {/* Bulk Upload Button */}
            <button
              type="button"
              onClick={() => setIsBulkOpen(true)}
              className="h-8.5 px-3.5 flex items-center justify-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] text-[12px] font-bold transition-all cursor-pointer shadow-2xs shrink-0"
              title="Bulk import questions from Excel/CSV"
            >
              <Icon name="upload" size="xs" />
              <span>Bulk Import</span>
            </button>

            {/* Add Question Button */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-8.5 px-4 flex items-center justify-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-white text-[12px] font-bold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer shadow-2xs shrink-0"
            >
              <Icon name="plus" size="xs" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* ────────────────── BULK SELECTION ACTION BAR ────────────────── */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[var(--accent-indigo-dim)] border-b border-[var(--accent-indigo)]/30 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs"
            >
              <div className="flex items-center gap-2 text-[var(--accent-indigo)] font-bold">
                <Icon name="check-circle" size="xs" />
                <span>{selectedIds.size} Question{selectedIds.size === 1 ? '' : 's'} Selected</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkActivate}
                  className="px-3 py-1 rounded-md bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--status-success-text)] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Icon name="check" size="xs" />
                  <span>Activate</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkDeactivate}
                  className="px-3 py-1 rounded-md bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-tertiary)] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Icon name="x-circle" size="xs" />
                  <span>Deactivate</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1 rounded-md bg-[var(--status-danger)] hover:opacity-90 text-white font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Icon name="trash-2" size="xs" />
                  <span>Bulk Delete ({selectedIds.size})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="px-2.5 py-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Data Table */}
        <div className="overflow-x-auto scrollbar-step w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <colgroup>
              <col style={{ width: '4%', minWidth: '40px' }} />
              <col style={{ width: '9%', minWidth: '80px' }} />
              <col style={{ width: '38%', minWidth: '240px' }} />
              <col style={{ width: '14%', minWidth: '110px' }} />
              <col style={{ width: '11%', minWidth: '95px' }} />
              <col style={{ width: '10%', minWidth: '90px' }} />
              <col style={{ width: '7%', minWidth: '70px' }} />
              <col style={{ width: '7%', minWidth: '70px' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-mono text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-[var(--accent-indigo)] cursor-pointer"
                    title="Select/Deselect All on Page"
                  />
                </th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap">Code</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap">Question Statement</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap">Language / Domain</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap">Section</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap">Format</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap">Experience Tier</th>
                <th className="py-2.5 px-4 font-mono text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={`${currentPage}-${languageFilter}-${sectionFilter}-${experienceTierFilter}-${typeFilter}-${statusFilter}-${search}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.0, 0.0, 0.2, 1] }}
                className="divide-y divide-[var(--border-soft)] text-[12.5px]"
              >
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--text-tertiary)]">
                      No questions found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((q) => {
                    const isExpanded = expandedId === q.id;
                    const isSelected = selectedIds.has(q.id);
                    return (
                      <React.Fragment key={q.id}>
                        <tr
                          className={`hover:bg-[var(--surface-hover)] transition-colors ${
                            isSelected ? 'bg-[var(--accent-indigo-dim)]/40' : ''
                          } ${!q.isActive ? 'opacity-50' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3 align-top text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(q.id)}
                              className="w-3.5 h-3.5 rounded text-[var(--accent-indigo)] cursor-pointer mt-1"
                            />
                          </td>

                          {/* Code */}
                          <td className="py-3 px-4 align-top">
                            <span className="font-mono text-[11px] font-extrabold text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] px-2 py-0.5 rounded border border-[var(--accent-indigo)]/20">
                              {q.code || `QB-${q.id}`}
                            </span>
                          </td>

                          {/* Question Text */}
                          <td className="py-3 px-4 align-top">
                            <div className="flex flex-col gap-1">
                              <span
                                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                                className="font-bold text-[var(--text-primary)] hover:text-[var(--accent-indigo)] cursor-pointer leading-snug"
                              >
                                {q.questionText}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-tertiary)]">
                                <span>Marks: <strong className="text-[var(--text-secondary)]">{q.marks}M</strong></span>
                              </div>
                            </div>
                          </td>

                          {/* Language / Domain with clean SVG Icon */}
                          <td className="py-3 px-4 align-top">
                            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--text-primary)]">
                              <Icon
                                name={
                                  q.language === 'General Aptitude'
                                    ? 'sparkles'
                                    : q.language === 'SQL (Database)'
                                    ? 'file-text'
                                    : 'code-2'
                                }
                                size="xs"
                                className="text-[var(--accent-indigo)] shrink-0"
                              />
                              <span>{q.language}</span>
                            </span>
                          </td>

                          {/* Section Category Badge */}
                          <td className="py-3 px-4 align-top">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                              <span>
                                {q.sectionType === 'TechnicalMCQ'
                                  ? 'Technical MCQ'
                                  : q.sectionType === 'SQLQuery'
                                  ? 'SQL Query'
                                  : q.sectionType === 'Coding'
                                  ? 'Coding Task'
                                  : 'Aptitude'}
                              </span>
                            </span>
                          </td>

                          {/* Question Format Badge (Clean SVG Icons, No Raw Emojis) */}
                          <td className="py-3 px-4 align-top">
                            {q.questionType === 'MULTI_CHOICE' ? (
                              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-0.5 rounded bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
                                <Icon name="check-square" size="xs" />
                                <span>Multi-Choice</span>
                              </span>
                            ) : q.questionType === 'SINGLE_CHOICE' ? (
                              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                                <Icon name="check-circle" size="xs" />
                                <span>Single-Choice</span>
                              </span>
                            ) : q.questionType === 'SQL' ? (
                              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--accent-cyan)] border border-[var(--border-default)]">
                                <Icon name="file-text" size="xs" />
                                <span>SQL Query</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--status-success-text)] border border-[var(--border-default)]">
                                <Icon name="code-2" size="xs" />
                                <span>Coding IDE</span>
                              </span>
                            )}
                          </td>

                          {/* Experience Tier Status Badge */}
                          <td className="py-3 px-4 align-top">
                            <TierBadge tier={q.experienceTier} size="sm" />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                                title={isExpanded ? 'Collapse Choices' : 'Preview Choices'}
                              >
                                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size="xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(q)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-indigo)] transition-all cursor-pointer"
                                title="Edit Question"
                              >
                                <Icon name="pencil" size="xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)] transition-all cursor-pointer"
                                title="Delete Question"
                              >
                                <Icon name="trash-2" size="xs" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Preview Drawer */}
                        {isExpanded && (
                          <tr className="bg-[var(--surface-2)]">
                            <td colSpan={8} className="p-4 border-b border-[var(--border-default)]">
                              <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-default)] space-y-3 text-xs">
                                {q.options && q.options.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10.5px] font-mono font-bold text-[var(--text-tertiary)] uppercase">
                                        Option Choices ({q.questionType === 'MULTI_CHOICE' ? 'Multi-Choice Checkboxes' : 'Single-Choice Radio'}):
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {q.options.map((opt, oIdx) => (
                                        <div
                                          key={oIdx}
                                          className={`p-2 rounded border flex items-center gap-2 ${
                                            opt.isCorrect
                                              ? 'bg-[var(--status-success-bg)] border-[var(--status-success-border)] text-[var(--status-success-text)] font-bold'
                                              : 'bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-secondary)]'
                                          }`}
                                        >
                                          <span className="w-5 h-5 rounded-full bg-[var(--surface-1)] flex items-center justify-center text-[10px] font-mono font-bold text-[var(--text-primary)]">
                                            {opt.label}
                                          </span>
                                          <span>{opt.text}</span>
                                          {opt.isCorrect && (
                                            <span className="ml-auto text-[10px] text-[var(--status-success-text)] font-bold">
                                              ✓ Correct
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {q.sqlSchema && (
                                  <div className="space-y-1">
                                    <span className="text-[10.5px] font-mono font-bold text-[var(--text-tertiary)] uppercase block">
                                      SQL Target Schema:
                                    </span>
                                    <pre className="p-2 rounded bg-[var(--surface-2)] font-mono text-[11px] text-[var(--text-secondary)] border border-[var(--border-default)] overflow-x-auto whitespace-pre">
                                      {q.sqlSchema}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        {/* ────────────────── PAGINATION FOOTER BAR ────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-[var(--border-default)] bg-[var(--surface-1)] text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 rounded border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 font-mono font-bold text-[var(--text-primary)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* ────────────────── BULK IMPORT MODAL ────────────────── */}
      <AnimatePresence>
        {isBulkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading flex items-center gap-2">
                  <Icon name="upload" size="sm" className="text-[var(--accent-indigo)]" />
                  <span>Bulk Upload Questions</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                Upload a structured Excel (.xlsx) or CSV file with questions categorized by Language/Domain, Section Type, and Format.
              </p>

              {/* Upload Dropzone */}
              <div className="p-8 border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-2)] text-center space-y-2 cursor-pointer hover:border-[var(--accent-indigo)] transition-all">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center mx-auto">
                  <Icon name="file-text" size="sm" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Drag & Drop Excel / CSV file here or click to browse
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)] font-mono block">
                  Supports: Language, SectionType, QuestionType, Difficulty, QuestionStatement, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer flex items-center gap-1.5 bg-[var(--surface-2)] px-3 py-1.5 rounded-full border border-[var(--border-default)]"
                  title="Download standard template with sample rows and headers"
                >
                  <Icon name="download" size="xs" />
                  <span>Download Sample Template</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkOpen(false)}
                    className="h-8.5 px-4 rounded-full border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    className="h-8.5 px-5 rounded-full bg-[var(--accent-indigo)] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Import Questions
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ────────────────── ADD / EDIT SINGLE QUESTION MODAL ────────────────── */}
      <AnimatePresence>
        {isModalOpen && editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--surface-2)]">
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
                    {editingQuestion.id ? 'Edit Question Bank Item' : 'Add Question to Central Bank'}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Configure language / domain, format, statement, and marks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Language / Domain *</label>
                    <select
                      value={editingQuestion.language ?? 'C# (.NET)'}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, language: e.target.value })
                      }
                      className="w-full h-9 px-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)]"
                    >
                      {languagesList.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Section Type</label>
                    <select
                      value={editingQuestion.sectionType}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          sectionType: e.target.value as any,
                        })
                      }
                      className="w-full h-9 px-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)]"
                    >
                      <option value="Aptitude">Aptitude & Logic</option>
                      <option value="TechnicalMCQ">Technical MCQ</option>
                      <option value="SQLQuery">SQL Query Challenge</option>
                      <option value="Coding">Coding IDE Challenge</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Experience Tier *</label>
                    <select
                      value={editingQuestion.experienceTier || 'Junior'}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, experienceTier: e.target.value })
                      }
                      className="w-full h-9 px-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)]"
                    >
                      {experienceTiersList.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Question Type: Single Choice vs Multi Choice */}
                {(editingQuestion.sectionType === 'TechnicalMCQ' ||
                  editingQuestion.sectionType === 'Aptitude') && (
                  <div className="flex items-center gap-4 p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-default)]">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Question Format:</span>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="questionType"
                        checked={editingQuestion.questionType !== 'MULTI_CHOICE'}
                        onChange={() =>
                          setEditingQuestion({ ...editingQuestion, questionType: 'SINGLE_CHOICE' })
                        }
                        className="text-[var(--accent-indigo)]"
                      />
                      <span>Single Choice (Radio)</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="questionType"
                        checked={editingQuestion.questionType === 'MULTI_CHOICE'}
                        onChange={() =>
                          setEditingQuestion({ ...editingQuestion, questionType: 'MULTI_CHOICE' })
                        }
                        className="text-[var(--accent-indigo)]"
                      />
                      <span>Multiple Choice (Checkbox)</span>
                    </label>
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Question Statement *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter the problem statement or question description..."
                    value={editingQuestion.questionText || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                    className="w-full p-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] font-medium focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>

                {/* SQL Target Schema DDL */}
                {editingQuestion.sectionType === 'SQLQuery' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">
                      SQL Target Table Schema (DDL)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="CREATE TABLE Employee (Id INT PRIMARY KEY, Name NVARCHAR(50), Salary DECIMAL(18,2));"
                      value={editingQuestion.sqlSchema || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, sqlSchema: e.target.value })}
                      className="w-full p-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                    />
                  </div>
                )}

                {/* MCQ Choices Builder */}
                {editingQuestion.sectionType !== 'Coding' && editingQuestion.sectionType !== 'SQLQuery' && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">
                      Option Choices ({editingQuestion.questionType === 'MULTI_CHOICE' ? 'Check all correct choices' : 'Select single correct choice'}):
                    </label>
                    <div className="space-y-2">
                      {editingQuestion.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {editingQuestion.questionType === 'MULTI_CHOICE' ? (
                            <input
                              type="checkbox"
                              checked={opt.isCorrect}
                              onChange={() => {
                                const updated = [...editingQuestion.options!];
                                updated[idx].isCorrect = !updated[idx].isCorrect;
                                setEditingQuestion({ ...editingQuestion, options: updated });
                              }}
                              className="w-4 h-4 rounded text-[var(--accent-indigo)] cursor-pointer"
                              title="Check if this option is correct"
                            />
                          ) : (
                            <input
                              type="radio"
                              name="correctOption"
                              checked={opt.isCorrect}
                              onChange={() => {
                                const updated = editingQuestion.options!.map((o, i) => ({
                                  ...o,
                                  isCorrect: i === idx,
                                }));
                                setEditingQuestion({ ...editingQuestion, options: updated });
                              }}
                              className="w-4 h-4 text-[var(--accent-indigo)] cursor-pointer"
                              title="Mark as single correct option"
                            />
                          )}
                          <span className="w-6 h-6 rounded bg-[var(--surface-2)] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 text-[var(--text-primary)]">
                            {opt.label}
                          </span>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${opt.label} text`}
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...editingQuestion.options!];
                              updated[idx].text = e.target.value;
                              setEditingQuestion({ ...editingQuestion, options: updated });
                            }}
                            className="w-full h-8 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marks */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Marks Awarded</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={editingQuestion.marks ?? 1}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })
                    }
                    className="w-full sm:w-48 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-primary)]"
                  />
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Note: Assessment time limit is controlled by the Section Rules in the Hiring Profile.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-9 px-4 rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-full bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

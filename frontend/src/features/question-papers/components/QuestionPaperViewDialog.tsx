'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { QuestionPaper, PaperSection, QuestionItem } from '../types/question-paper.types';

interface QuestionPaperViewDialogProps {
  paper: QuestionPaper;
  onClose: () => void;
  /**
   * mode:
   *  'library'    — read-only viewer with correct answers highlighted (current)
   *  'assessment' — future: candidate submits answers
   *  'evaluation' — future: interviewer sees candidate response + correct answer side-by-side
   */
  mode?: 'library' | 'assessment' | 'evaluation';
}

const QUESTION_TYPE_BADGE: Record<string, string> = {
  SINGLE_CHOICE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  MULTI_CHOICE: 'bg-violet-50 text-violet-700 border-violet-200',
  CODING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SQL: 'bg-amber-50 text-amber-700 border-amber-200',
  SUBJECTIVE: 'bg-purple-50 text-purple-700 border-purple-200',
};

const QUESTION_TYPE_LABEL: Record<string, string> = {
  SINGLE_CHOICE: 'MCQ — Single Choice',
  MULTI_CHOICE: 'MCQ — Multi Choice',
  CODING: 'Coding',
  SQL: 'SQL',
  SUBJECTIVE: 'Subjective',
};

// MCQ Question Card with highlighted correct answer
function MCQQuestionCard({ question, index }: { question: QuestionItem; index: number }) {
  const correctLabels = question.correctOption?.split(',').map((s) => s.trim()) ?? [];

  return (
    <div className="border border-[var(--border-default)] rounded-xl p-4 flex flex-col gap-3 bg-[var(--surface-1)]">
      <div className="flex items-start gap-2">
        <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] shrink-0 mt-0.5">Q{index + 1}</span>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-relaxed">{question.questionText}</p>
      </div>

      <div className="flex flex-col gap-1.5 pl-5">
        {question.options?.map((opt) => {
          const isCorrect = correctLabels.includes(opt.label);
          return (
            <div
              key={opt.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[12.5px] transition-all ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 border-l-4 border-l-emerald-500'
                  : 'bg-[var(--surface-2)] border-[var(--border-default)]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 border ${
                isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)]'
              }`}>
                {opt.label}
              </span>
              <span className={`font-medium ${isCorrect ? 'text-emerald-800 font-bold' : 'text-[var(--text-primary)]'}`}>
                {opt.text}
              </span>
              {isCorrect && (
                <span className="ml-auto text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  ✓ Correct
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// IDE-style viewer for Coding / SQL
function CodeQuestionCard({ question, index }: { question: QuestionItem; index: number }) {
  return (
    <div className="border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--surface-1)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center gap-2">
        <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] shrink-0">Q{index + 1}</span>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug">{question.questionText}</p>
      </div>

      {/* Problem Statement */}
      {question.problemStatement && (
        <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surface-2)]/40">
          <p className="text-[11.5px] font-mono font-bold text-[var(--text-tertiary)] uppercase mb-2">Problem Statement</p>
          <pre className="text-[12.5px] text-[var(--text-primary)] font-mono whitespace-pre-wrap leading-relaxed">{question.problemStatement}</pre>
        </div>
      )}

      {/* IDE-style Dark Code Area */}
      <div className="bg-[#1e1e2e] px-0">
        {/* IDE Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-[11px] font-mono text-slate-400">solution.{question.language === 'Python' ? 'py' : question.language === 'SQL' ? 'sql' : 'js'}</span>
          </div>
          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 text-slate-300 bg-white/5">
            {question.language}
          </span>
        </div>

        {/* Code Area with line numbers */}
        <div className="flex overflow-x-auto">
          <div className="flex flex-col text-right pr-3 pl-3 py-3 text-[11.5px] font-mono text-slate-600 select-none border-r border-white/10 min-w-[2.5rem]">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="leading-6">{i + 1}</span>
            ))}
          </div>
          <div className="py-3 px-4 flex-1">
            <pre className="text-[12.5px] font-mono text-slate-300 leading-6 whitespace-pre-wrap">
              {question.questionType === 'SQL'
                ? `-- Write your SQL query below\n\nSELECT\n    /* your solution */\nFROM\n    /* table */\nWHERE\n    /* condition */;`
                : question.language === 'Python'
                ? `# Write your solution below\n\ndef solution():\n    # Your code here\n    pass\n\n\n# Test\nprint(solution())`
                : `// Write your solution below\n\nfunction solution() {\n  // Your code here\n}\n\n\n// Test\nconsole.log(solution());`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subjective Question Card
function SubjectiveQuestionCard({ question, index }: { question: QuestionItem; index: number }) {
  return (
    <div className="border border-[var(--border-default)] rounded-xl p-4 flex flex-col gap-3 bg-[var(--surface-1)]">
      <div className="flex items-start gap-2">
        <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] shrink-0 mt-0.5">Q{index + 1}</span>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-relaxed">{question.questionText}</p>
      </div>
      <div className="pl-5">
        <div className="h-24 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-2)]/40 flex items-center justify-center text-[12px] text-[var(--text-tertiary)] font-mono">
          Answer area · Max {question.maxWordCount ?? 500} words
        </div>
      </div>
    </div>
  );
}

function SectionTab({ section }: { section: PaperSection }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Section Stats Bar — grid on mobile */}
      <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border-default)] flex flex-col gap-2">
        <span className={`self-start px-2.5 py-0.5 rounded border font-bold text-[10.5px] ${QUESTION_TYPE_BADGE[section.questionType]}`}>
          {QUESTION_TYPE_LABEL[section.questionType]}
        </span>
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-4 gap-x-4 gap-y-1 text-[11.5px] font-mono text-[var(--text-tertiary)]">
          <span><span className="font-bold text-[var(--text-primary)]">{section.totalQuestions}</span> Questions</span>
          <span><span className="font-bold text-[var(--text-primary)]">{section.marksPerQuestion}</span> Marks / Q</span>
          <span><span className="font-bold text-[var(--text-primary)]">{section.totalMarks}</span> Total Marks</span>
          <span><span className="font-bold text-[var(--text-primary)]">{section.timeLimitMinutes}</span> Mins</span>
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-3">
        {section.questions.map((q, idx) => {
          if (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTI_CHOICE') {
            return <MCQQuestionCard key={q.id} question={q} index={idx} />;
          } else if (q.questionType === 'CODING' || q.questionType === 'SQL') {
            return <CodeQuestionCard key={q.id} question={q} index={idx} />;
          } else {
            return <SubjectiveQuestionCard key={q.id} question={q} index={idx} />;
          }
        })}
      </div>
    </div>
  );
}

export const QuestionPaperViewDialog: React.FC<QuestionPaperViewDialogProps> = ({
  paper,
  onClose,
  mode = 'library',
}) => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-stretch justify-end cursor-pointer"
      onClick={onClose}
    >
      {/* Slide-over panel */}
      <div
        className="w-full max-w-3xl h-full flex flex-col bg-[var(--surface-1)] border-l border-[var(--border-default)] shadow-2xl cursor-default overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="px-4 py-3 border-b border-[var(--border-default)] flex flex-col gap-2 bg-[var(--surface-1)] shrink-0">
          {/* Top row: vacancy ref + close button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto scrollbar-none">
              <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)] whitespace-nowrap shrink-0">
                {paper.vacancyId.toUpperCase()}
              </span>
              <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono whitespace-nowrap truncate">→ {paper.vacancyTitle}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer shrink-0"
            >
              <Icon name="x" size="xs" />
            </button>
          </div>
          {/* Title — wraps on mobile */}
          <h2 className="text-[14px] font-extrabold text-[var(--text-primary)] font-heading leading-snug">
            {paper.title}
          </h2>
          {/* Metadata — compact row */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-tertiary)] flex-wrap">
            <span>{paper.totalQuestions} Q</span>
            <span>·</span>
            <span>{paper.totalMarks} Marks</span>
            <span>·</span>
            <span>{paper.durationMins} Mins</span>
            {mode === 'library' && (
              <span className="text-sky-600 font-bold ml-1">· Read-only</span>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-[var(--border-default)] overflow-x-auto scrollbar-none shrink-0 bg-[var(--surface-2)]/40">
          {paper.sections.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(idx)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[11.5px] font-bold whitespace-nowrap shrink-0 cursor-pointer border transition-all ${
                activeSection === idx
                  ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-sm'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)]'
              }`}
            >
              <span>{sec.sectionTitle}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeSection === idx ? 'bg-white/20' : 'bg-[var(--surface-2)]'}`}>
                {sec.totalQuestions}Q
              </span>
            </button>
          ))}
        </div>

        {/* Active Section Questions — Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 scrollbar-thin">
          <SectionTab section={paper.sections[activeSection]} />
        </div>
      </div>
    </div>
  );
};

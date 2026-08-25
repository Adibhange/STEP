'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import {
  useGetExamEvaluationQuery,
  useEvaluateAnswerMutation,
  usePublishAssessmentResultMutation,
} from '@/store/services/api';

export interface CandidateAssessmentEvaluationViewProps {
  candidateId?: string;
  candidateName?: string;
  candidateCode?: string;
  vacancyTitle?: string;
  /** The Assessment-round exam session to review — null/undefined if the candidate has none yet. */
  candidateExamSessionId?: number | null;
  assessmentRounds?: Array<{
    id: number;
    roundNumber: number;
    roundTitle: string;
    roundType: string;
    candidateExamSessionId: number | null;
    status: string;
    scoreObtained?: number | null;
  }>;
  onBack?: () => void;
  onClose?: () => void;
  onFinalizeScore?: (finalScore: number, finalPercentage: number, status: 'Passed' | 'Failed') => void;
}

// Question-type buckets, purely for palette grouping — same grouping logic used on the candidate's
// own exam-taking screen (CandidateExamPortal.tsx), so the round labels line up with what the
// candidate actually saw.
const ROUND_GROUPS: { title: string; types: string[] }[] = [
  { title: 'MCQs', types: ['SINGLE_CHOICE', 'MULTI_CHOICE'] },
  { title: 'Coding Challenges', types: ['CODING'] },
  { title: 'SQL Queries', types: ['SQL'] },
  { title: 'Subjective Essays', types: ['SUBJECTIVE'] },
];

const isMcqType = (type: string) => type === 'SINGLE_CHOICE' || type === 'MULTI_CHOICE';

export const CandidateAssessmentEvaluationView: React.FC<CandidateAssessmentEvaluationViewProps> = ({
  candidateId = '',
  candidateName = 'Candidate',
  candidateCode = 'CND-2026',
  vacancyTitle = 'Assessment Evaluation',
  candidateExamSessionId,
  assessmentRounds = [],
  onBack,
  onClose,
  onFinalizeScore,
}) => {
  const router = useRouter();

  const [activeSessionId, setActiveSessionId] = useState<number | null>(candidateExamSessionId ?? null);

  useEffect(() => {
    if (candidateExamSessionId) {
      setActiveSessionId(candidateExamSessionId);
    }
  }, [candidateExamSessionId]);

  const querySessionId = activeSessionId ?? candidateExamSessionId ?? 0;

  const {
    data: evalRes,
    isLoading,
    isError,
  } = useGetExamEvaluationQuery(querySessionId, { skip: !querySessionId });
  const [evaluateAnswerApi, { isLoading: isSavingAnswer }] = useEvaluateAnswerMutation();
  const [publishResultApi, { isLoading: isPublishing }] = usePublishAssessmentResultMutation();

  const evaluation = evalRes?.data;
  const answers = evaluation?.answers ?? [];

  // Draft marks/notes for non-MCQ answers — synced from the real fetched data exactly once per
  // session load, so a background refetch (e.g. after saving a different answer invalidates the
  // 'Exams' tag) doesn't clobber whatever the evaluator is mid-typing on another question.
  const [marksDraft, setMarksDraft] = useState<Record<number, number>>({});
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const hasSyncedDrafts = useRef<number | null>(null);

  useEffect(() => {
    if (!evaluation || answers.length === 0) return;
    if (hasSyncedDrafts.current === evaluation.candidateExamSessionId) return;
    hasSyncedDrafts.current = evaluation.candidateExamSessionId;

    const marks: Record<number, number> = {};
    const notes: Record<number, string> = {};
    answers.forEach((a) => {
      marks[a.candidateExamAnswerId] = a.marksObtained;
      notes[a.candidateExamAnswerId] = a.evaluatorRemarks ?? '';
    });
    setMarksDraft(marks);
    setNotesDraft(notes);
    setSelectedAnswerId(answers[0].candidateExamAnswerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluation, answers]);

  const selectedAnswer = useMemo(
    () => answers.find((a) => a.candidateExamAnswerId === selectedAnswerId) ?? answers[0],
    [answers, selectedAnswerId]
  );

  // Group answers dynamically by the section name defined in the DB blueprint
  const roundGroups = useMemo(() => {
    const map = new Map<string, typeof answers>();
    answers.forEach((a) => {
      const sectionKey =
        (a as any).sectionName ||
        (isMcqType(a.questionType)
          ? 'Multiple Choice (MCQ)'
          : a.questionType === 'CODING'
            ? 'Coding Challenges'
            : a.questionType === 'SQL'
              ? 'SQL Queries & Schema'
              : 'Subjective Questions');
      if (!map.has(sectionKey)) {
        map.set(sectionKey, []);
      }
      map.get(sectionKey)!.push(a);
    });
    return Array.from(map.entries()).map(([title, grpAnswers]) => ({
      title,
      answers: grpAnswers,
    }));
  }, [answers]);

  const maxPossibleMarks = useMemo(() => {
    const sum = answers.reduce((acc, a) => acc + a.marks, 0);
    return Math.round(sum * 100) / 100;
  }, [answers]);

  const autoMcqScore = useMemo(() => {
    const sum = answers.filter((a) => isMcqType(a.questionType)).reduce((acc, a) => acc + a.marksObtained, 0);
    return Math.round(sum * 100) / 100;
  }, [answers]);

  const manualScore = useMemo(() => {
    const sum = answers.filter((a) => !isMcqType(a.questionType)).reduce((acc, a) => acc + a.marksObtained, 0);
    return Math.round(sum * 100) / 100;
  }, [answers]);

  const currentScore = Math.round((autoMcqScore + manualScore) * 100) / 100;

  const nonMcqAnswers = answers.filter((a) => !isMcqType(a.questionType));
  const allNonMcqEvaluated = nonMcqAnswers.length === 0 || nonMcqAnswers.every((a) => a.evaluationStatus === 'Evaluated' || a.evaluationLocked);
  const isPublished = evaluation?.evaluationStatus === 'Published' || evaluation?.sessionStatus === 'Evaluated';
  const canPublish = (evaluation?.sessionStatus === 'Submitted' || evaluation?.evaluationStatus === 'PartiallyEvaluated') && allNonMcqEvaluated && !isPublished;

  const timeUsedMinutes =
    evaluation?.startedAt && evaluation?.submittedAt
      ? Math.round((new Date(evaluation.submittedAt).getTime() - new Date(evaluation.startedAt).getTime()) / 60000)
      : null;

  const handleSaveAnswer = async () => {
    if (!selectedAnswer || selectedAnswer.evaluationLocked) return;
    const marks = Math.min(selectedAnswer.marks, Math.max(0, marksDraft[selectedAnswer.candidateExamAnswerId] ?? 0));
    try {
      await evaluateAnswerApi({
        sessionId: querySessionId,
        candidateExamAnswerId: selectedAnswer.candidateExamAnswerId,
        marksObtained: marks,
        evaluatorRemarks: notesDraft[selectedAnswer.candidateExamAnswerId] || undefined,
      }).unwrap();
      toast.success('Answer Evaluated', {
        description: `Question #${selectedAnswer.questionDisplayOrder} graded ${marks}/${selectedAnswer.marks} marks.`,
      });
    } catch (err: any) {
      toast.error('Save Failed', { description: err?.data?.message || 'Could not save marks for this question.' });
    }
  };

  const handlePublish = async () => {
    if (!querySessionId) return;
    try {
      const res = await publishResultApi({ sessionId: querySessionId }).unwrap();
      const passed = res.data.resultStatus === 'Pass';
      toast.success('Assessment Result Published', {
        description: `Final Score: ${res.data.totalScore}/${res.data.totalMarks} (${res.data.percentage}% — ${res.data.resultStatus}). Result locked and candidate pipeline updated.`,
      });
      onFinalizeScore?.(Number(res.data.totalScore), Number(res.data.percentage), passed ? 'Passed' : 'Failed');
    } catch (err: any) {
      toast.error('Publish Failed', { description: err?.data?.message || 'Could not publish this result.' });
    }
  };

  const handleBackClick = () => {
    if (onClose) onClose();
    else if (onBack) onBack();
    else router.push(`/dashboard/candidates/${candidateId}`);
  };

  if (!querySessionId) {
    return (
      <div className="min-h-screen bg-[var(--canvas,#f7f8fb)] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-xl max-w-md w-full flex flex-col items-center gap-3">
          <Icon name="alert-triangle" size="lg" className="text-amber-600" />
          <h2 className="text-lg font-extrabold text-amber-700 font-heading">No Assessment Session Yet</h2>
          <p className="text-xs text-slate-500">
            This candidate hasn&apos;t started (or been assigned) an assessment round, so there&apos;s nothing to evaluate yet.
          </p>
          <button
            type="button"
            onClick={handleBackClick}
            className="mt-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Back to Candidate Profile
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--canvas,#f7f8fb)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
          <Icon name="spinner" size="lg" className="animate-spin text-blue-600" />
          <span>Loading assessment evaluation…</span>
        </div>
      </div>
    );
  }

  if (isError || !evaluation || !selectedAnswer) {
    return (
      <div className="min-h-screen bg-[var(--canvas,#f7f8fb)] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-xl max-w-md w-full flex flex-col items-center gap-3">
          <Icon name="alert-triangle" size="lg" className="text-rose-600" />
          <h2 className="text-lg font-extrabold text-rose-700 font-heading">Could Not Load Evaluation</h2>
          <p className="text-xs text-slate-500">This assessment session could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas,#f7f8fb)] text-[var(--text-primary,#0f172a)] flex flex-col font-sans">

      {/* ── 1. FULL-PAGE TOP NAVIGATION HEADER ───────────────────────────────── */}
      <header className="h-16 bg-[var(--surface-1)] border-b border-[var(--border-default)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Icon name="arrow-left" size="xs" />
            <span>Back to Candidate Profile</span>
          </button>

          <div className="h-5 w-px bg-[var(--border-default)] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 flex items-center justify-center font-bold shrink-0">
              <Icon name="clipboard-check" size="xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold font-heading text-[var(--text-primary)] tracking-tight">
                  Candidate Assessment Evaluation Workspace
                </h1>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
                  {candidateCode}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Candidate: <span className="font-semibold text-[var(--text-primary)]">{candidateName}</span> • Vacancy: <span className="font-semibold text-[var(--text-secondary)]">{vacancyTitle}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Round Switcher Tabs (if candidate has multiple assessment sessions) */}
        {assessmentRounds && assessmentRounds.length > 1 && (
          <div className="hidden md:flex items-center gap-1.5 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border-default)]">
            {assessmentRounds.map((rnd) => {
              const isSelected = rnd.candidateExamSessionId === querySessionId;
              return (
                <button
                  key={rnd.id || rnd.roundNumber}
                  type="button"
                  onClick={() => {
                    if (rnd.candidateExamSessionId) setActiveSessionId(rnd.candidateExamSessionId);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent-indigo)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon name={rnd.roundNumber === 1 ? 'file-text' : 'layers'} size="xs" />
                  <span>{rnd.roundTitle || `Round ${rnd.roundNumber}`}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Real session status badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">{evaluation.paperTitle}</span>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
              isPublished
                ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
                : evaluation.sessionStatus === 'Submitted'
                ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]'
                : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
            }`}
          >
            {isPublished ? 'Published' : evaluation.sessionStatus}
          </span>
        </div>
      </header>

      {/* ── 2. 2-COLUMN SPLIT MAIN PAGE BODY ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT SIDEBAR (Round-Wise Square Button Palette) ── */}
        <aside className="w-80 sm:w-96 bg-[var(--surface-1)] border-r border-[var(--border-default)] p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">

          {/* Proctoring Audit Log Card — real data */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Icon name="calendar" size="xs" className="text-[var(--accent-indigo)]" />
                <span>Test Duration & Time Used</span>
              </span>
              <span className="font-mono font-bold text-[var(--text-primary)]">
                {timeUsedMinutes !== null ? `${timeUsedMinutes} / ${evaluation.frozenTotalDurationMinutes} Mins` : `— / ${evaluation.frozenTotalDurationMinutes} Mins`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono border-t border-[var(--border-soft)] pt-2">
              <div className="flex flex-col">
                <span className="text-[var(--text-tertiary)]">Proctoring Violations</span>
                <span className={`font-bold ${evaluation.tabSwitchWarnings > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}`}>
                  {evaluation.tabSwitchWarnings} Warning(s)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--text-tertiary)]">Integrity Score</span>
                <span className={`font-bold ${evaluation.assessmentIntegrityScore < 100 ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}`}>
                  {evaluation.assessmentIntegrityScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Round-Wise Question Palette (SQUARE TILES SHOWING NUMBERS ONLY) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-extrabold text-[var(--text-tertiary)] font-heading uppercase tracking-wider">
              Round Question Palette
            </h4>

            {roundGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] border-b border-[var(--border-default)] pb-1">
                  <span>{group.title}</span>
                  <span className="text-[10px] font-mono text-[var(--accent-indigo)]">
                    {isMcqType(group.answers[0].questionType) ? 'Auto MCQ' : 'Manual Grade'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {group.answers.map((a) => {
                    const isSelected = a.candidateExamAnswerId === selectedAnswer.candidateExamAnswerId;
                    const auto = isMcqType(a.questionType);
                    const isCorrect = auto && a.marksObtained > 0;
                    const isIncorrect = auto && a.marksObtained === 0;

                    return (
                      <button
                        key={a.candidateExamAnswerId}
                        type="button"
                        onClick={() => setSelectedAnswerId(a.candidateExamAnswerId)}
                        className={`w-10 h-10 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-[var(--accent-indigo)] text-white border-2 border-[var(--accent-indigo)] shadow-md scale-105 z-10 font-bold'
                            : isCorrect
                            ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)] hover:bg-[var(--status-success-bg)]/80 font-bold'
                            : isIncorrect
                            ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)] hover:bg-[var(--status-danger-bg)]/80 font-bold'
                            : a.evaluationStatus === 'Evaluated' || a.evaluationLocked
                            ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)] hover:bg-[var(--status-success-bg)]/80 font-bold'
                            : 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)] hover:bg-[var(--status-warning-bg)]/80 font-bold'
                        }`}
                      >
                        <span>{a.questionDisplayOrder}</span>
                        <span className="text-[9px] font-mono opacity-80 leading-none">
                          {a.marksObtained}/{a.marks}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Final Score Summary & Publish Action Card */}
          <div className="mt-auto p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex flex-col gap-3 shadow-2xs">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">
                {isPublished ? 'Published Score' : 'Current Score (Pending Publish)'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-[var(--status-success)]">
                  {currentScore} / {maxPossibleMarks}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[var(--text-tertiary)]">
                MCQ Auto: {autoMcqScore} + Manual: {manualScore}
              </p>
            </div>

            {isPublished ? (
              <div className="p-2.5 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[var(--status-success-text)] text-[11px] font-bold text-center">
                Result published and locked.
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish || isPublishing}
                title={!allNonMcqEvaluated ? 'All coding/SQL/subjective answers must be evaluated first' : undefined}
                className="w-full h-10 rounded-xl bg-[var(--status-success)] hover:opacity-90 text-white font-extrabold text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <Icon name="spinner" size="xs" className="animate-spin" />
                ) : (
                  <Icon name="check-circle" size="xs" />
                )}
                <span>{isPublishing ? 'Publishing…' : 'Publish Result & Lock'}</span>
              </button>
            )}
            {!isPublished && !allNonMcqEvaluated && (
              <p className="text-[10px] text-[var(--status-warning-text)] font-semibold text-center">
                Evaluate every Coding/SQL/Subjective answer before publishing.
              </p>
            )}
          </div>
        </aside>

        {/* ── RIGHT MAIN PANEL (Selected Question Viewer & Manual Evaluation Form) ── */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin bg-[var(--canvas)]">

          {/* Selected Question Header */}
          <div className="flex items-start justify-between border-b border-[var(--border-default)] pb-3 flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] text-xs font-mono font-extrabold border border-[var(--accent-indigo)]/30">
                  Question #{selectedAnswer.questionDisplayOrder}
                </span>
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.2 rounded bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                  {selectedAnswer.questionType}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-heading mt-1 leading-relaxed">
                {selectedAnswer.questionText}
              </h3>
            </div>

            <div className="flex flex-col items-end shrink-0 font-mono">
              <span className="text-sm font-extrabold text-[var(--status-success)]">
                {selectedAnswer.marksObtained} / {selectedAnswer.marks} Marks
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded mt-0.5 ${isMcqType(selectedAnswer.questionType) ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]' : 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)]'}`}>
                {isMcqType(selectedAnswer.questionType) ? 'Auto-Evaluated' : selectedAnswer.evaluationLocked ? 'Locked (Published)' : 'Manual Evaluation Required'}
              </span>
            </div>
          </div>

          {/* ── MCQs: Auto-Evaluated Choice Viewer ──────────────────────────── */}
          {isMcqType(selectedAnswer.questionType) && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs font-semibold flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-[var(--status-success-text)]">
                  <Icon name="check-circle" size="xs" className="shrink-0 text-[var(--status-success)]" />
                  <span>Auto-Evaluated by System Engine. Correct options are scored automatically.</span>
                </div>
                {selectedAnswer.selectedOptionIds.length === 0 ? (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)]">
                    Unattempted by Candidate
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
                    Candidate Answered
                  </span>
                )}
              </div>

              {selectedAnswer.selectedOptionIds.length === 0 && (
                <div className="p-3 rounded-xl bg-[var(--status-warning-bg)]/40 border border-[var(--status-warning-border)] text-[var(--status-warning-text)] text-xs font-medium flex items-center gap-2">
                  <Icon name="alert-triangle" size="xs" className="shrink-0 text-[var(--status-warning-text)]" />
                  <span>Candidate did not select any option for this question.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                {selectedAnswer.options.map((opt) => {
                  const isSelected = selectedAnswer.selectedOptionIds.includes(opt.id);
                  const isCorrect = opt.isCorrect;

                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                        isSelected && isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold shadow-md ring-1 ring-emerald-500/30'
                          : isSelected && !isCorrect
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 font-bold shadow-md ring-1 ring-rose-500/30'
                          : !isSelected && isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300/90 font-medium'
                          : 'bg-[var(--surface-1)] border-[var(--border-default)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0 border ${
                            isSelected && isCorrect
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : isSelected && !isCorrect
                              ? 'bg-rose-500 text-white border-rose-400'
                              : isCorrect
                              ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
                              : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
                          }`}
                        >
                          {isSelected ? (isCorrect ? '✓' : '✗') : opt.label}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {isSelected && isCorrect && (
                          <>
                            <span className="text-[10px] font-mono font-extrabold text-emerald-300 bg-emerald-900/70 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
                              <span>✓ Candidate Choice</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/30">
                              Correct Key
                            </span>
                          </>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-[10px] font-mono font-extrabold text-rose-300 bg-rose-900/70 px-2 py-0.5 rounded border border-rose-500/50 flex items-center gap-1">
                            <span>✗ Candidate Choice (Wrong)</span>
                          </span>
                        )}
                        {!isSelected && isCorrect && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400/90 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                            Correct Answer (Not Selected)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NON-MCQs: Submitted Code / SQL / Essay Viewer ────────────────── */}
          {!isMcqType(selectedAnswer.questionType) && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                <span>Candidate Submitted {selectedAnswer.questionType} Solution:</span>
              </div>

              <pre className="p-4 rounded-xl bg-[#0d1117] text-emerald-400 border border-[var(--border-default)] font-mono text-xs leading-relaxed overflow-x-auto scrollbar-thin max-h-80 shadow-2xs">
                <code>{selectedAnswer.submittedAnswerText || '(No answer submitted)'}</code>
              </pre>
            </div>
          )}

          {/* ── MANUAL EVALUATION FORM PANEL (For Non-MCQ Questions) ─────────── */}
          {!isMcqType(selectedAnswer.questionType) && (
            <div className="mt-auto p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)] flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                <h4 className="text-xs font-extrabold text-[var(--status-warning-text)] font-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="pencil" size="xs" />
                  <span>Manual Evaluation & Marks Input</span>
                </h4>
                <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                  Max Allowed: {selectedAnswer.marks} Marks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Awarded Marks</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={selectedAnswer.marks}
                      disabled={selectedAnswer.evaluationLocked}
                      value={marksDraft[selectedAnswer.candidateExamAnswerId] ?? selectedAnswer.marksObtained}
                      onChange={(e) =>
                        setMarksDraft((prev) => ({
                          ...prev,
                          [selectedAnswer.candidateExamAnswerId]: Math.min(selectedAnswer.marks, Math.max(0, Number(e.target.value) || 0)),
                        }))
                      }
                      className="w-full h-10 px-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-primary)] font-mono text-sm font-extrabold outline-none focus:border-[var(--accent-indigo)] shadow-2xs disabled:opacity-60"
                    />
                    <span className="text-xs font-mono text-[var(--text-tertiary)] font-bold">/ {selectedAnswer.marks}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Evaluator Feedback & Remarks</label>
                  <textarea
                    value={notesDraft[selectedAnswer.candidateExamAnswerId] ?? selectedAnswer.evaluatorRemarks ?? ''}
                    disabled={selectedAnswer.evaluationLocked}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({ ...prev, [selectedAnswer.candidateExamAnswerId]: e.target.value }))
                    }
                    placeholder="Enter manual evaluation feedback notes for this candidate response..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] scrollbar-thin leading-relaxed shadow-2xs disabled:opacity-60"
                  />
                </div>
              </div>

              {!selectedAnswer.evaluationLocked && (
                <button
                  type="button"
                  onClick={handleSaveAnswer}
                  disabled={isSavingAnswer}
                  className="self-end px-4 py-2 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/90 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingAnswer ? <Icon name="spinner" size="xs" className="animate-spin" /> : <Icon name="check" size="xs" />}
                  <span>{isSavingAnswer ? 'Saving…' : 'Save Evaluation'}</span>
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

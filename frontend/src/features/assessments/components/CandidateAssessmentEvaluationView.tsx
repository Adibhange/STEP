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
  onBack,
  onClose,
  onFinalizeScore,
}) => {
  const router = useRouter();

  const {
    data: evalRes,
    isLoading,
    isError,
  } = useGetExamEvaluationQuery(candidateExamSessionId ?? 0, { skip: !candidateExamSessionId });
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

  // Group answers into round-like buckets by question type for the palette.
  const roundGroups = useMemo(() => {
    return ROUND_GROUPS
      .map((g) => ({ title: g.title, answers: answers.filter((a) => g.types.includes(a.questionType)) }))
      .filter((g) => g.answers.length > 0);
  }, [answers]);

  const maxPossibleMarks = useMemo(() => answers.reduce((acc, a) => acc + a.marks, 0), [answers]);
  const autoMcqScore = useMemo(
    () => answers.filter((a) => isMcqType(a.questionType)).reduce((acc, a) => acc + a.marksObtained, 0),
    [answers]
  );
  const manualScore = useMemo(
    () => answers.filter((a) => !isMcqType(a.questionType)).reduce((acc, a) => acc + a.marksObtained, 0),
    [answers]
  );
  const currentScore = autoMcqScore + manualScore;

  const nonMcqAnswers = answers.filter((a) => !isMcqType(a.questionType));
  const allNonMcqEvaluated = nonMcqAnswers.length === 0 || nonMcqAnswers.every((a) => a.evaluationStatus === 'Evaluated' || a.evaluationLocked);
  const isPublished = evaluation?.evaluationStatus === 'Published' || evaluation?.sessionStatus === 'Evaluated';
  const canPublish = evaluation?.sessionStatus === 'Submitted' && allNonMcqEvaluated && !isPublished;

  const timeUsedMinutes =
    evaluation?.startedAt && evaluation?.submittedAt
      ? Math.round((new Date(evaluation.submittedAt).getTime() - new Date(evaluation.startedAt).getTime()) / 60000)
      : null;

  const handleSaveAnswer = async () => {
    if (!selectedAnswer || selectedAnswer.evaluationLocked) return;
    const marks = Math.min(selectedAnswer.marks, Math.max(0, marksDraft[selectedAnswer.candidateExamAnswerId] ?? 0));
    try {
      await evaluateAnswerApi({
        candidateExamAnswerId: selectedAnswer.candidateExamAnswerId,
        marksObtained: marks,
        evaluatorRemarks: notesDraft[selectedAnswer.candidateExamAnswerId] || undefined,
      }).unwrap();
      toast.success('Evaluation Saved', { description: `Question #${selectedAnswer.questionDisplayOrder} scored ${marks}/${selectedAnswer.marks}.` });
    } catch (err: any) {
      toast.error('Save Failed', { description: err?.data?.message || 'Could not save this evaluation.' });
    }
  };

  const handlePublish = async () => {
    if (!candidateExamSessionId) return;
    try {
      const res = await publishResultApi({ sessionId: candidateExamSessionId }).unwrap();
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

  if (!candidateExamSessionId) {
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
      <header className="h-16 bg-white border-b border-[var(--border-default,rgba(15,23,42,0.09))] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Icon name="arrow-left" size="xs" />
            <span>Back to Candidate Profile</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold shrink-0">
              <Icon name="clipboard-check" size="xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold font-heading text-slate-900 tracking-tight">
                  Candidate Assessment Evaluation Workspace
                </h1>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {candidateCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Candidate: <span className="font-semibold text-slate-800">{candidateName}</span> • Vacancy: <span className="font-semibold text-slate-800">{vacancyTitle}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Real session status badge — replaces the old fictional multi-attempt tab switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">{evaluation.paperTitle}</span>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : evaluation.sessionStatus === 'Submitted'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isPublished ? 'Published' : evaluation.sessionStatus}
          </span>
        </div>
      </header>

      {/* ── 2. 2-COLUMN SPLIT MAIN PAGE BODY ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT SIDEBAR (Round-Wise Square Button Palette) ── */}
        <aside className="w-80 sm:w-96 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">

          {/* Proctoring Audit Log Card — real data */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Icon name="calendar" size="xs" className="text-blue-600" />
                <span>Test Duration & Time Used</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {timeUsedMinutes !== null ? `${timeUsedMinutes} / ${evaluation.frozenTotalDurationMinutes} Mins` : `— / ${evaluation.frozenTotalDurationMinutes} Mins`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono border-t border-slate-200 pt-2">
              <div className="flex flex-col">
                <span className="text-slate-500">Proctoring Violations</span>
                <span className={`font-bold ${evaluation.tabSwitchWarnings > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {evaluation.tabSwitchWarnings} Warning(s)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Integrity Score</span>
                <span className={`font-bold ${evaluation.assessmentIntegrityScore < 100 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {evaluation.assessmentIntegrityScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Round-Wise Question Palette (SQUARE TILES SHOWING NUMBERS ONLY) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-extrabold text-slate-500 font-heading uppercase tracking-wider">
              Round Question Palette
            </h4>

            {roundGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200 pb-1">
                  <span>{group.title}</span>
                  <span className="text-[10px] font-mono text-blue-700">
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
                            ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-md scale-105 z-10 font-bold'
                            : isCorrect
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold'
                            : isIncorrect
                            ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-bold'
                            : a.evaluationStatus === 'Evaluated' || a.evaluationLocked
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold'
                            : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 font-bold'
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
          <div className="mt-auto p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 shadow-2xs">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-500">
                {isPublished ? 'Published Score' : 'Current Score (Pending Publish)'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-emerald-600">
                  {currentScore} / {maxPossibleMarks}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                MCQ Auto: {autoMcqScore} + Manual: {manualScore}
              </p>
            </div>

            {isPublished ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold text-center">
                Result published and locked.
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish || isPublishing}
                title={!allNonMcqEvaluated ? 'All coding/SQL/subjective answers must be evaluated first' : undefined}
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-[10px] text-amber-700 font-semibold text-center">
                Evaluate every Coding/SQL/Subjective answer before publishing.
              </p>
            )}
          </div>
        </aside>

        {/* ── RIGHT MAIN PANEL (Selected Question Viewer & Manual Evaluation Form) ── */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin bg-white">

          {/* Selected Question Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-extrabold border border-blue-200">
                  Question #{selectedAnswer.questionDisplayOrder}
                </span>
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {selectedAnswer.questionType}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mt-1 leading-relaxed">
                {selectedAnswer.questionText}
              </h3>
            </div>

            <div className="flex flex-col items-end shrink-0 font-mono">
              <span className="text-sm font-extrabold text-emerald-700">
                {selectedAnswer.marksObtained} / {selectedAnswer.marks} Marks
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded mt-0.5 ${isMcqType(selectedAnswer.questionType) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {isMcqType(selectedAnswer.questionType) ? 'Auto-Evaluated' : selectedAnswer.evaluationLocked ? 'Locked (Published)' : 'Manual Evaluation Required'}
              </span>
            </div>
          </div>

          {/* ── MCQs: Auto-Evaluated Choice Viewer ──────────────────────────── */}
          {isMcqType(selectedAnswer.questionType) && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Icon name="check-circle" size="xs" className="shrink-0 text-emerald-600" />
                <span>Auto-Evaluated by System Engine. Correct options are scored automatically.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                {selectedAnswer.options.map((opt) => {
                  const isSelected = selectedAnswer.selectedOptionIds.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        opt.isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                          : isSelected && !opt.isCorrect
                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-500">{opt.label}.</span>
                        <span>{opt.text}</span>
                      </div>

                      {opt.isCorrect && (
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          Correct Answer
                        </span>
                      )}
                      {isSelected && !opt.isCorrect && (
                        <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                          Candidate Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NON-MCQs: Submitted Code / SQL / Essay Viewer ────────────────── */}
          {!isMcqType(selectedAnswer.questionType) && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span>Candidate Submitted {selectedAnswer.questionType} Solution:</span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto scrollbar-thin max-h-80 shadow-2xs">
                <code>{selectedAnswer.submittedAnswerText || '(No answer submitted)'}</code>
              </pre>
            </div>
          )}

          {/* ── MANUAL EVALUATION FORM PANEL (For Non-MCQ Questions) ─────────── */}
          {!isMcqType(selectedAnswer.questionType) && (
            <div className="mt-auto p-5 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-amber-700 font-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="pencil" size="xs" />
                  <span>Manual Evaluation & Marks Input</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Max Allowed: {selectedAnswer.marks} Marks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Awarded Marks</label>
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
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm font-extrabold outline-none focus:border-blue-500 shadow-2xs disabled:opacity-60"
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold">/ {selectedAnswer.marks}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Evaluator Feedback & Remarks</label>
                  <textarea
                    value={notesDraft[selectedAnswer.candidateExamAnswerId] ?? selectedAnswer.evaluatorRemarks ?? ''}
                    disabled={selectedAnswer.evaluationLocked}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({ ...prev, [selectedAnswer.candidateExamAnswerId]: e.target.value }))
                    }
                    placeholder="Enter manual evaluation feedback notes for this candidate response..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500 scrollbar-thin leading-relaxed shadow-2xs disabled:opacity-60"
                  />
                </div>
              </div>

              {!selectedAnswer.evaluationLocked && (
                <button
                  type="button"
                  onClick={handleSaveAnswer}
                  disabled={isSavingAnswer}
                  className="self-end px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
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

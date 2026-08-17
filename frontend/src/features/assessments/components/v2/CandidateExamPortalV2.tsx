'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@/design-system';
import {
  useStartExamSessionMutation,
  useSaveExamAnswerBatchV2Mutation,
  useSubmitExamMutation,
  usePublishAssessmentResultV2Mutation,
  useReportExamViolationMutation,
  type LiveExamWorkspaceData,
  type ExamQuestionData,
} from '@/store/services/api';

interface CandidateExamPortalV2Props {
  initialCandidateCode?: string;
  initialPasscode?: string;
}

export const CandidateExamPortalV2: React.FC<CandidateExamPortalV2Props> = ({
  initialCandidateCode = '',
  initialPasscode = '',
}) => {
  // Login / Start State
  const [candidateCode, setCandidateCode] = useState(initialCandidateCode);
  const [passcode, setPasscode] = useState(initialPasscode);
  const [session, setSession] = useState<LiveExamWorkspaceData | null>(null);
  const [sessionId, setSessionId] = useState<number>(0);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Exam Workspace State
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<number, { text?: string; optionIds: number[]; updatedAt: string }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Proctoring Violations
  const [tabWarnings, setTabWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  // Mutations
  const [startSession, { isLoading: isStarting }] = useStartExamSessionMutation();
  const [saveAnswerBatch] = useSaveExamAnswerBatchV2Mutation();
  const [submitExam, { isLoading: isSubmitting }] = useSubmitExamMutation();
  const [publishResult] = usePublishAssessmentResultV2Mutation();
  const [reportViolation] = useReportExamViolationMutation();

  // Network listener
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setSyncMessage('Network restored. Flushing buffered answers...');
      flushPendingAnswers();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage('Network disconnected. Answers will buffer locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session, answersMap]);

  // Load from LocalStorage buffer on start
  useEffect(() => {
    if (session?.sessionToken) {
      const storageKey = `step_v2_exam_${session.sessionToken}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.answersMap) setAnswersMap(parsed.answersMap);
          if (parsed.activeIdx !== undefined) setActiveIdx(parsed.activeIdx);
          if (parsed.timeLeft !== undefined && parsed.timeLeft > 0) setTimeLeft(parsed.timeLeft);
        }
      } catch (e) {
        console.warn('LocalStorage read error', e);
      }
    }
  }, [session?.sessionToken]);

  // Save to LocalStorage buffer
  const persistLocally = useCallback(
    (newMap: Record<number, any>, currentIdx: number, remainingTime: number) => {
      if (session?.sessionToken) {
        const storageKey = `step_v2_exam_${session.sessionToken}`;
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              answersMap: newMap,
              activeIdx: currentIdx,
              timeLeft: remainingTime,
              lastSaved: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.warn('LocalStorage write error', e);
        }
      }
    },
    [session?.sessionToken]
  );

  // Flush pending answers to backend
  const flushPendingAnswers = useCallback(async () => {
    if (!session?.sessionToken || !navigator.onLine || isSyncing) return;

    const answerList = Object.entries(answersMap).map(([qId, val]) => ({
      candidateExamSessionQuestionId: Number(qId),
      submittedAnswerText: val.text || null,
      selectedOptionIds: val.optionIds || [],
      clientTimestamp: val.updatedAt,
    }));

    if (answerList.length === 0) return;

    setIsSyncing(true);
    try {
      await saveAnswerBatch({
        sessionToken: session.sessionToken,
        answers: answerList,
      }).unwrap();
      setPendingSyncCount(0);
      setSyncMessage('All answers synced to server.');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (e) {
      console.warn('Batch sync retry pending', e);
    } finally {
      setIsSyncing(false);
    }
  }, [session?.sessionToken, answersMap, isSyncing, saveAnswerBatch]);

  // Timer countdown
  useEffect(() => {
    if (!session || isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        if (nextTime <= 0) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        if (nextTime % 30 === 0) {
          // periodic background sync every 30 seconds
          flushPendingAnswers();
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isSubmitted, timeLeft, flushPendingAnswers]);

  // Proctoring tab switch detector
  useEffect(() => {
    if (!session || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings((prev) => {
          const next = prev + 1;
          setShowWarningModal(true);
          reportViolation({ sessionToken: session.sessionToken, violationType: 'TabSwitch' });
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session, isSubmitted, reportViolation]);

  // Handle Login & Start
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await startSession({
        candidateCode: candidateCode.trim(),
        passcode: passcode.trim(),
        testSource: 'Online',
      }).unwrap();

      if (res.success && res.data) {
        setSession(res.data);
        setSessionId((res.data as any).id || 1);
        setTimeLeft(res.data.totalTimeLeftSeconds > 0 ? res.data.totalTimeLeftSeconds : res.data.durationMinutes * 60);
        setActiveIdx(res.data.activeQuestionIndex || 0);

        // Prepopulate answers if resuming
        const initialAnswers: Record<number, any> = {};
        res.data.questions?.forEach((q) => {
          if (q.selectedOptionIds && q.selectedOptionIds.length > 0) {
            initialAnswers[q.id] = {
              optionIds: q.selectedOptionIds,
              text: q.submittedAnswerText || '',
              updatedAt: new Date().toISOString(),
            };
          }
        });
        setAnswersMap(initialAnswers);
      }
    } catch (err: any) {
      setLoginError(err?.data?.message || 'Invalid Candidate Code or Passcode. Please check your credentials.');
    }
  };

  // Option select handler
  const handleSelectOption = (questionId: number, optionId: number, isMulti: boolean) => {
    const current = answersMap[questionId] || { optionIds: [], text: '', updatedAt: '' };
    let newOptionIds: number[];

    if (isMulti) {
      newOptionIds = current.optionIds.includes(optionId)
        ? current.optionIds.filter((id) => id !== optionId)
        : [...current.optionIds, optionId];
    } else {
      newOptionIds = [optionId];
    }

    const updated = {
      ...answersMap,
      [questionId]: {
        ...current,
        optionIds: newOptionIds,
        updatedAt: new Date().toISOString(),
      },
    };

    setAnswersMap(updated);
    setPendingSyncCount((prev) => prev + 1);
    persistLocally(updated, activeIdx, timeLeft);
  };

  // Text answer change handler
  const handleTextChange = (questionId: number, text: string) => {
    const current = answersMap[questionId] || { optionIds: [], text: '', updatedAt: '' };
    const updated = {
      ...answersMap,
      [questionId]: {
        ...current,
        text,
        updatedAt: new Date().toISOString(),
      },
    };

    setAnswersMap(updated);
    persistLocally(updated, activeIdx, timeLeft);
  };

  // Final Submit Handler with Zero-Touch Auto Evaluation
  const handleFinalSubmit = async () => {
    if (!session || isSubmitting) return;

    try {
      // 1. Flush any remaining buffered answers
      await flushPendingAnswers();

      // 2. Submit session
      const subRes = await submitExam({ sessionToken: session.sessionToken }).unwrap();

      // 3. Trigger V2 Auto-grade and auto-advance
      let pubRes: any = null;
      try {
        if (sessionId > 0) {
          pubRes = await publishResult({ sessionId }).unwrap();
        }
      } catch (e) {
        console.warn('Auto-publish fallback', e);
      }

      setIsSubmitted(true);
      setSubmitResult({
        ...subRes?.data,
        ...pubRes?.data,
      });

      // Clear local buffer
      localStorage.removeItem(`step_v2_exam_${session.sessionToken}`);
    } catch (err: any) {
      alert('Error submitting exam: ' + (err?.data?.message || 'Please retry.'));
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion: ExamQuestionData | null = useMemo(() => {
    return session?.questions?.[activeIdx] || null;
  }, [session, activeIdx]);

  // ────────────────── LOGIN SCREEN ──────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md">
              <Icon name="zap" size="md" />
            </div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] font-heading">
              STEP Assessment Portal
            </h1>
            <p className="text-xs text-[var(--text-tertiary)]">
              Enter your candidate test credentials to begin your evaluation.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] text-xs font-semibold flex items-center gap-2">
              <Icon name="alert-triangle" size="xs" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Candidate Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CAN-2026-1001"
                value={candidateCode}
                onChange={(e) => setCandidateCode(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">4-Digit Exam Passcode</label>
              <input
                type="password"
                required
                maxLength={8}
                placeholder="••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono font-bold text-[var(--text-primary)] tracking-widest focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isStarting}
              className="w-full h-11 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isStarting ? <Icon name="spinner" size="xs" className="animate-spin" /> : <Icon name="shield-check" size="xs" />}
              <span>Start Assessment</span>
            </button>
          </form>

          <div className="text-center text-[11px] text-[var(--text-tertiary)] flex items-center justify-center gap-1.5 pt-2">
            <Icon name="lock" size="xs" />
            <span>Secure Offline-Resilient Proctoring Enabled</span>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────── SUBMISSION COMPLETE SCREEN ──────────────────
  if (isSubmitted) {
    const isPassed = submitResult?.resultStatus === 'Pass' || submitResult?.percentage >= 65;
    return (
      <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${
              isPassed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            <Icon name={isPassed ? 'check' : 'clipboard-check'} size="lg" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading">
              Assessment Completed!
            </h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              Thank you, {session.candidateName}. Your answers have been recorded and auto-evaluated.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--surface-2)] border border-[var(--border-default)] space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--border-default)]">
              <span className="text-[var(--text-tertiary)] font-bold">Candidate</span>
              <span className="font-bold text-[var(--text-primary)]">{session.candidateName}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-[var(--border-default)]">
              <span className="text-[var(--text-tertiary)] font-bold">Target Role</span>
              <span className="font-bold text-[var(--text-primary)]">{session.vacancyTitle}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-tertiary)] font-bold">Screening Status</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isPassed ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
              }`}>
                {isPassed ? '⚡ Qualified & Stage Advanced' : 'Evaluation Recorded'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)]">
            {isPassed
              ? 'Congratulations! You have qualified for the next stage. The recruitment team has scheduled your Technical Interview.'
              : 'Your responses have been securely submitted to the recruitment team for final review.'}
          </p>
        </div>
      </div>
    );
  }

  // ────────────────── LIVE EXAM WORKSPACE ──────────────────
  return (
    <div className="min-h-screen bg-[var(--surface-base)] flex flex-col">
      {/* Top Proctoring & Timer Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface-1)] border-b border-[var(--border-default)] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Icon name="zap" size="xs" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[var(--text-primary)] font-heading leading-tight">
              {session.paperTitle || 'Recruitment Assessment'}
            </h2>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
              {session.candidateName} • {session.vacancyTitle}
            </span>
          </div>
        </div>

        {/* Network & Timer Pill Bar */}
        <div className="flex items-center gap-3">
          {/* Offline Sync Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isOnline
                ? pendingSyncCount > 0
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>
              {isOnline
                ? isSyncing
                  ? 'Syncing...'
                  : pendingSyncCount > 0
                  ? `Sync Pending (${pendingSyncCount})`
                  : '🟢 Online & Synced'
                : `🟡 Offline (${pendingSyncCount} Buffered)`}
            </span>
          </div>

          {/* Time Left Countdown */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-black border ${
              timeLeft < 300
                ? 'bg-rose-500/15 text-rose-600 border-rose-500/30 animate-pulse'
                : 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-default)]'
            }`}
          >
            <Icon name="calendar" size="xs" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="h-8 px-4 rounded-full bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? <Icon name="spinner" size="xs" className="animate-spin" /> : <Icon name="check" size="xs" />}
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Test Layout: Navigation Sidebar + Question Canvas */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
        {/* Question Canvas */}
        <main className="flex-1 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] p-6 flex flex-col justify-between shadow-2xs">
          {currentQuestion && (
            <div className="space-y-6">
              {/* Question Meta Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <span className="text-xs font-black text-[var(--text-tertiary)] uppercase font-mono tracking-wider">
                  Question {activeIdx + 1} of {session.questions.length}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                  {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                </span>
              </div>

              {/* Question Text */}
              <div className="text-base font-bold text-[var(--text-primary)] font-heading leading-relaxed">
                {currentQuestion.questionText}
              </div>

              {/* Options */}
              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = answersMap[currentQuestion.id]?.optionIds.includes(opt.id) || false;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id, false)}
                        className={`w-full text-left p-3.5 rounded-[var(--radius-xl)] border text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent-indigo-dim)] border-[var(--accent-indigo)] text-[var(--accent-indigo)] shadow-xs'
                            : 'bg-[var(--surface-2)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-[var(--accent-indigo)] text-white'
                              : 'bg-[var(--surface-3)] text-[var(--text-tertiary)]'
                          }`}
                        >
                          {opt.label || '•'}
                        </div>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Subjective/Coding Answer Textarea */}
              {(!currentQuestion.options || currentQuestion.options.length === 0) && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Your Answer / Code</label>
                  <textarea
                    rows={8}
                    value={answersMap[currentQuestion.id]?.text || ''}
                    onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your detailed answer or code here..."
                    className="w-full p-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent-indigo)] focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--border-default)] mt-6">
            <button
              type="button"
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeIdx === 0}
              className="h-9 px-4 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Icon name="chevron-left" size="xs" />
              <span>Previous</span>
            </button>

            <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
              {Object.keys(answersMap).length} of {session.questions.length} Answered
            </span>

            <button
              type="button"
              onClick={() => setActiveIdx((prev) => Math.min(session.questions.length - 1, prev + 1))}
              disabled={activeIdx === session.questions.length - 1}
              className="h-9 px-4 rounded-full bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>Next</span>
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>
        </main>

        {/* Question Palette Sidebar */}
        <aside className="w-72 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-2xl)] p-5 hidden lg:flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase font-mono tracking-wider">
              Question Navigator
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {session.questions.map((q, idx) => {
                const isAnswered = answersMap[q.id]?.optionIds.length > 0 || (answersMap[q.id]?.text && answersMap[q.id].text!.trim().length > 0);
                const isCurrent = activeIdx === idx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`h-9 rounded-[var(--radius-lg)] text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center border ${
                      isCurrent
                        ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)] shadow-xs scale-105'
                        : isAnswered
                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--border-default)] space-y-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[var(--text-secondary)]">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--surface-3)] border border-[var(--border-default)]" />
              <span className="text-[var(--text-tertiary)]">Unanswered</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Proctoring Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[var(--surface-1)] border border-rose-500/40 rounded-[var(--radius-xl)] shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-600 mx-auto flex items-center justify-center">
              <Icon name="alert-triangle" size="md" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-rose-600 font-heading">
                Proctoring Warning (#{tabWarnings})
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                You navigated away from the exam tab. Tab switches are logged and decrease your test integrity score.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full h-9 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

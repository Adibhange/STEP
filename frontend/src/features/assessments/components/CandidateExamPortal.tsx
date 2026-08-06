'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CodeEditorIDE } from './CodeEditorIDE';
import {
  useStartExamSessionMutation,
  useResumeExamSessionQuery,
  useSaveExamAnswerMutation,
  useSubmitExamMutation,
  useReportExamViolationMutation,
  type LiveExamWorkspaceData,
  type ExamQuestionData,
} from '@/store/services/api';

export interface ExamOption {
  label: string;
  text: string;
  optionId: number;
}

export interface ExamQuestion {
  id: string;
  number: number;
  roundNumber: number;
  roundTitle: string;
  sectionTitle: string;
  type: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';
  category: string;
  questionText: string;
  marks: number;
  timeAllowedMinutes: number;
  options?: ExamOption[];
  codeTemplate?: string;
  sqlSchema?: string;
  language?: string;
}

export interface AssessmentRoundConfig {
  roundNumber: number;
  roundTitle: string;
  shortTitle: string;
  durationMinutes: number;
  questionCount: number;
  totalMarks: number;
}

export interface CandidateExamPortalProps {
  testMode?: 'From Home' | 'In Office';
  sessionToken?: string;
  candidateName?: string;
  candidateCode?: string;
  candidateEmail?: string;
  vacancyTitle?: string;
  paperTitle?: string;
  durationMinutes?: number;
  passingPercentage?: number;
  onExamComplete?: (score: number, total: number) => void;
}

// Question-type buckets rendered as "rounds" in the UI — this is the same grouping the
// recruiter configures as Assessment Sections (MCQ / Coding / SQL / Subjective) when building
// the vacancy's question paper. A paper missing a category simply has fewer rounds shown.
const ROUND_TYPE_GROUPS: { title: string; shortTitle: string; types: ExamQuestion['type'][] }[] = [
  { title: 'Multiple Choice Questions (MCQs)', shortTitle: 'MCQs', types: ['SINGLE_CHOICE', 'MULTI_CHOICE'] },
  { title: 'Algorithmic Coding Challenge', shortTitle: 'Coding Challenge', types: ['CODING'] },
  { title: 'Database & SQL Queries', shortTitle: 'SQL Queries', types: ['SQL'] },
  { title: 'System Design Architecture', shortTitle: 'Subjective Architecture', types: ['SUBJECTIVE'] },
];

/**
 * Groups the paper's real (flat, shuffled) question list into round buckets and, for each round,
 * derives a duration: if every question in that round carries a real per-question
 * TimeAllowedMinutes, sum those; otherwise fall back to a proportional share of the paper's
 * overall duration, weighted by that round's share of total marks.
 */
function buildRoundsAndQuestions(
  rawQuestions: ExamQuestionData[],
  overallDurationMinutes: number
): { questions: ExamQuestion[]; rounds: AssessmentRoundConfig[] } {
  const totalMarks = rawQuestions.reduce((acc, q) => acc + q.marks, 0) || 1;
  const overallSeconds = overallDurationMinutes * 60;

  const rounds: AssessmentRoundConfig[] = [];
  const questions: ExamQuestion[] = [];
  let roundNumber = 0;

  for (const group of ROUND_TYPE_GROUPS) {
    const groupRaw = rawQuestions.filter((q) => group.types.includes(q.questionType as ExamQuestion['type']));
    if (groupRaw.length === 0) continue;

    roundNumber += 1;
    const groupMarks = groupRaw.reduce((acc, q) => acc + q.marks, 0);
    const allHaveRealTime = groupRaw.every((q) => (q.timeAllowedMinutes ?? 0) > 0);
    const durationMinutes = allHaveRealTime
      ? groupRaw.reduce((acc, q) => acc + (q.timeAllowedMinutes || 0), 0)
      : Math.max(1, Math.round((overallSeconds * (groupMarks / totalMarks)) / 60));

    rounds.push({
      roundNumber,
      roundTitle: group.title,
      shortTitle: group.shortTitle,
      durationMinutes,
      questionCount: groupRaw.length,
      totalMarks: groupMarks,
    });

    for (const q of groupRaw) {
      questions.push({
        id: String(q.id),
        number: 0, // assigned below, once overall ordering across all rounds is known
        roundNumber,
        roundTitle: group.title,
        sectionTitle: group.title,
        type: q.questionType as ExamQuestion['type'],
        category: q.questionType,
        questionText: q.questionText,
        marks: q.marks,
        timeAllowedMinutes: q.timeAllowedMinutes || 0,
        options: (q.options || []).map((o) => ({ label: o.label, text: o.text, optionId: o.id })),
        codeTemplate: q.questionType === 'CODING' ? '' : undefined,
        sqlSchema: q.questionType === 'SQL' ? (q.sqlSchema || '') : undefined,
        language: q.programmingLanguage || undefined,
      });
    }
  }

  questions.forEach((q, idx) => {
    q.number = idx + 1;
  });

  return { questions, rounds };
}

/** Rehydrates the local answers map from whatever the session already has saved (resume case). */
function buildInitialAnswers(rawQuestions: ExamQuestionData[], questions: ExamQuestion[]): Record<string, any> {
  const map: Record<string, any> = {};
  for (const q of questions) {
    const raw = rawQuestions.find((r) => String(r.id) === q.id);
    if (!raw) continue;

    if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTI_CHOICE') {
      const labels = (raw.selectedOptionIds || [])
        .map((optId) => q.options?.find((o) => o.optionId === optId)?.label)
        .filter((l): l is string => Boolean(l));
      if (labels.length > 0) {
        map[q.id] = q.type === 'MULTI_CHOICE' ? labels : labels[0];
      }
    } else if (raw.submittedAnswerText) {
      map[q.id] = raw.submittedAnswerText;
    }
  }
  return map;
}

/** Converts the local (label-based) answer value into the shape SaveExamAnswerCommand expects. */
function buildSaveAnswerPayload(question: ExamQuestion, value: any): { submittedAnswerText: string | null; selectedOptionIds: number[] } {
  if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTI_CHOICE') {
    const labels: string[] = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : [];
    const selectedOptionIds = (question.options || []).filter((o) => labels.includes(o.label)).map((o) => o.optionId);
    return { submittedAnswerText: null, selectedOptionIds };
  }
  return { submittedAnswerText: typeof value === 'string' ? value : '', selectedOptionIds: [] };
}

export const CandidateExamPortal: React.FC<CandidateExamPortalProps> = ({
  testMode = 'From Home',
  sessionToken: sessionTokenFromUrl = '',
  candidateName: candidateNameProp,
  candidateCode = '',
  candidateEmail: candidateEmailProp,
  vacancyTitle: vacancyTitleProp,
  paperTitle: paperTitleProp,
  durationMinutes: durationMinutesProp,
  passingPercentage = 70,
  onExamComplete,
}) => {
  // ── Real Session Data ────────────────────────────────────────────────────────
  const [workspace, setWorkspace] = useState<LiveExamWorkspaceData | null>(null);
  const [activeSessionToken, setActiveSessionToken] = useState<string | undefined>(undefined);
  const hasInitializedSessionState = useRef<string | null>(null);

  const [startExamSessionApi, { isLoading: isStarting }] = useStartExamSessionMutation();
  const {
    data: resumeRes,
    isLoading: isResuming,
    isError: isResumeError,
  } = useResumeExamSessionQuery(sessionTokenFromUrl, { skip: testMode !== 'In Office' || !sessionTokenFromUrl });
  const [saveExamAnswerApi] = useSaveExamAnswerMutation();
  const [submitExamApi, { isLoading: isSubmitting }] = useSubmitExamMutation();
  const [reportExamViolationApi] = useReportExamViolationMutation();

  // ── Authentication & Gatekeeper State ──────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginFallback, setShowLoginFallback] = useState(false);
  const [loginCode, setLoginCode] = useState(candidateCode);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Exam Flow Lifecycle States ──────────────────────────────────────────────
  const [examStep, setExamStep] = useState<'instructions' | 'active' | 'submitted'>('instructions');
  const [submitResult, setSubmitResult] = useState<{ totalScore: number; totalMarks: number } | null>(null);

  // Overall Total Exam Timer (in seconds) — seeded from the real session once it loads.
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((durationMinutesProp ?? 60) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Round-Wise Active State & Dedicated Round Timer
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeRoundNumber, setActiveRoundNumber] = useState<number>(1);
  const [roundTimeLeftSeconds, setRoundTimeLeftSeconds] = useState<number>(600);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // ── Anti-Cheating & Proctoring States (client-side only for now) ───────────
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [isMultiTabLocked, setIsMultiTabLocked] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // ── Question Palette & Navigation States ────────────────────────────
  const [paletteFilter, setPaletteFilter] = useState<'ALL' | 'ANSWERED' | 'UNANSWERED' | 'FLAGGED'>('ALL');
  const [isMobileQuestionDrawerOpen, setIsMobileQuestionDrawerOpen] = useState(false);

  // Pending debounced autosaves (free-text answers), flushed immediately on navigation/submit.
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Real per-vacancy/candidate identity — falls back to the prop defaults only until the real
  // session response arrives.
  const candidateName = workspace?.candidateName ?? candidateNameProp ?? candidateCode;
  const vacancyTitle = workspace?.vacancyTitle ?? vacancyTitleProp ?? '';
  const paperTitle = workspace?.paperTitle ?? paperTitleProp ?? '';
  const durationMinutes = workspace?.durationMinutes ?? durationMinutesProp ?? 60;

  // ==================== Derive rounds + flat question list from the real session ==========
  const { questions: examQuestions, rounds: assessmentRounds } = useMemo(() => {
    if (!workspace) return { questions: [] as ExamQuestion[], rounds: [] as AssessmentRoundConfig[] };
    return buildRoundsAndQuestions(workspace.questions, workspace.durationMinutes);
  }, [workspace]);

  // ==================== Apply a freshly loaded/resumed session's real state once =========
  useEffect(() => {
    if (!workspace || examQuestions.length === 0) return;
    if (hasInitializedSessionState.current === workspace.sessionToken) return;
    hasInitializedSessionState.current = workspace.sessionToken;

    setAnswers(buildInitialAnswers(workspace.questions, examQuestions));
    setTimeLeftSeconds(workspace.totalTimeLeftSeconds);

    const initialQIdx = Math.min(Math.max(workspace.activeQuestionIndex || 0, 0), examQuestions.length - 1);
    setCurrentQuestionIndex(initialQIdx);

    const initialRound = examQuestions[initialQIdx]?.roundNumber || 1;
    setActiveRoundNumber(initialRound);
    const roundCfg = assessmentRounds.find((r) => r.roundNumber === initialRound);
    setRoundTimeLeftSeconds((roundCfg?.durationMinutes || 10) * 60);

    const hasProgress =
      (workspace.activeQuestionIndex || 0) > 0 ||
      workspace.questions.some((q) => q.submittedAnswerText || (q.selectedOptionIds && q.selectedOptionIds.length > 0));

    if (workspace.sessionStatus === 'Submitted' || workspace.sessionStatus === 'Evaluated') {
      setExamStep('submitted');
    } else if (hasProgress) {
      setExamStep('active');
      setIsTimerRunning(true);
    } else {
      setExamStep('instructions');
    }
  }, [workspace, examQuestions, assessmentRounds]);

  // ==================== Office mode: silently resume an already-started session ==========
  useEffect(() => {
    if (testMode === 'In Office' && resumeRes?.data) {
      setWorkspace(resumeRes.data);
      setActiveSessionToken(resumeRes.data.sessionToken);
      setIsAuthenticated(true);
    }
  }, [testMode, resumeRes]);

  // ==================== 1. DISABLE BROWSER BACK BUTTON (NO POPUPS) ============
  useEffect(() => {
    if (examStep !== 'active') return;

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examStep]);

  // ==================== 2. MULTI-TAB / MULTI-DEVICE SESSION LOCK =============
  useEffect(() => {
    if (typeof window === 'undefined' || !activeSessionToken) return;

    try {
      const channel = new BroadcastChannel('STEP_EXAM_SESSION_CHANNEL');
      broadcastChannelRef.current = channel;

      channel.postMessage({ type: 'PING_EXISTING_SESSION', token: activeSessionToken });

      channel.onmessage = (event) => {
        if (event.data?.token === activeSessionToken) {
          if (event.data?.type === 'PING_EXISTING_SESSION') {
            channel.postMessage({ type: 'SESSION_ALREADY_ACTIVE', token: activeSessionToken });
          } else if (event.data?.type === 'SESSION_ALREADY_ACTIVE') {
            setIsMultiTabLocked(true);
          }
        }
      };
    } catch (e) {
      // Fallback if BroadcastChannel not supported
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [activeSessionToken]);

  // Shared by every violation source below (tab switch, fullscreen exit) — reports to the
  // backend, which is the authority on the 3-strike auto-submit rule
  // (CandidateExamSession.TabSwitchWarnings). The local counter still drives the header badge,
  // but the actual auto-submit decision comes back from the server so the client never submits
  // twice (once locally, once server-side) for the same violation.
  const reportViolation = (violationType: string) => {
    setTabSwitchWarnings((prev) => prev + 1);

    if (!activeSessionToken) return;
    reportExamViolationApi({ sessionToken: activeSessionToken, violationType })
      .unwrap()
      .then((res) => {
        if (res.data.autoSubmitted && res.data.submitResult) {
          setIsTimerRunning(false);
          setSubmitResult({
            totalScore: Number(res.data.submitResult.totalScore),
            totalMarks: Number(res.data.submitResult.totalMarks),
          });
          setExamStep('submitted');
          onExamComplete?.(Number(res.data.submitResult.totalScore), Number(res.data.submitResult.totalMarks));
        }
      })
      .catch(() => {
        // Best-effort — violation reporting failing shouldn't block the candidate from continuing.
      });
  };

  // ==================== 3. TAB / WINDOW SWITCH PROCTORING (INCREMENTS WARNINGS) =
  useEffect(() => {
    if (examStep !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('TabSwitch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStep, activeSessionToken]);

  // ==================== 3b. FULL-SCREEN ENFORCEMENT ===========================
  // Best-effort request on entering the active exam; exiting full-screen mid-exam counts as a
  // violation exactly like a tab switch (same counter, same server-side 3-strike rule).
  useEffect(() => {
    if (examStep !== 'active') return;

    if (document.fullscreenElement == null) {
      document.documentElement.requestFullscreen?.().catch(() => {
        // Some browsers/contexts reject this (e.g. iframe embedding) — degrade silently, the
        // rest of the proctoring measures still apply.
      });
    }

    const handleFullscreenChange = () => {
      if (document.fullscreenElement == null) {
        reportViolation('FullscreenExit');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement != null) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStep, activeSessionToken]);

  // ==================== 3c. COPY / PASTE / RIGHT-CLICK / DEVTOOLS BLOCKING ====
  useEffect(() => {
    if (examStep !== 'active') return;

    const blockClipboardEvent = (e: ClipboardEvent) => e.preventDefault();
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockDevToolsShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isDevToolsShortcut =
        key === 'f12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key)) ||
        (e.ctrlKey && key === 'u');
      if (isDevToolsShortcut) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', blockClipboardEvent);
    document.addEventListener('cut', blockClipboardEvent);
    document.addEventListener('paste', blockClipboardEvent);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockDevToolsShortcuts);

    return () => {
      document.removeEventListener('copy', blockClipboardEvent);
      document.removeEventListener('cut', blockClipboardEvent);
      document.removeEventListener('paste', blockClipboardEvent);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockDevToolsShortcuts);
    };
  }, [examStep]);

  // ==================== 4. ROUND TIME EXPIRY & DEDICATED TIMER EFFECT =========
  const handleRoundTimeExpiry = (expiredRound: number) => {
    const currentRoundIdx = assessmentRounds.findIndex((r) => r.roundNumber === expiredRound);

    if (currentRoundIdx < assessmentRounds.length - 1) {
      const nextRound = assessmentRounds[currentRoundIdx + 1];
      const firstQIdx = examQuestions.findIndex((q) => q.roundNumber === nextRound.roundNumber);

      setActiveRoundNumber(nextRound.roundNumber);
      setRoundTimeLeftSeconds(nextRound.durationMinutes * 60);

      if (firstQIdx !== -1) {
        setCurrentQuestionIndex(firstQIdx);
      }
    } else {
      handleAutoSubmit();
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && examStep === 'active') {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));

        setRoundTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleRoundTimeExpiry(activeRoundNumber);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, examStep, activeRoundNumber, assessmentRounds, examQuestions]);

  // ==================== Autosave plumbing ====================================
  const persistAnswerNow = async (question: ExamQuestion, value: any) => {
    if (!activeSessionToken) return;
    const payload = buildSaveAnswerPayload(question, value);
    try {
      await saveExamAnswerApi({
        sessionToken: activeSessionToken,
        candidateExamSessionQuestionId: Number(question.id),
        submittedAnswerText: payload.submittedAnswerText,
        selectedOptionIds: payload.selectedOptionIds,
      }).unwrap();
    } catch (err) {
      toast.error('Autosave Failed', { description: 'Your last answer change could not be saved. Please check your connection.' });
    }
  };

  const persistAnswerDebounced = (question: ExamQuestion, value: any) => {
    const key = question.id;
    if (saveTimersRef.current[key]) clearTimeout(saveTimersRef.current[key]);
    saveTimersRef.current[key] = setTimeout(() => {
      delete saveTimersRef.current[key];
      void persistAnswerNow(question, value);
    }, 800);
  };

  const flushPendingSaves = () => {
    Object.entries(saveTimersRef.current).forEach(([qId, timer]) => {
      clearTimeout(timer);
      const q = examQuestions.find((eq) => eq.id === qId);
      if (q && answers[qId] !== undefined) {
        void persistAnswerNow(q, answers[qId]);
      }
    });
    saveTimersRef.current = {};
  };

  const handleAnswerChange = (question: ExamQuestion, value: any) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    if (question.type === 'CODING' || question.type === 'SQL' || question.type === 'SUBJECTIVE') {
      persistAnswerDebounced(question, value);
    } else {
      persistAnswerNow(question, value);
    }
  };

  const handleClearAnswer = (question: ExamQuestion) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
    void persistAnswerNow(question, undefined);
  };

  // Handle Home candidate login form submit
  const handleCandidateLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginCode.trim() || !loginPasscode.trim()) {
      setLoginError('Please enter both Candidate ID and Passcode.');
      return;
    }
    if (loginPasscode.length < 4) {
      setLoginError('Passcode must be at least 4 digits.');
      return;
    }
    setLoginError(null);
    try {
      const res = await startExamSessionApi({
        candidateCode: loginCode.trim(),
        passcode: loginPasscode.trim(),
        testSource: testMode === 'In Office' ? 'Office' : 'Home',
      }).unwrap();
      setWorkspace(res.data);
      setActiveSessionToken(res.data.sessionToken);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err?.data?.message || 'Invalid Candidate ID or Passcode. Please check your exam invitation and try again.');
    }
  };

  const handleInOfficeDirectStart = async () => {
    setLoginError(null);
    try {
      const res = await startExamSessionApi({
        candidateCode: loginCode.trim() || candidateCode || '15',
        passcode: 'IN_OFFICE',
        testSource: 'Office',
      }).unwrap();
      setWorkspace(res.data);
      setActiveSessionToken(res.data.sessionToken);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err?.data?.message || 'Could not load assessment session for candidate.');
    }
  };

  // Start Exam Action — the real session already began server-side at login/resume; this just
  // moves the local UI from the instructions screen into the live timed view.
  const handleStartExam = () => {
    setExamStep('active');
    setIsTimerRunning(true);
  };

  const performSubmit = async (isAuto: boolean) => {
    flushPendingSaves();
    setIsTimerRunning(false);
    if (!activeSessionToken) return;
    try {
      const res = await submitExamApi({ sessionToken: activeSessionToken }).unwrap();
      setSubmitResult({ totalScore: Number(res.data.totalScore), totalMarks: Number(res.data.totalMarks) });
      setExamStep('submitted');
      if (!isAuto) {
        toast.success('Exam Submitted Successfully', { description: 'Your test responses have been evaluated and recorded.' });
      }
      onExamComplete?.(Number(res.data.totalScore), Number(res.data.totalMarks));
    } catch (err: any) {
      toast.error('Submission Failed', {
        description: err?.data?.message || 'Could not submit your exam. Please check your connection and try again.',
      });
      setIsTimerRunning(true);
    }
  };

  // Auto-Submit Exam on Timer Expiry or Max Violations
  const handleAutoSubmit = () => {
    void performSubmit(true);
  };

  // Manual Submit Exam
  const handleSubmitExam = () => {
    void performSubmit(false);
  };

  // Next Question / Next Round Action
  const handleNextQuestion = () => {
    const currentQForFlush = examQuestions[currentQuestionIndex];
    if (currentQForFlush && saveTimersRef.current[currentQForFlush.id]) {
      clearTimeout(saveTimersRef.current[currentQForFlush.id]);
      delete saveTimersRef.current[currentQForFlush.id];
      void persistAnswerNow(currentQForFlush, answers[currentQForFlush.id]);
    }

    if (currentQuestionIndex < examQuestions.length - 1) {
      const nextQ = examQuestions[currentQuestionIndex + 1];
      if (nextQ.roundNumber > activeRoundNumber) {
        const nextRoundConfig = assessmentRounds.find((r) => r.roundNumber === nextQ.roundNumber);
        setActiveRoundNumber(nextQ.roundNumber);
        if (nextRoundConfig) {
          setRoundTimeLeftSeconds(nextRoundConfig.durationMinutes * 60);
        }
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitExam();
    }
  };

  // Toggle Flag Question for Review
  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Timer Formats
  const formattedMinutes = Math.floor(timeLeftSeconds / 60);
  const formattedSeconds = String(timeLeftSeconds % 60).padStart(2, '0');

  const roundMinutes = Math.floor(roundTimeLeftSeconds / 60);
  const roundSeconds = String(roundTimeLeftSeconds % 60).padStart(2, '0');
  const isRoundTimerCritical = roundTimeLeftSeconds < 120; // < 2 mins

  const currentQ = examQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  // ── MULTI-TAB LOCKED SCREEN ───────────────────────────────────────────────
  if (isMultiTabLocked) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
            <Icon name="lock" size="lg" />
          </div>
          <h2 className="text-xl font-extrabold font-heading text-rose-700">
            Multi-Tab Exam Lock Enforced
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This exam session is already active in another tab or device window. To maintain proctoring integrity, only <strong className="text-slate-900">one single active window</strong> is permitted.
          </p>
          <div className="w-full bg-rose-50 border border-rose-200 p-3 rounded-xl text-left text-[11px] font-mono text-rose-900">
            Session Token: {activeSessionToken || sessionTokenFromUrl}<br />
            Security Rule: Single Active Session Constraint
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Return to Active Session / Refresh
          </button>
        </div>
      </div>
    );
  }

  // ── 1. HOME LOGIN GATEKEEPER SCREEN (or office-mode silent resume) ────────
  if (!isAuthenticated) {
    // Office mode: no login form — the session is expected to already exist (e.g. via a
    // walk-in check-in flow); just resolve it silently.
    if (testMode === 'In Office' && sessionTokenFromUrl && !showLoginFallback) {
      if (isResumeError) {
        return (
          <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans text-center">
            <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
              <Icon name="alert-triangle" size="lg" className="text-rose-600" />
              <h2 className="text-lg font-extrabold text-rose-700 font-heading">Unable to Resolve Token Link</h2>
              <p className="text-xs text-slate-500">
                The session token in this link could not be resolved. You can log in manually using your Access ID and 4-digit Passcode.
              </p>
              <button
                type="button"
                onClick={() => setShowLoginFallback(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Log in with Access ID &amp; Passcode
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
            <Icon name="spinner" size="lg" className="animate-spin text-blue-600" />
            <span>{isResuming ? 'Loading your assessment session…' : 'Preparing your assessment session…'}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans relative">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
          {testMode === 'In Office' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-2">
                  <Icon name="check-circle" size="md" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading tracking-tight">
                  In-Office Assessment Station
                </h2>
                <p className="text-xs text-slate-500">
                  Venue exam session — Candidate identity verified directly by office station.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <Icon name="alert-triangle" size="xs" className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Candidate Access ID:</span>
                  <span className="font-bold font-mono text-slate-900">{loginCode || candidateCode || '15'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Execution Mode:</span>
                  <span className="font-bold text-emerald-700">In Office (Venue Test)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">PIN Requirement:</span>
                  <span className="font-bold text-slate-700">None (Bypassed for Venue)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInOfficeDirectStart}
                disabled={isStarting}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <>
                    <Icon name="spinner" size="xs" className="animate-spin" />
                    <span>Loading Assessment…</span>
                  </>
                ) : (
                  <span>Start Assessment Now</span>
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-2">
                  <Icon name="lock" size="md" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading tracking-tight">
                  Candidate Home Exam Access Portal
                </h2>
                <p className="text-xs text-slate-500">
                  Please enter your Candidate Access ID and Passcode provided in your exam invitation.
                </p>
              </div>

              <form onSubmit={handleCandidateLogin} className="flex flex-col gap-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <Icon name="alert-triangle" size="xs" className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Candidate Access ID / Code</label>
                  <input
                    type="text"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    placeholder="e.g. CND-2026-1042"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Exam Passcode / PIN</label>
                  <input
                    type="password"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    placeholder="Enter 4-digit exam PIN"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                  <Icon name="info" size="xs" className="shrink-0 text-blue-600" />
                  <span><strong>Test Option:</strong> Remote Home Online Proctored (Single Device Lock Active).</span>
                </div>

                <button
                  type="submit"
                  disabled={isStarting}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isStarting ? (
                    <>
                      <Icon name="spinner" size="xs" className="animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <span>Verify &amp; Launch Exam Session</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── 2. PRE-EXAM INSTRUCTIONS & WELCOME SCREEN (With Round-Wise Time Limits) ──
  if (examStep === 'instructions') {
    return (
      <div className="h-screen w-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-3 sm:p-5 font-sans overflow-hidden">
        <div className="max-w-5xl w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[96vh] overflow-y-auto">

          {/* Vacancy & Exam Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {testMode === 'In Office' ? 'In Office Direct Link Access' : 'Online Remote Proctored'}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading mt-1">
                {paperTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Vacancy: <span className="font-semibold text-slate-800">{vacancyTitle}</span> • Candidate: <span className="font-semibold text-slate-800">{candidateName} ({candidateCode})</span>
              </p>
            </div>

            <div className="flex flex-col items-end font-mono">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {durationMinutes} Minutes Total
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Total Exam Time</span>
            </div>
          </div>

          {/* Test Pattern Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Rounds</span>
              <p className="font-bold text-blue-700 mt-0.5">{assessmentRounds.length} Timed Rounds</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Questions</span>
              <p className="font-bold text-slate-900 mt-0.5">{examQuestions.length} Questions</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Marks</span>
              <p className="font-bold text-slate-900 mt-0.5">{assessmentRounds.reduce((acc, r) => acc + r.totalMarks, 0)} Marks</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Passing Cutoff</span>
              <p className="font-bold text-emerald-700 mt-0.5">{passingPercentage}% Score</p>
            </div>
          </div>

          {/* Round-Wise Breakdown (4-Column Cards) */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-heading">
              Assessment Round Breakdown & Round-Wise Time Limits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {assessmentRounds.map((rnd) => (
                <div key={rnd.roundNumber} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-[11.5px]">
                    <span>{rnd.shortTitle}</span>
                    <span className="text-emerald-700 font-mono text-[10.5px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {rnd.durationMinutes} Mins
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    {rnd.questionCount} {rnd.questionCount === 1 ? 'Question' : 'Questions'} • {rnd.totalMarks} Marks
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Proctoring Instructions */}
          <div className="flex flex-col gap-1.5 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
            <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="alert-triangle" size="xs" className="text-amber-600" />
              <span>Anti-Cheating Security Rules & Guidelines</span>
            </h3>
            <ul className="text-xs text-amber-950 space-y-1 pl-4 list-disc leading-relaxed">
              <li><strong>Tab / Window Switch Warnings:</strong> Switching tabs or minimizing your browser window increments your warning counter badge in the header. (3 warnings auto-terminate exam).</li>
              <li><strong>Disabled Back Navigation:</strong> Browser back button is trapped and disabled during test.</li>
              <li><strong>Session Refresh Persistence:</strong> Your answers and timers are continuously saved. Refreshing the browser will restore your exact exam state seamlessly without modal prompts.</li>
              <li><strong>Round-Wise Time Limits & Auto-Submit:</strong> Each round has a dedicated timer (e.g. Round 1: 10 mins). When a round&apos;s timer reaches 00:00, that round is <strong>automatically submitted and locked</strong>.</li>
            </ul>
          </div>

          {/* System Checklist & Action Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <Icon name="check-circle" size="xs" className="text-emerald-600 shrink-0" />
              <span>Browser Compatibility & Proctoring Status Verified (Token: {(activeSessionToken || sessionTokenFromUrl).slice(0, 12)}...)</span>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Start Assessment Exam Now</span>
              <Icon name="chevron-right" size="xs" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. POST-EXAM SUBMITTED SUMMARY SCREEN ────────────────────────────────
  if (examStep === 'submitted') {
    return (
      <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <Icon name="check-circle" size="lg" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              Assessment Exam Submitted!
            </h2>
            <p className="text-xs text-slate-500">
              Thank you, {candidateName}. Your test answers have been recorded for evaluation.
            </p>
          </div>

          <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs font-mono text-left">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Questions Answered</span>
              <p className="font-bold text-slate-900 mt-0.5">{answeredCount} / {examQuestions.length}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Security Audit Log</span>
              <p className="font-bold text-emerald-700 mt-0.5">{tabSwitchWarnings} Tab Switch Warnings</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Candidate Code</span>
              <p className="font-bold text-slate-800 mt-0.5">{candidateCode}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Submission Time</span>
              <p className="font-bold text-slate-800 mt-0.5">Just Now</p>
            </div>
          </div>

          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            Your results have been sent to the Recruitment Team. You will receive an update regarding interview progression shortly.
          </p>
        </div>
      </div>
    );
  }

  // ── 4. LIVE PROCTORED EXAM INTERFACE ─────────────────────────────────────
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
          <Icon name="spinner" size="lg" className="animate-spin text-blue-600" />
          <span>Loading questions…</span>
        </div>
      </div>
    );
  }

  const activeRoundQuestions = examQuestions.filter((q) => q.roundNumber === activeRoundNumber);

  const currentQuestionIndexInRound = activeRoundQuestions.findIndex((q) => q.id === currentQ?.id);
  const roundQuestionNumber = currentQuestionIndexInRound !== -1 ? currentQuestionIndexInRound + 1 : 1;
  const roundQuestionCount = activeRoundQuestions.length;

  const answeredCountInRound = activeRoundQuestions.filter(
    (q) => answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true)
  ).length;

  const flaggedCountInRound = activeRoundQuestions.filter((q) => flaggedQuestions.has(q.id)).length;
  const unansweredCountInRound = activeRoundQuestions.length - answeredCountInRound;

  const filteredPaletteQuestions = activeRoundQuestions.filter((q) => {
    const isAnswered = answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true);
    const isFlagged = flaggedQuestions.has(q.id);
    if (paletteFilter === 'ANSWERED') return isAnswered;
    if (paletteFilter === 'UNANSWERED') return !isAnswered;
    if (paletteFilter === 'FLAGGED') return isFlagged;
    return true;
  });

  return (
    <div className="h-screen w-screen bg-[#f7f8fb] text-slate-900 flex flex-col font-sans select-none overflow-hidden">

      {/* ── Top Header Navigation Bar ───────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shrink-0">
            <Icon name="clipboard-check" size="xs" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[11px] sm:text-xs font-extrabold text-slate-900 font-heading truncate max-w-[140px] sm:max-w-md">
              {paperTitle}
            </h2>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate">
              Candidate: <span className="font-semibold text-slate-800">{candidateName}</span> ({candidateCode})
            </p>
          </div>
        </div>

        {/* Live Proctoring Banner & Timers */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          {/* Header Warning Counter Badge */}
          {tabSwitchWarnings > 0 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9.5px] sm:text-[10.5px] font-mono font-bold flex items-center gap-1">
              <Icon name="alert-triangle" size="xs" className="text-rose-600" />
              <span>Warnings: {tabSwitchWarnings}/3</span>
            </span>
          )}

          {/* Active Round Dedicated Countdown Timer */}
          <div
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-mono font-extrabold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 ${
              isRoundTimerCritical
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <Icon name="calendar" size="xs" />
            <span>R{activeRoundNumber} Time: {roundMinutes}:{roundSeconds}</span>
          </div>

          {/* Total Exam Time Remaining */}
          <div className="px-2.5 py-1 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 font-mono text-[11px] font-semibold hidden sm:flex items-center gap-1">
            <span>Total: {formattedMinutes}:{formattedSeconds}</span>
          </div>
        </div>
      </header>

      {/* ── Sub-Header: Step-by-Step Round Stepper Bar ────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto shrink-0 scrollbar-none w-full">
        {assessmentRounds.map((rnd, idx) => {
          const isCompleted = rnd.roundNumber < activeRoundNumber;
          const isActive = rnd.roundNumber === activeRoundNumber;

          return (
            <div key={rnd.roundNumber} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isCompleted ? (
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-mono font-extrabold flex items-center gap-1.5 sm:gap-2 shadow-2xs">
                  <Icon name="check-circle" size="xs" className="text-emerald-600" />
                  <span className="hidden sm:inline">{rnd.roundNumber}. {rnd.shortTitle}</span>
                  <span className="sm:hidden">R{rnd.roundNumber}</span>
                </span>
              ) : isActive ? (
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 text-white font-mono font-extrabold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md ring-2 ring-blue-500/30">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="hidden sm:inline">{rnd.roundNumber}. {rnd.shortTitle} (Active)</span>
                  <span className="sm:hidden">R{rnd.roundNumber} (Active)</span>
                </span>
              ) : (
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white text-slate-400 border border-slate-200 text-xs sm:text-sm font-mono font-semibold flex items-center gap-1.5 sm:gap-2">
                  <Icon name="lock" size="xs" className="text-slate-400" />
                  <span className="hidden sm:inline">{rnd.roundNumber}. {rnd.shortTitle}</span>
                  <span className="sm:hidden">R{rnd.roundNumber}</span>
                </span>
              )}
              {idx < assessmentRounds.length - 1 && (
                <span className="text-slate-300 font-mono text-xs sm:text-sm font-bold px-0.5 sm:px-1">►</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Main Exam Body: Split View (Left Palette / Right Main Content) ──── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT COLUMN: Active Round Question Palette (Matching white background with right panel) */}
        <aside className="w-64 lg:w-72 xl:w-80 bg-white p-3.5 lg:p-5 flex flex-col gap-3.5 lg:gap-4 overflow-y-auto hidden md:flex shrink-0 border-r border-slate-200">
          <div className="border-b border-slate-200 pb-2">
            <h4 className="text-xs lg:text-sm font-extrabold text-slate-900 font-heading uppercase tracking-wider">
              QUESTION PALETTE
            </h4>
          </div>

          {/* Filter Pills Bar with Direct Status Color Coding */}
          <div className="grid grid-cols-4 gap-1 lg:gap-1.5 text-[10px] lg:text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setPaletteFilter('ALL')}
              className={`py-1 lg:py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                paletteFilter === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              All ({activeRoundQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setPaletteFilter('ANSWERED')}
              className={`py-1 lg:py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                paletteFilter === 'ANSWERED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Ans ({answeredCountInRound})
            </button>
            <button
              type="button"
              onClick={() => setPaletteFilter('UNANSWERED')}
              className={`py-1 lg:py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                paletteFilter === 'UNANSWERED'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                  : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Left ({unansweredCountInRound})
            </button>
            <button
              type="button"
              onClick={() => setPaletteFilter('FLAGGED')}
              className={`py-1 lg:py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                paletteFilter === 'FLAGGED'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Flag ({flaggedCountInRound})
            </button>
          </div>

          {/* Scrollable 5-Column Question Grid */}
          <div className="flex-1 flex flex-col gap-1.5 min-h-[240px]">
            <div className="max-h-[440px] xl:max-h-[520px] overflow-y-auto scrollbar-thin pr-1 grid grid-cols-5 gap-1.5 lg:gap-2">
              {filteredPaletteQuestions.map((q) => {
                const idx = examQuestions.findIndex((item) => item.id === q.id);
                const isAnswered = answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true);
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrentQ = idx === currentQuestionIndex;
                const qIdxInRound = activeRoundQuestions.findIndex((item) => item.id === q.id);
                const qNumInRound = qIdxInRound !== -1 ? qIdxInRound + 1 : q.number;

                return (
                  <button
                    key={q.id}
                    type="button"
                    title={`Question ${qNumInRound} (${q.type}) - ${isAnswered ? 'Answered' : 'Unanswered'}`}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-9 h-9 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl font-mono text-xs lg:text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrentQ
                        ? 'ring-2 ring-blue-600 bg-blue-600 text-white font-extrabold shadow-sm'
                        : isAnswered
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isFlagged
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {qNumInRound}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Question Display & Interactive Answer Controls */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 bg-white">

          {/* Mobile Question Jump Bar (Visible on screens under md) */}
          <div className="flex md:hidden items-center justify-between bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 gap-2 shrink-0">
            {/* Open Question Navigator Sheet Button */}
            <button
              type="button"
              onClick={() => setIsMobileQuestionDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Icon name="grid" size="xs" className="text-blue-600" />
              <span>Question Navigator</span>
              <Icon name="chevron-down" size="xs" className="text-slate-400" />
            </button>

            {/* Status Counter */}
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
              {answeredCountInRound}/{roundQuestionCount} Ans
            </span>
          </div>

          {/* Question & Round Metadata Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Question Number Badge */}
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-mono font-bold">
                Question {roundQuestionNumber} of {roundQuestionCount}
              </span>

              {/* Multi-Choice Indicator */}
              {currentQ.type === 'MULTI_CHOICE' && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] sm:text-xs font-mono font-extrabold flex items-center gap-1">
                  <Icon name="check-square" size="xs" className="text-amber-600" />
                  <span>Select All That Apply</span>
                </span>
              )}

              {/* Question Marks Badge */}
              <span className="text-[10px] sm:text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {currentQ.marks} Marks
              </span>
            </div>

            {/* Flag Button */}
            <button
              type="button"
              onClick={() => toggleFlag(currentQ.id)}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0 ml-auto sm:ml-0"
            >
              <Icon name="list" size="xs" />
              <span>{flaggedQuestions.has(currentQ.id) ? 'Flagged' : 'Flag'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed font-heading">
            {currentQ.questionText}
          </h3>

          {/* Single / Multi Choice Options */}
          {currentQ.options && (
            <div className="flex flex-col gap-2 mt-1">
              {currentQ.options.map((opt) => {
                const currentAnswer = answers[currentQ.id];
                const isMultiChoice = currentQ.type === 'MULTI_CHOICE';

                const currentArr: string[] = Array.isArray(currentAnswer)
                  ? currentAnswer
                  : typeof currentAnswer === 'string' && currentAnswer.trim() !== ''
                  ? [currentAnswer]
                  : [];

                const isSelected = isMultiChoice
                  ? currentArr.includes(opt.label)
                  : currentAnswer === opt.label;

                const handleOptionClick = () => {
                  if (isMultiChoice) {
                    const newArr = currentArr.includes(opt.label)
                      ? currentArr.filter((item) => item !== opt.label)
                      : [...currentArr, opt.label];
                    handleAnswerChange(currentQ, newArr);
                  } else {
                    handleAnswerChange(currentQ, opt.label);
                  }
                };

                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={handleOptionClick}
                    className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isMultiChoice ? (
                      <span
                        className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border border-blue-600'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {isSelected ? <Icon name="check" size="xs" /> : opt.label}
                      </span>
                    ) : (
                      <span
                        className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </span>
                    )}
                    <span className="leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Coding Challenge Solution IDE */}
          {currentQ.type === 'CODING' && (
            <CodeEditorIDE
              value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : (currentQ.codeTemplate || '')}
              onChange={(val) => handleAnswerChange(currentQ, val)}
              questionType="CODING"
              language={currentQ.language}
              defaultTemplate={currentQ.codeTemplate || ''}
              title="Algorithmic Solution IDE"
              questionId={currentQ.id}
            />
          )}

          {/* SQL Query Editor IDE */}
          {currentQ.type === 'SQL' && (
            <CodeEditorIDE
              value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : (currentQ.sqlSchema || '')}
              onChange={(val) => handleAnswerChange(currentQ, val)}
              questionType="SQL"
              language={currentQ.language}
              defaultTemplate={currentQ.sqlSchema || ''}
              title="SQL Server & Database Query IDE"
              questionId={currentQ.id}
            />
          )}

          {/* Subjective Essay Textarea */}
          {currentQ.type === 'SUBJECTIVE' && (
            <div className="flex-1 flex flex-col gap-1.5 mt-1 min-h-[280px]">
              <label className="text-xs font-bold text-slate-700">Your Detailed Architecture / Essay Response:</label>
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ, e.target.value)}
                placeholder="Type your explanation and system design architecture solution here..."
                className="flex-1 w-full p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white leading-relaxed resize-none scrollbar-thin shadow-2xs min-h-[240px]"
              />
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-3 mt-auto gap-2">
            <button
              type="button"
              onClick={() => handleClearAnswer(currentQ)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Clear Choice
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={
                  currentQuestionIndex === 0 ||
                  examQuestions[currentQuestionIndex - 1].roundNumber < activeRoundNumber
                }
                onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-bold text-[11px] sm:text-xs transition-colors cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isSubmitting}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-1 sm:gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {isSubmitting
                    ? 'Submitting…'
                    : currentQuestionIndex === examQuestions.length - 1
                    ? 'Save & Submit Exam'
                    : currentQuestionIndex < examQuestions.length - 1 &&
                      examQuestions[currentQuestionIndex + 1].roundNumber > activeRoundNumber
                    ? `Finish Round ${activeRoundNumber} & Next Round`
                    : 'Save & Next Question'}
                </span>
                <Icon name="chevron-right" size="xs" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Question Navigator Drawer Sheet Overlay */}
      {isMobileQuestionDrawerOpen && (
        <div
          onClick={() => setIsMobileQuestionDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 p-4 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <Icon name="grid" size="xs" />
                </span>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 font-heading">
                    Question Navigator ({roundQuestionCount} Questions)
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileQuestionDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <Icon name="x" size="xs" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setPaletteFilter('ALL')}
                className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paletteFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                All ({activeRoundQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setPaletteFilter('ANSWERED')}
                className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paletteFilter === 'ANSWERED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Ans ({answeredCountInRound})
              </button>
              <button
                type="button"
                onClick={() => setPaletteFilter('UNANSWERED')}
                className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paletteFilter === 'UNANSWERED'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                    : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Left ({unansweredCountInRound})
              </button>
              <button
                type="button"
                onClick={() => setPaletteFilter('FLAGGED')}
                className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  paletteFilter === 'FLAGGED'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                Flag ({flaggedCountInRound})
              </button>
            </div>

            {/* 5-Column Question Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto scrollbar-thin p-1">
              {filteredPaletteQuestions.map((q) => {
                const idx = examQuestions.findIndex((item) => item.id === q.id);
                const isAnswered = answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true);
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrentQ = idx === currentQuestionIndex;
                const qIdxInRound = activeRoundQuestions.findIndex((item) => item.id === q.id);
                const qNumInRound = qIdxInRound !== -1 ? qIdxInRound + 1 : q.number;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsMobileQuestionDrawerOpen(false);
                    }}
                    className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrentQ
                        ? 'ring-2 ring-blue-600 bg-blue-600 text-white font-extrabold shadow-md'
                        : isAnswered
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isFlagged
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {qNumInRound}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

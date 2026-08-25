'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Icon, questionCardSliderVariant } from '@/design-system';
import { CodeEditorIDE } from './CodeEditorIDE';
import { ExamSubmissionModal } from './ExamSubmissionModal';
import {
  useStartExamSessionMutation,
  useSaveExamAnswerBatchV2Mutation,
  useSubmitExamMutation,
  usePublishAssessmentResultV2Mutation,
  useReportExamViolationMutation,
  type LiveExamWorkspaceData,
  type ExamQuestionData,
} from '@/store/services/api';

export interface CandidateExamPortalV2Props {
  initialCandidateCode?: string;
  initialPasscode?: string;
  initialRoundNumber?: number;
  testMode?: 'Online' | 'In Office';
}

interface RoundSectionConfig {
  sectionId: number;
  sectionTitle: string;
  shortTitle: string;
  iconName: string;
  sectionType: 'TechnicalMCQ' | 'Coding' | 'SQLQuery' | 'SubjectiveTheory';
  durationMinutes: number;
  questionCount: number;
  totalMarks: number;
  questionIndices: number[];
}

const SECTION_TYPE_MAP: Record<string, { title: string; shortTitle: string; icon: string; sectionType: RoundSectionConfig['sectionType'] }> = {
  SINGLE_CHOICE: { title: 'Multiple Choice', shortTitle: 'MCQ', icon: 'check-square', sectionType: 'TechnicalMCQ' },
  MULTI_CHOICE: { title: 'Multiple Choice', shortTitle: 'MCQ', icon: 'check-square', sectionType: 'TechnicalMCQ' },
  CODING: { title: 'Coding Challenge', shortTitle: 'Coding', icon: 'code-2', sectionType: 'Coding' },
  SQL: { title: 'SQL Queries', shortTitle: 'SQL', icon: 'file-spreadsheet', sectionType: 'SQLQuery' },
  SUBJECTIVE: { title: 'Subjective Questions', shortTitle: 'Theory', icon: 'layers', sectionType: 'SubjectiveTheory' },
};

export const CandidateExamPortalV2: React.FC<CandidateExamPortalV2Props> = ({
  initialCandidateCode = '',
  initialPasscode = '',
  initialRoundNumber,
  testMode = 'Online',
}) => {
  // ── Authentication & Session State ──────────────────────────────────────────
  const [candidateCode, setCandidateCode] = useState(initialCandidateCode);
  const [passcode, setPasscode] = useState(initialPasscode);
  const [session, setSession] = useState<LiveExamWorkspaceData | null>(null);
  const [activeSessionToken, setActiveSessionToken] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Exam Flow Lifecycle ─────────────────────────────────────────────────────
  const [examStep, setExamStep] = useState<'login' | 'instructions' | 'active' | 'submitted'>(
    initialCandidateCode && initialPasscode ? 'instructions' : 'login'
  );
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false);

  // ── Navigation & Question Selection ─────────────────────────────────────────
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [navigationDirection, setNavigationDirection] = useState<number>(1);
  const [answersMap, setAnswersMap] = useState<
    Record<number, { text?: string; optionIds: number[]; updatedAt: string }>
  >({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<number>>(new Set());
  const [eliminatedOptionsMap, setEliminatedOptionsMap] = useState<Record<number, number[]>>({});
  const [paletteFilter, setPaletteFilter] = useState<'ALL' | 'ANSWERED' | 'UNANSWERED' | 'FLAGGED'>('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const goToQuestion = useCallback(
    (targetIdx: number) => {
      if (targetIdx === activeQuestionIndex) return;
      setNavigationDirection(targetIdx > activeQuestionIndex ? 1 : -1);
      setActiveQuestionIndex(targetIdx);
    },
    [activeQuestionIndex]
  );

  // ── Coding & SQL Simulation Sandboxes ───────────────────────────────────────
  const [activeTerminalTab, setActiveTerminalTab] = useState<'testcases' | 'console'>('testcases');
  const [simulatedCodeRunning, setSimulatedCodeRunning] = useState<boolean>(false);
  const [codeExecutionPassed, setCodeExecutionPassed] = useState<boolean | null>(null);
  const [codeConsoleOutput, setCodeConsoleOutput] = useState<string>('');
  const [sqlQueryResult, setSqlQueryResult] = useState<{ columns: string[]; rows: any[][]; rowCount: number; executionTimeMs: number } | null>(null);
  const [sqlRunning, setSqlRunning] = useState<boolean>(false);
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);

  // ── Timers & HUD ────────────────────────────────────────────────────────────
  const [totalTimeLeftSeconds, setTotalTimeLeftSeconds] = useState<number>(3600);
  const [initialTotalDuration, setInitialTotalDuration] = useState<number>(3600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sectionTimeLeftMap, setSectionTimeLeftMap] = useState<Record<number, number>>({});
  const [sectionTransitionModal, setSectionTransitionModal] = useState<{
    completedSectionTitle: string;
    completedSectionId: number;
    nextSectionTitle: string;
    nextSectionId: number;
    nextSectionQuestionCount: number;
    nextSectionDurationMinutes: number;
    countdownSeconds: number;
  } | null>(null);

  // ── Security & Proctoring ───────────────────────────────────────────────────
  const [lockedSectionIds, setLockedSectionIds] = useState<Set<number>>(new Set());
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenReentrySeconds, setFullscreenReentrySeconds] = useState<number | null>(null);
  const [isMultiTabLocked, setIsMultiTabLocked] = useState<boolean>(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // ── Offline & Network Sync ──────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusText, setSyncStatusText] = useState<string>('Live Sync Active');

  // ── RTK Mutations ───────────────────────────────────────────────────────────
  const [startSessionApi, { isLoading: isStartingSession }] = useStartExamSessionMutation();
  const [saveAnswerBatchApi] = useSaveExamAnswerBatchV2Mutation();
  const [submitExamApi, { isLoading: isSubmittingExam }] = useSubmitExamMutation();
  const [publishResultApi] = usePublishAssessmentResultV2Mutation();
  const [reportViolationApi] = useReportExamViolationMutation();

  // ── 1. Section Architecture ─────────────────────────────────────────────────
  const rawQuestions = useMemo(() => session?.questions || [], [session]);

  const sections: RoundSectionConfig[] = useMemo(() => {
    if (rawQuestions.length === 0) return [];

    const sectionBuckets: Record<string, { config: typeof SECTION_TYPE_MAP[string]; questions: { q: ExamQuestionData; idx: number }[] }> = {};

    rawQuestions.forEach((q, idx) => {
      const mapping = SECTION_TYPE_MAP[q.questionType] || {
        title: 'Core Assessment',
        shortTitle: 'Assessment',
        icon: 'file-text',
        sectionType: 'TechnicalMCQ' as const,
      };
      if (!sectionBuckets[mapping.shortTitle]) {
        sectionBuckets[mapping.shortTitle] = { config: mapping, questions: [] };
      }
      sectionBuckets[mapping.shortTitle].questions.push({ q, idx });
    });

    let secId = 1;
    const totalExamMinutes = session?.durationMinutes || 30;
    const totalExamMarks = rawQuestions.reduce((acc, q) => acc + q.marks, 0) || 1;
    const isSingleSection = Object.keys(sectionBuckets).length <= 1;

    return Object.values(sectionBuckets).map(({ config, questions }) => {
      const qIndices = questions.map((item) => item.idx);
      const sectionMarks = questions.reduce((acc, item) => acc + item.q.marks, 0);

      // Section duration: If single section, duration is the total exam duration.
      // If multi-section, proportional to marks, strictly capped at totalExamMinutes.
      const durationMinutes = isSingleSection
        ? totalExamMinutes
        : Math.min(totalExamMinutes, Math.max(5, Math.round(totalExamMinutes * (sectionMarks / totalExamMarks))));

      return {
        sectionId: secId++,
        sectionTitle: config.title,
        shortTitle: config.shortTitle,
        iconName: config.icon,
        sectionType: config.sectionType,
        durationMinutes,
        questionCount: questions.length,
        totalMarks: sectionMarks,
        questionIndices: qIndices,
      };
    });
  }, [rawQuestions, session?.durationMinutes]);

  // Synchronize dynamic section timers
  useEffect(() => {
    if (sections.length === 0) return;
    setSectionTimeLeftMap((prev) => {
      const updated = { ...prev };
      let changed = false;
      sections.forEach((sec) => {
        if (updated[sec.sectionId] === undefined) {
          updated[sec.sectionId] = sec.durationMinutes * 60;
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [sections]);

  const currentQuestion = useMemo(() => rawQuestions[activeQuestionIndex] || null, [rawQuestions, activeQuestionIndex]);

  const activeSection = useMemo(() => {
    if (!currentQuestion) return sections[0] || null;
    return sections.find((sec) => sec.questionIndices.includes(activeQuestionIndex)) || sections[0] || null;
  }, [sections, activeQuestionIndex, currentQuestion]);

  // Questions in the active section
  const activeSectionQuestions = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.questionIndices.map((idx) => ({
      q: rawQuestions[idx],
      globalIdx: idx,
      sectionRelativeIdx: activeSection.questionIndices.indexOf(idx) + 1,
    }));
  }, [activeSection, rawQuestions]);

  // Answered metrics in active section
  const activeSectionAnsweredCount = useMemo(() => {
    return activeSectionQuestions.filter(({ q }) => {
      const a = answersMap[q.id];
      return (a?.optionIds && a.optionIds.length > 0) || (a?.text && a.text.trim().length > 0);
    }).length;
  }, [activeSectionQuestions, answersMap]);

  const activeSectionFlaggedCount = useMemo(() => {
    return activeSectionQuestions.filter(({ q }) => flaggedQuestionIds.has(q.id)).length;
  }, [activeSectionQuestions, flaggedQuestionIds]);

  // Global Answered Metrics
  const answeredCount = Object.keys(answersMap).filter((qId) => {
    const a = answersMap[Number(qId)];
    return (a?.optionIds && a.optionIds.length > 0) || (a?.text && a.text.trim().length > 0);
  }).length;

  const completionPercentage = rawQuestions.length > 0 ? Math.round((answeredCount / rawQuestions.length) * 100) : 0;
  const sectionCompletionPercentage =
    activeSection && activeSection.questionCount > 0
      ? Math.round((activeSectionAnsweredCount / activeSection.questionCount) * 100)
      : 0;

  // Multi-tab block
  useEffect(() => {
    if (typeof window === 'undefined' || !activeSessionToken) return;

    try {
      const channel = new BroadcastChannel('STEP_STUDIO_V2_CHANNEL');
      broadcastChannelRef.current = channel;

      channel.postMessage({ type: 'PING_STUDIO_SESSION', token: activeSessionToken });
      channel.onmessage = (event) => {
        if (event.data?.token === activeSessionToken) {
          if (event.data?.type === 'PING_STUDIO_SESSION') {
            channel.postMessage({ type: 'STUDIO_ACTIVE', token: activeSessionToken });
          } else if (event.data?.type === 'STUDIO_ACTIVE') {
            setIsMultiTabLocked(true);
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [activeSessionToken]);

  // Anti-cheating listeners (Back button, Copy, Cut, Devtools)
  useEffect(() => {
    if (examStep !== 'active') return;

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    const blockCopy = (e: ClipboardEvent) => e.preventDefault();
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === 'f12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key)) ||
        (e.ctrlKey && key === 'u')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCopy);
    document.addEventListener('paste', blockCopy);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockShortcuts);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('cut', blockCopy);
      document.removeEventListener('paste', blockCopy);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, [examStep]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // ── 3. Offline Local Storage & Sync ─────────────────────────────────────────
  const persistLocally = useCallback(
    (
      newAnswers: typeof answersMap,
      newIdx: number,
      timeLeft: number,
      secTimeMap?: typeof sectionTimeLeftMap,
      lockedSecs?: Set<number>
    ) => {
      if (activeSessionToken) {
        try {
          localStorage.setItem(
            `step_studio_v2_${activeSessionToken}`,
            JSON.stringify({
              answersMap: newAnswers,
              activeQuestionIndex: newIdx,
              totalTimeLeftSeconds: timeLeft,
              sectionTimeLeftMap: secTimeMap || sectionTimeLeftMap,
              lockedSectionIds: Array.from(lockedSecs || lockedSectionIds),
              flaggedQuestionIds: Array.from(flaggedQuestionIds),
              eliminatedOptionsMap,
              savedAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.warn('LocalStorage error', e);
        }
      }
    },
    [activeSessionToken, sectionTimeLeftMap, lockedSectionIds, flaggedQuestionIds, eliminatedOptionsMap]
  );

  const flushAnswersToServer = useCallback(async () => {
    if (!activeSessionToken || !navigator.onLine || isSyncing) return;

    const answerList = Object.entries(answersMap).map(([qId, val]) => ({
      candidateExamSessionQuestionId: Number(qId),
      submittedAnswerText: val.text || null,
      selectedOptionIds: val.optionIds || [],
      clientTimestamp: val.updatedAt,
    }));

    if (answerList.length === 0) return;

    setIsSyncing(true);
    setSyncStatusText('Syncing to cloud...');
    try {
      await saveAnswerBatchApi({
        sessionToken: activeSessionToken,
        answers: answerList,
      }).unwrap();
      setSyncStatusText('Live Sync Active');
    } catch (e) {
      setSyncStatusText('Buffered locally (retry)');
    } finally {
      setIsSyncing(false);
    }
  }, [activeSessionToken, answersMap, isSyncing, saveAnswerBatchApi]);

  // Debounced auto-sync whenever answers change
  useEffect(() => {
    if (Object.keys(answersMap).length === 0 || !activeSessionToken || examStep !== 'active') return;
    const syncTimer = setTimeout(() => {
      flushAnswersToServer();
    }, 600);
    return () => clearTimeout(syncTimer);
  }, [answersMap, activeSessionToken, examStep, flushAnswersToServer]);

  // ── 7. Submission Handling ──────────────────────────────────────────────────
  const handleFinalSubmit = useCallback(async (customReason?: string) => {
    setIsSubmissionModalOpen(false);
    setIsTimerRunning(false);

    // Explicitly pack all answers in memory and sync before submitting
    if (activeSessionToken && Object.keys(answersMap).length > 0) {
      const answerList = Object.entries(answersMap).map(([qId, val]) => ({
        candidateExamSessionQuestionId: Number(qId),
        submittedAnswerText: val.text || null,
        selectedOptionIds: val.optionIds || [],
        clientTimestamp: val.updatedAt || new Date().toISOString(),
      }));

      try {
        await saveAnswerBatchApi({
          sessionToken: activeSessionToken,
          answers: answerList,
        }).unwrap();
      } catch (e) {
        console.warn('Pre-submit answer sync error', e);
      }
    }

    try {
      const res = await submitExamApi({
        sessionToken: activeSessionToken,
        reason: customReason || 'Candidate completed examination',
      }).unwrap();
      if (res.success) setSubmitResult(res.data);
    } catch (e) {
      console.warn('Submission error', e);
    } finally {
      setExamStep('submitted');
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    }
  }, [activeSessionToken, answersMap, saveAnswerBatchApi, submitExamApi]);

  // ── 2. Proctoring & Security ────────────────────────────────────────────────
  const reportViolation = useCallback(
    (violationType: string) => {
      setTabSwitchWarnings((prev) => {
        const next = prev + 1;
        if (activeSessionToken) {
          reportViolationApi({ sessionToken: activeSessionToken, violationType });
        }
        if (next >= 3) {
          // Exceeded 3 warnings: automatically lock and submit
          setTimeout(() => {
            handleFinalSubmit('Security violation threshold reached (3 tab switch violations). Test automatically locked.');
          }, 150);
        }
        return next;
      });
    },
    [activeSessionToken, reportViolationApi, handleFinalSubmit]
  );

  useEffect(() => {
    if (examStep !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('TabSwitch');
      }
    };

    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      if (!isFs) {
        reportViolation('ExitFullscreen');
        setFullscreenReentrySeconds(2);
      } else {
        setFullscreenReentrySeconds(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [examStep, reportViolation]);

  // ── Auto 2-Second Fullscreen Re-entry Handler ──────────────────────────────
  useEffect(() => {
    if (fullscreenReentrySeconds === null || examStep !== 'active') return;

    if (fullscreenReentrySeconds <= 0) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.()
          .then(() => {
            setIsFullscreen(true);
            setFullscreenReentrySeconds(null);
          })
          .catch(() => {
            // If browser requires explicit user activation, modal remains visible with 1-click button
          });
      } else {
        setFullscreenReentrySeconds(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setFullscreenReentrySeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [fullscreenReentrySeconds, examStep]);

  const flushAnswersRef = useRef(flushAnswersToServer);
  useEffect(() => {
    flushAnswersRef.current = flushAnswersToServer;
  }, [flushAnswersToServer]);

  const handleFinalSubmitRef = useRef(handleFinalSubmit);
  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  const goToQuestionRef = useRef(goToQuestion);
  useEffect(() => {
    goToQuestionRef.current = goToQuestion;
  }, [goToQuestion]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => {
      setIsOnline(true);
      setSyncStatusText('Connection Restored');
      flushAnswersRef.current();
    };
    const onOffline = () => {
      setIsOnline(false);
      setSyncStatusText('Offline (Local Vault Active)');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // ── 4. Dynamic Countdown Timer & Automatic Section/Exam Progression ─────────
  useEffect(() => {
    if (examStep !== 'active' || !isTimerRunning) return;

    const interval = setInterval(() => {
      // 1. Decrement overall exam time
      setTotalTimeLeftSeconds((prevTotal) => {
        const nextTotal = prevTotal - 1;
        if (nextTotal <= 0) {
          clearInterval(interval);
          handleFinalSubmitRef.current('Total examination time expired. Assessment automatically submitted.');
          return 0;
        }
        if (nextTotal % 30 === 0) flushAnswersRef.current();
        return nextTotal;
      });

      // 2. Decrement active section time & auto-advance when section time ends
      if (activeSection && !lockedSectionIds.has(activeSection.sectionId)) {
        setSectionTimeLeftMap((prevMap) => {
          const currentSecLeft = prevMap[activeSection.sectionId] ?? (activeSection.durationMinutes * 60);
          const nextSecLeft = currentSecLeft - 1;

          if (nextSecLeft <= 0) {
            // Lock current section
            setLockedSectionIds((prevLocked) => {
              const updatedLocked = new Set(prevLocked).add(activeSection.sectionId);
              return updatedLocked;
            });

            // Find next sequential section
            const currentSecIdx = sections.findIndex((s) => s.sectionId === activeSection.sectionId);
            const nextSec = currentSecIdx >= 0 && currentSecIdx < sections.length - 1 ? sections[currentSecIdx + 1] : null;

            if (nextSec) {
              const firstQOfNext = nextSec.questionIndices[0];
              if (firstQOfNext !== undefined) {
                goToQuestionRef.current(firstQOfNext);
              }
              setSectionTransitionModal({
                completedSectionTitle: activeSection.shortTitle,
                completedSectionId: activeSection.sectionId,
                nextSectionTitle: nextSec.shortTitle,
                nextSectionId: nextSec.sectionId,
                nextSectionQuestionCount: nextSec.questionCount,
                nextSectionDurationMinutes: nextSec.durationMinutes,
                countdownSeconds: 30,
              });
            } else {
              // Final section timer concluded -> submit exam automatically
              handleFinalSubmitRef.current(`Time expired for final Section ${activeSection.sectionId} (${activeSection.shortTitle}). Assessment submitted.`);
            }

            return { ...prevMap, [activeSection.sectionId]: 0 };
          }

          return { ...prevMap, [activeSection.sectionId]: nextSecLeft };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [examStep, isTimerRunning, activeSection?.sectionId, lockedSectionIds.size, sections.length]);

  // ── Section Transition Modal 30s Auto-Countdown ─────────────────────────────
  useEffect(() => {
    if (!sectionTransitionModal) return;

    const interval = setInterval(() => {
      setSectionTransitionModal((prev) => {
        if (!prev) return null;
        if (prev.countdownSeconds <= 1) {
          clearInterval(interval);
          return null; // Automatically close after 30 seconds
        }
        return { ...prev, countdownSeconds: prev.countdownSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sectionTransitionModal]);

  // ── 5. Launch & Start Exam ──────────────────────────────────────────────────
  const handleLaunchSession = async () => {
    if (!candidateCode.trim() || !passcode.trim()) {
      setLoginError('Please enter both Candidate Code and Exam Passcode.');
      return;
    }

    setLoginError(null);
    try {
      const res = await startSessionApi({
        candidateCode: candidateCode.trim(),
        passcode: passcode.trim(),
        testSource: testMode,
        roundNumber: initialRoundNumber,
      }).unwrap();

      if (res.success && res.data) {
        setSession(res.data);
        setActiveSessionToken(res.data.sessionToken);
        const durationSecs = res.data.totalTimeLeftSeconds || (res.data.durationMinutes * 60) || 3600;
        setTotalTimeLeftSeconds(durationSecs);
        setInitialTotalDuration(durationSecs);

        const initMap: typeof answersMap = {};
        (res.data.questions || []).forEach((q) => {
          if (q.submittedAnswerText || (q.selectedOptionIds && q.selectedOptionIds.length > 0)) {
            initMap[q.id] = {
              text: q.submittedAnswerText || undefined,
              optionIds: q.selectedOptionIds || [],
              updatedAt: new Date().toISOString(),
            };
          }
        });
        setAnswersMap(initMap);

        try {
          const cached = localStorage.getItem(`step_studio_v2_${res.data.sessionToken}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.answersMap) setAnswersMap((prev) => ({ ...prev, ...parsed.answersMap }));
            if (parsed.activeQuestionIndex !== undefined) setActiveQuestionIndex(parsed.activeQuestionIndex);
            if (parsed.sectionTimeLeftMap) setSectionTimeLeftMap(parsed.sectionTimeLeftMap);
            if (parsed.lockedSectionIds) setLockedSectionIds(new Set(parsed.lockedSectionIds));
            if (parsed.flaggedQuestionIds) setFlaggedQuestionIds(new Set(parsed.flaggedQuestionIds));
            if (parsed.eliminatedOptionsMap) setEliminatedOptionsMap(parsed.eliminatedOptionsMap);
          }
        } catch (e) {
          console.warn('Cache load error', e);
        }

        setExamStep('instructions');
      } else {
        setLoginError(res.message || 'Invalid examination credentials or expired test link.');
      }
    } catch (err: any) {
      const errMsg =
        (Array.isArray(err?.data?.errors)
          ? typeof err.data.errors[0] === 'string'
            ? err.data.errors[0]
            : err.data.errors[0]?.errorMessage || err.data.errors[0]?.message
          : null) ||
        (err?.data?.errors && typeof err.data.errors === 'object'
          ? Array.isArray(Object.values(err.data.errors)[0])
            ? (Object.values(err.data.errors)[0] as string[])[0]
            : String(Object.values(err.data.errors)[0])
          : null) ||
        (err?.data?.message && err.data.message !== 'Validation failed' ? err.data.message : null) ||
        err?.data?.title ||
        err?.error ||
        err?.message ||
        'Verification failed. Check your Candidate Code and Passcode.';
      setLoginError(typeof errMsg === 'string' ? errMsg : String(errMsg));
    }
  };

  useEffect(() => {
    if (initialCandidateCode && initialPasscode && !session) {
      handleLaunchSession();
    }
  }, [initialCandidateCode, initialPasscode]);

  const handleStartExamNow = () => {
    setExamStep('active');
    setIsTimerRunning(true);
    toggleFullscreen();
  };

  // ── 6. Answer Selection & Keyboard Shortcuts ────────────────────────────────
  const handleSelectOption = (questionId: number, optionId: number, isMulti: boolean) => {
    const timeStamp = new Date().toISOString();
    setAnswersMap((prev) => {
      const currentOptIds = prev[questionId]?.optionIds || [];
      let nextOptIds: number[];

      if (isMulti) {
        nextOptIds = currentOptIds.includes(optionId)
          ? currentOptIds.filter((id) => id !== optionId)
          : [...currentOptIds, optionId];
      } else {
        nextOptIds = [optionId];
      }

      const updated = {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          optionIds: nextOptIds,
          updatedAt: timeStamp,
        },
      };

      persistLocally(updated, activeQuestionIndex, totalTimeLeftSeconds);
      return updated;
    });

    // Real-time optimistic backend persistence
    if (activeSessionToken) {
      saveAnswerBatchApi({
        sessionToken: activeSessionToken,
        answers: [{
          candidateExamSessionQuestionId: questionId,
          selectedOptionIds: isMulti ? undefined : [optionId],
          clientTimestamp: timeStamp,
        }],
      }).catch((e) => console.warn('Instant save error', e));
    }
  };

  const handleToggleEliminateOption = (questionId: number, optionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEliminatedOptionsMap((prev) => {
      const currentElim = prev[questionId] || [];
      const nextElim = currentElim.includes(optionId)
        ? currentElim.filter((id) => id !== optionId)
        : [...currentElim, optionId];
      return { ...prev, [questionId]: nextElim };
    });
  };

  const handleTextAnswerChange = (questionId: number, text: string) => {
    setAnswersMap((prev) => {
      const updated = {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          text,
          updatedAt: new Date().toISOString(),
        },
      };
      persistLocally(updated, activeQuestionIndex, totalTimeLeftSeconds);
      return updated;
    });
  };

  const handleClearAnswer = (questionId: number) => {
    setAnswersMap((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      persistLocally(updated, activeQuestionIndex, totalTimeLeftSeconds);
      return updated;
    });
  };

  const toggleFlagQuestion = (questionId: number) => {
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Keyboard shortcut listener for options (1-4, A-D)
  useEffect(() => {
    if (examStep !== 'active' || !currentQuestion) return;
    if (currentQuestion.questionType !== 'SINGLE_CHOICE' && currentQuestion.questionType !== 'MULTI_CHOICE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      const key = e.key.toUpperCase();
      const options = currentQuestion.options || [];

      let chosenIndex = -1;
      if (['1', '2', '3', '4', '5'].includes(key)) chosenIndex = parseInt(key) - 1;
      else if (['A', 'B', 'C', 'D', 'E'].includes(key)) chosenIndex = key.charCodeAt(0) - 65;

      if (chosenIndex >= 0 && chosenIndex < options.length) {
        handleSelectOption(
          currentQuestion.id,
          options[chosenIndex].id,
          currentQuestion.questionType === 'MULTI_CHOICE'
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [examStep, currentQuestion]);

  // ── 8. Code & SQL Simulators ────────────────────────────────────────────────
  const handleRunCodeTest = () => {
    setSimulatedCodeRunning(true);
    setCodeExecutionPassed(null);
    setTimeout(() => {
      setSimulatedCodeRunning(false);
      setCodeExecutionPassed(true);
      setCodeConsoleOutput(
        `> Compiling C# Source with .NET 10 Roslyn Compiler...\n> Optimizations: Enabled (Release mode)\n> Running Test Suite...\n[PASS] Test Case 1: LRU Eviction Order (Expected: 1, Actual: 1) — 12ms\n[PASS] Test Case 2: Capacity Boundary Limit — 14ms\n[PASS] Test Case 3: Thread-Safety Concurrency Stress (10,000 ops) — 22ms\n\n✓ All 3 Test Cases Verified Successfully (Total: 48ms | Memory: 24.2 MB)`
      );
      setActiveTerminalTab('console');
    }, 850);
  };

  const handleRunSqlQuery = () => {
    setSqlRunning(true);
    setTimeout(() => {
      setSqlRunning(false);
      setSqlQueryResult({
        columns: ['EmployeeId', 'FullName', 'Salary', 'SalaryRank'],
        rows: [
          ['104', 'Vikram Deshmukh', '$142,000.00', '2'],
        ],
        rowCount: 1,
        executionTimeMs: 18,
      });
    }, 650);
  };

  // Time format
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered Question Palette Items for the ACTIVE SECTION ONLY
  const filteredActiveQuestions = activeSectionQuestions.filter(({ q }) => {
    const ans = answersMap[q.id];
    const isAnswered = (ans?.optionIds && ans.optionIds.length > 0) || (ans?.text && ans.text.trim().length > 0);
    const isFlagged = flaggedQuestionIds.has(q.id);

    if (paletteFilter === 'ANSWERED') return isAnswered;
    if (paletteFilter === 'UNANSWERED') return !isAnswered;
    if (paletteFilter === 'FLAGGED') return isFlagged;
    return true;
  });

  // Relative index within active section
  const currentRelativeIndex = activeSection
    ? activeSection.questionIndices.indexOf(activeQuestionIndex) + 1
    : 1;

  const nextSection = useMemo(() => {
    if (!activeSection) return null;
    const currentSecIdx = sections.findIndex((s) => s.sectionId === activeSection.sectionId);
    return currentSecIdx < sections.length - 1 ? sections[currentSecIdx + 1] : null;
  }, [sections, activeSection]);

  const prevSection = useMemo(() => {
    if (!activeSection) return null;
    const currentSecIdx = sections.findIndex((s) => s.sectionId === activeSection.sectionId);
    return currentSecIdx > 0 ? sections[currentSecIdx - 1] : null;
  }, [sections, activeSection]);

  const isLastQuestionOfSection = activeSection && activeSection.questionIndices[activeSection.questionIndices.length - 1] === activeQuestionIndex;
  const isFirstQuestionOfSection = activeSection && activeSection.questionIndices[0] === activeQuestionIndex;

  // ── STAGE 1: CANDIDATE LOGIN ───────────────────────────────────────────────
  if (examStep === 'login') {
    return (
      <div className="min-h-screen bg-canvas text-text-primary flex items-center justify-center p-4 font-sans select-none relative overflow-hidden" data-theme="dark">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-indigo-dim rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-cyan-dim rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-surface-1 border border-border-default rounded-3xl shadow-2xl p-8 space-y-6 relative z-10"
        >
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-indigo-dim text-accent-indigo border border-border-default mb-1"
            >
              <Icon name="code-2" size="md" />
            </motion.div>
            <h1 className="text-2xl font-bold text-text-primary font-heading tracking-tight">
              STEP Online Assessment
            </h1>
            <p className="text-xs text-text-secondary">
              Enter your credentials to begin the assessment.
            </p>
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger-text text-xs font-semibold flex items-center gap-2.5 animate-step-shake"
            >
              <Icon name="alert-triangle" size="xs" className="shrink-0" />
              <span>{loginError}</span>
            </motion.div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLaunchSession();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary font-mono flex items-center justify-between">
                <span>CANDIDATE CODE</span>
                <span className="text-[10px] text-text-tertiary font-normal">Provided in invitation</span>
              </label>
              <input
                type="text"
                value={candidateCode}
                onChange={(e) => setCandidateCode(e.target.value.toUpperCase())}
                placeholder="e.g. CND-2026-1042"
                className="w-full h-11 px-4 rounded-xl border border-border-default bg-surface-2 text-text-primary font-mono text-xs focus:border-border-focus focus:outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary font-mono flex items-center justify-between">
                <span>EXAM PASSCODE / PIN</span>
                <span className="text-[10px] text-text-tertiary font-normal">Access PIN</span>
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••"
                maxLength={8}
                className="w-full h-11 px-4 rounded-xl border border-border-default bg-surface-2 text-text-primary font-mono text-xs focus:border-border-focus focus:outline-none transition-all tracking-widest text-center"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={isStartingSession}
              className="w-full h-11 rounded-xl bg-accent-indigo hover:bg-accent-indigo-hover text-text-on-accent font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isStartingSession ? (
                <>
                  <Icon name="spinner" size="xs" className="animate-spin" />
                  <span>Loading Assessment...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <Icon name="arrow-right" size="xs" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── STAGE 2: PRE-EXAM INSTRUCTIONS ──────────────────────────────────────────
  if (examStep === 'instructions' && !session && isStartingSession) {
    return (
      <div className="min-h-screen bg-canvas text-text-primary flex items-center justify-center p-4 font-sans" data-theme="dark">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-accent-indigo-dim text-accent-indigo border border-border-default flex items-center justify-center mx-auto animate-spin">
            <Icon name="loader" size="md" />
          </div>
          <h2 className="text-base font-bold text-text-primary font-heading">
            Loading Assessment Blueprint...
          </h2>
          <p className="text-xs text-text-tertiary font-mono">
            Generating your personalized questions and securing the proctoring environment.
          </p>
        </div>
      </div>
    );
  }

  if (examStep === 'instructions' && !session && loginError) {
    const isLockedError =
      loginError.toLowerCase().includes('lock') ||
      loginError.toLowerCase().includes('round') ||
      loginError.toLowerCase().includes('aptitude') ||
      loginError.toLowerCase().includes('prerequisite') ||
      loginError.toLowerCase().includes('pass');

    return (
      <div className="min-h-screen bg-canvas text-text-primary flex items-center justify-center p-4 font-sans select-none relative overflow-hidden" data-theme="dark">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-indigo-dim rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative z-10"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
            isLockedError
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
              : 'bg-status-danger-bg text-status-danger-text border-status-danger-border'
          }`}>
            <Icon name={isLockedError ? 'lock' : 'alert-triangle'} size="md" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-text-primary font-heading tracking-tight">
              {isLockedError ? 'Assessment Stage Locked' : 'Assessment Access Restricted'}
            </h2>
            <p className="text-xs text-text-tertiary">
              {isLockedError ? 'Prerequisite evaluation required' : 'Unable to initialize examination environment'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed text-left space-y-2 ${
            isLockedError
              ? 'bg-amber-500/5 border-amber-500/20 text-amber-300/90'
              : 'bg-status-danger-bg/50 border-status-danger-border text-status-danger-text'
          }`}>
            <div className="flex items-start gap-2.5">
              <Icon name="info" size="xs" className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {initialRoundNumber === 2 && isLockedError && (
              <a
                href={`/exam?code=${encodeURIComponent(candidateCode)}&pass=${encodeURIComponent(passcode)}&round=1`}
                className="w-full h-11 rounded-xl bg-accent-indigo hover:bg-accent-indigo-hover text-text-on-accent font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Take Round 1: Aptitude Assessment</span>
                <Icon name="arrow-right" size="xs" />
              </a>
            )}

            <button
              type="button"
              onClick={handleLaunchSession}
              className="w-full h-10 rounded-xl bg-surface-2 hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary font-semibold text-xs transition-all cursor-pointer"
            >
              Retry Verification
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (examStep === 'instructions') {
    return (
      <div className="min-h-screen bg-canvas text-text-primary flex items-center justify-center p-4 sm:p-6 font-sans select-none relative overflow-hidden" data-theme="dark">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-indigo-dim rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
        >
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-start justify-between border-b border-border-soft pb-5 flex-wrap gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-status-success-bg text-status-success-text border border-status-success-border text-[10.5px] font-mono font-bold">
                  PROCTORED ASSESSMENT
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">
                  {testMode === 'In Office' ? '• In Office Test' : '• Online Test'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                {session?.paperTitle || 'Technical Assessment'}
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Candidate: <strong className="text-accent-indigo">{session?.candidateName}</strong> ({candidateCode}) • Role: <strong className="text-accent-indigo">{session?.vacancyTitle}</strong>
              </p>
            </div>

            <div className="bg-surface-2 border border-border-default px-4 py-2 rounded-2xl font-mono text-right">
              <span className="text-sm font-black text-accent-cyan">{session?.durationMinutes || 60} Mins</span>
              <div className="text-[10px] text-text-tertiary">Duration</div>
            </div>
          </motion.div>

          {/* Bento Grid Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-2 p-4 rounded-2xl border border-border-soft text-xs font-mono"
          >
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold">Sections</span>
              <p className="font-extrabold text-accent-indigo mt-0.5">{sections.length} Sections</p>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold">Total Questions</span>
              <p className="font-extrabold text-text-primary mt-0.5">{rawQuestions.length} Questions</p>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold">Total Marks</span>
              <p className="font-extrabold text-text-primary mt-0.5">{rawQuestions.reduce((acc, q) => acc + q.marks, 0)} Marks</p>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold">Passing Benchmark</span>
              <p className="font-extrabold text-status-success-text mt-0.5">70%</p>
            </div>
          </motion.div>

          {/* Section Matrix Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-text-secondary uppercase font-mono tracking-wider">
              Sections Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sections.map((sec, idx) => (
                <motion.div
                  key={sec.sectionId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + idx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-3.5 rounded-2xl bg-surface-2 border border-border-soft hover:border-border-default transition-all space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <Icon name={sec.iconName as any} size="xs" className="text-accent-indigo" />
                      <span>{sec.shortTitle}</span>
                    </span>
                    <span className="text-[10px] font-mono text-accent-cyan font-extrabold bg-accent-cyan-dim px-2 py-0.5 rounded border border-border-soft">
                      {sec.durationMinutes}m
                    </span>
                  </div>
                  <p className="text-[11px] text-text-tertiary">
                    {sec.questionCount} {sec.questionCount === 1 ? 'Question' : 'Questions'} • {sec.totalMarks} Marks
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Instructions Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            className="p-4 rounded-2xl bg-status-warning-bg border border-status-warning-border space-y-2 text-xs"
          >
            <div className="flex items-center gap-2 text-status-warning-title font-bold font-mono">
              <Icon name="alert-triangle" size="xs" />
              <span>IMPORTANT RULES</span>
            </div>
            <p className="text-status-warning-text text-[11.5px] leading-relaxed">
              • Do not switch tabs, minimize your browser, or exit fullscreen. 3 warnings will automatically submit your assessment.<br />
              • Answers are saved automatically in real-time.<br />
              • Sections are sequential: once you finish a section and advance, earlier sections cannot be reopened.
            </p>
          </motion.div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border-soft">
            <div className="flex items-center gap-2 text-xs text-status-success-text font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-step-pulse" />
              <span>Ready to start</span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStartExamNow}
              className="h-11 px-8 rounded-xl bg-status-success text-text-on-accent hover:opacity-95 font-extrabold text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>Start Assessment</span>
              <Icon name="chevron-right" size="xs" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── STAGE 3: POST-EXAM SUBMISSION (Clean & Minimal Summary) ──
  if (examStep === 'submitted') {
    return (
      <div className="min-h-screen bg-canvas text-text-primary flex items-center justify-center p-4 font-sans select-none" data-theme="dark">
        <div className="max-w-md w-full bg-surface-1 border border-border-default rounded-3xl p-8 shadow-2xl text-center space-y-5 animate-step-zoom-in">
          <div className="w-14 h-14 rounded-2xl bg-status-success-bg text-status-success-text border border-status-success-border mx-auto flex items-center justify-center shadow-md">
            <Icon name="check-circle" size="md" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-text-primary font-heading">
              Assessment Submitted
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {session?.candidateName || candidateCode}
            </p>
          </div>

          {tabSwitchWarnings >= 3 && (
            <div className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger-text text-xs font-mono text-center flex items-center justify-center gap-2">
              <Icon name="alert-triangle" size="xs" />
              <span>Terminated: Maximum 3 security warnings reached.</span>
            </div>
          )}

          <div className="bg-surface-2 p-4 rounded-2xl border border-border-soft grid grid-cols-2 gap-3 text-xs font-mono text-left">
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold">Answered</span>
              <p className="font-bold text-text-primary mt-0.5">{answeredCount} of {rawQuestions.length} ({completionPercentage}%)</p>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase font-bold">Status</span>
              <p className="font-bold text-status-success-text mt-0.5">Completed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STAGE 4: LIVE ASSESSMENT WORKSPACE ──────────────────────────────────────
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-xs text-text-tertiary font-mono" data-theme="dark">
        Loading test questions...
      </div>
    );
  }

  const isCurrentFlagged = flaggedQuestionIds.has(currentQuestion.id);
  const currentAnswer = answersMap[currentQuestion.id] || { optionIds: [] };
  const currentEliminated = eliminatedOptionsMap[currentQuestion.id] || [];

  return (
    <div className="h-screen w-screen bg-canvas text-text-primary flex flex-col font-sans select-none overflow-hidden" data-theme="dark">
      {/* ── TOP HUD COMMAND BAR ── */}
      <header className="h-14 bg-surface-1 border-b border-border-default px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Assessment Brand & Candidate Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-accent-indigo-dim border border-border-default text-accent-indigo flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-xs">
            <Icon name="shield-check" size="xs" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-text-primary font-heading truncate max-w-[180px] sm:max-w-sm">
                {session?.paperTitle || 'Online Assessment'}
              </h2>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-accent-indigo-dim text-accent-indigo text-[10px] font-mono font-bold border border-border-default">
                Section {activeSection?.sectionId}: {activeSection?.shortTitle}
              </span>
            </div>
            <p className="text-[10px] text-text-tertiary font-mono truncate">
              {session?.candidateName || candidateCode} • {session?.vacancyTitle}
            </p>
          </div>
        </div>

        {/* Center: Section & Overall Progress Ribbon */}
        <div className="hidden md:flex items-center gap-4">
          {/* Section Progress */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[10.5px] font-mono text-text-secondary">
              <span className="text-accent-indigo font-bold">{activeSection?.shortTitle}:</span>
              <strong className="text-text-primary">{activeSectionAnsweredCount}/{activeSection?.questionCount} Solved</strong>
              <span className="text-text-tertiary">({sectionCompletionPercentage}%)</span>
            </div>
            <div className="w-32 h-1.5 bg-surface-3 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-accent-indigo rounded-full"
                initial={false}
                animate={{ width: `${sectionCompletionPercentage}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Overall Divider */}
          <div className="w-px h-6 bg-border-soft" />

          {/* Overall Progress */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[10.5px] font-mono text-text-tertiary">
              <span>Overall:</span>
              <strong className="text-status-success-text">{answeredCount}/{rawQuestions.length}</strong>
              <span className="text-text-tertiary">({completionPercentage}%)</span>
            </div>
            <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-status-success rounded-full"
                initial={false}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        {/* Right: Security, Timers, Submission Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Violation warning counter */}
          {tabSwitchWarnings > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-status-danger-bg text-status-danger-text border border-status-danger-border text-[10.5px] font-mono font-bold flex items-center gap-1 animate-step-shake">
              <Icon name="alert-triangle" size="xs" />
              <span>Warnings: {tabSwitchWarnings}/3</span>
            </span>
          )}

          {/* Sync status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border-default text-[10px] font-mono text-text-secondary">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-status-success animate-step-pulse' : 'bg-status-warning'}`} />
            <span>{syncStatusText}</span>
          </div>

          {/* Timers HUD: Dynamic Single-Timer vs Multi-Section Dual Timers */}
          <div className="flex items-center gap-2">
            {sections.length > 1 && activeSection && (
              <div
                className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-1.5 transition-all ${
                  (sectionTimeLeftMap[activeSection.sectionId] ?? activeSection.durationMinutes * 60) < 120
                    ? 'bg-status-warning-bg text-status-warning-text border-status-warning-border animate-step-pulse font-black'
                    : 'bg-surface-2 border-border-default text-accent-indigo'
                }`}
                title={`Time remaining for current section (${activeSection.shortTitle})`}
              >
                <Icon name="layers" size="xs" />
                <span className="hidden sm:inline">{activeSection.shortTitle}:</span>
                <strong className="font-mono">{formatTime(sectionTimeLeftMap[activeSection.sectionId] ?? activeSection.durationMinutes * 60)}</strong>
              </div>
            )}

            {/* Overall countdown HUD */}
            <div
              className={`px-3 py-1.5 rounded-xl border font-mono font-black text-xs flex items-center gap-1.5 transition-all ${
                totalTimeLeftSeconds < 300
                  ? 'bg-status-danger-bg text-status-danger-text border-status-danger-border animate-step-pulse'
                  : 'bg-surface-2 border-border-default text-accent-cyan'
              }`}
              title="Total Assessment Time Remaining"
            >
              <Icon name="calendar" size="xs" />
              <span className="hidden sm:inline">{sections.length === 1 ? 'Time Left:' : 'Total:'}</span>
              <span>{formatTime(totalTimeLeftSeconds)}</span>
            </div>
          </div>

          {/* Submit Test Button (Refined subtle aesthetic) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsSubmissionModalOpen(true)}
            className="h-8.5 px-3.5 rounded-xl border border-status-success-border/60 bg-status-success-bg/40 hover:bg-status-success-bg hover:border-status-success text-status-success-text font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Review and Submit Assessment"
          >
            <Icon name="check-circle" size="xs" className="text-status-success-text shrink-0" />
            <span>Submit Assessment</span>
          </motion.button>
        </div>
      </header>

      {/* ── WORKSPACE LAYOUT (Left Sections HUD / Center Workspace) ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT HUD: Sections & Active Question Grid */}
        <aside
          className={`${
            isSidebarCollapsed ? 'w-16 p-2' : 'w-76 p-3.5'
          } bg-surface-1 border-r border-border-default flex flex-col justify-start space-y-3.5 overflow-y-auto transition-all duration-300 ease-in-out shrink-0 z-20`}
        >
          {isSidebarCollapsed ? (
            /* ── COLLAPSED PRO ACTIVITY DOCK (Sleek 64px Rail) ── */
            <div className="flex flex-col items-center justify-between h-full py-1 space-y-4">
              <div className="flex flex-col items-center space-y-3 w-full">
                {/* Top Expand Icon */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="w-9 h-9 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-default text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Expand Sections"
                >
                  <Icon name="chevron-right" size="xs" />
                </button>

                <div className="w-8 h-px bg-border-soft my-1" />

                {/* Section Icon Buttons */}
                <div className="flex flex-col items-center space-y-2 w-full">
                  {sections.map((sec) => {
                    const isActive = activeSection?.sectionId === sec.sectionId;
                    const isPastLocked = lockedSectionIds.has(sec.sectionId);
                    const isFutureLocked = sec.sectionId > (activeSection?.sectionId || 1);
                    const isLocked = isPastLocked || isFutureLocked;

                    return (
                      <button
                        key={sec.sectionId}
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) {
                            const firstQ = sec.questionIndices[0];
                            if (firstQ !== undefined) goToQuestion(firstQ);
                          }
                        }}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center relative group ${
                          isActive
                            ? 'bg-accent-indigo text-text-on-accent shadow-md ring-2 ring-accent-indigo/40 cursor-pointer'
                            : isPastLocked
                            ? 'bg-status-success-bg text-status-success-text border border-status-success-border opacity-70 cursor-not-allowed'
                            : 'bg-surface-3 text-text-tertiary border border-border-soft opacity-40 cursor-not-allowed'
                        }`}
                        title={`Section ${sec.sectionId}: ${sec.shortTitle} ${
                          isPastLocked
                            ? '(Completed & Locked)'
                            : isActive
                            ? '(Current Section)'
                            : '(Locked - Complete Previous Section First)'
                        }`}
                      >
                        {isPastLocked ? (
                          <Icon name="check-circle" size="xs" className="text-status-success-text" />
                        ) : isFutureLocked ? (
                          <Icon name="lock" size="xs" className="text-text-tertiary" />
                        ) : (
                          <Icon name={sec.iconName as any} size="xs" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="w-8 h-px bg-border-soft my-1" />

                {/* Mini Question Matrix for Active Section (Compact 2-col grid) */}
                {activeSection && (
                  <div className="flex flex-col items-center space-y-1.5 w-full">
                    <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto px-1 py-1 scrollbar-step">
                      {activeSectionQuestions.map(({ q, globalIdx, sectionRelativeIdx }) => {
                        const isCurrent = activeQuestionIndex === globalIdx;
                        const ans = answersMap[q.id];
                        const isAns = (ans?.optionIds && ans.optionIds.length > 0) || (ans?.text && ans.text.trim().length > 0);
                        const isFlag = flaggedQuestionIds.has(q.id);

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => goToQuestion(globalIdx)}
                            className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center border relative ${
                              isCurrent
                                ? 'bg-accent-indigo text-text-on-accent border-accent-indigo ring-1 ring-accent-cyan shadow-xs scale-110'
                                : isAns
                                ? 'bg-status-success-bg text-status-success-text border-status-success-border'
                                : 'bg-surface-2 text-text-tertiary border-border-soft hover:text-text-primary'
                            }`}
                            title={`Q${sectionRelativeIdx} in ${activeSection.shortTitle}`}
                          >
                            {sectionRelativeIdx}
                            {isFlag && (
                              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-status-warning" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Expand */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-9 h-9 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-default text-accent-indigo hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Expand Sections & Questions Menu"
              >
                <Icon name="layers" size="xs" />
              </button>
            </div>
          ) : (
            /* ── FULL EXPANDED 280px SIDEBAR ── */
            <>
              <div className="space-y-4">
                {/* Collapse Toggle Header */}
                <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-text-secondary uppercase font-mono tracking-wider">
                      SECTIONS &amp; QUESTIONS
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="w-7 h-7 rounded-lg bg-surface-2 border border-border-default hover:bg-surface-3 text-text-tertiary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer ml-auto"
                    title="Collapse to Mini Dock"
                  >
                    <Icon name="chevron-left" size="xs" />
                  </button>
                </div>

                {/* 1. SECTION NAVIGATION ACCORDION / PILLS */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-text-tertiary font-bold px-1">
                    Sections ({sections.length})
                  </div>
                  <div className="space-y-1">
                    {sections.map((sec) => {
                      const isActive = activeSection?.sectionId === sec.sectionId;
                      const isPastLocked = lockedSectionIds.has(sec.sectionId);
                      const isFutureLocked = sec.sectionId > (activeSection?.sectionId || 1);
                      const isLocked = isPastLocked || isFutureLocked;
                      const secAnswered = sec.questionIndices.filter((idx) => {
                        const a = answersMap[rawQuestions[idx]?.id];
                        return (a?.optionIds && a.optionIds.length > 0) || (a?.text && a.text.trim().length > 0);
                      }).length;

                      return (
                        <button
                          key={sec.sectionId}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            if (!isLocked) {
                              const firstQ = sec.questionIndices[0];
                              if (firstQ !== undefined) goToQuestion(firstQ);
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border font-mono text-xs transition-all flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-accent-indigo-dim border-accent-indigo text-text-primary shadow-sm ring-1 ring-accent-indigo/40 cursor-pointer'
                              : isPastLocked
                              ? 'bg-status-success-bg border-status-success-border text-status-success-text opacity-75 cursor-not-allowed'
                              : 'bg-surface-3 border-border-soft text-text-tertiary opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isPastLocked ? (
                              <Icon name="check-circle" size="xs" className="text-status-success-text shrink-0" />
                            ) : isActive ? (
                              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-step-pulse shrink-0" />
                            ) : (
                              <Icon name="lock" size="xs" className="text-text-tertiary shrink-0" />
                            )}
                            <span className="font-bold truncate">Section {sec.sectionId}: {sec.shortTitle}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10.5px]">
                            {isPastLocked ? (
                              <span className="text-[9.5px] px-2 py-0.5 rounded bg-status-success-bg text-status-success-text font-bold border border-status-success-border flex items-center gap-1">
                                <Icon name="check-circle" size="xs" />
                                <span>Completed</span>
                              </span>
                            ) : isActive ? (
                              <span className="text-[9.5px] px-2 py-0.5 rounded bg-accent-indigo text-text-on-accent font-bold font-mono">
                                Active
                              </span>
                            ) : (
                              <span className="text-[9.5px] px-2 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-soft flex items-center gap-1">
                                <Icon name="lock" size="xs" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DEDICATED ACTIVE SECTION QUESTION PALETTE */}
                {activeSection && (
                  <div className="p-3 rounded-2xl bg-surface-2 border border-border-default space-y-3">
                    <div className="flex items-center justify-between border-b border-border-soft pb-2">
                      <div className="text-[11px] font-mono font-black text-text-primary uppercase">
                        {activeSection.shortTitle} Questions
                      </div>
                      <span className="text-[10px] font-mono text-accent-cyan font-bold">
                        {activeSectionAnsweredCount}/{activeSection.questionCount} Solved
                      </span>
                    </div>

                    {/* Filter Pills for this Active Section */}
                    <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => setPaletteFilter('ALL')}
                        className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          paletteFilter === 'ALL' ? 'bg-accent-indigo text-text-on-accent border-accent-indigo' : 'bg-surface-3 text-text-tertiary border-border-soft'
                        }`}
                      >
                        All ({activeSection.questionCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter('ANSWERED')}
                        className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          paletteFilter === 'ANSWERED' ? 'bg-status-success text-text-on-accent border-status-success' : 'bg-surface-3 text-status-success-text border-border-soft'
                        }`}
                      >
                        Ans ({activeSectionAnsweredCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter('UNANSWERED')}
                        className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          paletteFilter === 'UNANSWERED' ? 'bg-surface-4 text-text-primary border-border-strong' : 'bg-surface-3 text-text-tertiary border-border-soft'
                        }`}
                      >
                        Un ({activeSection.questionCount - activeSectionAnsweredCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter('FLAGGED')}
                        className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          paletteFilter === 'FLAGGED' ? 'bg-status-warning text-text-on-accent border-status-warning' : 'bg-surface-3 text-status-warning-text border-border-soft'
                        }`}
                      >
                        Flag ({activeSectionFlaggedCount})
                      </button>
                    </div>

                    {/* Clean Active Question Grid */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {filteredActiveQuestions.map(({ q, globalIdx, sectionRelativeIdx }) => {
                        const isCurrent = activeQuestionIndex === globalIdx;
                        const ans = answersMap[q.id];
                        const isAns = (ans?.optionIds && ans.optionIds.length > 0) || (ans?.text && ans.text.trim().length > 0);
                        const isFlag = flaggedQuestionIds.has(q.id);

                        return (
                          <motion.button
                            key={q.id}
                            type="button"
                            whileHover={{ scale: 1.14 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => goToQuestion(globalIdx)}
                            className={`h-8 rounded-xl text-xs font-mono font-bold relative transition-all cursor-pointer flex items-center justify-center border ${
                              isCurrent
                                ? 'bg-accent-indigo text-text-on-accent border-accent-indigo shadow-md scale-105 ring-2 ring-accent-cyan/40'
                                : isAns
                                ? 'bg-status-success-bg text-status-success-text border-status-success-border'
                                : 'bg-surface-3 text-text-tertiary border-border-soft hover:border-border-default hover:text-text-primary'
                            }`}
                            title={`Question ${sectionRelativeIdx} in this section (Overall Q${globalIdx + 1})`}
                          >
                            {sectionRelativeIdx}
                            {isFlag && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-status-warning ring-2 ring-surface-1" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mini Legend */}
              <div className="p-2.5 rounded-xl bg-surface-2 border border-border-soft space-y-1.5 text-[10.5px] font-mono text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-success" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-warning" />
                  <span>Flagged for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-surface-4" />
                  <span>Unanswered</span>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* CENTER MAIN WORKSPACE CANVAS */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto bg-canvas relative">
          <div className="max-w-5xl mx-auto w-full space-y-4 animate-step-fade-in">
            {/* Floating Expand Pill (Visible only when sidebar is collapsed) */}
            {isSidebarCollapsed && (
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-1 hover:bg-surface-2 border border-border-default text-xs font-mono font-bold text-accent-indigo hover:text-text-primary shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Icon name="layers" size="xs" />
                  <span>Section {activeSection?.sectionId}: {activeSection?.shortTitle}</span>
                  <span className="text-[10px] text-accent-cyan bg-accent-cyan-dim px-2 py-0.5 rounded border border-border-soft">
                    Open Questions ({currentRelativeIndex}/{activeSection?.questionCount})
                  </span>
                </button>
              </div>
            )}


            {/* Question Card with Directional Physics & Beam Shimmer */}
            <AnimatePresence mode="wait" custom={navigationDirection} initial={false}>
              <motion.div
                key={currentQuestion.id}
                custom={navigationDirection}
                variants={questionCardSliderVariant}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Question Entrance Neon Lightbeam Shimmer */}
                <motion.div
                  key={`beam-${currentQuestion.id}`}
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-accent-indigo to-transparent pointer-events-none"
                />

                {/* Question Action Header */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  className="flex items-center justify-between border-b border-border-soft pb-4 flex-wrap gap-2.5"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-accent-indigo-dim text-accent-indigo font-mono text-xs font-bold border border-border-default">
                      SECTION {activeSection?.sectionId}: {activeSection?.shortTitle.toUpperCase()}
                    </span>
                    
                    {/* Question Type Badge */}
                    {currentQuestion.questionType === 'MULTI_CHOICE' ? (
                      <span className="px-2.5 py-1 rounded-xl bg-accent-violet-dim text-accent-violet font-mono text-[11px] font-bold border border-border-default flex items-center gap-1.5">
                        <Icon name="check-square" size="xs" />
                        <span>Multiple Choice</span>
                      </span>
                    ) : currentQuestion.questionType === 'SINGLE_CHOICE' ? (
                      <span className="px-2.5 py-1 rounded-xl bg-accent-indigo-dim text-accent-indigo font-mono text-[11px] font-bold border border-border-default">
                        Single Choice
                      </span>
                    ) : null}

                    <span className="text-xs font-mono font-bold text-text-tertiary">
                      QUESTION {currentRelativeIndex} OF {activeSection?.questionCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-xl bg-accent-cyan-dim text-accent-cyan border border-border-default">
                      {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                    </span>

                    {/* Bookmark Toggle */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleFlagQuestion(currentQuestion.id)}
                      className={`h-8 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isCurrentFlagged
                          ? 'bg-status-warning-bg text-status-warning-text border-status-warning-border shadow-xs'
                          : 'bg-surface-2 text-text-tertiary border-border-default hover:text-status-warning-text'
                      }`}
                    >
                      <Icon name="award" size="xs" />
                      <span>{isCurrentFlagged ? 'FLAGGED' : 'FLAG'}</span>
                    </motion.button>

                    {/* Clear button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleClearAnswer(currentQuestion.id)}
                      className="h-8 px-2.5 rounded-xl bg-surface-2 text-text-tertiary hover:text-status-danger-text border border-border-default text-xs font-mono transition-colors cursor-pointer"
                    >
                      CLEAR
                    </motion.button>
                  </div>
                </motion.div>

                {/* Question Text Prompt */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.22 }}
                  className="text-base sm:text-lg font-bold text-text-primary font-heading leading-relaxed"
                >
                  {currentQuestion.questionText}
                </motion.div>

                {/* ── WORKSPACE A: MCQS ── */}
                {(currentQuestion.questionType === 'SINGLE_CHOICE' || currentQuestion.questionType === 'MULTI_CHOICE') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.25 }}
                    className="space-y-3 pt-1"
                  >
                    <div className="grid grid-cols-1 gap-2.5">
                      {(currentQuestion.options || []).map((opt, optIdx) => {
                        const isSelected = currentAnswer.optionIds.includes(opt.id);
                        const isMulti = currentQuestion.questionType === 'MULTI_CHOICE';
                        const keyLabel = opt.label || String.fromCharCode(65 + optIdx);

                        return (
                          <motion.div
                            key={opt.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.14 + optIdx * 0.04, duration: 0.2 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => handleSelectOption(currentQuestion.id, opt.id, isMulti)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                              isSelected
                                ? isMulti
                                  ? 'bg-accent-violet-dim border-accent-violet text-text-primary shadow-sm ring-1 ring-accent-violet/40'
                                  : 'bg-accent-indigo-dim border-accent-indigo text-text-primary shadow-sm ring-1 ring-accent-indigo/40'
                                : 'bg-surface-2 border-border-soft text-text-secondary hover:border-border-default hover:bg-surface-3'
                            }`}
                          >
                            {/* Option Badge */}
                            <motion.div
                              animate={isSelected ? { scale: [0.85, 1.15, 1] } : { scale: 1 }}
                              transition={{ duration: 0.25 }}
                              className={`w-7 h-7 ${
                                isMulti ? 'rounded-lg border' : 'rounded-full'
                              } flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? isMulti
                                    ? 'bg-accent-violet text-text-on-accent shadow-xs'
                                    : 'bg-accent-indigo text-text-on-accent shadow-xs'
                                  : 'bg-surface-3 text-text-tertiary group-hover:bg-surface-4'
                              }`}
                            >
                              {isSelected && isMulti ? <Icon name="check" size="xs" /> : keyLabel}
                            </motion.div>
                            <span className="text-xs font-medium leading-relaxed flex-1">{opt.text}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── WORKSPACE B: LIVE CODING IDE ── */}
                {currentQuestion.questionType === 'CODING' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.25 }}
                    className="space-y-4 pt-1"
                  >
                    <div className="rounded-2xl border border-border-default bg-surface-2 overflow-hidden">
                      <CodeEditorIDE
                        value={currentAnswer.text || ''}
                        onChange={(val) => handleTextAnswerChange(currentQuestion.id, val)}
                        language={currentQuestion.programmingLanguage || 'csharp'}
                        questionType="CODING"
                        defaultTemplate={currentQuestion.codeTemplate || '// Write your C# / TypeScript solution here...'}
                        title="CODE EDITOR"
                      />

                      {/* Integrated Terminal & Test Cases Console */}
                      <div className="border-t border-border-default bg-surface-1 p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <button
                              type="button"
                              onClick={() => setActiveTerminalTab('testcases')}
                              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                                activeTerminalTab === 'testcases'
                                  ? 'bg-accent-indigo text-text-on-accent border-accent-indigo'
                                  : 'bg-surface-2 text-text-secondary border-border-default'
                              }`}
                            >
                              Test Cases (3)
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTerminalTab('console')}
                              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                                activeTerminalTab === 'console'
                                  ? 'bg-accent-indigo text-text-on-accent border-accent-indigo'
                                  : 'bg-surface-2 text-text-secondary border-border-default'
                              }`}
                            >
                              Terminal Output
                            </button>
                          </div>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleRunCodeTest}
                            disabled={simulatedCodeRunning}
                            className="h-8.5 px-4 rounded-xl bg-accent-indigo hover:bg-accent-indigo-hover text-text-on-accent text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-md"
                          >
                            {simulatedCodeRunning ? (
                              <>
                                <Icon name="spinner" size="xs" className="animate-spin" />
                                <span>Executing Test Suite...</span>
                              </>
                            ) : (
                              <>
                                <Icon name="code-2" size="xs" />
                                <span>RUN CODE &amp; VALIDATE</span>
                              </>
                            )}
                          </motion.button>
                        </div>

                        {/* Console View */}
                        {activeTerminalTab === 'console' && (
                          <pre className="p-3.5 rounded-xl bg-canvas border border-border-default text-[11px] font-mono text-accent-cyan whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {codeConsoleOutput || '> Click "Run Code & Validate" to compile and execute test cases.'}
                          </pre>
                        )}

                        {/* Test Case Breakdown */}
                        {activeTerminalTab === 'testcases' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
                            <div className="p-2.5 rounded-xl bg-surface-2 border border-border-soft space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-text-primary font-bold">Case 1: Basic O(1)</span>
                                <span className={`text-[10px] ${codeExecutionPassed ? 'text-status-success-text' : 'text-text-tertiary'}`}>
                                  {codeExecutionPassed ? 'PASSED' : 'READY'}
                                </span>
                              </div>
                              <div className="text-[10px] text-text-tertiary">Put(1,1), Get(1)</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-surface-2 border border-border-soft space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-text-primary font-bold">Case 2: Eviction</span>
                                <span className={`text-[10px] ${codeExecutionPassed ? 'text-status-success-text' : 'text-text-tertiary'}`}>
                                  {codeExecutionPassed ? 'PASSED' : 'READY'}
                                </span>
                              </div>
                              <div className="text-[10px] text-text-tertiary">Capacity Exceeded</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-surface-2 border border-border-soft space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-text-primary font-bold">Case 3: Concurrency</span>
                                <span className={`text-[10px] ${codeExecutionPassed ? 'text-status-success-text' : 'text-text-tertiary'}`}>
                                  {codeExecutionPassed ? 'PASSED' : 'READY'}
                                </span>
                              </div>
                              <div className="text-[10px] text-text-tertiary">Multi-Threaded Ops</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── WORKSPACE C: SQL QUERY ENGINE ── */}
                {currentQuestion.questionType === 'SQL' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.25 }}
                    className="space-y-4 pt-1"
                  >
                    {/* Schema Ribbon */}
                    <div className="flex items-center justify-between bg-surface-2 p-3 rounded-2xl border border-border-default">
                      <span className="text-xs font-mono text-accent-cyan font-bold flex items-center gap-2">
                        <Icon name="file-spreadsheet" size="xs" />
                        <span>Schema: Employees (Id INT, FullName VARCHAR, Salary DECIMAL, DepartmentId INT)</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setShowSchemaModal((prev) => !prev)}
                        className="px-3 py-1 rounded-xl bg-surface-3 hover:bg-surface-4 text-text-primary text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        {showSchemaModal ? 'Hide Schema' : 'View Full DDL'}
                      </button>
                    </div>

                    {showSchemaModal && (
                      <pre className="p-3.5 rounded-2xl bg-surface-2 border border-border-default text-xs font-mono text-accent-cyan whitespace-pre-wrap">
                        {currentQuestion.sqlSchema || `CREATE TABLE Employees (\n    Id INT PRIMARY KEY,\n    FullName VARCHAR(100),\n    Salary DECIMAL(18,2),\n    DepartmentId INT\n);`}
                      </pre>
                    )}

                    <CodeEditorIDE
                      value={currentAnswer.text || ''}
                      onChange={(val) => handleTextAnswerChange(currentQuestion.id, val)}
                      language="sql"
                      questionType="SQL"
                      defaultTemplate="-- Write your SQL query here\nSELECT "
                      title="SQL QUERY RUNNER"
                    />

                    <div className="flex items-center justify-between bg-surface-1 p-3 rounded-2xl border border-border-default">
                      <span className="text-[11px] font-mono text-text-tertiary">Target Engine: T-SQL / SQL Server 2022</span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRunSqlQuery}
                        disabled={sqlRunning}
                        className="h-8.5 px-4 rounded-xl bg-accent-cyan hover:opacity-90 text-text-on-accent text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        {sqlRunning ? (
                          <>
                            <Icon name="spinner" size="xs" className="animate-spin" />
                            <span>Executing Query...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="file-text" size="xs" />
                            <span>RUN SQL QUERY</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    {sqlQueryResult && (
                      <div className="p-4 rounded-2xl bg-surface-2 border border-accent-cyan-dim space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-mono text-status-success-text font-bold">
                          <span>Query Result ({sqlQueryResult.rowCount} rows in {sqlQueryResult.executionTimeMs}ms)</span>
                          <span className="text-accent-cyan">MATCHES EXPECTED CRITERIA ✓</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-border-soft">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-surface-3 text-text-secondary">
                              <tr>
                                {sqlQueryResult.columns.map((c) => (
                                  <th key={c} className="p-2.5 border-b border-border-soft">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-soft bg-surface-2">
                              {sqlQueryResult.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((val, cIdx) => (
                                    <td key={cIdx} className="p-2.5 text-text-primary">{val}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── WORKSPACE D: SUBJECTIVE ESSAY ── */}
                {currentQuestion.questionType === 'SUBJECTIVE' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.25 }}
                    className="space-y-3 pt-1"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-text-tertiary">
                      <span>ARCHITECTURE ANALYSIS &amp; SYSTEM TRADEOFFS</span>
                      <span className="text-accent-indigo">
                        {(currentAnswer.text || '').trim().split(/\s+/).filter(Boolean).length} / {currentQuestion.maxWordCount || 500} Words
                      </span>
                    </div>

                    <textarea
                      rows={12}
                      value={currentAnswer.text || ''}
                      onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Provide your in-depth architectural justification, distributed transaction failure modes, and CQRS / Event Sourcing strategy..."
                      className="w-full p-4 rounded-2xl border border-border-default bg-surface-2 text-xs text-text-primary font-mono focus:border-border-focus focus:outline-none transition-all leading-relaxed"
                    />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Command Navigation Dock */}
            <div className="flex items-center justify-between pt-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  goToQuestion(Math.max(0, activeQuestionIndex - 1));
                }}
                disabled={isFirstQuestionOfSection || activeQuestionIndex === 0}
                className="h-10 px-4.5 rounded-xl border border-border-default bg-surface-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs"
                title={isFirstQuestionOfSection ? 'Cannot navigate back to previously locked section' : 'Previous Question in this Section'}
              >
                <Icon name="chevron-left" size="xs" />
                <span>Previous Question</span>
              </motion.button>

              {isLastQuestionOfSection && nextSection ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (activeSection) {
                      setLockedSectionIds((prev) => new Set(prev).add(activeSection.sectionId));
                    }
                    const firstQOfNext = nextSection.questionIndices[0];
                    if (firstQOfNext !== undefined) goToQuestion(firstQOfNext);
                  }}
                  className="h-10 px-5 rounded-xl border border-border-focus/60 bg-accent-indigo-dim/50 hover:bg-accent-indigo-dim hover:border-accent-indigo text-accent-indigo font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Next Section: {nextSection.shortTitle}</span>
                  <Icon name="arrow-right" size="xs" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (activeQuestionIndex === rawQuestions.length - 1) {
                      setIsSubmissionModalOpen(true);
                    } else {
                      goToQuestion(Math.min(rawQuestions.length - 1, activeQuestionIndex + 1));
                    }
                  }}
                  className={`h-10 px-5 rounded-xl border font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xs ${
                    activeQuestionIndex === rawQuestions.length - 1
                      ? 'border-status-success-border/60 bg-status-success-bg/40 hover:bg-status-success-bg hover:border-status-success text-status-success-text'
                      : 'border-border-focus/60 bg-accent-indigo-dim/50 hover:bg-accent-indigo-dim hover:border-accent-indigo text-accent-indigo'
                  }`}
                >
                  <span>{activeQuestionIndex === rawQuestions.length - 1 ? 'Review & Submit' : 'Next Question'}</span>
                  <Icon name="chevron-right" size="xs" />
                </motion.button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── SECTION TRANSITION DIALOG (30s Countdown or Start Immediately) ── */}
      <AnimatePresence>
        {sectionTransitionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="bg-surface-1 border border-border-default rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Glowing Accent Lightbeam */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-accent-indigo to-transparent" />

              {/* Status Header */}
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-status-success-bg border border-status-success-border text-status-success-text flex items-center justify-center mx-auto shadow-xs">
                  <Icon name="check-circle" size="md" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-text-primary font-heading">
                  Section {sectionTransitionModal.completedSectionId} Concluded
                </h3>
                <p className="text-xs text-text-secondary">
                  Time for <strong>{sectionTransitionModal.completedSectionTitle}</strong> has expired. The section is now locked.
                </p>
              </div>

              {/* Next Round Preview Card */}
              <div className="p-4 rounded-2xl bg-surface-2 border border-border-default space-y-3 text-left">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-tertiary uppercase font-bold">Next Round</span>
                  <span className="px-2 py-0.5 rounded bg-accent-indigo-dim text-accent-indigo font-bold border border-border-default">
                    Section {sectionTransitionModal.nextSectionId}
                  </span>
                </div>
                <div className="text-sm font-bold text-text-primary font-heading">
                  {sectionTransitionModal.nextSectionTitle}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-text-tertiary">
                  <span>Questions: <strong className="text-text-secondary">{sectionTransitionModal.nextSectionQuestionCount}</strong></span>
                  <span>Duration: <strong className="text-text-secondary">{sectionTransitionModal.nextSectionDurationMinutes} mins</strong></span>
                </div>
              </div>

              {/* 30s Countdown Timer Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span>Starting next section in:</span>
                  <strong className="text-accent-cyan font-bold font-mono">
                    00:{sectionTransitionModal.countdownSeconds.toString().padStart(2, '0')}
                  </strong>
                </div>
                <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent-cyan rounded-full"
                    initial={false}
                    animate={{ width: `${(sectionTransitionModal.countdownSeconds / 30) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSectionTransitionModal(null)}
                  className="w-full h-11 rounded-xl border border-border-focus/60 bg-accent-indigo-dim/50 hover:bg-accent-indigo-dim hover:border-accent-indigo text-accent-indigo font-semibold text-xs transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start {sectionTransitionModal.nextSectionTitle} Immediately</span>
                  <Icon name="arrow-right" size="xs" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FULL SCREEN REQUIRED / AUTO RE-ENTRY MODAL ── */}
      {fullscreenReentrySeconds !== null && !isFullscreen && examStep === 'active' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center font-bold text-2xl animate-pulse">
              <Icon name="alert-triangle" size="md" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-black text-[var(--text-primary)] font-heading">
                Full Screen Required
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                This proctored assessment must remain in full screen. Returning to full screen mode automatically in{' '}
                <span className="font-mono font-bold text-rose-500 text-sm">{fullscreenReentrySeconds}s</span>.
              </p>
            </div>

            {/* 2-Second Countdown Progress Indicator */}
            <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(fullscreenReentrySeconds / 2) * 100}%` }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                document.documentElement.requestFullscreen?.()
                  .then(() => {
                    setIsFullscreen(true);
                    setFullscreenReentrySeconds(null);
                  })
                  .catch(() => {});
              }}
              className="w-full h-11 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/90 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-1"
            >
              <span>Return to Full Screen Immediately</span>
              <span className="text-[10px] font-mono opacity-80">({fullscreenReentrySeconds}s)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      <ExamSubmissionModal
        isOpen={isSubmissionModalOpen}
        isSubmitting={isSubmittingExam}
        totalQuestions={rawQuestions.length}
        answeredCount={answeredCount}
        onConfirm={() => handleFinalSubmit('Candidate confirmed assessment submission')}
        onCancel={() => setIsSubmissionModalOpen(false)}
      />
    </div>
  );
};

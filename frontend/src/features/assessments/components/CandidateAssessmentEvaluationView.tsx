'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';

export interface EvaluatedQuestionItem {
  id: string;
  questionNumber: number;
  roundName: 'Round 1: MCQs' | 'Round 2: Coding Challenges' | 'Round 3: SQL Queries' | 'Round 4: Subjective Essays';
  sectionTitle: string;
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';
  category: string;
  questionText: string;
  maxMarks: number;
  isAutoEvaluated: boolean; // true for MCQs, false for Coding/SQL/Subjective
  obtainedMarks: number;
  evaluatorNotes: string;
  options?: { label: string; text: string; isCorrect: boolean; isSelected: boolean }[];
  candidateAnswerText?: string;
  testCasesPassed?: number;
  totalTestCases?: number;
}

export interface AssessmentEvaluationAttempt {
  attemptNumber: number;
  attemptDate: string;
  paperTitle: string;
  passingPercentage: number;
  durationMinutes: number;
  timeUsedMinutes: number;
  tabSwitchViolations: number;
  windowBlurViolations: number;
  penaltyDeduction: number;
  evaluatorRemarks: string;
  questions: EvaluatedQuestionItem[];
}

export interface CandidateAssessmentEvaluationViewProps {
  candidateId?: string;
  candidateName?: string;
  candidateCode?: string;
  vacancyTitle?: string;
  attempts?: AssessmentEvaluationAttempt[];
  onBack?: () => void;
  onClose?: () => void;
  onFinalizeScore?: (finalScore: number, finalPercentage: number, status: 'Passed' | 'Failed') => void;
}

export const DEFAULT_EVALUATION_ATTEMPTS: AssessmentEvaluationAttempt[] = [
  {
    attemptNumber: 1,
    attemptDate: '15 May 2025 • 10:30 AM',
    paperTitle: 'Advanced React 19 & Next.js Enterprise Assessment',
    passingPercentage: 70,
    durationMinutes: 60,
    timeUsedMinutes: 48,
    tabSwitchViolations: 2,
    windowBlurViolations: 1,
    penaltyDeduction: 5,
    evaluatorRemarks: 'Strong technical fundamentals in React and Data Structures. Minor penalty applied for 2 tab switches.',
    questions: [
      // ── ROUND 1: MCQs (Auto-Evaluated) ───────────────────────────────────
      {
        id: 'r1-q1',
        questionNumber: 1,
        roundName: 'Round 1: MCQs',
        sectionTitle: 'MCQ (Single Choice)',
        questionType: 'SINGLE_CHOICE',
        category: 'Next.js 16 App Router',
        questionText: 'Which React directive is required at the top of a file to declare client-side interactivity in Next.js 16?',
        maxMarks: 5,
        isAutoEvaluated: true,
        obtainedMarks: 5,
        evaluatorNotes: 'Auto-Evaluated by System: Correct Option B selected.',
        options: [
          { label: 'A', text: "'use server'", isCorrect: false, isSelected: false },
          { label: 'B', text: "'use client'", isCorrect: true, isSelected: true },
          { label: 'C', text: "'use interactive'", isCorrect: false, isSelected: false },
          { label: 'D', text: "'use react'", isCorrect: false, isSelected: false },
        ],
      },
      {
        id: 'r1-q2',
        questionNumber: 2,
        roundName: 'Round 1: MCQs',
        sectionTitle: 'MCQ (Single Choice)',
        questionType: 'SINGLE_CHOICE',
        category: 'React 19 Hooks',
        questionText: 'What is the primary benefit of the new React 19 useActionState hook?',
        maxMarks: 5,
        isAutoEvaluated: true,
        obtainedMarks: 5,
        evaluatorNotes: 'Auto-Evaluated by System: Correct Option B selected.',
        options: [
          { label: 'A', text: 'Direct DOM node manipulation without refs', isCorrect: false, isSelected: false },
          { label: 'B', text: 'Managing pending state, optimistic updates, and form response data in server actions', isCorrect: true, isSelected: true },
          { label: 'C', text: 'Automatic Redux store synchronization', isCorrect: false, isSelected: false },
          { label: 'D', text: 'Replacing all useEffect calls in application code', isCorrect: false, isSelected: false },
        ],
      },
      {
        id: 'r1-q3',
        questionNumber: 3,
        roundName: 'Round 1: MCQs',
        sectionTitle: 'MCQ (Multi Choice)',
        questionType: 'MULTI_CHOICE',
        category: 'TypeScript Enterprise',
        questionText: 'Which TypeScript utility types construct a type with optional or required properties?',
        maxMarks: 5,
        isAutoEvaluated: true,
        obtainedMarks: 0,
        evaluatorNotes: 'Auto-Evaluated by System: Incorrect Option A selected.',
        options: [
          { label: 'A', text: 'Required<T>', isCorrect: false, isSelected: true },
          { label: 'B', text: 'Partial<T>', isCorrect: true, isSelected: false },
          { label: 'C', text: 'Readonly<T>', isCorrect: false, isSelected: false },
          { label: 'D', text: 'Record<K, T>', isCorrect: false, isSelected: false },
        ],
      },

      // ── ROUND 2: Coding Challenges (Manual Evaluation) ───────────────────
      {
        id: 'r2-q4',
        questionNumber: 4,
        roundName: 'Round 2: Coding Challenges',
        sectionTitle: 'Coding & Algorithm Challenge',
        questionType: 'CODING',
        category: 'Data Structures & Algorithms',
        questionText: 'Implement an LRU (Least Recently Used) Cache class with get(key) and put(key, value) operations in O(1) time complexity.',
        maxMarks: 25,
        isAutoEvaluated: false,
        obtainedMarks: 25,
        testCasesPassed: 5,
        totalTestCases: 5,
        candidateAnswerText: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
        evaluatorNotes: 'Optimal O(1) time complexity implementation using JavaScript Map insertion-order guarantee. All 5 test cases passed cleanly.',
      },

      // ── ROUND 3: SQL Queries (Manual Evaluation) ──────────────────────────
      {
        id: 'r3-q5',
        questionNumber: 5,
        roundName: 'Round 3: SQL Queries',
        sectionTitle: 'SQL & Database Queries',
        questionType: 'SQL',
        category: 'SQL Server 2022',
        questionText: 'Write a SQL query to calculate 30-day rolling candidate hire conversion counts partitioned by hiring location.',
        maxMarks: 20,
        isAutoEvaluated: false,
        obtainedMarks: 20,
        testCasesPassed: 3,
        totalTestCases: 3,
        candidateAnswerText: `SELECT 
    HiringLocationId,
    AppliedDate,
    COUNT(Id) OVER (
        PARTITION BY HiringLocationId 
        ORDER BY AppliedDate 
        RANGE BETWEEN INTERVAL '30' DAY PRECEDING AND CURRENT ROW
    ) AS RollingHires
FROM Candidates
WHERE Status = 'Joined'
ORDER BY HiringLocationId, AppliedDate;`,
        evaluatorNotes: 'Correct usage of SQL window functions with OVER partition clause. Evaluated and approved.',
      },

      // ── ROUND 4: Subjective Essays (Manual Evaluation) ───────────────────
      {
        id: 'r4-q6',
        questionNumber: 6,
        roundName: 'Round 4: Subjective Essays',
        sectionTitle: 'Subjective & System Architecture',
        questionType: 'SUBJECTIVE',
        category: 'Enterprise Security Architecture',
        questionText: 'Describe how you would design a multi-tenant proctoring engine with tab switch detection and anti-cheating token locks.',
        maxMarks: 20,
        isAutoEvaluated: false,
        obtainedMarks: 18,
        candidateAnswerText: `To implement anti-cheating proctoring:
1. Visibility API (document.visibilityState) & Window Blur listener to flag tab switching.
2. BroadcastChannel API ('STEP_EXAM_SESSION_CHANNEL') to enforce single active session across tabs.
3. Redis token lock & WebSocket heartbeat pings every 15s to detect concurrent device logins.
4. Auto-submission trigger upon 3 cumulative security warnings.`,
        evaluatorNotes: 'Well-articulated architectural strategy covering both client-side API listeners and server-side token locks. Awarded 18/20 marks.',
      },
    ],
  },
  {
    attemptNumber: 2,
    attemptDate: '18 May 2025 • 02:15 PM',
    paperTitle: 'Advanced React 19 & Next.js Enterprise Assessment (Retake)',
    passingPercentage: 70,
    durationMinutes: 60,
    timeUsedMinutes: 42,
    tabSwitchViolations: 0,
    windowBlurViolations: 0,
    penaltyDeduction: 0,
    evaluatorRemarks: 'Flawless retake attempt with zero proctoring violations.',
    questions: [
      {
        id: 'retake-q1',
        questionNumber: 1,
        roundName: 'Round 1: MCQs',
        sectionTitle: 'MCQ (Single Choice)',
        questionType: 'SINGLE_CHOICE',
        category: 'Next.js 16 App Router',
        questionText: 'Which React directive is required at the top of a file to declare client-side interactivity in Next.js 16?',
        maxMarks: 5,
        isAutoEvaluated: true,
        obtainedMarks: 5,
        evaluatorNotes: 'Auto-Evaluated: Correct Option B selected.',
        options: [
          { label: 'A', text: "'use server'", isCorrect: false, isSelected: false },
          { label: 'B', text: "'use client'", isCorrect: true, isSelected: true },
          { label: 'C', text: "'use interactive'", isCorrect: false, isSelected: false },
          { label: 'D', text: "'use react'", isCorrect: false, isSelected: false },
        ],
      },
      {
        id: 'retake-q2',
        questionNumber: 2,
        roundName: 'Round 2: Coding Challenges',
        sectionTitle: 'Coding & Algorithm Challenge',
        questionType: 'CODING',
        category: 'Data Structures & Algorithms',
        questionText: 'Implement an LRU Cache with O(1) Operations.',
        maxMarks: 25,
        isAutoEvaluated: false,
        obtainedMarks: 25,
        testCasesPassed: 5,
        totalTestCases: 5,
        candidateAnswerText: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value);
    this.map.set(key, value);
  }
}`,
        evaluatorNotes: 'Retake evaluation clean. Max score 25/25.',
      },
    ],
  },
];

export const CandidateAssessmentEvaluationView: React.FC<CandidateAssessmentEvaluationViewProps> = ({
  candidateId = '1',
  candidateName = 'Candidate',
  candidateCode = 'CND-2026',
  vacancyTitle = 'Assessment Evaluation',
  attempts = [],
  onBack,
  onClose,
  onFinalizeScore,
}) => {
  const router = useRouter();

  // ── Active Attempt State ───────────────────────────────────────────────────
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState(0);
  const activeAttempt = attempts[selectedAttemptIdx] || attempts[0];

  // ── Dynamic Evaluation Questions & Scores State ────────────────────────────
  const [questions, setQuestions] = useState<EvaluatedQuestionItem[]>(activeAttempt.questions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(activeAttempt.questions[0]?.id || '');
  const [penaltyDeduction, setPenaltyDeduction] = useState<number>(activeAttempt.penaltyDeduction);

  // Switch Attempt
  const handleSelectAttempt = (idx: number) => {
    setSelectedAttemptIdx(idx);
    const targetAttempt = attempts[idx] || attempts[0];
    setQuestions(targetAttempt.questions);
    setSelectedQuestionId(targetAttempt.questions[0]?.id || '');
    setPenaltyDeduction(targetAttempt.penaltyDeduction);
  };

  // Currently Selected Question
  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) || questions[0],
    [questions, selectedQuestionId]
  );

  // Group Questions Round-Wise
  const roundGroups = useMemo(() => {
    const map: Record<string, EvaluatedQuestionItem[]> = {};
    questions.forEach((q) => {
      if (!map[q.roundName]) map[q.roundName] = [];
      map[q.roundName].push(q);
    });
    return map;
  }, [questions]);

  // Calculated Aggregate Scores
  const maxPossibleMarks = useMemo(() => questions.reduce((acc, q) => acc + q.maxMarks, 0), [questions]);
  const autoMcqScore = useMemo(
    () => questions.filter((q) => q.isAutoEvaluated).reduce((acc, q) => acc + q.obtainedMarks, 0),
    [questions]
  );
  const manualNonMcqScore = useMemo(
    () => questions.filter((q) => !q.isAutoEvaluated).reduce((acc, q) => acc + (q.obtainedMarks || 0), 0),
    [questions]
  );
  const grossScore = autoMcqScore + manualNonMcqScore;
  const finalCalculatedScore = Math.max(0, grossScore - penaltyDeduction);
  const finalPercentage = maxPossibleMarks > 0 ? Math.round((finalCalculatedScore / maxPossibleMarks) * 100) : 0;
  const isPassed = finalPercentage >= activeAttempt.passingPercentage;

  // Handle Manual Marks Input Update for non-MCQ
  const handleUpdateMarks = (qId: string, valStr: string) => {
    const marks = Math.min(selectedQuestion.maxMarks, Math.max(0, Number(valStr) || 0));
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, obtainedMarks: marks } : q))
    );
  };

  // Handle Evaluator Notes Input Update
  const handleUpdateNotes = (qId: string, notes: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, evaluatorNotes: notes } : q))
    );
  };

  // Finalize & Save Evaluation Action
  const handleFinalizeEvaluation = () => {
    toast.success('Assessment Evaluation Finalized', {
      description: `Final Score: ${finalCalculatedScore}/${maxPossibleMarks} (${finalPercentage}% - ${isPassed ? 'Passed' : 'Failed'}). Scorecard saved.`,
    });
    if (onFinalizeScore) {
      onFinalizeScore(finalCalculatedScore, finalPercentage, isPassed ? 'Passed' : 'Failed');
    }
  };

  const handleBackClick = () => {
    if (onClose) {
      onClose();
    } else if (onBack) {
      onBack();
    } else {
      router.push(`/dashboard/candidates/${candidateId}`);
    }
  };

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

        {/* Attempt Selection Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 px-2 hidden md:inline">Attempts:</span>
          {attempts.map((att, idx) => {
            const isActive = idx === selectedAttemptIdx;
            return (
              <button
                key={att.attemptNumber}
                type="button"
                onClick={() => handleSelectAttempt(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>Attempt #{att.attemptNumber}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  {att.attemptDate.split('•')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── 2. 2-COLUMN SPLIT MAIN PAGE BODY ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT SIDEBAR (Round-Wise Square Button Palette & Penalty Input) ── */}
        <aside className="w-80 sm:w-96 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 scrollbar-thin">
          
          {/* Proctoring Audit Log Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Icon name="calendar" size="xs" className="text-blue-600" />
                <span>Test Duration & Time Used</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {activeAttempt.timeUsedMinutes} / {activeAttempt.durationMinutes} Mins
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono border-t border-slate-200 pt-2">
              <div className="flex flex-col">
                <span className="text-slate-500">Tab Switches</span>
                <span className={`font-bold ${activeAttempt.tabSwitchViolations > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {activeAttempt.tabSwitchViolations} Violations
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Window Blurs</span>
                <span className="font-bold text-slate-700">
                  {activeAttempt.windowBlurViolations} Blurs
                </span>
              </div>
            </div>

            {/* Violation Penalty Reduction Input */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
              <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                <Icon name="alert-triangle" size="xs" className="text-rose-600" />
                <span>Security Penalty Marks:</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-rose-600">-</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={penaltyDeduction}
                  onChange={(e) => setPenaltyDeduction(Math.max(0, Number(e.target.value) || 0))}
                  className="w-14 h-7 px-2 text-center rounded-lg bg-white border border-rose-300 text-rose-800 font-mono text-xs font-bold outline-none focus:border-rose-500 shadow-2xs"
                />
                <span className="text-[10.5px] font-mono text-slate-500">Pts</span>
              </div>
            </div>
          </div>

          {/* Round-Wise Question Palette (SQUARE TILES SHOWING NUMBERS ONLY) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-extrabold text-slate-500 font-heading uppercase tracking-wider">
              Round Question Palette
            </h4>

            {Object.entries(roundGroups).map(([roundName, qList]) => (
              <div key={roundName} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200 pb-1">
                  <span>{roundName}</span>
                  <span className="text-[10px] font-mono text-blue-700">
                    {qList.some((q) => q.isAutoEvaluated) ? 'Auto MCQ' : 'Manual Grade'}
                  </span>
                </div>

                {/* Grid of Square Tiles showing Numbers ONLY */}
                <div className="grid grid-cols-5 gap-2">
                  {qList.map((q) => {
                    const isSelected = q.id === selectedQuestionId;
                    const isCorrect = q.isAutoEvaluated && q.obtainedMarks > 0;
                    const isIncorrect = q.isAutoEvaluated && q.obtainedMarks === 0;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuestionId(q.id)}
                        className={`w-10 h-10 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-md scale-105 z-10 font-bold'
                            : isCorrect
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-bold'
                            : isIncorrect
                            ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-bold'
                            : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 font-bold'
                        }`}
                      >
                        <span>{q.questionNumber}</span>
                        <span className="text-[9px] font-mono opacity-80 leading-none">
                          {q.obtainedMarks}/{q.maxMarks}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Final Score Summary & Finalize Action Card */}
          <div className="mt-auto p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 shadow-2xs">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-500">Calculated Evaluation Score</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-emerald-600">
                  {finalCalculatedScore} / {maxPossibleMarks}
                </span>
                <span className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full ${isPassed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                  {finalPercentage}% ({isPassed ? 'Passed' : 'Failed'})
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                MCQ Auto: {autoMcqScore} + Manual: {manualNonMcqScore} - Penalty: {penaltyDeduction}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinalizeEvaluation}
              className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Icon name="check-circle" size="xs" />
              <span>Finalize Score & Submit Evaluation</span>
            </button>
          </div>
        </aside>

        {/* ── RIGHT MAIN PANEL (Selected Question Viewer & Manual Evaluation Form) ── */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 scrollbar-thin bg-white">
          
          {/* Selected Question Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-extrabold border border-blue-200">
                  Question #{selectedQuestion.questionNumber}
                </span>
                <span className="text-xs font-extrabold font-heading text-slate-800">
                  {selectedQuestion.roundName}
                </span>
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {selectedQuestion.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading mt-1 leading-relaxed">
                {selectedQuestion.questionText}
              </h3>
            </div>

            <div className="flex flex-col items-end shrink-0 font-mono">
              <span className="text-sm font-extrabold text-emerald-700">
                {selectedQuestion.obtainedMarks} / {selectedQuestion.maxMarks} Marks
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded mt-0.5 ${selectedQuestion.isAutoEvaluated ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {selectedQuestion.isAutoEvaluated ? 'Auto-Evaluated' : 'Manual Evaluation Required'}
              </span>
            </div>
          </div>

          {/* ── MCQs: Auto-Evaluated Choice Viewer ──────────────────────────── */}
          {selectedQuestion.isAutoEvaluated && selectedQuestion.options && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Icon name="check-circle" size="xs" className="shrink-0 text-emerald-600" />
                <span>Auto-Evaluated by System Engine. Correct options are scored automatically.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                {selectedQuestion.options.map((opt) => (
                  <div
                    key={opt.label}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      opt.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                        : opt.isSelected && !opt.isCorrect
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
                    {opt.isSelected && !opt.isCorrect && (
                      <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                        Candidate Choice
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NON-MCQs: Submitted Code / SQL / Essay Viewer ────────────────── */}
          {!selectedQuestion.isAutoEvaluated && selectedQuestion.candidateAnswerText && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span>Candidate Submitted {selectedQuestion.questionType} Solution:</span>
                {selectedQuestion.testCasesPassed !== undefined && (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✔ {selectedQuestion.testCasesPassed} / {selectedQuestion.totalTestCases} Test Cases Passed
                  </span>
                )}
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto scrollbar-thin max-h-80 shadow-2xs">
                <code>{selectedQuestion.candidateAnswerText}</code>
              </pre>
            </div>
          )}

          {/* ── MANUAL EVALUATION FORM PANEL (For Non-MCQ Questions) ─────────── */}
          {!selectedQuestion.isAutoEvaluated && (
            <div className="mt-auto p-5 rounded-xl bg-white border border-slate-200 flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-amber-700 font-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="pencil" size="xs" />
                  <span>Manual Evaluation & Marks Input</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Max Allowed: {selectedQuestion.maxMarks} Marks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Awarded Marks</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={selectedQuestion.maxMarks}
                      value={selectedQuestion.obtainedMarks}
                      onChange={(e) => handleUpdateMarks(selectedQuestion.id, e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm font-extrabold outline-none focus:border-blue-500 shadow-2xs"
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold">/ {selectedQuestion.maxMarks}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Evaluator Feedback & Remarks</label>
                  <textarea
                    value={selectedQuestion.evaluatorNotes}
                    onChange={(e) => handleUpdateNotes(selectedQuestion.id, e.target.value)}
                    placeholder="Enter manual evaluation feedback notes for this candidate response..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 outline-none focus:border-blue-500 scrollbar-thin leading-relaxed shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

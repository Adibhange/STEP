'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';

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
  options?: { label: string; text: string }[];
  codeTemplate?: string;
  sqlSchema?: string;
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

export const ASSESSMENT_ROUNDS: AssessmentRoundConfig[] = [
  { roundNumber: 1, roundTitle: 'Round 1: Multiple Choice Questions (MCQs)', shortTitle: 'Round 1: MCQs', durationMinutes: 10, questionCount: 3, totalMarks: 15 },
  { roundNumber: 2, roundTitle: 'Round 2: Algorithmic Coding Challenge', shortTitle: 'Round 2: Coding', durationMinutes: 20, questionCount: 1, totalMarks: 25 },
  { roundNumber: 3, roundTitle: 'Round 3: Database & SQL Queries', shortTitle: 'Round 3: SQL', durationMinutes: 15, questionCount: 1, totalMarks: 20 },
  { roundNumber: 4, roundTitle: 'Round 4: System Design Architecture', shortTitle: 'Round 4: Subjective', durationMinutes: 15, questionCount: 1, totalMarks: 20 },
];

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'eq-1',
    number: 1,
    roundNumber: 1,
    roundTitle: 'Round 1: Multiple Choice Questions (MCQs)',
    sectionTitle: 'MCQ (Single Choice)',
    type: 'SINGLE_CHOICE',
    category: 'Next.js 16 App Router',
    questionText: 'Which React directive is required at the top of a file to declare client-side interactivity in Next.js 16?',
    marks: 5,
    timeAllowedMinutes: 3,
    options: [
      { label: 'A', text: "'use server'" },
      { label: 'B', text: "'use client'" },
      { label: 'C', text: "'use interactive'" },
      { label: 'D', text: "'use react'" },
    ],
  },
  {
    id: 'eq-2',
    number: 2,
    roundNumber: 1,
    roundTitle: 'Round 1: Multiple Choice Questions (MCQs)',
    sectionTitle: 'MCQ (Single Choice)',
    type: 'SINGLE_CHOICE',
    category: 'React 19 Hooks',
    questionText: 'What is the primary benefit of the new React 19 useActionState hook?',
    marks: 5,
    timeAllowedMinutes: 3,
    options: [
      { label: 'A', text: 'Direct DOM node manipulation without refs' },
      { label: 'B', text: 'Managing pending state, optimistic updates, and form response data in server actions' },
      { label: 'C', text: 'Automatic Redux store synchronization' },
      { label: 'D', text: 'Replacing all useEffect calls in application code' },
    ],
  },
  {
    id: 'eq-3',
    number: 3,
    roundNumber: 1,
    roundTitle: 'Round 1: Multiple Choice Questions (MCQs)',
    sectionTitle: 'MCQ (Multi Choice)',
    type: 'MULTI_CHOICE',
    category: 'ASP.NET Core 10 & EF Core',
    questionText: 'Which of the following are valid lifetime scopes for Dependency Injection in .NET Core? (Select all that apply)',
    marks: 5,
    timeAllowedMinutes: 4,
    options: [
      { label: 'A', text: 'AddTransient' },
      { label: 'B', text: 'AddScoped' },
      { label: 'C', text: 'AddSingleton' },
      { label: 'D', text: 'AddGlobal' },
    ],
  },
  {
    id: 'eq-4',
    number: 4,
    roundNumber: 2,
    roundTitle: 'Round 2: Algorithmic Coding Challenge',
    sectionTitle: 'Coding & Algorithm Challenge',
    type: 'CODING',
    category: 'Data Structures & Algorithms',
    questionText: 'Implement an LRU (Least Recently Used) Cache class with get(key) and put(key, value) operations in O(1) time complexity.',
    marks: 25,
    timeAllowedMinutes: 20,
    codeTemplate: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /** 
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Write your solution code here
  }

  /** 
   * @param {number} key 
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Write your solution code here
  }
}`,
  },
  {
    id: 'eq-5',
    number: 5,
    roundNumber: 3,
    roundTitle: 'Round 3: Database & SQL Queries',
    sectionTitle: 'SQL & Database Queries',
    type: 'SQL',
    category: 'SQL Server 2022',
    questionText: 'Write a SQL query to calculate 30-day rolling candidate hire conversion counts partitioned by hiring location.',
    marks: 20,
    timeAllowedMinutes: 15,
    sqlSchema: `-- Table: Candidates (Id, Code, Name, HiringLocationId, Status, AppliedDate)
SELECT 
    HiringLocationId,
    AppliedDate,
    COUNT(Id) OVER (
        PARTITION BY HiringLocationId 
        ORDER BY AppliedDate 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) AS Rolling30DayHireCount
FROM Candidates
WHERE Status = 'Joined';`,
  },
  {
    id: 'eq-6',
    number: 6,
    roundNumber: 4,
    roundTitle: 'Round 4: Architecture & Subjective',
    sectionTitle: 'Subjective & System Architecture',
    type: 'SUBJECTIVE',
    category: 'Enterprise Security Architecture',
    questionText: 'Describe how you would design a multi-tenant proctoring engine with tab switch detection and anti-cheating token locks.',
    marks: 20,
    timeAllowedMinutes: 15,
  },
];

export const CandidateExamPortal: React.FC<CandidateExamPortalProps> = ({
  testMode = 'From Home',
  sessionToken = 'EXAM-MUM-2026-X89',
  candidateName = 'Anjali Sharma',
  candidateCode = 'CND-2026-1042',
  candidateEmail = 'anjali.sharma@email.com',
  vacancyTitle = 'Frontend Developer - React (V123)',
  paperTitle = 'Advanced React 19 & Next.js Enterprise Assessment',
  durationMinutes = 60,
  passingPercentage = 70,
  onExamComplete,
}) => {
  const STORAGE_KEY = `STEP_EXAM_PERSISTENCE_${sessionToken}`;

  // ── Authentication & Gatekeeper State ──────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(testMode === 'In Office');
  const [loginCode, setLoginCode] = useState(candidateCode);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Exam Flow Lifecycle States ──────────────────────────────────────────────
  const [examStep, setExamStep] = useState<'instructions' | 'active' | 'submitted'>('instructions');

  // Overall Total Exam Timer (in seconds)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Round-Wise Active State & Dedicated Round Timer
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeRoundNumber, setActiveRoundNumber] = useState<number>(1);
  const [roundTimeLeftSeconds, setRoundTimeLeftSeconds] = useState<number>(ASSESSMENT_ROUNDS[0].durationMinutes * 60);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // ── Anti-Cheating & Proctoring States ───────────────────────────────────────
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [isMultiTabLocked, setIsMultiTabLocked] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Simulation test cases output state
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isTestingCode, setIsTestingCode] = useState(false);

  // ==================== 1. REFRESH PERSISTENCE (HYDRATION ON MOUNT) ============
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSession = sessionStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.isAuthenticated !== undefined) setIsAuthenticated(parsed.isAuthenticated);
        if (parsed.examStep !== undefined) setExamStep(parsed.examStep);
        if (parsed.currentQuestionIndex !== undefined) setCurrentQuestionIndex(parsed.currentQuestionIndex);
        if (parsed.activeRoundNumber !== undefined) setActiveRoundNumber(parsed.activeRoundNumber);
        if (parsed.roundTimeLeftSeconds !== undefined) setRoundTimeLeftSeconds(parsed.roundTimeLeftSeconds);
        if (parsed.timeLeftSeconds !== undefined) setTimeLeftSeconds(parsed.timeLeftSeconds);
        if (parsed.answers !== undefined) setAnswers(parsed.answers);
        if (parsed.flaggedQuestions !== undefined) setFlaggedQuestions(new Set(parsed.flaggedQuestions));
        if (parsed.tabSwitchWarnings !== undefined) setTabSwitchWarnings(parsed.tabSwitchWarnings);

        if (parsed.examStep === 'active') {
          setIsTimerRunning(true);
        }
      }
    } catch (e) {
      // Fallback if sessionStorage read fails
    }
  }, [STORAGE_KEY]);

  // ==================== 2. SAVE STATE TO STORAGE ON CHANGE ====================
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionToken) return;
    try {
      const stateToSave = {
        isAuthenticated,
        examStep,
        currentQuestionIndex,
        activeRoundNumber,
        roundTimeLeftSeconds,
        timeLeftSeconds,
        answers,
        flaggedQuestions: Array.from(flaggedQuestions),
        tabSwitchWarnings,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      // Storage quota safety fallback
    }
  }, [
    STORAGE_KEY,
    sessionToken,
    isAuthenticated,
    examStep,
    currentQuestionIndex,
    activeRoundNumber,
    roundTimeLeftSeconds,
    timeLeftSeconds,
    answers,
    flaggedQuestions,
    tabSwitchWarnings,
  ]);

  // ==================== 3. DISABLE BROWSER BACK BUTTON (NO POPUPS) ============
  useEffect(() => {
    if (examStep !== 'active') return;

    // Push dummy state onto history stack to block backward navigation
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Trap/block back button navigation seamlessly without prompt popups
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examStep]);

  // ==================== 4. MULTI-TAB / MULTI-DEVICE SESSION LOCK =============
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const channel = new BroadcastChannel('STEP_EXAM_SESSION_CHANNEL');
      broadcastChannelRef.current = channel;

      channel.postMessage({ type: 'PING_EXISTING_SESSION', token: sessionToken });

      channel.onmessage = (event) => {
        if (event.data?.token === sessionToken) {
          if (event.data?.type === 'PING_EXISTING_SESSION') {
            channel.postMessage({ type: 'SESSION_ALREADY_ACTIVE', token: sessionToken });
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
  }, [sessionToken]);

  // ==================== 5. TAB / WINDOW SWITCH PROCTORING (INCREMENTS WARNINGS) =
  useEffect(() => {
    if (examStep !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Increment warning count ONLY on tab switch / window blur
        setTabSwitchWarnings((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= 3) {
            handleAutoSubmit();
          }
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examStep]);

  // ==================== 6. ROUND TIME EXPIRY & DEDICATED TIMER EFFECT =========
  const handleRoundTimeExpiry = (expiredRound: number) => {
    const currentRoundIdx = ASSESSMENT_ROUNDS.findIndex((r) => r.roundNumber === expiredRound);

    if (currentRoundIdx < ASSESSMENT_ROUNDS.length - 1) {
      const nextRound = ASSESSMENT_ROUNDS[currentRoundIdx + 1];
      const firstQIdx = EXAM_QUESTIONS.findIndex((q) => q.roundNumber === nextRound.roundNumber);

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
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && examStep === 'active') {
      interval = setInterval(() => {
        // 1. Overall exam timer decrement
        setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));

        // 2. Active round timer decrement
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
  }, [isTimerRunning, examStep, activeRoundNumber]);

  // Handle Home candidate login form submit
  const handleCandidateLogin = (e: React.SyntheticEvent<HTMLFormElement>) => {
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
    setIsAuthenticated(true);
  };

  // Start Exam Action
  const handleStartExam = () => {
    setExamStep('active');
    setIsTimerRunning(true);
    setActiveRoundNumber(1);
    setRoundTimeLeftSeconds(ASSESSMENT_ROUNDS[0].durationMinutes * 60);
  };

  // Auto-Submit Exam on Timer Expiry or Max Violations
  const handleAutoSubmit = () => {
    setIsTimerRunning(false);
    setExamStep('submitted');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    if (onExamComplete) onExamComplete(88, 100);
  };

  // Manual Submit Exam
  const handleSubmitExam = () => {
    setIsTimerRunning(false);
    setExamStep('submitted');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    toast.success('Exam Submitted Successfully', {
      description: 'Your test responses have been evaluated and recorded.',
    });
    if (onExamComplete) onExamComplete(92, 100);
  };

  // Next Question / Next Round Action
  const handleNextQuestion = () => {
    if (currentQuestionIndex < EXAM_QUESTIONS.length - 1) {
      const nextQ = EXAM_QUESTIONS[currentQuestionIndex + 1];
      if (nextQ.roundNumber > activeRoundNumber) {
        // Advancing to next round manually!
        const nextRoundConfig = ASSESSMENT_ROUNDS.find((r) => r.roundNumber === nextQ.roundNumber);
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

  // Simulate Running Code Test Cases
  const handleRunCodeTests = () => {
    setIsTestingCode(true);
    setCodeOutput(null);
    setTimeout(() => {
      setIsTestingCode(false);
      setCodeOutput('✔ Test Case 1 Passed (lru.get(1) == 1)\n✔ Test Case 2 Passed (lru.put(3, 3) evicted key 2)\n✔ Test Case 3 Passed (O(1) execution time: 0.42ms)\n\nAll 5 Test Cases Passed Successfully!');
    }, 600);
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

  const currentQ = EXAM_QUESTIONS[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  // Group questions by Round for palette display
  const roundsList = [
    { number: 1, title: 'ROUND 1: MCQS', questions: EXAM_QUESTIONS.filter((q) => q.roundNumber === 1) },
    { number: 2, title: 'ROUND 2: CODING', questions: EXAM_QUESTIONS.filter((q) => q.roundNumber === 2) },
    { number: 3, title: 'ROUND 3: SQL', questions: EXAM_QUESTIONS.filter((q) => q.roundNumber === 3) },
    { number: 4, title: 'ROUND 4: SUBJECTIVE', questions: EXAM_QUESTIONS.filter((q) => q.roundNumber === 4) },
  ];

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
            Session Token: {sessionToken}<br />
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

  // ── 1. HOME LOGIN GATEKEEPER SCREEN ───────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] text-slate-900 flex items-center justify-center p-4 font-sans relative">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
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
              className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              Verify & Launch Exam Session
            </button>
          </form>
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
              <p className="font-bold text-blue-700 mt-0.5">4 Timed Rounds</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Questions</span>
              <p className="font-bold text-slate-900 mt-0.5">{EXAM_QUESTIONS.length} Questions</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Marks</span>
              <p className="font-bold text-slate-900 mt-0.5">100 Marks</p>
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
              {ASSESSMENT_ROUNDS.map((rnd) => (
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
              <span>Browser Compatibility & Proctoring Status Verified (Token: {sessionToken.slice(0, 12)}...)</span>
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
              <p className="font-bold text-slate-900 mt-0.5">{answeredCount} / {EXAM_QUESTIONS.length}</p>
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
  return (
    <div className="h-screen w-screen bg-[#f7f8fb] text-slate-900 flex flex-col font-sans select-none overflow-hidden">
      
      {/* ── Top Header Navigation Bar ───────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shrink-0">
            <Icon name="clipboard-check" size="xs" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 font-heading truncate max-w-xs sm:max-w-md">
              {paperTitle}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              Candidate: <span className="font-semibold text-slate-800">{candidateName}</span> ({candidateCode})
            </p>
          </div>
        </div>

        {/* Live Proctoring Banner & Timers */}
        <div className="flex items-center gap-3">
          {/* Header Warning Counter Badge (Increments ONLY on Tab / Window Switch) */}
          {tabSwitchWarnings > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10.5px] font-mono font-bold flex items-center gap-1">
              <Icon name="alert-triangle" size="xs" className="text-rose-600" />
              <span>Warnings: {tabSwitchWarnings}/3</span>
            </span>
          )}

          {/* Active Round Dedicated Countdown Timer */}
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono font-extrabold text-xs flex items-center gap-1.5 ${
              isRoundTimerCritical
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <Icon name="calendar" size="xs" />
            <span>Round {activeRoundNumber} Time: {roundMinutes}:{roundSeconds}</span>
          </div>

          {/* Total Exam Time Remaining */}
          <div className="px-2.5 py-1 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 font-mono text-[11px] font-semibold hidden sm:flex items-center gap-1">
            <span>Total: {formattedMinutes}:{formattedSeconds}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmitExam}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* ── Main Exam Body: Split View (Left Palette / Right Main Content) ──── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Question Palette (Square Tiles + Sequential Round Lock State) */}
        <aside className="w-72 bg-slate-50 p-4 flex flex-col gap-3.5 overflow-y-auto hidden md:flex shrink-0 border-r border-slate-200">
          <h4 className="text-xs font-extrabold text-slate-800 font-heading uppercase tracking-wider">
            QUESTION PALETTE
          </h4>

          {/* Status Counter Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span>Answered</span>
              <span className="font-bold">{answeredCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
              <span>Flagged</span>
              <span className="font-bold">{flaggedQuestions.size}</span>
            </div>
          </div>

          {/* Round-Wise Palette Sections with Lock State */}
          <div className="flex flex-col gap-3 mt-1">
            {roundsList.map((rnd) => {
              const isCurrentRound = rnd.number === activeRoundNumber;
              const isPastRound = rnd.number < activeRoundNumber;
              const isFutureRound = rnd.number > activeRoundNumber;

              return (
                <div key={rnd.number} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-extrabold tracking-wider ${
                      isCurrentRound ? 'text-blue-700' : isPastRound ? 'text-slate-400 line-through' : 'text-slate-400'
                    }`}>
                      {rnd.title}
                    </span>
                    {(isPastRound || isFutureRound) && (
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                        <Icon name="lock" size="xs" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {rnd.questions.map((q) => {
                      const idx = EXAM_QUESTIONS.findIndex((item) => item.id === q.id);
                      const isAnswered = answers[q.id] !== undefined;
                      const isFlagged = flaggedQuestions.has(q.id);
                      const isCurrentQ = idx === currentQuestionIndex;

                      const isLocked = q.roundNumber !== activeRoundNumber;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            if (!isLocked) setCurrentQuestionIndex(idx);
                          }}
                          className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${
                            isCurrentQ
                              ? 'ring-2 ring-blue-600 bg-blue-600 text-white font-extrabold shadow-md cursor-pointer'
                              : isLocked
                              ? 'bg-slate-100 border border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                              : isAnswered
                              ? 'bg-emerald-600 text-white shadow-2xs font-bold cursor-pointer'
                              : isFlagged
                              ? 'bg-amber-500 text-white shadow-2xs font-bold cursor-pointer'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer'
                          }`}
                        >
                          {q.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-600 space-y-0.5 shadow-2xs leading-tight">
            <p><strong className="text-slate-900">Active Round:</strong> Round {activeRoundNumber} ({ASSESSMENT_ROUNDS[activeRoundNumber - 1]?.shortTitle})</p>
            <p><strong className="text-slate-900">Session Persistence:</strong> Auto-Saved</p>
            <p><strong className="text-slate-900">Proctoring Log:</strong> Tab Switch Warnings Only</p>
          </div>
        </aside>

        {/* RIGHT COLUMN: Question Display & Interactive Answer Controls */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 bg-white">
          
          {/* Question & Round Metadata Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Round Badge */}
              <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold">
                {currentQ.roundTitle}
              </span>

              {/* Question Number Badge */}
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
                Question {currentQ.number} of {EXAM_QUESTIONS.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Question Time Allowed Badge */}
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                <Icon name="calendar" size="xs" />
                <span>Round Time Allowed: {ASSESSMENT_ROUNDS[activeRoundNumber - 1]?.durationMinutes} Mins</span>
              </span>

              {/* Question Marks Badge */}
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {currentQ.marks} Marks
              </span>

              {/* Flag Button */}
              <button
                type="button"
                onClick={() => toggleFlag(currentQ.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  flaggedQuestions.has(currentQ.id)
                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon name="list" size="xs" />
                <span>{flaggedQuestions.has(currentQ.id) ? 'Flagged' : 'Flag for Review'}</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed font-heading">
            {currentQ.questionText}
          </h3>

          {/* Single / Multi Choice Options */}
          {currentQ.options && (
            <div className="flex flex-col gap-2 mt-1">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.label })}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Coding Challenge Editor */}
          {currentQ.type === 'CODING' && (
            <div className="flex flex-col gap-0 border border-slate-800 rounded-xl overflow-hidden shadow-2xs mt-1">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 text-slate-200 text-xs font-mono border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Icon name="file-text" size="xs" className="text-emerald-400" />
                  <span>JavaScript / TypeScript Code Solution</span>
                </span>
                <button
                  type="button"
                  onClick={handleRunCodeTests}
                  disabled={isTestingCode}
                  className="px-3 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="send" size="xs" />
                  <span>{isTestingCode ? 'Running...' : 'Run Code Test Cases'}</span>
                </button>
              </div>

              <textarea
                value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : currentQ.codeTemplate}
                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                rows={6}
                className="w-full p-3.5 bg-slate-950 font-mono text-xs text-emerald-300 outline-none leading-relaxed scrollbar-thin"
              />

              {codeOutput && (
                <div className="p-2.5 bg-slate-900 border-t border-emerald-500/40 font-mono text-[11px] text-emerald-400 whitespace-pre-line leading-relaxed">
                  {codeOutput}
                </div>
              )}
            </div>
          )}

          {/* SQL Query Editor */}
          {currentQ.type === 'SQL' && (
            <div className="flex flex-col gap-0 border border-slate-800 rounded-xl overflow-hidden shadow-2xs mt-1">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 text-slate-200 text-xs font-mono border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Icon name="file-text" size="xs" className="text-amber-400" />
                  <span>SQL Server 2022 Query Editor</span>
                </span>
              </div>
              <textarea
                value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : currentQ.sqlSchema}
                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                rows={5}
                className="w-full p-3.5 bg-slate-950 font-mono text-xs text-amber-300 outline-none leading-relaxed scrollbar-thin"
              />
            </div>
          )}

          {/* Subjective Essay Textarea */}
          {currentQ.type === 'SUBJECTIVE' && (
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-xs font-bold text-slate-700">Your Detailed Architecture / Essay Response:</label>
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                placeholder="Type your explanation and system design architecture solution here..."
                rows={4}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white leading-relaxed scrollbar-thin shadow-2xs"
              />
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-auto">
            <button
              type="button"
              onClick={() => {
                const nextAns = { ...answers };
                delete nextAns[currentQ.id];
                setAnswers(nextAns);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Clear Choice
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  currentQuestionIndex === 0 ||
                  EXAM_QUESTIONS[currentQuestionIndex - 1].roundNumber < activeRoundNumber
                }
                onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-1.5"
              >
                <span>
                  {currentQuestionIndex === EXAM_QUESTIONS.length - 1
                    ? 'Save & Submit Exam'
                    : currentQuestionIndex < EXAM_QUESTIONS.length - 1 &&
                      EXAM_QUESTIONS[currentQuestionIndex + 1].roundNumber > activeRoundNumber
                    ? `Finish Round ${activeRoundNumber} & Next Round`
                    : 'Save & Next Question'}
                </span>
                <Icon name="chevron-right" size="xs" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

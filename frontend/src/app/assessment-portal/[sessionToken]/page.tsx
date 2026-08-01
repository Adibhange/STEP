'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  FileText, 
  Lock, 
  Send,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/company-ui';

interface Question {
  id: number;
  type: string;
  title: string;
  body: string;
  codeTemplate?: string;
  marks: number;
  options?: { id: number; text: string }[];
}

const mockQuestions: Question[] = [
  {
    id: 101,
    type: 'MCQ',
    title: 'Question 1: EF Core Optimistic Concurrency',
    body: 'Which attribute or EF Core Fluent API mapping is recommended to enforce optimistic concurrency checks on SQL Server tables?',
    marks: 2.0,
    options: [
      { id: 1, text: '[Timestamp] attribute or Property(e => e.RowVersion).IsRowVersion()' },
      { id: 2, text: '[Key] attribute' },
      { id: 3, text: 'UseGuidAsPrimaryKey()' },
      { id: 4, text: 'DisableTracking()' }
    ]
  },
  {
    id: 102,
    type: 'SQL',
    title: 'Question 2: SQL Server Window Functions',
    body: 'Write a SQL query using ROW_NUMBER() OVER (PARTITION BY Department ORDER BY CreatedDate DESC) to retrieve the most recent candidate application for each department.',
    marks: 5.0,
    codeTemplate: 'SELECT *\nFROM (\n  SELECT CandidateId, Department,\n    ROW_NUMBER() OVER (PARTITION BY Department ORDER BY CreatedDate DESC) AS rn\n  FROM candidate.Candidates\n) t\nWHERE t.rn = 1;'
  },
  {
    id: 103,
    type: 'Coding',
    title: 'Question 3: C# Thread Safety in Background Processing',
    body: 'Implement a thread-safe singleton queue in C# using Channel<T> for processing background notifications.',
    marks: 5.0,
    codeTemplate: 'public class NotificationQueue {\n  private readonly Channel<OutboxNotification> _channel = Channel.CreateUnbounded<OutboxNotification>();\n}'
  }
];

export default function AssessmentPortalPage({ params }: { params: { sessionToken: string } }) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [violations, setViolations] = useState<{ type: string; time: string }[]>([]);
  const [riskScore, setRiskScore] = useState(0.0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(3600); // 60 mins
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);

  // Anti-cheating event listeners
  useEffect(() => {
    const handleBlur = () => {
      logViolation('TabSwitch / WindowBlur', 1.5);
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('CopyAttempt Blocked', 2.0);
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('PasteAttempt Blocked', 2.0);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('copy', handleCopy as any);
    window.addEventListener('paste', handlePaste as any);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('copy', handleCopy as any);
      window.removeEventListener('paste', handlePaste as any);
    };
  }, [riskScore]);

  // Timer countdown loop
  useEffect(() => {
    if (isSubmitted || isDisqualified) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, isDisqualified]);

  const logViolation = (type: string, weight: number) => {
    const timeStr = new Date().toLocaleTimeString();
    setViolations((prev) => [{ type, time: timeStr }, ...prev]);
    const newScore = riskScore + weight;
    setRiskScore(newScore);

    if (newScore >= 10.0) {
      setIsDisqualified(true);
    }
  };

  const handleOptionSelect = (qId: number, optionId: number) => {
    setAnswers({ ...answers, [qId]: String(optionId) });
  };

  const handleCodeChange = (qId: number, code: string) => {
    setAnswers({ ...answers, [qId]: code });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const currentQ = mockQuestions[activeQuestionIdx];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  if (isDisqualified) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-rose-950/40 border border-rose-800 rounded-lg p-6 text-center space-y-3">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
          <h1 className="text-lg font-bold text-rose-400">Session Terminated & Disqualified</h1>
          <p className="text-xs text-slate-300">
            Excessive proctoring violations detected (Tab switching / Window focus loss / Copy attempts). Your test session has been disqualified and recorded in the audit log.
          </p>
          <div className="p-3 bg-rose-900/50 rounded text-xs font-mono font-bold text-rose-200">
            Final Risk Score: {riskScore.toFixed(1)} / 10.0
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-6 text-center space-y-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">Assessment Submitted Successfully</h1>
          <p className="text-xs text-slate-400">
            Your responses have been recorded and sent to the evaluation engine.
          </p>
          <div className="p-3 bg-slate-800 rounded text-xs font-mono text-slate-300">
            Questions Answered: {Object.keys(answers).length} of {mockQuestions.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Proctoring Header Bar */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs text-white">ERMS Secure Assessment Portal</span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Token: {params.sessionToken.slice(0, 8)}...
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Risk Score Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Score: {riskScore.toFixed(1)} / 10.0</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-950/60 border border-sky-800 text-sky-300 font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>

          <Button variant="danger" size="sm" onClick={handleSubmit}>
            Submit Test <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Question Navigation */}
        <aside className="w-56 bg-slate-900 border-r border-slate-800 p-3 space-y-3 shrink-0">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Question Navigator
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {mockQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = activeQuestionIdx === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`h-8 rounded text-xs font-bold font-mono transition-all ${
                      isActive
                        ? 'bg-[#2563EB] text-white ring-2 ring-[#2563EB]/50'
                        : isAnswered
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Violation Audit Logs */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Live Violation Stream
            </h4>
            <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[10px]">
              {violations.length === 0 ? (
                <p className="text-slate-500 italic">No violations recorded.</p>
              ) : (
                violations.map((v, i) => (
                  <div key={i} className="p-1 rounded bg-rose-950/40 text-rose-300 border border-rose-900">
                    [{v.time}] {v.type}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Side: Active Question Workspace */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white">{currentQ.title}</h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">[{currentQ.marks} Marks]</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900 p-3 rounded border border-slate-800">
            {currentQ.body}
          </p>

          {/* MCQ Option Selection */}
          {currentQ.type === 'MCQ' && currentQ.options && (
            <div className="space-y-2 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === String(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                    className={`p-3 rounded border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#2563EB]/20 border-[#2563EB] text-white font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-600'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{opt.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* SQL / Coding Code Editor */}
          {(currentQ.type === 'SQL' || currentQ.type === 'Coding') && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5 text-[#2563EB]" /> Code Editor ({currentQ.type})</span>
                <span>Copy/Paste Disabled</span>
              </div>
              <textarea
                rows={10}
                value={answers[currentQ.id] ?? currentQ.codeTemplate ?? ''}
                onChange={(e) => handleCodeChange(currentQ.id, e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          )}

          {/* Next / Previous Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={activeQuestionIdx === 0}
              onClick={() => setActiveQuestionIdx(activeQuestionIdx - 1)}
            >
              Previous Question
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={activeQuestionIdx === mockQuestions.length - 1}
              onClick={() => setActiveQuestionIdx(activeQuestionIdx + 1)}
            >
              Next Question
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

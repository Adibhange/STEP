'use client';

import React, { useState } from 'react';
import { ExamLayout } from '@/layouts/ExamLayout';
import { Button } from '@/ui/button/Button';

export default function AssessmentPortalPage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <ExamLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Test Header Progress */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Question 3 of 25</span>
            <h2 className="text-sm font-semibold text-slate-100">Section B: System Design & Architecture</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Time Remaining:</span>
            <p className="font-mono text-base font-bold text-amber-400">42m : 18s</p>
          </div>
        </div>

        {/* Question Card */}
        {submitted ? (
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded text-center space-y-3 text-slate-200">
            <h3 className="text-lg font-bold text-emerald-400">✅ Test Submitted Successfully</h3>
            <p className="text-xs text-slate-400">Your proctored exam answers and webcam security logs have been submitted to the recruitment committee.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded space-y-4">
            <p className="text-sm font-medium text-slate-200">
              Which garbage collection algorithm optimization minimizes Stop-The-World (STW) pauses in high-throughput .NET 10 microservices?
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Server Garbage Collection with Background GC enabled.',
                'WorkStation GC with concurrent compaction disabled.',
                'Manual pointer pinning with Unsafe memory allocation.',
                'Generational GC with Gen 2 compaction forced on every request.',
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedOption === idx ? 'border-blue-500 bg-blue-950/40 text-blue-200 font-semibold' : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="xs">Skip Question</Button>
              <Button variant="primary" size="sm" onClick={() => setSubmitted(true)}>
                Submit Test
              </Button>
            </div>
          </div>
        )}
      </div>
    </ExamLayout>
  );
}

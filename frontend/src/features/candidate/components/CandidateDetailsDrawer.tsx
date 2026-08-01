'use client';

import React, { useState } from 'react';
import { EntityDrawer } from '@/ui/drawer/EntityDrawer';
import { Badge } from '@/ui/badge/Badge';
import { Button } from '@/ui/button/Button';
import { Icon } from '@/registry/icons';
import { CandidateRecord } from '@/mock/candidate.mock';

export interface CandidateDetailsDrawerProps {
  candidate: CandidateRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateDetailsDrawer: React.FC<CandidateDetailsDrawerProps> = ({
  candidate,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'assessment' | 'interviews'>('profile');

  if (!candidate) return null;

  return (
    <EntityDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${candidate.name} (${candidate.code})`}
      subtitle={`${candidate.role} • ${candidate.experienceYears} Yrs Experience`}
      width="2xl"
      badge={
        <Badge variant={candidate.status === 'Rejected' ? 'danger' : candidate.status === 'Offered' ? 'success' : 'info'}>
          {candidate.status}
        </Badge>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button variant="danger" size="xs" icon="UserX">
            Disqualify
          </Button>
          <Button variant="success" size="xs" icon="CheckCircle2">
            Advance Stage
          </Button>
        </div>
      }
    >
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] mb-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Candidate Profile & Resume
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'assessment'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Assessment & Proctoring ({candidate.score})
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'interviews'
              ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Interview Rubric History
        </button>
      </div>

      {/* Split Panel View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Sub-Panel: Basic Info & Resume */}
        <div className="space-y-4 bg-[var(--bg-surface-hover)] p-3.5 rounded border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-base shadow-sm">
              {candidate.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[var(--text-primary)]">{candidate.name}</h4>
              <p className="text-xs text-[var(--text-muted)]">{candidate.email}</p>
              <p className="text-xs text-[var(--text-muted)]">{candidate.mobile} • {candidate.city}</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Applied Source:</span>
              <span className="font-medium text-[var(--text-primary)]">{candidate.source}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Current Stage:</span>
              <span className="font-medium text-[var(--text-primary)]">{candidate.stage}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Applied Date:</span>
              <span className="font-medium text-[var(--text-primary)]">{candidate.appliedDate}</span>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
            <h5 className="font-semibold text-xs text-[var(--text-primary)]">Resume Preview (Verified Document)</h5>
            <div className="bg-[var(--bg-app)] border border-[var(--border-strong)] p-3 rounded text-[11px] font-mono text-[var(--text-secondary)] space-y-1">
              <p className="font-bold text-xs text-[var(--text-primary)]">{candidate.name} - Senior Engineer</p>
              <p>• 5+ Years experience in .NET 10, C#, Next.js, and SQL Server.</p>
              <p>• Architected high-throughput microservices handling 50k requests/min.</p>
              <p>• Lead engineering team of 6 developers across full-stack applications.</p>
            </div>
          </div>
        </div>

        {/* Right Sub-Panel: Assessment Scores & Proctoring Risk */}
        <div className="space-y-4 bg-[var(--bg-surface-hover)] p-3.5 rounded border border-[var(--border-subtle)]">
          <div className="space-y-2">
            <h5 className="font-semibold text-xs text-[var(--text-primary)] flex items-center justify-between">
              <span>Anti-Cheating Proctoring Audit</span>
              <span className={candidate.riskScore > 5 ? 'text-red-500 font-bold' : 'text-green-500 font-semibold'}>
                Risk Index: {candidate.riskScore}
              </span>
            </h5>
            <div className="w-full bg-[var(--bg-app)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className={`h-full ${candidate.riskScore > 5 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, candidate.riskScore * 8)}%` }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {candidate.riskScore > 5
                ? '⚠️ Multiple tab switches & face detection anomalies flagged during online test.'
                : '✅ Zero security violations detected during 60-minute proctored session.'}
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
            <h5 className="font-semibold text-xs text-[var(--text-primary)]">Stage Evaluation Metrics</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[var(--bg-surface)] p-2 rounded border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-muted)]">Assessment Score</p>
                <p className="font-bold text-sm text-[var(--brand-primary)]">{candidate.score}</p>
              </div>
              <div className="bg-[var(--bg-surface)] p-2 rounded border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-muted)]">Technical Rating</p>
                <p className="font-bold text-sm text-green-500">4.5 / 5.0</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
            <h5 className="font-semibold text-xs text-[var(--text-primary)]">Interviewer Recommendations</h5>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-2.5 rounded text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-primary)]">
                <span>Director Round Feedback</span>
                <span className="text-green-600">Strong Hire</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                "Demonstrated exceptional system architecture skills in C# and SQL Server. Solved LRU cache live coding exercise in 12 minutes."
              </p>
            </div>
          </div>
        </div>
      </div>
    </EntityDrawer>
  );
};

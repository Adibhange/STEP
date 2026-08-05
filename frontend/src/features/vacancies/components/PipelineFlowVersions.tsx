'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { PipelineFlowVersion, PipelineRound } from '../types/vacancy.types';

export const INITIAL_FLOW_VERSIONS: PipelineFlowVersion[] = [
  {
    id: 'flow-v1',
    versionName: 'Flow Version 1 (Standard Aptitude First)',
    description: 'Round 1: Aptitude Filter → Round 2: Technical Assessment → Round 3: F2F HR Interview',
    isDefault: true,
    assignedCandidateCount: 142,
    rounds: [
      { id: 'r-1', name: 'General Aptitude & Logical Test', type: 'Aptitude', cutoffPercent: 65 },
      { id: 'r-2', name: 'Coding & Algorithm Challenge', type: 'Technical', cutoffPercent: 70 },
      { id: 'r-3', name: 'Technical F2F & Live Coding', type: 'F2F', cutoffPercent: 80 },
    ],
  },
  {
    id: 'flow-v2',
    versionName: 'Flow Version 2 (Fast-Track Technical First)',
    description: 'Round 1: Technical Code Assessment → Round 2: General Aptitude → Round 3: F2F Interview',
    isDefault: false,
    assignedCandidateCount: 120,
    rounds: [
      { id: 'r-10', name: 'Coding & Algorithm Challenge', type: 'Technical', cutoffPercent: 75 },
      { id: 'r-11', name: 'General Aptitude & Logical Test', type: 'Aptitude', cutoffPercent: 60 },
      { id: 'r-12', name: 'HR & Cultural Fit Round', type: 'HR', cutoffPercent: 70 },
    ],
  },
];

export interface PipelineFlowVersionsProps {
  vacancyId?: string;
}

export const PipelineFlowVersions: React.FC<PipelineFlowVersionsProps> = () => {
  const [flows, setFlows] = useState<PipelineFlowVersion[]>(INITIAL_FLOW_VERSIONS);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSetDefault = (flowId: string) => {
    setFlows((prev) =>
      prev.map((f) => ({
        ...f,
        isDefault: f.id === flowId,
      }))
    );
  };

  const handleUpdateRound = (flowId: string, roundId: string, field: keyof PipelineRound, val: any) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        return {
          ...f,
          rounds: f.rounds.map((r) => (r.id === roundId ? { ...r, [field]: val } : r)),
        };
      })
    );
  };

  const handleAddRoundStage = (flowId: string) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        const newStage: PipelineRound = {
          id: `r-${Date.now()}`,
          name: 'SQL & Database Queries',
          type: 'Technical',
          cutoffPercent: 70,
        };
        return {
          ...f,
          rounds: [...f.rounds, newStage],
        };
      })
    );
  };

  const handleRemoveRoundStage = (flowId: string, roundId: string) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        if (f.rounds.length <= 1) return f;
        return {
          ...f,
          rounds: f.rounds.filter((r) => r.id !== roundId),
        };
      })
    );
  };

  const handleAddFlowVersion = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;

    const newFlow: PipelineFlowVersion = {
      id: `flow-${Date.now()}`,
      versionName: newVersionName,
      description: newVersionDesc || 'Custom interview pipeline version',
      isDefault: false,
      assignedCandidateCount: 0,
      rounds: [
        { id: `r-${Date.now()}-1`, name: 'MCQ (Multiple Choice Questions)', type: 'Aptitude', cutoffPercent: 65 },
        { id: `r-${Date.now()}-2`, name: 'Technical F2F & Live Coding', type: 'F2F', cutoffPercent: 75 },
      ],
    };

    setFlows([...flows, newFlow]);
    setNewVersionName('');
    setNewVersionDesc('');
    setIsAddModalOpen(false);
  };

  const handleDeleteFlowVersion = (flowId: string) => {
    if (flows.length <= 1) return;
    setFlows(flows.filter((f) => f.id !== flowId));
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Action Header */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
              Dynamic Pipeline Flow Versions
            </h3>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {flows.length} Versions Configured
            </span>
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            Configure multiple interview sequence versions for A/B testing or split recruitment pipelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 px-4 rounded-full bg-[var(--accent-indigo)] text-white text-[12px] font-bold shadow-xs hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Icon name="plus" size="xs" />
          <span>Add New Flow Version</span>
        </button>
      </div>

      {/* List of Configured Flow Versions */}
      <div className="flex flex-col gap-4">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className={`bg-[var(--surface-1)] border rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col gap-4 transition-all ${
              flow.isDefault
                ? 'border-[var(--accent-indigo)] ring-1 ring-[var(--accent-indigo)]/30'
                : 'border-[var(--border-default)]'
            }`}
          >
            {/* Version Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-default)] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[12px] border ${
                  flow.isDefault
                    ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)]'
                }`}>
                  <Icon name="grid" size="xs" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">
                      {flow.versionName}
                    </h4>
                    {flow.isDefault && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Default Walk-in Flow
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{flow.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11.5px] font-mono font-bold text-[var(--text-secondary)] bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--border-default)]">
                  {flow.assignedCandidateCount} Candidates Enrolled
                </span>

                {!flow.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(flow.id)}
                    className="text-[11.5px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}

                {flows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFlowVersion(flow.id)}
                    className="text-[var(--text-tertiary)] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Delete Version"
                  >
                    <Icon name="trash-2" size="xs" />
                  </button>
                )}
              </div>
            </div>

            {/* Stages Sequence Builder */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase font-mono text-[var(--text-tertiary)]">
                  Interview Stage Sequence ({flow.rounds.length} Rounds):
                </span>

                <button
                  type="button"
                  onClick={() => handleAddRoundStage(flow.id)}
                  className="text-[11.5px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Icon name="plus" size="xs" />
                  <span>Add Round Stage</span>
                </button>
              </div>

              {/* Grid of Dynamic Round Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {flow.rounds.map((rd, index) => (
                  <div
                    key={rd.id}
                    className="bg-[var(--surface-2)] border border-[var(--border-default)] p-3.5 rounded-xl flex flex-col gap-2.5 relative group hover:border-[var(--accent-indigo)]/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5.5 h-5.5 rounded-full bg-indigo-600 text-white text-[10.5px] font-extrabold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">
                          Stage {index + 1}
                        </span>
                      </div>

                      {flow.rounds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoundStage(flow.id, rd.id)}
                          className="p-1 text-[var(--text-tertiary)] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove Stage"
                        >
                          <Icon name="x" size="xs" />
                        </button>
                      )}
                    </div>

                    {/* Master Data Round Title CustomSelect */}
                    <CustomSelect
                      value={rd.name}
                      onChange={(val) => handleUpdateRound(flow.id, rd.id, 'name', val)}
                      options={[
                        { value: 'MCQ (Multiple Choice Questions)', label: 'MCQ (Multiple Choice Questions)' },
                        { value: 'Coding & Algorithm Challenge', label: 'Coding & Algorithm Challenge' },
                        { value: 'SQL & Database Queries', label: 'SQL & Database Queries' },
                        { value: 'Subjective & Essay Questions', label: 'Subjective & Essay Questions' },
                        { value: 'General Aptitude & Logical Test', label: 'General Aptitude & Logical Test' },
                        { value: 'System Design & Architecture', label: 'System Design & Architecture' },
                        { value: 'Technical F2F & Live Coding', label: 'Technical F2F & Live Coding' },
                        { value: 'Executive F2F Interview', label: 'Executive F2F Interview' },
                        { value: 'HR & Cultural Fit Round', label: 'HR & Cultural Fit Round' },
                      ]}
                      widthClass="w-full"
                    />

                    {/* Editable Type & Cutoff % */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-0.5">
                          Type
                        </label>
                        <select
                          value={rd.type}
                          onChange={(e) => handleUpdateRound(flow.id, rd.id, 'type', e.target.value)}
                          className="w-full h-8 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-[11.5px] font-bold text-[var(--text-primary)] outline-none cursor-pointer"
                        >
                          <option value="Aptitude">Aptitude</option>
                          <option value="Technical">Technical</option>
                          <option value="F2F">F2F</option>
                          <option value="HR">HR</option>
                          <option value="Group Discussion">GD</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-0.5">
                          Cutoff %
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rd.cutoffPercent}
                          onChange={(e) => handleUpdateRound(flow.id, rd.id, 'cutoffPercent', parseInt(e.target.value) || 0)}
                          className="w-full h-8 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] font-mono text-center text-[11.5px] font-bold text-[var(--text-primary)] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Flow Version Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-md p-5 flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h4 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
                Create Pipeline Flow Version
              </h4>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="xs" />
              </button>
            </div>

            <form onSubmit={handleAddFlowVersion} className="flex flex-col gap-4">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                  Version Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flow Version 3 (Fast-Track Technical)"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>

              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief workflow description..."
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-default)] w-full">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 rounded-lg text-[12.5px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--surface-hover)] cursor-pointer w-full"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg text-[12.5px] font-bold bg-[var(--accent-indigo)] text-white flex items-center justify-center hover:bg-[var(--accent-indigo-hover)] cursor-pointer w-full"
                >
                  <span>Create Version</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

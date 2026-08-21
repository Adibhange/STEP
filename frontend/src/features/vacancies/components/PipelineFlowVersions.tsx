'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icon, EnterpriseModal } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { PipelineRound } from '../types/vacancy.types';
import {
  useGetVacancyByIdQuery,
  useCreatePipelineFlowMutation,
  useUpdatePipelineFlowMutation,
  useDeletePipelineFlowMutation,
} from '@/store/services/api';

export interface PipelineFlowVersionsProps {
  vacancyId?: string;
}

// A round as it exists in the editable draft — `id` is null for a stage the user just added
// locally and hasn't been saved yet (mirrors UpdateVacancyPipelineFlowCommand's UpdateRoundInput,
// which treats a null/absent Id as "create this round").
interface DraftRound extends Omit<PipelineRound, 'id'> {
  id: number | null;
}

interface FlowDraft {
  flowId: number;
  versionName: string;
  description: string;
  isDefault: boolean;
  assignedCandidateCount: number;
  rounds: DraftRound[];
  dirty: boolean;
}

const STAGE_TYPE_MAP: Record<string, string> = {
  'MCQ (Multiple Choice Questions)': 'Aptitude',
  'Coding & Algorithm Challenge': 'Technical',
  'SQL & Database Queries': 'Technical',
  'Subjective & Essay Questions': 'Technical',
  'General Aptitude & Logical Test': 'Aptitude',
  'System Design & Architecture': 'Technical',
  'Technical F2F & Live Coding': 'F2F',
  'Executive F2F Interview': 'F2F',
  'HR & Cultural Fit Round': 'HR',
};

let tempRoundKeySeq = -1;

export const PipelineFlowVersions: React.FC<PipelineFlowVersionsProps> = ({ vacancyId }) => {
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const numVacancyId = vacancyId ? Number(vacancyId) : undefined;
  const { data: vacancyRes, isLoading: isVacancyLoading } = useGetVacancyByIdQuery(numVacancyId!, { skip: !numVacancyId });
  const [createPipelineFlow, { isLoading: isCreating }] = useCreatePipelineFlowMutation();
  const [updatePipelineFlow] = useUpdatePipelineFlowMutation();
  const [deletePipelineFlow] = useDeletePipelineFlowMutation();

  const realFlows = vacancyRes?.data?.pipelineFlows as any[] | undefined;

  // Editable drafts, keyed by real backend flow id — reseeded whenever the server's flow *shape*
  // (which flows exist, and each one's round count) changes, so a save-and-refetch doesn't stomp
  // in-progress edits to fields the round count doesn't capture (name text, cutoff numbers, etc.)
  // while still picking up flows that were added/removed elsewhere.
  const [drafts, setDrafts] = useState<Record<number, FlowDraft>>({});
  const flowShapeKey = (realFlows || []).map((f) => `${f.id}:${f.rounds?.length ?? 0}`).join('|');

  useEffect(() => {
    if (!realFlows) return;
    setDrafts(
      Object.fromEntries(
        realFlows.map((f) => [
          f.id,
          {
            flowId: f.id,
            versionName: f.versionName,
            description: f.description || '',
            isDefault: f.isDefault,
            assignedCandidateCount: f.assignedCandidateCount ?? 0,
            rounds: (f.rounds || [])
              .slice()
              .sort((a: any, b: any) => a.roundOrder - b.roundOrder)
              .map((r: any) => ({ id: r.id, name: r.name, type: r.roundType, cutoffPercent: Number(r.cutoffPercent) })),
            dirty: false,
          } as FlowDraft,
        ])
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowShapeKey]);

  const flowList = useMemo(() => Object.values(drafts).sort((a, b) => a.flowId - b.flowId), [drafts]);
  const hasRealFlows = flowList.length > 0;

  const updateDraft = (flowId: number, patch: Partial<FlowDraft>) => {
    setDrafts((prev) => ({ ...prev, [flowId]: { ...prev[flowId], ...patch, dirty: true } }));
  };

  const handleUpdateRound = (flowId: number, roundKey: number | null, index: number, field: keyof PipelineRound, val: any) => {
    setDrafts((prev) => {
      const flow = prev[flowId];
      if (!flow) return prev;
      const rounds = flow.rounds.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, [field]: val };
        if (field === 'name' && STAGE_TYPE_MAP[val]) {
          updated.type = STAGE_TYPE_MAP[val] as any;
        }
        return updated;
      });
      return { ...prev, [flowId]: { ...flow, rounds, dirty: true } };
    });
  };

  const handleAddRoundStage = (flowId: number) => {
    setDrafts((prev) => {
      const flow = prev[flowId];
      if (!flow) return prev;
      const newStage: DraftRound = { id: tempRoundKeySeq--, name: 'SQL & Database Queries', type: 'Technical', cutoffPercent: 70 };
      return { ...prev, [flowId]: { ...flow, rounds: [...flow.rounds, newStage], dirty: true } };
    });
  };

  const handleRemoveRoundStage = (flowId: number, index: number) => {
    setDrafts((prev) => {
      const flow = prev[flowId];
      if (!flow || flow.rounds.length <= 1) return prev;
      return { ...prev, [flowId]: { ...flow, rounds: flow.rounds.filter((_, i) => i !== index), dirty: true } };
    });
  };

  const persistFlow = async (flowId: number, overrides?: Partial<Pick<FlowDraft, 'isDefault'>>) => {
    const flow = drafts[flowId];
    if (!flow) return;
    const isDefault = overrides?.isDefault ?? flow.isDefault;
    try {
      await updatePipelineFlow({
        vacancyId: numVacancyId!,
        flowId,
        data: {
          versionName: flow.versionName,
          description: flow.description,
          isDefault,
          rounds: flow.rounds.map((r, i) => ({
            id: r.id && r.id > 0 ? r.id : null,
            roundOrder: i + 1,
            name: r.name,
            roundType: r.type,
            cutoffPercent: r.cutoffPercent,
          })),
        },
      }).unwrap();
      toast.success('Pipeline Flow Saved', { description: `"${flow.versionName}" was updated successfully.` });
    } catch (err: any) {
      toast.error('Save Failed', {
        description: err?.data?.message || err?.data?.errors?.[0] || 'Could not save this pipeline flow.',
      });
    }
  };

  const handleSetDefault = (flowId: number) => persistFlow(flowId, { isDefault: true });

  const handleAddFlowVersion = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newVersionName.trim() || !numVacancyId) return;

    try {
      await createPipelineFlow({
        vacancyId: numVacancyId,
        data: {
          versionName: newVersionName.trim(),
          description: newVersionDesc || 'Custom interview pipeline version',
          isDefault: flowList.length === 0,
          rounds: [
            { roundOrder: 1, name: 'MCQ (Multiple Choice Questions)', roundType: 'Aptitude', cutoffPercent: 65 },
            { roundOrder: 2, name: 'Technical F2F & Live Coding', roundType: 'F2F', cutoffPercent: 75 },
          ],
        },
      }).unwrap();
      toast.success('Flow Version Created', { description: `"${newVersionName.trim()}" was added to this vacancy.` });
      setNewVersionName('');
      setNewVersionDesc('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error('Creation Failed', {
        description: err?.data?.message || err?.data?.errors?.[0] || 'Could not create the pipeline flow version.',
      });
    }
  };

  const handleDeleteFlowVersion = async (flowId: number) => {
    if (!numVacancyId || flowList.length <= 1) return;
    try {
      await deletePipelineFlow({ vacancyId: numVacancyId, flowId }).unwrap();
      toast.success('Flow Version Deleted');
    } catch (err: any) {
      toast.error('Delete Failed', {
        description:
          err?.data?.message || err?.data?.errors?.[0] || 'This flow version could not be deleted — it may already have candidates assigned.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {isVacancyLoading ? (
        <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-default)] text-[12px] text-[var(--text-tertiary)] flex items-center gap-2">
          <Icon name="spinner" size="xs" className="animate-spin" />
          <span>Loading this vacancy's saved pipeline flow…</span>
        </div>
      ) : hasRealFlows ? (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-700 font-semibold flex items-center gap-2">
          <Icon name="check-circle" size="xs" />
          <span>Showing the pipeline flow(s) saved for this vacancy. Edits below are saved per-card via "Save Changes".</span>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-700 font-semibold flex items-center gap-2">
          <Icon name="alert-triangle" size="xs" />
          <span>No pipeline flow has been created for this vacancy yet — add one below.</span>
        </div>
      )}

      {/* Action Header */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
              Dynamic Pipeline Flow Versions
            </h3>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
              {flowList.length} Versions Configured
            </span>
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            Configure multiple interview sequence versions for A/B testing or split recruitment pipelines.
          </p>
        </div>

        <button
          type="button"
          disabled={!numVacancyId || isCreating}
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 px-4 rounded-full bg-[var(--accent-indigo)] text-white text-[12px] font-bold shadow-xs hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="plus" size="xs" />
          <span>Add New Flow Version</span>
        </button>
      </div>

      {/* List of Configured Flow Versions */}
      <div className="flex flex-col gap-4">
        {flowList.map((flow) => (
          <div
            key={flow.flowId}
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      value={flow.versionName}
                      onChange={(e) => updateDraft(flow.flowId, { versionName: e.target.value })}
                      className="text-sm font-extrabold text-[var(--text-primary)] font-heading bg-transparent outline-none border-b border-transparent hover:border-[var(--border-default)] focus:border-[var(--accent-indigo)] min-w-[160px]"
                    />
                    {flow.isDefault && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 shrink-0">
                        Default Walk-in Flow
                      </span>
                    )}
                  </div>
                  <input
                    value={flow.description}
                    onChange={(e) => updateDraft(flow.flowId, { description: e.target.value })}
                    placeholder="Describe this flow's sequence…"
                    className="text-[12px] text-[var(--text-tertiary)] mt-0.5 bg-transparent outline-none border-b border-transparent hover:border-[var(--border-default)] focus:border-[var(--accent-indigo)] w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11.5px] font-mono font-bold text-[var(--text-secondary)] bg-[var(--surface-2)] px-2.5 py-1 rounded-md border border-[var(--border-default)]">
                  {flow.assignedCandidateCount} Candidates Enrolled
                </span>

                {!flow.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(flow.flowId)}
                    className="text-[11.5px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}

                {flowList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFlowVersion(flow.flowId)}
                    className="text-[var(--text-tertiary)] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Delete Version (only allowed before any candidate is assigned to it)"
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
                  onClick={() => handleAddRoundStage(flow.flowId)}
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
                    key={rd.id ?? `new-${index}`}
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
                          onClick={() => handleRemoveRoundStage(flow.flowId, index)}
                          className="p-1 text-[var(--text-tertiary)] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove Stage"
                        >
                          <Icon name="x" size="xs" />
                        </button>
                      )}
                    </div>

                    <CustomSelect
                      value={rd.name}
                      onChange={(val) => handleUpdateRound(flow.flowId, rd.id, index, 'name', val)}
                      options={[
                        { value: 'General Aptitude & Logical Test', label: 'General Aptitude & Logical Test' },
                        { value: 'Coding & Algorithm Challenge', label: 'Coding & Algorithm Challenge' },
                        { value: 'Technical F2F & Live Coding', label: 'Technical F2F & Live Coding' },
                        { value: 'HR & Cultural Fit Round', label: 'HR & Cultural Fit Round' },
                      ]}
                      widthClass="w-full"
                    />

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-0.5">
                          Type
                        </label>
                        <CustomSelect
                          value={rd.type}
                          onChange={(val) => handleUpdateRound(flow.flowId, rd.id, index, 'type', val)}
                          options={[
                            { value: 'Aptitude', label: 'Aptitude' },
                            { value: 'Technical', label: 'Technical' },
                            { value: 'F2F', label: 'F2F' },
                            { value: 'HR', label: 'HR' },
                            { value: 'Group Discussion', label: 'GD' },
                          ]}
                          widthClass="w-full"
                        />
                      </div>

                      {rd.type !== 'HR' && (
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-0.5">
                            Cutoff %
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={rd.cutoffPercent}
                            onChange={(e) => handleUpdateRound(flow.flowId, rd.id, index, 'cutoffPercent', parseInt(e.target.value) || 0)}
                            className="w-full h-8 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] font-mono text-center text-[11.5px] font-bold text-[var(--text-primary)] outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-flow save action */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-soft)]">
              {flow.dirty && (
                <span className="text-[11px] text-amber-600 font-semibold mr-auto">Unsaved changes</span>
              )}
              <button
                type="button"
                onClick={() => persistFlow(flow.flowId)}
                className="h-8 px-4 rounded-lg text-[11.5px] font-bold bg-[var(--accent-indigo)] text-white hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Icon name="check" size="xs" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Flow Version Modal */}
      {/* Create Pipeline Flow Version Modal */}
      <EnterpriseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Pipeline Flow Version"
        subtitle="Define a distinct round sequence track for candidate evaluation."
        icon="git-branch"
        maxWidth="lg"
        submitText={isCreating ? 'Creating…' : 'Create Flow Version'}
        cancelText="Cancel"
        isSubmitting={isCreating}
        onSubmit={handleAddFlowVersion}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[11.5px] font-bold text-[var(--text-secondary)] mb-1 font-mono uppercase">
              Flow Version Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Flow Version 3 (Fast-Track Senior)"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              className="w-full h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-bold text-[var(--text-secondary)] mb-1 font-mono uppercase">
              Description / Sequence Overview
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Round 1: Coding Challenge → Round 2: System Design"
              value={newVersionDesc}
              onChange={(e) => setNewVersionDesc(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent-indigo)]"
            />
          </div>
        </div>
      </EnterpriseModal>
    </div>
  );
};

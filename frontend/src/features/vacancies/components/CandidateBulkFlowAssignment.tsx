'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CandidateBulkItem } from '../types/vacancy.types';
import { useGetCandidatesQuery, useGetVacancyByIdQuery, useAssignPipelineFlowMutation } from '@/store/services/api';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { TablePagination } from '@/features/dashboard/shared/TablePagination';

interface CandidateBulkFlowAssignmentProps {
  vacancyId?: string | number;
  vacancyTitle?: string;
}

interface FlowOption {
  id: number;
  versionName: string;
}

export const CandidateBulkFlowAssignment: React.FC<CandidateBulkFlowAssignmentProps> = ({
  vacancyId,
  vacancyTitle,
}) => {
  const numVacId = vacancyId ? parseInt(String(vacancyId).replace(/\D/g, ''), 10) : undefined;
  const { data: candidatesRes, isLoading } = useGetCandidatesQuery(numVacId ? { vacancyId: numVacId } : undefined);
  const { data: vacancyRes } = useGetVacancyByIdQuery(numVacId!, { skip: !numVacId });
  const [assignPipelineFlow, { isLoading: isAssigning }] = useAssignPipelineFlowMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isBulkRunning, setIsBulkRunning] = useState(false);

  // Real, saved pipeline flow versions for this vacancy — no fallback placeholders. Bulk
  // assignment is unavailable until at least one flow has actually been configured.
  const flowOptions: FlowOption[] = useMemo(
    () => (vacancyRes?.data?.pipelineFlows || []).map((f: any) => ({ id: f.id, versionName: f.versionName })),
    [vacancyRes]
  );

  const rawCandidates = useMemo(() => {
    let list = candidatesRes?.data || [];
    if (vacancyId) {
      list = list.filter((c: any) => {
        return c.vacancyId !== null && c.vacancyId !== undefined && (String(c.vacancyId) === String(vacancyId) || String(c.vacancyId) === String(numVacId));
      });
    }
    return list;
  }, [candidatesRes, vacancyId, numVacId]);

  const candidates: (CandidateBulkItem & { hasPipelineFlowAssigned: boolean })[] = useMemo(() => {
    return rawCandidates.map((c: any) => ({
      id: String(c.id),
      code: c.candidateCode || `CND-${c.id}`,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Candidate',
      email: c.email || '',
      phone: c.phone || '',
      appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
      flowVersion: '',
      status: c.hasPipelineFlowAssigned ? 'Assigned' : 'Pending',
      hasPipelineFlowAssigned: Boolean(c.hasPipelineFlowAssigned),
    }));
  }, [rawCandidates]);

  const filtered = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [candidates, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const unassignedCandidates = useMemo(() => candidates.filter((c) => !c.hasPipelineFlowAssigned), [candidates]);

  const persistAssignments = async (plan: { candidateId: number; vacancyPipelineFlowId: number }[], label: string) => {
    if (plan.length === 0) return;
    setIsBulkRunning(true);
    let succeeded = 0;
    let failed = 0;
    for (const item of plan) {
      try {
        await assignPipelineFlow(item).unwrap();
        succeeded++;
      } catch {
        failed++;
      }
    }
    setIsBulkRunning(false);
    if (failed === 0) {
      toast.success(`${label} Applied`, { description: `${succeeded} candidate(s) assigned to their pipeline flow.` });
    } else {
      toast.error(`${label} Partially Applied`, { description: `${succeeded} succeeded, ${failed} failed (likely already assigned).` });
    }
  };

  // 1. Apply 50/50 Equal Split Strategy across all currently unassigned candidates
  const handleApply5050Split = () => {
    if (unassignedCandidates.length === 0 || flowOptions.length === 0) return;
    const plan = unassignedCandidates.map((c, idx) => ({
      candidateId: Number(c.id),
      vacancyPipelineFlowId: flowOptions[idx % Math.min(2, flowOptions.length)].id,
    }));
    persistAssignments(plan, '50/50 Split');
  };

  // 2. Apply Random Shuffle Strategy across all currently unassigned candidates
  const handleApplyRandomShuffle = () => {
    if (unassignedCandidates.length === 0 || flowOptions.length === 0) return;
    const maxIdx = Math.min(2, flowOptions.length);
    const plan = unassignedCandidates.map((c) => ({
      candidateId: Number(c.id),
      vacancyPipelineFlowId: flowOptions[Math.floor(Math.random() * maxIdx)].id,
    }));
    persistAssignments(plan, 'Random Shuffle');
  };

  const handleSingleCandidateFlowChange = (candidateId: string, flowId: number) => {
    persistAssignments([{ candidateId: Number(candidateId), vacancyPipelineFlowId: flowId }], 'Pipeline Flow Assignment');
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    const pageIds = paginatedCandidates.map((c) => c.id);
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const isAllPageSelected = paginatedCandidates.length > 0 && paginatedCandidates.every((c) => selectedIds.includes(c.id));
  const busy = isAssigning || isBulkRunning;

  return (
    <div className="flex flex-col gap-4">
      {flowOptions.length === 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-700 font-semibold flex items-center gap-2">
          <Icon name="alert-triangle" size="xs" />
          <span>No pipeline flow version has been configured for this vacancy yet — add one in the Flow Versions tab before assigning candidates.</span>
        </div>
      )}

      {/* Single-Line Compact Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] py-2.5 px-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-2xs">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] font-heading">
            Bulk Candidate Pipeline Flow Assignment
          </h3>
          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
            {candidates.length} Candidates &middot; {unassignedCandidates.length} Unassigned
          </span>
        </div>

        {/* Action Buttons: 50/50 & Randomize + Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleApply5050Split}
            disabled={busy || unassignedCandidates.length === 0 || flowOptions.length === 0}
            className="h-8 px-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11.5px] font-bold shadow-xs hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="grid" size="xs" />
            <span>50 / 50 Split</span>
          </button>

          <button
            type="button"
            onClick={handleApplyRandomShuffle}
            disabled={busy || unassignedCandidates.length === 0 || flowOptions.length === 0}
            className="h-8 px-3 rounded-full bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-default)] text-[11.5px] font-bold shadow-2xs hover:bg-[var(--surface-hover)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="arrow-up-down" size="xs" className="text-indigo-600" />
            <span>Randomize Split</span>
          </button>

          {/* Search */}
          <div className="relative flex items-center h-8 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)]">
            <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
            <input
              type="search"
              placeholder="Search candidate..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent outline-none text-[11.5px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] w-36"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface-1)] shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-mono font-bold uppercase text-[10.5px]">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={(e) => handleSelectAllOnPage(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Candidate Code & Name</th>
              <th className="py-3 px-4">Email / Phone</th>
              <th className="py-3 px-4">Pipeline Flow Version</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)] font-medium text-[var(--text-primary)]">
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[var(--text-tertiary)] font-mono">
                  Loading candidates from database...
                </td>
              </tr>
            )}
            {!isLoading && paginatedCandidates.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[var(--text-tertiary)] font-mono">
                  No candidates found for this vacancy.
                </td>
              </tr>
            )}
            {!isLoading &&
              paginatedCandidates.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <tr key={c.id} className={`hover:bg-[var(--surface-hover)] transition-colors ${isSelected ? 'bg-[var(--accent-indigo-dim)]' : ''}`}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds((prev) => [...prev, c.id]);
                          else setSelectedIds((prev) => prev.filter((id) => id !== c.id));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      <div className="flex flex-col">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{c.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                      <div className="flex flex-col">
                        <span>{c.email}</span>
                        {c.phone && <span className="text-[10px] text-[var(--text-tertiary)]">{c.phone}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {c.hasPipelineFlowAssigned ? (
                        <span className="text-[11px] font-mono font-semibold text-[var(--text-tertiary)]">
                          Locked — already started
                        </span>
                      ) : flowOptions.length === 0 ? (
                        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">No flow configured</span>
                      ) : (
                        <CustomSelect
                          placeholder="Assign a flow…"
                          value=""
                          onChange={(val) => val && handleSingleCandidateFlowChange(c.id, Number(val))}
                          options={flowOptions.map((fv) => ({ value: String(fv.id), label: fv.versionName }))}
                          widthClass="w-72"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.hasPipelineFlowAssigned
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Table Pagination Footer */}
        {filtered.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filtered.length}
            rowsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(newSize: number) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

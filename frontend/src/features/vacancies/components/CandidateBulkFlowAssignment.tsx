'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CandidateBulkItem } from '../types/vacancy.types';
import { useGetCandidatesQuery } from '@/store/services/api';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { TablePagination } from '@/features/dashboard/shared/TablePagination';
import { INITIAL_FLOW_VERSIONS } from './PipelineFlowVersions';

interface CandidateBulkFlowAssignmentProps {
  vacancyId?: string | number;
  vacancyTitle?: string;
}

export const CandidateBulkFlowAssignment: React.FC<CandidateBulkFlowAssignmentProps> = ({
  vacancyId,
  vacancyTitle,
}) => {
  const numVacId = vacancyId ? parseInt(String(vacancyId).replace(/\D/g, ''), 10) : undefined;
  const { data: candidatesRes, isLoading } = useGetCandidatesQuery(numVacId ? { vacancyId: numVacId } : undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic flow version names created in earlier steps
  const flowVersionNames = useMemo(() => {
    return INITIAL_FLOW_VERSIONS.map((fv) => fv.versionName);
  }, []);

  // State to hold permanent flow version per candidate ID
  const [flowAssignments, setFlowAssignments] = useState<Record<string, string>>({});

  const rawCandidates = useMemo(() => {
    let list = candidatesRes?.data || [];
    if (vacancyId) {
      list = list.filter((c: any) => {
        return c.vacancyId !== null && c.vacancyId !== undefined && (String(c.vacancyId) === String(vacancyId) || String(c.vacancyId) === String(numVacId));
      });
    }
    return list;
  }, [candidatesRes, vacancyId, numVacId]);

  // Initialize/sync permanent flow assignments when candidates load
  useEffect(() => {
    if (rawCandidates.length > 0 && typeof window !== 'undefined') {
      setFlowAssignments((prev) => {
        const next = { ...prev };
        rawCandidates.forEach((c: any, idx: number) => {
          const cid = String(c.id || idx + 1);
          // Read permanent assignment from localStorage if exists
          const saved = localStorage.getItem(`step_candidate_flow_${cid}`);
          if (saved) {
            next[cid] = saved;
          } else if (!next[cid]) {
            // Default 50/50 split assignment
            const defaultFlow = idx % 2 === 0 ? flowVersionNames[0] : (flowVersionNames[1] || flowVersionNames[0]);
            next[cid] = defaultFlow;
            localStorage.setItem(`step_candidate_flow_${cid}`, defaultFlow);
          }
        });
        return next;
      });
    }
  }, [rawCandidates, flowVersionNames]);

  const candidates: CandidateBulkItem[] = useMemo(() => {
    return rawCandidates.map((c: any, index: number) => {
      const cid = String(c.id || index + 1);
      return {
        id: cid,
        code: c.candidateCode || `CND-2026-${cid}`,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Candidate',
        email: c.email || '',
        phone: c.phone || '',
        appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
        flowVersion: flowAssignments[cid] || flowVersionNames[0],
        status: 'Assigned',
      };
    });
  }, [rawCandidates, flowAssignments, flowVersionNames]);

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

  // 1. Apply Permanent 50/50 Equal Split Strategy
  const handleApply5050Split = () => {
    if (candidates.length === 0) return;
    const next: Record<string, string> = {};
    candidates.forEach((c, idx) => {
      const targetFlow = idx % 2 === 0 ? flowVersionNames[0] : (flowVersionNames[1] || flowVersionNames[0]);
      next[c.id] = targetFlow;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`step_candidate_flow_${c.id}`, targetFlow);
      }
    });
    setFlowAssignments(next);
    toast.success('50/50 Equal Split Applied Permanently!', {
      description: `Distributed ${candidates.length} candidates evenly between ${flowVersionNames[0]} and ${flowVersionNames[1] || flowVersionNames[0]}.`,
    });
  };

  // 2. Apply Permanent Random / Shuffle Split Strategy
  const handleApplyRandomShuffle = () => {
    if (candidates.length === 0) return;
    const next: Record<string, string> = {};
    const maxIdx = Math.min(2, flowVersionNames.length);
    candidates.forEach((c) => {
      const randomIdx = Math.floor(Math.random() * maxIdx);
      const targetFlow = flowVersionNames[randomIdx] || flowVersionNames[0];
      next[c.id] = targetFlow;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`step_candidate_flow_${c.id}`, targetFlow);
      }
    });
    setFlowAssignments(next);
    toast.success('Random Pipeline Shuffle Applied Permanently!', {
      description: `Shuffled pipeline flow assignments randomly across all ${candidates.length} candidates.`,
    });
  };

  const handleSingleCandidateFlowChange = (candidateId: string, newVersion: string) => {
    setFlowAssignments((prev) => ({
      ...prev,
      [candidateId]: newVersion,
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`step_candidate_flow_${candidateId}`, newVersion);
    }
    toast.success('Candidate Permanent Flow Version Updated', {
      description: `Flow set to "${newVersion}".`,
    });
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

  return (
    <div className="flex flex-col gap-4">
      {/* Single-Line Compact Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] py-2.5 px-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-2xs">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] font-heading">
            Bulk Candidate Pipeline Flow Assignment
          </h3>
          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {candidates.length} Walk-in Candidates
          </span>
        </div>

        {/* Action Buttons: 50/50 & Randomize + Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleApply5050Split}
            className="h-8 px-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11.5px] font-bold shadow-xs hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Icon name="grid" size="xs" />
            <span>50 / 50 Split</span>
          </button>

          <button
            type="button"
            onClick={handleApplyRandomShuffle}
            className="h-8 px-3 rounded-full bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-default)] text-[11.5px] font-bold shadow-2xs hover:bg-[var(--surface-hover)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
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
              <th className="py-3 px-4">Assigned Pipeline Version</th>
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
                  <tr key={c.id} className={`hover:bg-[var(--surface-hover)] transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}>
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
                      <CustomSelect
                        value={c.flowVersion}
                        onChange={(newVersion) => handleSingleCandidateFlowChange(c.id, newVersion)}
                        options={flowVersionNames.map((fv) => ({ value: fv, label: fv }))}
                        widthClass="w-72"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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

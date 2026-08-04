'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CandidateBulkItem } from '../types/vacancy.types';
import { useGetCandidatesQuery } from '@/store/services/api';

export const CandidateBulkFlowAssignment: React.FC = () => {
  const { data: candidatesRes, isLoading } = useGetCandidatesQuery();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const candidates: CandidateBulkItem[] = useMemo(() => {
    return (candidatesRes?.data || []).map((c: any, index: number) => ({
      id: String(c.id || index + 1),
      code: c.candidateCode || `CND-2026-${c.id || index + 1}`,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Candidate',
      email: c.email || '',
      phone: c.phone || '',
      appliedDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
      flowVersion: 'Version A (Standard 3-Round)',
      status: 'Assigned',
    }));
  }, [candidatesRes]);

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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-2xs">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">
            Bulk Candidate Pipeline Flow Assignment
          </h3>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {candidates.length} Total Candidates
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center h-8 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)]">
            <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
            <input
              type="search"
              placeholder="Search candidate name, code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent outline-none text-[11.5px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] w-48"
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
              <th className="py-3 px-4">Email</th>
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
                  No candidates found in database.
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
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-indigo-700">{c.flowVersion}</td>
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
      </div>
    </div>
  );
};

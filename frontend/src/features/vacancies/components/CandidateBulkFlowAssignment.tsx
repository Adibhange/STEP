'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { generateMockCandidates, distributeRandomABFlows } from '../utils/candidateGenerator';
import { CandidateBulkItem } from '../types/vacancy.types';

export const CandidateBulkFlowAssignment: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateBulkItem[]>(() => generateMockCandidates(500));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Pagination State (Handles 500+ candidates smoothly without overflow)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [candidates, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // 1-Click 50/50 Random A/B Flow Distribution
  const handleRandomABSplitAll = () => {
    const updated = distributeRandomABFlows(candidates);
    setCandidates(updated);
    toast.success('Random A/B Split Applied', {
      description: 'Flow tracks randomly distributed 50/50 across candidates.',
    });
  };

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col gap-4 w-full">
      {/* Top Header & Actions Bar — single unified row */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4 flex-wrap">
        {/* Left: Title + Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading whitespace-nowrap">
            Candidates Directory & Flow Assignment
          </h3>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs whitespace-nowrap shrink-0">
            {candidates.length} Total
          </span>
        </div>

        {/* Right: Search + A/B Split Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative w-52">
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
              <Icon name="search" size="xs" />
            </div>
          </div>

          {/* 1-Click A/B Split */}
          <button
            type="button"
            onClick={handleRandomABSplitAll}
            className="h-9 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-[12px] shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Icon name="check" size="xs" />
            <span>Random A/B Split All</span>
          </button>
        </div>
      </div>

      {/* 500+ Candidates Fixed Height Scrollable Table Container */}
      <div className="border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--surface-1)] shadow-2xs relative">
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse table-fixed">
            {/* Explicit Column Width Balancing */}
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>

            <thead className="bg-[var(--surface-2)] border-b border-[var(--border-default)] text-[11px] font-extrabold uppercase font-mono text-[var(--text-tertiary)] sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-[var(--accent-indigo)] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Candidate Name & ID</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Applied Date</th>
                <th className="py-2.5 px-3">Assigned Flow Version</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-default)] text-[12.5px] font-sans">
              {paginatedCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(cand.id)}
                      onChange={() => handleSelectOne(cand.id)}
                      className="accent-[var(--accent-indigo)] cursor-pointer"
                    />
                  </td>
                  <td className="py-2 px-3 font-bold text-[var(--text-primary)] truncate">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-mono font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {cand.name.charAt(0)}
                      </span>
                      <div className="truncate">
                        <div className="truncate">{cand.name}</div>
                        <div className="text-[10.5px] font-mono text-[var(--text-tertiary)] font-normal truncate">{cand.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-[var(--text-secondary)] font-mono text-[11.5px] truncate">{cand.email}</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)] font-mono text-[11.5px] truncate">{cand.appliedDate}</td>
                  <td className="py-2 px-3 truncate">
                    <span className="inline-block max-w-full text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 truncate">
                      {cand.flowVersion}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                      {cand.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-[var(--surface-2)] border-t border-[var(--border-default)] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-bold text-[var(--text-primary)] outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 text-[11.5px] font-mono">
              Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} candidates
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Previous
            </button>

            <span className="px-2 font-mono text-[11.5px] font-bold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-bold disabled:opacity-40 hover:bg-[var(--surface-hover)] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

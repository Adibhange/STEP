"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/design-system";
import { FilterBar } from "../shared/FilterBar";
import { TablePagination } from "../shared/TablePagination";
import { CandidateTable } from "./CandidateTable";
import { AddCandidateDialog } from "./AddCandidateDialog";
import { CANDIDATE_FILTERS, type FilterDef } from "../config/candidateFilters";
import { useGetCandidatesQuery } from "@/store/services/api";
import { toast } from "@/design-system/feedback/toast";
import { exportCandidatesToExcel } from "./utils/candidateExcelExporter";
import type { ActiveFilter } from "../shared/FilterBar";
import type { DashboardCandidate } from "@/features/dashboard/types/dashboard.types";

const ROWS_PER_PAGE_DEFAULT = 10;

/**
 * STEP Enterprise CandidateWorkspace
 *
 * Sourced 100% dynamically from backend candidates API.
 */
export const CandidateWorkspace: React.FC = () => {
  const router = useRouter();
  const { data: apiCandidatesResponse, isLoading } = useGetCandidatesQuery();

  const apiCandidates: DashboardCandidate[] = useMemo(() => {
    return (apiCandidatesResponse?.data || []).map((c: any, index: number) => ({
      id:
        typeof c.id === "number" || typeof c.id === "string" ? c.id : index + 1,
      code: c.candidateCode || `CND-2026-${c.id || index + 1}`,
      name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Candidate",
      email: c.email || "",
      mobile: c.phone || "",
      role: c.vacancyTitle || c.role || "Applicant",
      experience: c.experienceYears ? `${c.experienceYears} Years` : "0 Years",
      experienceYears: c.experienceYears || 0,
      source: (c.registrationChannel === "Walk-in"
        ? "WalkIn"
        : "HomeTest") as any,
      stage: (c.currentStage || "Screening") as any,
      currentRound: (c.currentStage || "Screening") as any,
      assignedInterviewer: c.assignedInterviewer || "Unassigned",
      status: (c.status || "In-Progress") as any,
      hiringLocation: c.hiringLocation || c.currentLocation || "Primary Center",
      testLocation: c.testLocation || c.currentLocation || "Test Center",
      riskScore: 0,
      city: c.currentLocation || "",
      appliedDate: c.createdAt
        ? new Date(c.createdAt).toISOString().split("T")[0]
        : "",
    }));
  }, [apiCandidatesResponse]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_DEFAULT);

  const handleFilterChange = useCallback((filterId: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setActiveFilters({});
    setSearch("");
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  // Dynamic filter configuration derived from actual DB candidate records
  const dynamicFilters = useMemo<FilterDef[]>(() => {
    const rolesSet = new Set<string>();
    const stagesSet = new Set<string>();
    const hiringLocsSet = new Set<string>();
    const testLocsSet = new Set<string>();
    const statusesSet = new Set<string>();

    apiCandidates.forEach((c) => {
      if (c.role) rolesSet.add(c.role.trim());
      if (c.stage) stagesSet.add(c.stage.trim());
      if (c.hiringLocation) hiringLocsSet.add(c.hiringLocation.trim());
      if (c.testLocation) testLocsSet.add(c.testLocation.trim());
      if (c.status) statusesSet.add(c.status.trim());
    });

    // Populate standard options if dataset is sparse
    ['Applied', 'In-Progress', 'Offered', 'On Hold', 'Rejected', 'Hired'].forEach((s) => statusesSet.add(s));
    ['Registered', 'Screening', 'Assessment', 'Interview', 'HR Round', 'Director Round'].forEach((st) => stagesSet.add(st));

    return [
      {
        id: 'role',
        label: 'Role',
        placeholder: 'All Roles',
        type: 'select',
        options: Array.from(rolesSet).sort().map((r) => ({ value: r, label: r })),
      },
      {
        id: 'stage',
        label: 'Stage',
        placeholder: 'All Stages',
        type: 'select',
        options: Array.from(stagesSet).sort().map((s) => ({ value: s, label: s })),
      },
      {
        id: 'hiringLocation',
        label: 'Hiring Location',
        placeholder: 'All Cities',
        type: 'select',
        options: Array.from(hiringLocsSet).sort().map((l) => ({ value: l, label: l })),
      },
      {
        id: 'testLocation',
        label: 'Test Location',
        placeholder: 'All Centers',
        type: 'select',
        options: Array.from(testLocsSet).sort().map((l) => ({ value: l, label: l })),
      },
      {
        id: 'status',
        label: 'Status',
        placeholder: 'All Statuses',
        type: 'select',
        options: Array.from(statusesSet).sort().map((st) => ({ value: st, label: st })),
      },
      {
        id: 'appliedDate',
        label: 'Applied Date',
        placeholder: 'Any Date',
        type: 'date-range',
      },
    ];
  }, [apiCandidates]);

  // Client-side filtering over database response
  const filteredCandidates = useMemo<DashboardCandidate[]>(() => {
    let result = apiCandidates;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q),
      );
    }

    if (activeFilters.role) {
      const targetRole = activeFilters.role.toLowerCase().trim();
      result = result.filter((c) => (c.role || '').toLowerCase().trim() === targetRole);
    }
    if (activeFilters.stage) {
      const targetStage = activeFilters.stage.toLowerCase().trim();
      result = result.filter((c) => (c.stage || '').toLowerCase().trim() === targetStage);
    }
    if (activeFilters.hiringLocation) {
      const targetHiringLoc = activeFilters.hiringLocation.toLowerCase().trim();
      result = result.filter((c) => (c.hiringLocation || '').toLowerCase().trim() === targetHiringLoc);
    }
    if (activeFilters.testLocation) {
      const targetTestLoc = activeFilters.testLocation.toLowerCase().trim();
      result = result.filter((c) => (c.testLocation || '').toLowerCase().trim() === targetTestLoc);
    }
    if (activeFilters.status) {
      const targetStatus = activeFilters.status.toLowerCase().trim();
      result = result.filter((c) => (c.status || '').toLowerCase().trim() === targetStatus);
    }
    if (activeFilters.appliedDate) {
      result = result.filter((c) => c.appliedDate >= activeFilters.appliedDate);
    }

    return result;
  }, [search, activeFilters, apiCandidates]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / rowsPerPage),
  );
  const paginatedCandidates = useMemo(
    () =>
      filteredCandidates.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
      ),
    [filteredCandidates, currentPage, rowsPerPage],
  );

  const filterKey = `${currentPage}-${JSON.stringify(activeFilters)}-${search}`;

  return (
    <section
      className="bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-[var(--shadow-xs)] flex flex-col relative z-0"
      aria-label="Candidate workspace"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--border-default)] bg-[var(--surface-1)] rounded-t-[var(--radius-lg)] relative z-30 overflow-visible min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <h2 className="text-sm sm:text-[var(--type-h3-size)] font-extrabold text-[var(--text-primary)] tracking-tight font-heading">
            Candidates
          </h2>
          <span className="text-[11px] sm:text-[11.5px] font-extrabold text-[var(--text-on-accent)] bg-[var(--accent-indigo)] px-2 sm:px-2.5 py-0.5 rounded-full font-mono shadow-2xs shrink-0">
            {filteredCandidates.length}
          </span>
        </div>

        <div className="flex-1 min-w-0 relative hidden md:block">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[var(--surface-1)] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--surface-1)] to-transparent z-10" />
          <div className="overflow-x-auto scrollbar-none flex items-center gap-2 px-1 relative z-20">
            <FilterBar
              filters={dynamicFilters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
              resultCount={filteredCandidates.length}
              totalCount={apiCandidates.length}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`relative flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full border
              transition-all duration-150 ease-out w-28 sm:w-44 md:w-52 xl:w-64 shrink-0
              ${
                searchFocused
                  ? "border-[var(--border-focus)] shadow-[0_0_0_3px_var(--focus-glow)] bg-[var(--surface-1)]"
                  : "border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--surface-2)]"
              }`}
          >
            <Icon
              name="search"
              size="xs"
              className={`shrink-0 transition-opacity duration-150 ${searchFocused ? "opacity-100 text-[var(--accent-indigo)]" : "opacity-60 text-[var(--text-tertiary)]"}`}
            />
            <input
              type="search"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent border-none outline-none text-[11.5px] md:text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] min-w-0 font-sans"
              aria-label="Search candidates"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="text-(--text-tertiary) hover:text-(--text-primary) transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <Icon
                  name="x"
                  size="xs"
                />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--border-default)] text-[9.5px] font-mono font-bold text-[var(--text-tertiary)] shrink-0">
                ⌘K
              </kbd>
            )}
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const listToExport = (apiCandidatesResponse?.data || filteredCandidates || []);
                await exportCandidatesToExcel(listToExport);
                toast.success("Candidates Exported", {
                  description: `Successfully generated Excel workbook for ${listToExport.length} candidate(s).`,
                });
              } catch (err: any) {
                toast.error("Export Failed", {
                  description: err?.message || "Failed to generate Excel export.",
                });
              }
            }}
            className="h-8 w-8 sm:w-auto px-0 sm:px-3 flex items-center justify-center gap-2 rounded-full border border-[var(--border-default)]
              text-[12px] font-semibold text-[var(--text-primary)] bg-[var(--surface-1)]
              hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] hover:-translate-y-[1px] hover:shadow-xs active:scale-[0.98]
              transition-all duration-150 focus-ring-step cursor-pointer shrink-0"
            aria-label="Export candidates to Excel (.xlsx)"
            title="Export candidates to Excel (.xlsx)"
          >
            <span className="w-4 h-4 rounded-[3px] bg-[#107C41] text-white font-mono font-black text-[9.5px] flex items-center justify-center shrink-0 leading-none shadow-2xs">
              X
            </span>
            <span className="hidden sm:inline">Export .xlsx</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 w-8 sm:w-auto px-0 sm:px-3.5 flex items-center justify-center gap-1.5 rounded-full
              bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-[1px] active:scale-[0.98]
              text-[12px] font-bold transition-all duration-150 focus-ring-step cursor-pointer shrink-0 border-none"
            aria-label="Add new candidate"
            title="Add new candidate"
          >
            <Icon
              name="plus"
              size="xs"
            />
            <span className="whitespace-nowrap hidden sm:inline">
              Add Candidate
            </span>
          </button>
        </div>
      </div>

      <div className="md:hidden border-b border-[var(--border-default)] bg-[var(--surface-1)]">
        <div className="overflow-x-auto scrollbar-none flex items-center gap-2 px-4 py-2.5">
          <FilterBar
            filters={dynamicFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
            resultCount={filteredCandidates.length}
            totalCount={apiCandidates.length}
          />
        </div>
      </div>

      <div className="relative z-10">
        <CandidateTable
          candidates={paginatedCandidates}
          loading={isLoading}
          filterKey={filterKey}
          onView={(c) => router.push(`/dashboard/candidates/${c.id}`)}
        />
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filteredCandidates.length}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(n) => setRowsPerPage(n)}
      />

      <AddCandidateDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </section>
  );
};

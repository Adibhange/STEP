'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { TablePagination } from '@/features/dashboard/shared/TablePagination';
import { CandidateProgressModal } from '@/features/dashboard/candidates/CandidateProgressModal';
import type { DashboardCandidate } from '@/features/dashboard/types/dashboard.types';
import type { VacancyItem } from '../types/vacancy.types';

interface VacancyCandidatesTabProps {
  vacancy: VacancyItem;
}

interface CandidateRow {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  score: number | null;
  aptitudeScore?: number | null;
  technicalScore?: number | null;
  currentRoundName: string;
  currentRoundScore: number | null;
  currentRoundStatus: 'Passed' | 'Failed' | 'In-Progress';
  status: string;
  registeredAt: string;
  rawTime: number;
  sourceChannel?: string;
  isTechAuthorized?: boolean;
}

// Generate realistic unique 128 candidates matching the Drive count
const generateCandidatesDataset = (): CandidateRow[] => {
  const FIRST_NAMES = [
    'Aditya', 'Rohan', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rahul',
    'Pooja', 'Karan', 'Neha', 'Siddharth', 'Divya', 'Manish', 'Kavita', 'Suresh',
    'Deepak', 'Meera', 'Gaurav', 'Shweta', 'Tanvi', 'Varun', 'Nikhil', 'Isha',
    'Arjun', 'Bhavna', 'Chetan', 'Geeta', 'Harish', 'Jyoti', 'Kapil', 'Lata',
    'Mayur', 'Nandini', 'Omkar', 'Pranav', 'Ritu', 'Sameer', 'Tarun', 'Umesh',
    'Vandana', 'Yash', 'Zoya', 'Alok', 'Barkha', 'Dev', 'Esha', 'Farhan'
  ];

  const LAST_NAMES = [
    'Bhange', 'Deshmukh', 'Sharma', 'Patel', 'Kulkarni', 'Joshi', 'Verma', 'Nair',
    'Iyer', 'Mehta', 'Gupta', 'Rao', 'Reddy', 'Singh', 'Chauhan', 'Pandey',
    'Kadam', 'Bhide', 'Shinde', 'Pawar', 'Bhat', 'Dube', 'Gokhale', 'Jadhav',
    'Kamble', 'Lohar', 'Mishra', 'Navale', 'Oak', 'Paranjpe', 'Rane', 'Sawant',
    'Trivedi', 'Upadhyay', 'Vaidya', 'Wagh', 'Yadav', 'Zende', 'Bose', 'Chatterjee'
  ];

  const rows: CandidateRow[] = [];

  for (let i = 1; i <= 128; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const exp = Number((1.5 + ((i * 3.7) % 8.5)).toFixed(1));

    let currentRoundName = 'Round 1: Aptitude (Elimination)';
    let currentRoundScore: number | null = null;
    let currentRoundStatus: 'Passed' | 'Failed' | 'In-Progress' = 'In-Progress';
    let status = 'In Screening';
    let aptScore: number | null = null;
    let techScore: number | null = null;
    let isTechAuthorized = false;

    if (i <= 18) {
      // Cleared Aptitude, awaiting HR Tech Authorization
      currentRoundName = 'Round 2: Technical Assessment';
      aptScore = 78 + (i % 18);
      currentRoundScore = aptScore;
      currentRoundStatus = 'Passed';
      status = 'Awaiting Tech Auth';
      isTechAuthorized = false;
    } else if (i <= 41) {
      // In Test (either currently taking Aptitude or Tech)
      currentRoundName = i % 2 === 0 ? 'Round 1: Aptitude (Elimination)' : 'Round 2: Technical Assessment';
      currentRoundStatus = 'In-Progress';
      status = i % 2 === 0 ? 'Taking Aptitude Test' : 'Taking Technical Test';
      isTechAuthorized = i % 2 !== 0;
    } else if (i <= 53) {
      // Eliminated in Aptitude
      currentRoundName = 'Round 1: Aptitude (Elimination)';
      currentRoundScore = 45 + (i % 22);
      currentRoundStatus = 'Failed';
      status = 'Eliminated (Aptitude)';
      aptScore = currentRoundScore;
    } else if (i <= 118) {
      // Interview Stage
      currentRoundName = 'Round 3: Tech Interview';
      currentRoundScore = 80 + (i % 16);
      currentRoundStatus = 'Passed';
      status = 'Interview Scheduled';
      aptScore = 85 + (i % 10);
      techScore = currentRoundScore;
      isTechAuthorized = true;
    } else {
      // Offered
      currentRoundName = 'Round 4: Executive Decision';
      currentRoundScore = 92 + (i % 7);
      currentRoundStatus = 'Passed';
      status = 'Offered';
      aptScore = 94;
      techScore = 91;
      isTechAuthorized = true;
    }

    const hour = 9 + Math.floor(((i * 7) % 180) / 45);
    const min = (i * 13) % 60;
    const timeStr = `Today, ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;

    rows.push({
      id: i,
      code: `CWD-2026-${1000 + i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      phone: `+91 98${(10000000 + i * 83719).toString().slice(0, 8)}`,
      experienceYears: exp,
      score: currentRoundScore,
      aptitudeScore: aptScore,
      technicalScore: techScore,
      currentRoundName,
      currentRoundScore,
      currentRoundStatus,
      status,
      registeredAt: timeStr,
      rawTime: hour * 100 + min,
      sourceChannel: i % 5 === 0 ? 'Direct Sourced' : 'Walk-in QR',
      isTechAuthorized,
    });
  }

  return rows;
};

export const VacancyCandidatesTab: React.FC<VacancyCandidatesTabProps> = ({ vacancy }) => {
  const router = useRouter();
  const isDirectHiring = vacancy.driveType === 'Direct / Sourced Hiring';

  // Candidate Data State (mutable for authorizing rounds)
  const [candidates, setCandidates] = useState<CandidateRow[]>(() => generateCandidatesDataset());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AWAITING_AUTH' | 'IN_TEST' | 'INTERVIEW' | 'OFFERED' | 'ELIMINATED'>('ALL');
  const [sortBy, setSortBy] = useState<'time' | 'score' | 'exp' | 'name'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Candidate Progress Modal state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  // Dynamic filter counts
  const filterCounts = useMemo(() => ({
    all: candidates.length,
    awaitingAuth: candidates.filter((c) => c.status === 'Awaiting Tech Auth').length,
    inTest: candidates.filter((c) => c.currentRoundStatus === 'In-Progress' || c.status.includes('Taking')).length,
    interview: candidates.filter((c) => c.status.includes('Interview')).length,
    offered: candidates.filter((c) => c.status === 'Offered').length,
    eliminated: candidates.filter((c) => c.status.includes('Eliminated') || c.currentRoundStatus === 'Failed').length,
  }), [candidates]);

  // Filtered and sorted candidates
  const processedCandidates = useMemo(() => {
    let result = candidates.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      switch (statusFilter) {
        case 'AWAITING_AUTH':
          return c.status === 'Awaiting Tech Auth';
        case 'IN_TEST':
          return c.currentRoundStatus === 'In-Progress' || c.status.includes('Taking');
        case 'INTERVIEW':
          return c.status.includes('Interview');
        case 'OFFERED':
          return c.status === 'Offered';
        case 'ELIMINATED':
          return c.status.includes('Eliminated') || c.currentRoundStatus === 'Failed';
        case 'ALL':
        default:
          return true;
      }
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'time') {
        cmp = (a.rawTime || 0) - (b.rawTime || 0);
      } else if (sortBy === 'score') {
        cmp = (a.currentRoundScore ?? -1) - (b.currentRoundScore ?? -1);
      } else if (sortBy === 'exp') {
        cmp = a.experienceYears - b.experienceYears;
      } else if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [candidates, searchQuery, statusFilter, sortBy, sortOrder]);

  // Paginated slice
  const totalPages = Math.ceil(processedCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCandidates.slice(start, start + pageSize);
  }, [processedCandidates, currentPage, pageSize]);

  // ── Multi-Select Handlers ───────────────────────────────────────────────────
  const handleToggleSelectAll = () => {
    if (selectedIds.size === processedCandidates.length && processedCandidates.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedCandidates.map((c) => c.id)));
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Compute how many selected candidates are eligible for Round 2 (passed Aptitude >= 70% and not already authorized)
  const eligibleSelectedCandidates = useMemo(() => {
    return candidates.filter(
      (c) =>
        selectedIds.has(c.id) &&
        !c.isTechAuthorized &&
        c.aptitudeScore !== null &&
        (c.aptitudeScore ?? 0) >= 70 &&
        !c.status.includes('Eliminated') &&
        !c.status.includes('Interview') &&
        c.status !== 'Offered'
    );
  }, [candidates, selectedIds]);

  // ── Single & Bulk Authorize Technical Round ─────────────────────────────────
  const handleAuthorizeSingle = (candidate: CandidateRow) => {
    if (candidate.aptitudeScore !== null && (candidate.aptitudeScore ?? 0) < 70) {
      toast.error('Cannot Authorize', {
        description: `${candidate.name} scored ${candidate.aptitudeScore}% (below 70% cutoff).`,
      });
      return;
    }

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? {
              ...c,
              isTechAuthorized: true,
              status: 'Tech Round Authorized',
              currentRoundName: 'Round 2: Technical Assessment',
            }
          : c
      )
    );
    toast.success('Technical Round Authorized', {
      description: `Unlocked Round 2 for ${candidate.name}. Candidate can now start Technical Assessment.`,
    });
  };

  const handleBulkAuthorize = () => {
    const eligibleIds = new Set(eligibleSelectedCandidates.map((c) => c.id));
    const count = eligibleIds.size;
    if (count === 0) {
      toast.error('No Eligible Candidates', {
        description: 'Selected candidates have either not passed Aptitude (Cutoff: 70%) or are already authorized.',
      });
      return;
    }

    setCandidates((prev) =>
      prev.map((c) =>
        eligibleIds.has(c.id)
          ? {
              ...c,
              isTechAuthorized: true,
              status: 'Tech Round Authorized',
              currentRoundName: 'Round 2: Technical Assessment',
            }
          : c
      )
    );

    setSelectedIds(new Set());
    toast.success('Bulk Authorization Complete', {
      description: `Successfully authorized Technical Round for ${count} eligible candidate${count > 1 ? 's' : ''}!`,
    });
  };

  const handleFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleLiveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Live Sync Complete', { description: 'Roster synced with live assessment engine.' });
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Candidate Code', 'Name', 'Email', 'Phone', 'Experience (Yrs)', 'Registered At', 'Current Round', 'Score (%)', 'Status'];
    const rows = processedCandidates.map((c) => [
      c.code,
      `"${c.name}"`,
      c.email,
      c.phone,
      c.experienceYears,
      `"${c.registeredAt}"`,
      `"${c.currentRoundName}"`,
      c.currentRoundScore ?? 'In-Progress',
      `"${c.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Drive_Candidates_${vacancy.id || '2026'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Exported', { description: `Exported ${processedCandidates.length} candidate records.` });
  };

  const dashboardCandidateModalData: DashboardCandidate | null = useMemo(() => {
    if (!selectedCandidate) return null;
    return {
      id: selectedCandidate.id,
      code: selectedCandidate.code,
      name: selectedCandidate.name,
      email: selectedCandidate.email,
      mobile: selectedCandidate.phone,
      role: vacancy.title || 'Senior .NET Architect',
      experience: `${selectedCandidate.experienceYears} Yrs`,
      experienceYears: selectedCandidate.experienceYears,
      source: 'WalkIn',
      stage: selectedCandidate.status.includes('Interview') ? 'Technical' : selectedCandidate.status === 'Offered' ? 'Offered' : 'Screening',
      currentRound: selectedCandidate.currentRoundName,
      assignedInterviewer: 'Evaluator Panel',
      status: selectedCandidate.status.includes('Eliminated') ? 'Rejected' : selectedCandidate.status === 'Offered' ? 'Offered' : 'Screening',
      hiringLocation: vacancy.hiringLocation || 'Pune Center',
      testLocation: vacancy.testLocation || 'Walk-in Drive Venue',
      riskScore: 0,
      city: 'Pune',
      appliedDate: selectedCandidate.registeredAt,
    };
  }, [selectedCandidate, vacancy]);

  const filterTabs: { id: typeof statusFilter; label: string; count: number; badgeStyle?: string }[] = [
    { id: 'ALL', label: 'All Candidates', count: filterCounts.all },
    { id: 'AWAITING_AUTH', label: '⚡ Awaiting Tech Auth', count: filterCounts.awaitingAuth, badgeStyle: 'bg-[var(--accent-indigo)] text-white font-bold' },
    { id: 'IN_TEST', label: 'In Assessment', count: filterCounts.inTest },
    { id: 'INTERVIEW', label: 'Interview Stage', count: filterCounts.interview },
    { id: 'OFFERED', label: 'Offered', count: filterCounts.offered },
    { id: 'ELIMINATED', label: 'Eliminated', count: filterCounts.eliminated },
  ];

  return (
    <div className="space-y-3.5 relative">
      {/* ── 2-Tier Spacious Filter & Toolbar Structure (No Cramping/Cut-offs) ── */}
      <div className="space-y-2.5 bg-[var(--surface-2)] p-3 rounded-2xl border border-[var(--border-default)] shadow-xs">
        {/* Tier 1: Search + Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by candidate name, code, or email..."
              className="w-full h-8.5 pl-8.5 pr-7 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-indigo)] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0.5 rounded-full cursor-pointer"
              >
                <Icon name="x" size="xs" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLiveSync}
              title="Auto-refresh candidate roster"
              className="h-8.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Icon name="refresh" size="xs" className={isSyncing ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
              <span className="font-mono text-[11px]">Live Sync</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              title="Export roster to CSV"
              className="h-8.5 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Icon name="download" size="xs" className="text-[var(--accent-indigo)]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Filter Pills Bar (Never wraps or cuts off) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 pt-0.5 border-t border-[var(--border-soft)]">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                className={`relative px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'border-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] shadow-xs'
                    : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    tab.badgeStyle
                      ? tab.badgeStyle
                      : isActive
                        ? 'bg-[var(--accent-indigo)] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Candidates Table Container ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px] text-left text-xs font-sans border-collapse">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--border-default)] text-[10.5px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider select-none">
              <tr>
                {/* Multi-Select Header Checkbox */}
                <th className="py-3 pl-4 pr-1 w-[4%]">
                  <input
                    type="checkbox"
                    checked={processedCandidates.length > 0 && selectedIds.size === processedCandidates.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent-indigo)] cursor-pointer"
                  />
                </th>

                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-2 w-[26%] font-bold cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Candidate Code & Name</span>
                    {sortBy === 'name' && (
                      <span className="text-[var(--accent-indigo)] font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort('time')}
                  className="py-3 px-2 w-[14%] font-bold cursor-pointer hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{isDirectHiring ? 'Sourced Via' : 'Registered'}</span>
                    {sortBy === 'time' && (
                      <span className="text-[var(--accent-indigo)] font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort('exp')}
                  className="py-3 px-2 w-[9%] font-bold cursor-pointer hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Exp</span>
                    {sortBy === 'exp' && (
                      <span className="text-[var(--accent-indigo)] font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort('score')}
                  className="py-3 px-2 w-[22%] font-bold cursor-pointer hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Assessment Status</span>
                    {sortBy === 'score' && (
                      <span className="text-[var(--accent-indigo)] font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th className="py-3 px-2 w-[13%] font-bold whitespace-nowrap">
                  <span>Hiring Stage</span>
                </th>

                <th className="py-3 pl-2 pr-4 w-[12%] font-bold text-right whitespace-nowrap">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-soft)]">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-tertiary)] text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="search" size="md" className="opacity-40" />
                      <p>No candidates found matching the selected filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('ALL');
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="text-[var(--accent-indigo)] hover:underline text-xs font-semibold mt-1 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  const isAwaitingAuth = c.status === 'Awaiting Tech Auth' || (!c.isTechAuthorized && c.aptitudeScore !== null && (c.aptitudeScore ?? 0) >= 70 && !c.status.includes('Interview') && c.status !== 'Offered');

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-[var(--surface-2)] transition-colors group ${
                        isSelected ? 'bg-[var(--accent-indigo-dim)]/20' : ''
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-2.5 pl-4 pr-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(c.id)}
                          className="w-4 h-4 rounded border-[var(--border-default)] accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </td>

                      {/* Candidate Name & Code */}
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-[var(--text-primary)] text-xs tracking-tight truncate max-w-[190px] group-hover:text-[var(--accent-indigo)] transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                          <span className="font-mono font-medium text-[var(--text-secondary)]">{c.code}</span>
                          <span className="text-[var(--text-tertiary)]/50">•</span>
                          <span className="text-[var(--text-tertiary)] truncate max-w-[120px]">{c.email}</span>
                        </div>
                      </td>

                      {/* Sourced Via OR Registered Time */}
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className="text-[11.5px] text-[var(--text-secondary)] font-mono">
                          {c.registeredAt}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="py-2.5 px-2 text-[var(--text-secondary)] font-mono text-xs whitespace-nowrap">
                        {c.experienceYears} Yrs
                      </td>

                      {/* Assessment Status (Clean logic without overlap bugs) */}
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                            {c.currentRoundName}
                          </div>
                          <div className="mt-0.5">
                            {c.currentRoundStatus === 'Failed' || (c.aptitudeScore !== null && (c.aptitudeScore ?? 0) < 70) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400">
                                <span>Aptitude: {c.aptitudeScore ?? c.currentRoundScore}%</span>
                                <span className="text-[10px] font-sans font-medium">✕ Below Cutoff</span>
                              </span>
                            ) : c.currentRoundStatus === 'In-Progress' || c.status.includes('Taking') ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Assessment In-Progress...</span>
                              </span>
                            ) : c.aptitudeScore !== null ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                                <span>Aptitude: {c.aptitudeScore}%</span>
                                <span className="text-[10px] font-sans font-medium">✓ Cleared</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            c.status === 'Offered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : c.status === 'Awaiting Tech Auth'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
                                : c.status.includes('Interview')
                                  ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--border-default)]'
                                  : c.status.includes('Eliminated')
                                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-default)]'
                          }`}
                        >
                          <span className="truncate max-w-[120px]">{c.status}</span>
                        </span>
                      </td>

                      {/* Actions Column: Authorize Tech OR View Progress */}
                      <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAwaitingAuth ? (
                            <button
                              type="button"
                              onClick={() => handleAuthorizeSingle(c)}
                              title="Authorize candidate for Round 2 Technical Assessment"
                              className="h-7 px-2.5 rounded-lg bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Icon name="zap" size="xs" />
                              <span>Authorize Tech</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCandidate(c);
                              setIsProgressModalOpen(true);
                            }}
                            title="View candidate hiring pipeline progress tracker"
                            className="h-7 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Icon name="list" size="xs" className="text-[var(--text-tertiary)]" />
                            <span>Progress</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Standard STEP Enterprise TablePagination */}
        {processedCandidates.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={processedCandidates.length}
            rowsPerPage={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(rows) => {
              setPageSize(rows);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* ── Floating Bulk Actions Bar (Framer Motion) ───────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--surface-1)] border border-[var(--accent-indigo)] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 text-xs font-semibold"
          >
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-indigo)] text-white text-xs flex items-center justify-center font-mono">
                {selectedIds.size}
              </span>
              <span>
                Candidate{selectedIds.size > 1 ? 's' : ''} Selected
                {eligibleSelectedCandidates.length > 0 ? (
                  <span className="text-emerald-400 font-normal ml-1">
                    ({eligibleSelectedCandidates.length} Passed Aptitude)
                  </span>
                ) : (
                  <span className="text-rose-400 font-normal ml-1">(0 Passed Aptitude)</span>
                )}
              </span>
            </div>

            <div className="h-4 w-px bg-[var(--border-default)]" />

            <button
              type="button"
              disabled={eligibleSelectedCandidates.length === 0}
              onClick={handleBulkAuthorize}
              className="h-8 px-3.5 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Icon name="zap" size="xs" />
              <span>Authorize Technical Round ({eligibleSelectedCandidates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer text-xs font-medium"
            >
              Clear Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Candidate Progress Modal ────────────────────────────────────────── */}
      {isProgressModalOpen && dashboardCandidateModalData && (
        <CandidateProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedCandidate(null);
          }}
          candidate={dashboardCandidateModalData}
          onNavigateToProfile={(candidateId) => {
            router.push(`/dashboard/candidates`);
          }}
        />
      )}
    </div>
  );
};

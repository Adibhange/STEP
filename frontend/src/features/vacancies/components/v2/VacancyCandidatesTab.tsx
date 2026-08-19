'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { TablePagination } from '@/features/dashboard/shared/TablePagination';
import { CandidateProgressModal } from '@/features/dashboard/candidates/CandidateProgressModal';
import type { DashboardCandidate } from '@/features/dashboard/types/dashboard.types';
import type { VacancyItem } from '../../types/vacancy.types';

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

  const rows: CandidateRow[] = [
    {
      id: 1,
      code: 'CWD-2026-1001',
      name: 'Aditya Bhange',
      email: 'aditya.bhange@example.com',
      phone: '+91 98765 43210',
      experienceYears: 4.5,
      score: 88,
      aptitudeScore: 90,
      technicalScore: 88,
      currentRoundName: 'Round 2: Technical Assessment',
      currentRoundScore: 88,
      currentRoundStatus: 'Passed',
      status: 'Round 3: Tech Interview',
      registeredAt: 'Today, 10:15 AM',
      rawTime: 1015,
      sourceChannel: 'Walk-in QR',
    },
    {
      id: 2,
      code: 'CWD-2026-1002',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@example.com',
      phone: '+91 98220 11223',
      experienceYears: 3.0,
      score: 76,
      aptitudeScore: 80,
      technicalScore: 76,
      currentRoundName: 'Round 2: Technical Assessment',
      currentRoundScore: 76,
      currentRoundStatus: 'Passed',
      status: 'Interview Scheduled',
      registeredAt: 'Today, 10:45 AM',
      rawTime: 1045,
      sourceChannel: 'Walk-in QR',
    },
    {
      id: 3,
      code: 'CWD-2026-1003',
      name: 'Priya Sharma',
      email: 'priya.s@example.com',
      phone: '+91 97654 32109',
      experienceYears: 5.0,
      score: 94,
      aptitudeScore: 95,
      technicalScore: 94,
      currentRoundName: 'Round 4: Executive Decision',
      currentRoundScore: 94,
      currentRoundStatus: 'Passed',
      status: 'Offered',
      registeredAt: 'Yesterday, 04:30 PM',
      rawTime: 900,
      sourceChannel: 'LinkedIn Sourced',
    },
    {
      id: 4,
      code: 'CWD-2026-1004',
      name: 'Amit Patel',
      email: 'amit.p@example.com',
      phone: '+91 91234 56780',
      experienceYears: 2.5,
      score: null,
      aptitudeScore: 85,
      technicalScore: null,
      currentRoundName: 'Round 2: Technical Assessment',
      currentRoundScore: null,
      currentRoundStatus: 'In-Progress',
      status: 'Round 2: Technical Test',
      registeredAt: 'Today, 11:20 AM',
      rawTime: 1120,
      sourceChannel: 'Walk-in QR',
    },
    {
      id: 5,
      code: 'CWD-2026-1005',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      phone: '+91 98450 67891',
      experienceYears: 1.5,
      score: 48,
      aptitudeScore: 48,
      technicalScore: null,
      currentRoundName: 'Round 1: Aptitude (Elimination)',
      currentRoundScore: 48,
      currentRoundStatus: 'Failed',
      status: 'Eliminated (Round 1)',
      registeredAt: 'Today, 09:30 AM',
      rawTime: 930,
      sourceChannel: 'Walk-in QR',
    },
    {
      id: 6,
      code: 'CWD-2026-1006',
      name: 'Vikram Joshi',
      email: 'vikram.j@example.com',
      phone: '+91 97230 45612',
      experienceYears: 2.0,
      score: null,
      aptitudeScore: null,
      technicalScore: null,
      currentRoundName: 'Round 1: Aptitude (Elimination)',
      currentRoundScore: null,
      currentRoundStatus: 'In-Progress',
      status: 'Round 1: Aptitude Test',
      registeredAt: 'Today, 11:45 AM',
      rawTime: 1145,
      sourceChannel: 'Walk-in QR',
    },
  ];

  for (let i = 7; i <= 128; i++) {
    const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const exp = Number((1.0 + ((i * 3) % 7) * 0.9).toFixed(1));

    const isEliminated = i % 6 === 0;
    const isInTest = !isEliminated && i % 4 === 0;
    const isOffered = !isEliminated && !isInTest && i % 11 === 0;

    let status = 'Interview Scheduled';
    let currentRoundName = 'Round 2: Technical Assessment';
    let currentRoundScore: number | null = 72 + ((i * 7) % 24);
    let currentRoundStatus: 'Passed' | 'Failed' | 'In-Progress' = 'Passed';
    let aptScore: number | null = 75 + ((i * 5) % 20);
    let techScore: number | null = currentRoundScore;

    if (isEliminated) {
      status = 'Eliminated (Round 1)';
      currentRoundName = 'Round 1: Aptitude (Elimination)';
      currentRoundScore = 42 + (i % 22);
      currentRoundStatus = 'Failed';
      aptScore = currentRoundScore;
      techScore = null;
    } else if (isInTest) {
      if (i % 2 === 0) {
        status = 'Round 2: Technical Test';
        currentRoundName = 'Round 2: Technical Assessment';
        currentRoundScore = null;
        currentRoundStatus = 'In-Progress';
        techScore = null;
      } else {
        status = 'Round 1: Aptitude Test';
        currentRoundName = 'Round 1: Aptitude (Elimination)';
        currentRoundScore = null;
        currentRoundStatus = 'In-Progress';
        aptScore = null;
        techScore = null;
      }
    } else if (isOffered) {
      status = 'Offered';
      currentRoundName = 'Round 4: Executive Decision';
      currentRoundScore = 91 + (i % 8);
      currentRoundStatus = 'Passed';
      aptScore = 94;
      techScore = currentRoundScore;
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
    });
  }

  return rows;
};

const ALL_CANDIDATES = generateCandidatesDataset();

export const VacancyCandidatesTab: React.FC<VacancyCandidatesTabProps> = ({ vacancy }) => {
  const router = useRouter();
  const isDirectHiring = vacancy.driveType === 'Direct / Sourced Hiring';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_TEST' | 'INTERVIEW' | 'OFFERED' | 'ELIMINATED'>('ALL');
  const [sortBy, setSortBy] = useState<'time' | 'score' | 'exp' | 'name'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination state: Default 10 rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Candidate Progress Modal state (reusing the Dashboard View Progress modal)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  // Convert selected CandidateRow to DashboardCandidate format for CandidateProgressModal
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

  // Dynamic filter counts
  const filterCounts = useMemo(() => ({
    all: ALL_CANDIDATES.length,
    inTest: ALL_CANDIDATES.filter((c) => c.currentRoundStatus === 'In-Progress').length,
    interview: ALL_CANDIDATES.filter((c) => c.status.includes('Interview')).length,
    offered: ALL_CANDIDATES.filter((c) => c.status === 'Offered').length,
    eliminated: ALL_CANDIDATES.filter((c) => c.status.includes('Eliminated') || c.currentRoundStatus === 'Failed').length,
  }), []);

  // Filtered and sorted candidates
  const processedCandidates = useMemo(() => {
    let result = ALL_CANDIDATES.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      switch (statusFilter) {
        case 'IN_TEST':
          return c.currentRoundStatus === 'In-Progress';
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
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  // Paginated slice
  const totalPages = Math.ceil(processedCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCandidates.slice(start, start + pageSize);
  }, [processedCandidates, currentPage, pageSize]);

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
      toast.success('Live Sync Complete', { description: 'All candidate assessment scores updated.' });
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

  const getStatusBadge = (status: string) => {
    if (status === 'Offered') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status.includes('Interview')) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    if (status.includes('Round 2')) return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    if (status.includes('Round 1')) return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    if (status.includes('Eliminated') || status.includes('Failed')) return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    return 'bg-surface-3 text-text-tertiary border-border-soft';
  };

  const getStatusDot = (status: string) => {
    if (status === 'Offered') return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />;
    if (status.includes('Interview')) return <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />;
    if (status.includes('Round 2')) return <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />;
    if (status.includes('Round 1')) return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />;
    if (status.includes('Eliminated') || status.includes('Failed')) return <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />;
    return <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />;
  };

  const handleOpenProgress = (candidate: CandidateRow) => {
    setSelectedCandidate(candidate);
    setIsProgressModalOpen(true);
  };

  const filterTabs: { id: typeof statusFilter; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: filterCounts.all },
    { id: 'IN_TEST', label: 'In Test', count: filterCounts.inTest },
    { id: 'INTERVIEW', label: 'Interview Stage', count: filterCounts.interview },
    { id: 'OFFERED', label: 'Offered', count: filterCounts.offered },
    { id: 'ELIMINATED', label: 'Eliminated', count: filterCounts.eliminated },
  ];

  return (
    <div className="space-y-3">
      {/* Top Filter & Toolbar Bar — Responsive Multi-Screen Layout */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-surface-2 p-2 sm:p-2.5 rounded-2xl border border-border-default shadow-xs">
        {/* Search & Actions Row on Mobile */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search candidate..."
              className="w-full h-8 pl-8.5 pr-7 rounded-xl bg-surface-1 border border-border-default text-xs text-text-primary placeholder:text-text-placeholder focus:border-border-focus focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5 rounded-full cursor-pointer"
              >
                <Icon name="x" size="xs" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 lg:hidden">
            <button
              type="button"
              onClick={handleLiveSync}
              title="Live Sync"
              className="h-8 px-2 rounded-xl border border-border-default bg-surface-1 text-text-secondary hover:text-text-primary text-xs flex items-center gap-1"
            >
              <Icon name="refresh" size="xs" className={isSyncing ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              title="Export CSV"
              className="h-8 px-2 rounded-xl border border-border-default bg-surface-1 text-text-primary text-xs flex items-center gap-1"
            >
              <Icon name="download" size="xs" className="text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Filter Pills with Smooth Native Scrolling */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium scrollbar-none pb-0.5">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange(tab.id)}
                className={`relative px-2.5 py-1 rounded-xl border transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1.5 ${
                  isActive
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300 font-semibold shadow-xs'
                    : 'bg-surface-1 text-text-secondary border-border-default hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-surface-3 text-text-tertiary'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Quick Utility Actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLiveSync}
            title="Auto-refresh candidate roster"
            className="h-8 px-2.5 rounded-xl border border-border-default bg-surface-1 hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Icon name="refresh" size="xs" className={isSyncing ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
            <span className="text-[11px] font-mono">Live Sync</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            title="Export full roster to CSV"
            className="h-8 px-3 rounded-xl border border-border-default bg-surface-1 hover:bg-surface-hover text-text-primary text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Icon name="download" size="xs" className="text-indigo-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Candidates Table & Pagination Container — Horizontal Scroll Support on Mobile */}
      <div className="rounded-2xl border border-border-default bg-surface-1 overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[620px] text-left text-xs font-sans border-collapse">
            <thead className="bg-surface-2/95 border-b border-border-default text-[10.5px] font-mono text-text-tertiary uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-2.5 pl-4 pr-2 w-[28%] font-bold cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Candidate Code & Name</span>
                    {sortBy === 'name' && (
                      <span className="text-indigo-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort('time')}
                  className="py-2.5 px-2 w-[14%] font-bold cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{isDirectHiring ? 'Sourced Via' : 'Registered'}</span>
                    {sortBy === 'time' && (
                      <span className="text-indigo-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort('exp')}
                  className="py-2.5 px-2 w-[10%] font-bold cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Exp</span>
                    {sortBy === 'exp' && (
                      <span className="text-indigo-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th
                  onClick={() => toggleSort('score')}
                  className="py-2.5 px-2 w-[24%] font-bold cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Current Evaluation</span>
                    {sortBy === 'score' && (
                      <span className="text-indigo-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>

                <th className="py-2.5 px-2 w-[14%] font-bold whitespace-nowrap">
                  <span>Stage Status</span>
                </th>

                <th className="py-2.5 pl-2 pr-4 w-[10%] font-bold text-right whitespace-nowrap">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            {/* Fast, Clean Table Body Transition */}
            <tbody className="divide-y divide-border-soft">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-text-tertiary text-xs">
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
                        className="text-indigo-400 hover:underline text-xs font-semibold mt-1 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-2/60 transition-colors group"
                  >
                    {/* Candidate Name & Code */}
                    <td className="py-2.5 pl-4 pr-2">
                      <div className="font-semibold text-text-primary text-xs tracking-tight truncate max-w-[190px] group-hover:text-indigo-300 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-text-tertiary flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                        <span className="font-mono font-medium text-text-secondary">{c.code}</span>
                        <span className="text-text-tertiary/50">•</span>
                        <span className="text-text-tertiary truncate max-w-[110px]">{c.email}</span>
                      </div>
                    </td>

                    {/* Sourced Via OR Registered Time */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      {isDirectHiring ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary text-[10.5px] border border-border-soft font-mono">
                          {c.sourceChannel || 'Direct Portal'}
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-text-secondary font-mono">
                          {c.registeredAt}
                        </span>
                      )}
                    </td>

                    {/* Experience */}
                    <td className="py-2.5 px-2 text-text-secondary font-mono text-xs whitespace-nowrap">
                      {c.experienceYears} Yrs
                    </td>

                    {/* Current Round & Evaluation */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-semibold text-text-primary truncate max-w-[160px]">
                          {c.currentRoundName}
                        </div>
                        <div className="mt-0.5">
                          {c.currentRoundStatus === 'Passed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold">
                              <span>{c.currentRoundScore}%</span>
                              <span className="text-[10px] font-sans font-medium text-emerald-500/90">✓ Cleared</span>
                            </span>
                          )}
                          {c.currentRoundStatus === 'Failed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-mono font-bold">
                              <span>{c.currentRoundScore}%</span>
                              <span className="text-[10px] font-sans font-medium text-rose-500/90">✕ Below 70%</span>
                            </span>
                          )}
                          {c.currentRoundStatus === 'In-Progress' && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>In-Progress...</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Current Stage */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(c.status)}`}>
                        {getStatusDot(c.status)}
                        <span className="truncate max-w-[100px]">{c.status}</span>
                      </span>
                    </td>

                    {/* Actions: View Progress */}
                    <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenProgress(c)}
                        title="View candidate hiring pipeline progress tracker"
                        className="h-7 px-3 rounded-lg border border-border-default bg-surface-2 hover:bg-surface-hover hover:border-border-strong text-text-primary text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Icon name="list" size="xs" className="text-text-tertiary" />
                        <span>Progress</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standard STEP Enterprise TablePagination Directly In Table Footer */}
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
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </div>

      {/* Canonical STEP CandidateProgressModal (Reused from Dashboard) */}
      <CandidateProgressModal
        candidate={dashboardCandidateModalData}
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        onNavigateToProfile={(candidateId) => {
          router.push(`/candidates/${candidateId}`);
        }}
      />
    </div>
  );
};

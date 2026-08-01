'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  FileCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  TrendingUp,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  UserX,
  Play
} from 'lucide-react';
import { Button, Badge, Table, Drawer, Column } from '@/components/company-ui';

interface CandidateRow {
  id: number;
  code: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  source: string;
  experience: string;
  stage: string;
  score: string;
  status: 'Registered' | 'PendingVerification' | 'Verified' | 'InAssessment' | 'InInterview' | 'Offered' | 'Hired' | 'Rejected';
  riskScore: number;
}

const mockCandidates: CandidateRow[] = [
  { id: 1, code: 'CND-948123', name: 'Rahul Sharma', email: 'rahul.s@example.com', mobile: '+91 9876543210', role: 'Senior Full Stack Engineer', source: 'WalkIn', experience: '5.2 Yrs', stage: 'Technical Screen', score: '88%', status: 'InInterview', riskScore: 0.0 },
  { id: 2, code: 'CND-948124', name: 'Priya Patel', email: 'priya.p@example.com', mobile: '+91 9876543211', role: 'Senior Full Stack Engineer', source: 'HomeTest', stage: 'Director Round', score: '92%', status: 'InInterview', experience: '6.0 Yrs', riskScore: 1.0 },
  { id: 3, code: 'CND-948125', name: 'Amit Verma', email: 'amit.v@example.com', mobile: '+91 9876543212', role: 'Backend Engineer (.NET)', source: 'CampusDrive', stage: 'Online Assessment', score: '74%', status: 'Verified', experience: '2.5 Yrs', riskScore: 0.0 },
  { id: 4, code: 'CND-948126', name: 'Neha Gupta', email: 'neha.g@example.com', mobile: '+91 9876543213', role: 'Senior Full Stack Engineer', source: 'WalkIn', stage: 'HR Verification', score: 'Pending', status: 'PendingVerification', experience: '4.0 Yrs', riskScore: 0.0 },
  { id: 5, code: 'CND-948127', name: 'Vikram Singh', email: 'vikram.s@example.com', mobile: '+91 9876543214', role: 'DevOps Architect', source: 'Referral', stage: 'Offer Released', score: '95%', status: 'Offered', experience: '8.1 Yrs', riskScore: 0.5 },
  { id: 6, code: 'CND-948128', name: 'Siddharth Rao', email: 'siddharth.r@example.com', mobile: '+91 9876543215', role: 'Backend Engineer (.NET)', source: 'HomeTest', stage: 'Online Assessment', score: 'Disqualified', status: 'Rejected', experience: '3.0 Yrs', riskScore: 12.5 },
];

export default function OverviewDashboardPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<CandidateRow>[] = [
    { header: 'Code', accessorKey: 'code', width: '110px' },
    { 
      header: 'Candidate', 
      cell: (row: CandidateRow) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{row.name}</div>
          <div className="text-[10px] text-slate-500">{row.email}</div>
        </div>
      ),
      width: '200px'
    },
    { header: 'Role', accessorKey: 'role', width: '180px' },
    { 
      header: 'Source', 
      cell: (row: CandidateRow) => <Badge variant="muted">{row.source}</Badge>,
      width: '100px' 
    },
    { header: 'Experience', accessorKey: 'experience', width: '90px' },
    { header: 'Current Stage', accessorKey: 'stage', width: '140px' },
    { 
      header: 'Assessment Score', 
      cell: (row: CandidateRow) => (
        <span className={row.score === 'Disqualified' ? 'text-red-600 font-bold' : 'font-medium'}>
          {row.score}
        </span>
      ),
      width: '110px'
    },
    { 
      header: 'Status', 
      cell: (row: CandidateRow) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
          InInterview: 'info',
          Offered: 'success',
          Verified: 'info',
          PendingVerification: 'warning',
          Rejected: 'danger',
        };
        return <Badge variant={variants[row.status] || 'muted'}>{row.status}</Badge>;
      },
      width: '120px'
    },
    {
      header: 'Actions',
      cell: (row: CandidateRow) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCandidate(row);
              setIsDrawerOpen(true);
            }}
          >
            Inspect
          </Button>
        </div>
      ),
      width: '90px'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Recruitment Operations Console
            <span className="text-xs font-normal text-slate-500 font-mono">| Live Execution</span>
          </h1>
          <p className="text-xs text-slate-500">Real-time candidate intake, assessment proctoring, and pipeline management.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/candidate-intake/walk-in/demo-qr', '_blank')}>
            <ExternalLink className="w-3.5 h-3.5" /> Walk-In QR Kiosk
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert("Excel Template Download Initiated")}>
            <Download className="w-3.5 h-3.5" /> Export Data
          </Button>
        </div>
      </div>

      {/* 8 Compact Operational KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: 'Total Intake', count: 142, icon: Users, color: 'text-blue-600', filter: 'All' },
          { label: 'Pending HR', count: 14, icon: Clock, color: 'text-amber-500', filter: 'PendingVerification' },
          { label: 'Verified', count: 118, icon: UserCheck, color: 'text-emerald-600', filter: 'Verified' },
          { label: 'In Assessment', count: 32, icon: FileCheck, color: 'text-sky-600', filter: 'InAssessment' },
          { label: 'In Interview', count: 24, icon: TrendingUp, color: 'text-purple-600', filter: 'InInterview' },
          { label: 'Offered', count: 12, icon: Award, color: 'text-emerald-500', filter: 'Offered' },
          { label: 'Pass Rate', count: '78.5%', icon: CheckCircle2, color: 'text-emerald-600', filter: 'All' },
          { label: 'Disqualified', count: 3, icon: ShieldAlert, color: 'text-red-500', filter: 'Rejected' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const isSelected = statusFilter === kpi.filter;
          return (
            <div
              key={i}
              onClick={() => setStatusFilter(kpi.filter)}
              className={`p-2 bg-white dark:bg-slate-900 border rounded cursor-pointer transition-all hover:border-[#2563EB] shadow-2xs ${
                isSelected ? 'border-[#2563EB] ring-1 ring-[#2563EB]/40 bg-sky-50/40 dark:bg-slate-800/80' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 leading-none">
                {kpi.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Visualizer */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Recruitment Pipeline Conversion Funnel</h2>
          <span className="text-[11px] text-slate-500 font-mono">Avg Time-To-Hire: 14.2 Days</span>
        </div>
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div className="bg-sky-50 dark:bg-slate-800 p-1.5 rounded border border-sky-200 dark:border-slate-700">
            <div className="font-mono text-[10px] text-slate-500">Intake</div>
            <div className="font-bold text-sky-700 dark:text-sky-300">142 (100%)</div>
          </div>
          <div className="bg-indigo-50 dark:bg-slate-800 p-1.5 rounded border border-indigo-200 dark:border-slate-700">
            <div className="font-mono text-[10px] text-slate-500">Verified</div>
            <div className="font-bold text-indigo-700 dark:text-indigo-300">118 (83.1%)</div>
          </div>
          <div className="bg-purple-50 dark:bg-slate-800 p-1.5 rounded border border-purple-200 dark:border-slate-700">
            <div className="font-mono text-[10px] text-slate-500">Assessment</div>
            <div className="font-bold text-purple-700 dark:text-purple-300">85 (72.0%)</div>
          </div>
          <div className="bg-amber-50 dark:bg-slate-800 p-1.5 rounded border border-amber-200 dark:border-slate-700">
            <div className="font-mono text-[10px] text-slate-500">Interview</div>
            <div className="font-bold text-amber-700 dark:text-amber-300">42 (49.4%)</div>
          </div>
          <div className="bg-emerald-50 dark:bg-slate-800 p-1.5 rounded border border-emerald-200 dark:border-slate-700">
            <div className="font-mono text-[10px] text-slate-500">Offered / Hired</div>
            <div className="font-bold text-emerald-700 dark:text-emerald-300">18 (42.8%)</div>
          </div>
        </div>
      </div>

      {/* Main Table Controls & Data Grid */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, name, email..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-8 py-1 text-xs focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
              Reset Filters
            </Button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>
        </div>

        {/* Operational Table */}
        <Table
          columns={columns}
          data={filteredCandidates}
          rowKey="id"
          selectedId={selectedCandidate?.id}
          onRowClick={(row) => {
            setSelectedCandidate(row);
            setIsDrawerOpen(true);
          }}
        />
      </div>

      {/* Side Inspect Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Candidate Details: ${selectedCandidate?.code}`}
        subtitle={selectedCandidate?.name}
        width="w-[600px]"
      >
        {selectedCandidate && (
          <div className="space-y-4 text-xs">
            {/* Quick Header */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedCandidate.name}</h4>
                <p className="text-slate-500">{selectedCandidate.role} ({selectedCandidate.experience})</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedCandidate.email} | {selectedCandidate.mobile}</p>
              </div>
              <Badge variant={selectedCandidate.status === 'Offered' ? 'success' : 'info'}>
                {selectedCandidate.status}
              </Badge>
            </div>

            {/* Stage Progress Matrix */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">Dynamic Stage Progression</h5>
              <div className="space-y-1">
                {[
                  { stage: '1. HR Registration & Verification', status: 'Completed', date: '2026-08-01 10:30 AM' },
                  { stage: '2. Online Aptitude & Technical Assessment', status: selectedCandidate.score === 'Pending' ? 'In Progress' : 'Passed (Score: ' + selectedCandidate.score + ')', date: '2026-08-01 11:45 AM' },
                  { stage: '3. Technical Interview Screen', status: 'Scheduled', date: '2026-08-02 02:00 PM' },
                  { stage: '4. Director Approval Gate', status: 'Pending', date: '-' },
                ].map((st, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{st.stage}</span>
                    <div className="text-right font-mono text-[11px]">
                      <span className="font-semibold text-[#2563EB]">{st.status}</span>
                      <div className="text-slate-400 text-[10px]">{st.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Cheating & Proctoring Audit */}
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Proctoring Risk Score
                </span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm">
                  {selectedCandidate.riskScore} / 10.0
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {selectedCandidate.riskScore > 5 ? 'High risk detected during remote assessment session.' : 'Clean session. Zero tab switches or copy violations detected.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`/assessment-portal/demo-token-123`, '_blank');
                }}
              >
                <Play className="w-3.5 h-3.5" /> Preview Exam Session
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={() => alert(`Candidate ${selectedCandidate.code} rejected.`)}>
                  Reject
                </Button>
                <Button variant="primary" size="sm" onClick={() => alert(`Candidate ${selectedCandidate.code} promoted to next stage!`)}>
                  Approve & Advance
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

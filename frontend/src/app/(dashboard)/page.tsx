'use client';

import React, { useState } from 'react';
import { useCandidates } from '@/features/candidate/hooks/useCandidates';
import { CandidateDetailsDrawer } from '@/features/candidate/components/CandidateDetailsDrawer';
import { CandidateRecord } from '@/mock/candidate.mock';
import { DataGrid, Column } from '@/ui/table/DataGrid';
import { Badge } from '@/ui/badge/Badge';
import { Icon } from '@/registry/icons';

export default function OverviewDashboardPage() {
  const { candidates } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);

  const kpis = [
    { label: 'Total Candidates', value: candidates.length, trend: '+12%', icon: 'Users', color: 'text-blue-500' },
    { label: "Today's Interviews", value: 14, trend: '+4', icon: 'Calendar', color: 'text-purple-500' },
    { label: 'Walk-In Registrations', value: 38, trend: '+8', icon: 'Plus', color: 'text-green-500' },
    { label: 'Pending Verification', value: 19, trend: '-3', icon: 'ShieldAlert', color: 'text-yellow-500' },
    { label: 'Live Assessment Sessions', value: 7, trend: 'Active', icon: 'Clock', color: 'text-indigo-500' },
    { label: 'Disqualified / Flagged', value: 12, trend: '-2', icon: 'UserX', color: 'text-red-500' },
  ];

  const columns: Column<CandidateRecord>[] = [
    { header: 'Code', accessorKey: 'code', width: '110px' },
    {
      header: 'Candidate',
      cell: (row: CandidateRecord) => (
        <div>
          <div className="font-semibold text-[var(--text-primary)]">{row.name}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{row.email}</div>
        </div>
      ),
      width: '200px',
    },
    { header: 'Role', accessorKey: 'role', width: '180px' },
    { header: 'Source', cell: (row: CandidateRecord) => <Badge variant="muted">{row.source}</Badge>, width: '100px' },
    { header: 'Experience', accessorKey: 'experienceYears', width: '90px' },
    { header: 'Current Stage', accessorKey: 'stage', width: '140px' },
    {
      header: 'Score',
      cell: (row: CandidateRecord) => (
        <span className={row.score === 'Disqualified' ? 'text-red-600 font-bold' : 'font-medium'}>{row.score}</span>
      ),
      width: '110px',
    },
    {
      header: 'Status',
      cell: (row: CandidateRecord) => (
        <Badge variant={row.status === 'Rejected' ? 'danger' : row.status === 'Offered' ? 'success' : 'info'}>
          {row.status}
        </Badge>
      ),
      width: '120px',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Animated KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-[var(--bg-surface)] p-3 rounded border border-[var(--border-subtle)] shadow-xs hover-lift cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--text-muted)] truncate">{kpi.label}</span>
              <Icon name={kpi.icon as any} size={15} className={kpi.color} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-[var(--text-primary)]">{kpi.value}</span>
              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1 rounded">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Data Grid */}
      <DataGrid
        title="Active Candidates Pipeline"
        columns={columns}
        data={candidates}
        rowKey="id"
        onRowClick={(row) => setSelectedCandidate(row)}
      />

      {/* Candidate Details Slide-Over Drawer */}
      <CandidateDetailsDrawer
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}

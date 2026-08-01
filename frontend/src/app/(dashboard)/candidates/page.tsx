'use client';

import React, { useState } from 'react';
import { useCandidates } from '@/features/candidate/hooks/useCandidates';
import { CandidateDetailsDrawer } from '@/features/candidate/components/CandidateDetailsDrawer';
import { CandidateRecord } from '@/mock/candidate.mock';
import { DataGrid, Column } from '@/ui/table/DataGrid';
import { Badge } from '@/ui/badge/Badge';

export default function CandidatesPage() {
  const { candidates } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);

  const columns: Column<CandidateRecord>[] = [
    { header: 'Code', accessorKey: 'code', width: '110px' },
    {
      header: 'Candidate Name',
      cell: (row: CandidateRecord) => (
        <div>
          <div className="font-semibold text-[var(--text-primary)]">{row.name}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{row.email}</div>
        </div>
      ),
      width: '200px',
    },
    { header: 'Applied Role', accessorKey: 'role', width: '180px' },
    { header: 'Source', cell: (row: CandidateRecord) => <Badge variant="muted">{row.source}</Badge>, width: '100px' },
    { header: 'Experience', accessorKey: 'experienceYears', width: '90px' },
    { header: 'Stage', accessorKey: 'stage', width: '140px' },
    { header: 'Risk Score', accessorKey: 'riskScore', width: '90px' },
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
      <DataGrid
        title="All Candidates Directory (500+ Records)"
        columns={columns}
        data={candidates}
        rowKey="id"
        onRowClick={(row) => setSelectedCandidate(row)}
      />

      <CandidateDetailsDrawer
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}

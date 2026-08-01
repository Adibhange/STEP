'use client';

import React from 'react';
import { useGetVacanciesQuery } from '@/store/baseApi';
import { VacancyRecord } from '@/mock/vacancy.mock';
import { DataGrid, Column } from '@/ui/table/DataGrid';
import { Badge } from '@/ui/badge/Badge';

export default function VacanciesPage() {
  const { data: vacancies = [] } = useGetVacanciesQuery();

  const columns: Column<VacancyRecord>[] = [
    { header: 'Requisition Code', accessorKey: 'code', width: '130px' },
    { header: 'Job Title', accessorKey: 'title', width: '220px' },
    { header: 'Department', accessorKey: 'department', width: '130px' },
    { header: 'Location', accessorKey: 'location', width: '120px' },
    { header: 'Openings', accessorKey: 'openingsCount', width: '90px' },
    { header: 'Candidates', accessorKey: 'candidateCount', width: '100px' },
    {
      header: 'Status',
      cell: (row: VacancyRecord) => (
        <Badge variant={row.status === 'Published' ? 'success' : row.status === 'Hold' ? 'warning' : 'muted'}>
          {row.status}
        </Badge>
      ),
      width: '110px',
    },
    { header: 'Closure Date', accessorKey: 'closureDate', width: '110px' },
  ];

  return (
    <div className="space-y-4">
      <DataGrid title="Vacancies & Requisitions Directory" columns={columns} data={vacancies} rowKey="id" />
    </div>
  );
}

'use client';

import React from 'react';
import { useGetQuestionsQuery } from '@/store/baseApi';
import { QuestionRecord } from '@/mock/question.mock';
import { DataGrid, Column } from '@/ui/table/DataGrid';
import { Badge } from '@/ui/badge/Badge';

export default function QuestionBankPage() {
  const { data: questions = [] } = useGetQuestionsQuery();

  const columns: Column<QuestionRecord>[] = [
    { header: 'Code', accessorKey: 'code', width: '100px' },
    { header: 'Category', accessorKey: 'category', width: '120px' },
    { header: 'Question Prompt', accessorKey: 'title', width: '350px' },
    {
      header: 'Difficulty',
      cell: (row: QuestionRecord) => (
        <Badge variant={row.difficulty === 'Hard' ? 'danger' : row.difficulty === 'Medium' ? 'warning' : 'success'}>
          {row.difficulty}
        </Badge>
      ),
      width: '100px',
    },
    { header: 'Marks', accessorKey: 'marks', width: '80px' },
  ];

  return (
    <div className="space-y-4">
      <DataGrid title="Assessment Question Repository (1000+ Items)" columns={columns} data={questions} rowKey="id" />
    </div>
  );
}

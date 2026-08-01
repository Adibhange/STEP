'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface MasterTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectedId?: number | string;
  rowKey: keyof T;
  emptyText?: string;
  className?: string;
}

export function MasterTable<T>({
  columns,
  data,
  onRowClick,
  selectedId,
  rowKey,
  emptyText = 'No records found',
  className,
}: MasterTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 shadow-2xs', className)}>
      <table className="w-full text-left border-collapse text-xs">
        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className="px-3 py-2 text-[11px] font-bold"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = String(row[rowKey]);
              const isSelected = selectedId !== undefined && String(selectedId) === id;

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'h-9 transition-colors hover:bg-sky-50/60 dark:hover:bg-slate-800/60 cursor-pointer select-none',
                    isSelected && 'bg-sky-100/70 dark:bg-sky-950/60 font-medium'
                  )}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] ?? '') : null)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Table = MasterTable;

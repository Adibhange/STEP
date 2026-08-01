'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/registry/icons';
import { Button } from '@/ui/button/Button';
import { Badge } from '@/ui/badge/Badge';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
  onDoubleRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  title?: string;
  emptyText?: string;
  actions?: React.ReactNode;
  exportable?: boolean;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  onDoubleRowClick,
  selectable = true,
  onSelectionChange,
  title,
  emptyText = 'No records found',
  actions,
  exportable = true,
}: DataGridProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<any>>(new Set());
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search & Sorting Filter
  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          val != null && String(val).toLowerCase().includes(q)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handle Sort
  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedKeys.size === paginatedData.length) {
      setSelectedKeys(new Set());
      onSelectionChange?.([]);
    } else {
      const allKeys = new Set(paginatedData.map((r) => r[rowKey]));
      setSelectedKeys(allKeys);
      onSelectionChange?.(paginatedData);
    }
  };

  const toggleSelectRow = (row: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = row[rowKey];
    const newKeys = new Set(selectedKeys);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }
    setSelectedKeys(newKeys);
    onSelectionChange?.(data.filter((r) => newKeys.has(r[rowKey])));
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = filteredData.map((row) =>
      columns
        .map((c) => {
          const val = c.accessorKey ? row[c.accessorKey] : '';
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2 w-full">
      {/* DataGrid Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--bg-surface)] p-2.5 rounded border border-[var(--border-subtle)] shadow-xs">
        <div className="flex items-center gap-2">
          {title && <h3 className="font-semibold text-xs text-[var(--text-primary)]">{title}</h3>}
          <Badge variant="muted">{filteredData.length} Records</Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search dataset..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[var(--bg-app)] border border-[var(--border-strong)] rounded px-2.5 py-1 text-xs pl-7 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
            <div className="absolute left-2 top-2 text-[var(--text-muted)]">
              <Icon name="Search" size={13} />
            </div>
          </div>

          {actions}

          {exportable && (
            <Button variant="outline" size="xs" icon="Download" onClick={handleExportCSV}>
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="data-grid-container">
        <table className="data-grid-table">
          <thead>
            <tr>
              {selectable && (
                <th className="data-grid-header-cell w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedKeys.size === paginatedData.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--border-strong)] text-[var(--brand-primary)] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className={`data-grid-header-cell ${col.sortable !== false ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : ''}`}
                  onClick={() => col.sortable !== false && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.accessorKey && sortKey === col.accessorKey && (
                      <Icon name={sortDir === 'asc' ? 'ChevronRight' : 'ChevronLeft'} size={12} className="rotate-90" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-8 text-center text-xs text-[var(--text-muted)]">
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const key = row[rowKey];
                const isSelected = selectedKeys.has(key);
                return (
                  <tr
                    key={String(key)}
                    onClick={() => onRowClick?.(row)}
                    onDoubleClick={() => onDoubleRowClick?.(row)}
                    className={`data-grid-row ${isSelected ? 'selected' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {selectable && (
                      <td className="data-grid-body-cell text-center" onClick={(e) => toggleSelectRow(row, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-[var(--border-strong)] text-[var(--brand-primary)] cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td key={idx} className="data-grid-body-cell">
                        {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : ''}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-[var(--text-muted)]">
        <div>
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <span className="px-2 font-medium text-[var(--text-primary)]">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="xs"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

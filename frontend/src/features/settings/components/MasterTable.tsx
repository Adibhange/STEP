'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import type { MasterRecord } from '@/types/master.types';

export interface MasterColumn {
  key: keyof MasterRecord | string;
  label: string;
  render?: (record: MasterRecord) => React.ReactNode;
}

export interface MasterTableProps {
  title: string;
  description?: string;
  data: MasterRecord[];
  columns?: MasterColumn[];
  exampleName?: string;
  exampleCode?: string;
  onAdd?: (newRecord: Omit<MasterRecord, 'id' | 'updatedAt'>) => void;
  onEdit?: (record: MasterRecord) => void;
  onToggleStatus?: (recordId: string | number) => void;
  onDelete?: (recordId: string | number) => void;
}

function generateUniqueCode(name: string, records: MasterRecord[], currentId?: string | number): string {
  const allWords = name.trim().split(/\s+/).filter(Boolean);
  const letterWords = allWords.filter((w) => /^[a-zA-Z]/.test(w));

  let baseCode = '';

  if (letterWords.length > 1) {
    baseCode = letterWords.map((w) => w[0]).join('').toUpperCase();
  } else if (letterWords.length === 1) {
    const cleaned = letterWords[0].replace(/[^a-zA-Z]/g, '');
    baseCode = cleaned.substring(0, 3).toUpperCase();
  } else if (allWords.length > 0) {
    const cleaned = name.replace(/[^a-zA-Z]/g, '');
    baseCode = cleaned.substring(0, 3).toUpperCase();
  }

  if (!baseCode) baseCode = 'REC';

  let candidate = baseCode;
  let counter = 2;

  const existingCodes = new Set(
    records.filter((r) => r.id !== currentId).map((r) => r.code?.toUpperCase()).filter(Boolean)
  );

  while (existingCodes.has(candidate)) {
    candidate = `${baseCode}${counter}`;
    counter++;
  }

  return candidate;
}

/**
 * STEP Enterprise MasterTable Primitive
 *
 * Generic CRUD table component for Master Data taxonomies.
 */
export const MasterTable: React.FC<MasterTableProps> = ({
  title,
  description,
  data,
  columns,
  exampleName = 'Data Analyst',
  exampleCode = 'DA',
  onAdd,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);

  // Modal form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(search.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormStatus('Active');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (record: MasterRecord) => {
    setEditingRecord(record);
    setFormName(record.name);
    setFormCode(record.code || '');
    setFormDescription(record.description || '');
    setFormStatus(record.status || 'Active');
  };

  const handleSaveAdd = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Use custom code if provided, else auto-generate unique short code from record name
    const finalCode = formCode.trim() ? formCode.trim().toUpperCase() : generateUniqueCode(formName, data);

    onAdd?.({
      name: formName.trim(),
      code: finalCode,
      description: formDescription.trim(),
      status: formStatus,
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecord || !formName.trim()) return;

    const finalCode = formCode.trim()
      ? formCode.trim().toUpperCase()
      : (formName.trim().toLowerCase() === editingRecord.name.toLowerCase() && editingRecord.code
          ? editingRecord.code
          : generateUniqueCode(formName, data, editingRecord.id));

    onEdit?.({
      ...editingRecord,
      name: formName.trim(),
      code: finalCode,
      description: formDescription.trim(),
      status: formStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setEditingRecord(null);
  };

  const defaultColumns: MasterColumn[] = [
    {
      key: 'name',
      label: 'Record Name',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-[var(--text-primary)] text-[13px]">{r.name}</span>
          {r.description && (
            <span className="text-[11px] text-[var(--text-tertiary)] truncate max-w-[220px]" title={r.description}>
              {r.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Short Code',
      render: (r) => (
        <span className="font-mono text-[11.5px] font-extrabold text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] px-2.5 py-0.5 rounded border border-[var(--accent-indigo)]/20">
          {r.code || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          type="button"
          onClick={() => onToggleStatus?.(r.id)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all active:scale-95 ${
            r.status === 'Active'
              ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
              : 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]'
          }`}
          title="Click to toggle status"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Active' ? 'bg-[var(--status-success)]' : 'bg-[var(--status-danger)]'}`} />
          <span>{r.status}</span>
        </button>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (r) => <span className="text-[11.5px] text-[var(--text-tertiary)] font-sans">{r.updatedAt}</span>,
    },
  ];

  const activeColumns = columns || defaultColumns;

  return (
    <div className="bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-xs flex flex-col overflow-hidden w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[var(--border-default)] bg-[var(--surface-1)]">
        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading tracking-tight">{title}</h3>
          {description && <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{description}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex items-center h-8.5 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-56">
            <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
            <input
              type="search"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
            />
          </div>

          {/* Tokenized CustomSelect Dropdown */}
          <CustomSelect
            label="Status Filter"
            placeholder="All Statuses"
            value={statusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' },
            ]}
            onChange={(val) => setStatusFilter((val || 'All') as any)}
            widthClass="w-full sm:w-[130px]"
          />

          {/* Add Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-8.5 px-4 flex items-center justify-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12px] font-bold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer shadow-2xs w-full sm:w-auto shrink-0"
          >
            <Icon name="plus" size="xs" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="overflow-x-auto scrollbar-step w-full">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <colgroup>
            <col style={{ width: '32%', minWidth: '180px' }} />
            <col style={{ width: '15%', minWidth: '90px' }} />
            <col style={{ width: '18%', minWidth: '100px' }} />
            <col style={{ width: '20%', minWidth: '110px' }} />
            <col style={{ width: '15%', minWidth: '80px' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              {activeColumns.map((col) => (
                <th key={String(col.key)} className="py-2.5 px-4 font-mono whitespace-nowrap">{col.label}</th>
              ))}
              <th className="py-2.5 px-4 font-mono text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)] text-[12.5px]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="py-8 text-center text-[var(--text-tertiary)]">
                  No records found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  {activeColumns.map((col) => (
                    <td key={String(col.key)} className="py-3 px-4 whitespace-nowrap">
                      {col.render ? col.render(record) : String(record[col.key as keyof MasterRecord] ?? '—')}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(record)}
                        className="p-1.5 rounded hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--accent-indigo)] transition-colors cursor-pointer"
                        title="Edit record"
                      >
                        <Icon name="pencil" size="xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(record.id)}
                        className="p-1.5 rounded hover:bg-[var(--status-danger-bg)] text-[var(--text-tertiary)] hover:text-[var(--status-danger-text)] transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Icon name="trash-2" size="xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Stats */}
      <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--surface-2)] flex flex-col sm:flex-row gap-1 items-start sm:items-center justify-between text-[11.5px] text-[var(--text-tertiary)] font-medium">
        <span>Showing {filteredData.length} of {data.length} records</span>
        <span className="font-mono text-[10.5px]">STEP Enterprise Master Schema v1.0</span>
      </div>

      {/* Add Modal (Closes on backdrop click) */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-[var(--overlay)] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-md p-5 flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h4 className="text-base font-bold text-[var(--text-primary)]">Add New {title}</h4>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="sm" />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="flex flex-col gap-4">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Record Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={`Enter ${title.toLowerCase()} name... (e.g. ${exampleName})`}
                  className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Short Code (Optional)</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder={`Auto-generated if left blank (e.g. ${exampleCode})`}
                  className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] font-mono"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Description (Optional)</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter optional description..."
                  className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Status</label>
                <CustomSelect
                  label="Initial Status"
                  value={formStatus}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  onChange={(val) => setFormStatus((val || 'Active') as any)}
                  widthClass="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-default)] mt-1 w-full">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none w-full"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer select-none w-full"
                >
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Closes on backdrop click) */}
      {editingRecord && (
        <div
          className="fixed inset-0 z-50 bg-[var(--overlay)] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEditingRecord(null)}
        >
          <div
            className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-md p-5 flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h4 className="text-base font-bold text-[var(--text-primary)]">Edit {title} Record</h4>
              <button type="button" onClick={() => setEditingRecord(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="sm" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Record Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Short Code</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Short Code"
                  className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] font-mono"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Description (Optional)</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter optional description..."
                  className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Status</label>
                <CustomSelect
                  label="Status"
                  value={formStatus}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  onChange={(val) => setFormStatus((val || 'Active') as any)}
                  widthClass="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-default)] mt-1 w-full">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none w-full"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer select-none w-full"
                >
                  <span>Update Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

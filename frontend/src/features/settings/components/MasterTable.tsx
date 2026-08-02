'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import type { MasterRecord } from '../mock/master.mock';

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
  onAdd?: (newRecord: Omit<MasterRecord, 'id' | 'updatedAt'>) => void;
  onEdit?: (record: MasterRecord) => void;
  onToggleStatus?: (recordId: string) => void;
  onDelete?: (recordId: string) => void;
}

/**
 * STEP Enterprise MasterTable Primitive
 *
 * Single generic CRUD table component powering all 14 Configuration master entities.
 * Inputs: title, description, data, columns, actions. Reuses CustomSelect primitive.
 */
export const MasterTable: React.FC<MasterTableProps> = ({
  title,
  description,
  data,
  columns,
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
  const [formDesc, setFormDesc] = useState('');
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
    setFormDesc('');
    setFormStatus('Active');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (record: MasterRecord) => {
    setEditingRecord(record);
    setFormName(record.name);
    setFormCode(record.code || '');
    setFormDesc(record.description || '');
    setFormStatus(record.status);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    onAdd?.({
      name: formName.trim(),
      code: formCode.trim() || undefined,
      description: formDesc.trim() || undefined,
      status: formStatus,
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !formName.trim()) return;
    onEdit?.({
      ...editingRecord,
      name: formName.trim(),
      code: formCode.trim() || undefined,
      description: formDesc.trim() || undefined,
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
          {r.description && <span className="text-[11px] text-[var(--text-tertiary)] truncate max-w-xs">{r.description}</span>}
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code / Tag',
      render: (r) => (
        <span className="font-mono text-[11.5px] font-bold text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border-default)]">
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
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition-all active:scale-95 ${
            r.status === 'Active'
              ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]'
              : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
          }`}
          title="Click to toggle status"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Active' ? 'bg-[var(--status-success)]' : 'bg-[var(--text-tertiary)]'}`} />
          <span>{r.status}</span>
        </button>
      ),
    },
    {
      key: 'count',
      label: 'Linked Entities',
      render: (r) => <span className="font-mono font-bold text-[12px] text-[var(--text-secondary)]">{r.count ?? 0}</span>,
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (r) => <span className="text-[11.5px] text-[var(--text-tertiary)] font-sans">{r.updatedAt}</span>,
    },
  ];

  const activeColumns = columns || defaultColumns;

  return (
    <div className="bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-xs flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[var(--border-default)] bg-[var(--surface-1)]">
        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading tracking-tight">{title}</h3>
          {description && <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{description}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex items-center h-8.5 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-44 sm:w-56">
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
            widthClass="w-[130px]"
          />

          {/* Add Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-8.5 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12px] font-bold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer shadow-2xs"
          >
            <Icon name="plus" size="xs" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="overflow-x-auto scrollbar-step">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              {activeColumns.map((col) => (
                <th key={String(col.key)} className="py-2.5 px-4 font-mono">{col.label}</th>
              ))}
              <th className="py-2.5 px-4 font-mono text-right">Actions</th>
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
                    <td key={String(col.key)} className="py-3 px-4">
                      {col.render ? col.render(record) : String(record[col.key as keyof MasterRecord] ?? '—')}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right">
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
      <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--surface-2)] flex items-center justify-between text-[11.5px] text-[var(--text-tertiary)] font-medium">
        <span>Showing {filteredData.length} of {data.length} records</span>
        <span className="font-mono text-[10.5px]">STEP Enterprise Master Schema v1.0</span>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--overlay)] flex items-center justify-center p-4" backdrop-blur="true">
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-md p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h4 className="text-base font-bold text-[var(--text-primary)]">Add New {title}</h4>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="sm" />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="flex flex-col gap-3">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Record Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={`Enter ${title.toLowerCase()} name...`}
                  className="w-full mt-1 h-9 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Code / Short Tag</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. SE-01, BOM, 4-7 YRS"
                  className="w-full mt-1 h-9 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full mt-1 p-2.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] resize-none"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Initial Status</label>
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
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-default)] mt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-3.5 h-8.5 text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-md cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 h-8.5 text-[12px] font-bold bg-[var(--accent-indigo)] text-white rounded-md hover:bg-[var(--accent-indigo-hover)] cursor-pointer">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-[var(--overlay)] flex items-center justify-center p-4" backdrop-blur="true">
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-md p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h4 className="text-base font-bold text-[var(--text-primary)]">Edit {title} Record</h4>
              <button type="button" onClick={() => setEditingRecord(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="sm" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Record Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Code / Short Tag</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)] resize-none"
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
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-default)] mt-2">
                <button type="button" onClick={() => setEditingRecord(null)} className="px-3.5 h-8.5 text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-md cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 h-8.5 text-[12px] font-bold bg-[var(--accent-indigo)] text-white rounded-md hover:bg-[var(--accent-indigo-hover)] cursor-pointer">
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

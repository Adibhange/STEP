'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { USERS_MOCK, type UserItem } from '@/mock/users';

/**
 * STEP Enterprise Users Module — Unified All Users Table with Tokenized CustomSelect Dropdowns
 */
export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>(USERS_MOCK);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchDept = deptFilter === 'All' || u.department === deptFilter;
    return matchSearch && matchRole && matchStatus && matchDept;
  });

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            All Users & Access Control
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Single enterprise user directory for recruiters, interviewers, HR managers, and directors.
          </p>
        </div>
        <button type="button" className="h-9 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12.5px] font-bold shadow-2xs cursor-pointer">
          <Icon name="plus" size="xs" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Unified Filters with CustomSelect: Role, Department, Status, Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] border border-[var(--border-default)] p-3 rounded-[var(--radius-lg)] shadow-2xs">
        {/* Search */}
        <div className="relative flex items-center h-8.5 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-64">
          <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
          <input
            type="search"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        {/* Tokenized CustomSelect Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <CustomSelect
            label="Role Filter"
            placeholder="All Roles"
            value={roleFilter}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Director', label: 'Director' },
              { value: 'Recruiter', label: 'Recruiter' },
              { value: 'Interviewer', label: 'Interviewer' },
              { value: 'HR Manager', label: 'HR Manager' },
            ]}
            onChange={(val) => setRoleFilter(val || 'All')}
            widthClass="w-[130px]"
          />

          {/* Department Filter */}
          <CustomSelect
            label="Department Filter"
            placeholder="All Departments"
            value={deptFilter}
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'Talent Acquisition', label: 'Talent Acquisition' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Human Resources', label: 'Human Resources' },
            ]}
            onChange={(val) => setDeptFilter(val || 'All')}
            widthClass="w-[150px]"
          />

          {/* Status Filter */}
          <CustomSelect
            label="Status Filter"
            placeholder="All Statuses"
            value={statusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Invited', label: 'Invited' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            onChange={(val) => setStatusFilter(val || 'All')}
            widthClass="w-[130px]"
          />
        </div>
      </div>

      {/* Unified All Users Table */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
              <th className="py-2.5 px-4">User</th>
              <th className="py-2.5 px-4">Role</th>
              <th className="py-2.5 px-4">Department</th>
              <th className="py-2.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)] text-[12.5px]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold text-[11px] flex items-center justify-center border border-[var(--accent-indigo)] border-opacity-30">
                      {u.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)]">{u.name}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-[var(--text-secondary)]">{u.role}</td>
                <td className="py-3 px-4 font-semibold text-[var(--text-tertiary)]">{u.department}</td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                    u.status === 'Active'
                      ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success)]'
                      : u.status === 'Invited'
                      ? 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border-[var(--status-info)]'
                      : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
                  }`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

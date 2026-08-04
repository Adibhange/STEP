'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { USERS_MOCK, type UserItem, type UserRole, type UserStatus } from '@/mock/users';
import { useGetUsersQuery, useCreateUserMutation } from '@/store/services/api';

const DEPARTMENT_OPTIONS = [
  'Talent Acquisition',
  'Engineering',
  'Human Resources',
  'Product Management',
  'Quality Assurance',
];

// Role → Department constraints
const DEPT_BY_ROLE: Record<string, string[] | 'locked'> = {
  Director: 'locked',       // Auto-locked to Administration
  HR: ['Human Resources', 'Talent Acquisition'],
  Interviewer: ['Engineering', 'Quality Assurance'],
};

/**
 * STEP Enterprise Users & Access Control Module
 */
export const UsersView: React.FC = () => {
  const { data: apiUsersResponse, isLoading } = useGetUsersQuery();
  const [createUserApi] = useCreateUserMutation();

  const apiUsers: UserItem[] = (apiUsersResponse?.data || []).map((u: any) => ({
    id: String(u.id),
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
    empId: u.employeeCode || u.empId || `EMP-${u.id}`,
    email: u.email || '',
    role: (u.role || 'Interviewer') as UserRole,
    department: u.department || 'Engineering',
    status: (u.status || 'Active') as UserStatus,
  }));

  const [users, setUsers] = useState<UserItem[]>(USERS_MOCK);

  const displayUsers = apiUsers.length > 0 ? apiUsers : users;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Modal Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form Fields State for Add / Edit
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTempPassword, setFormTempPassword] = useState('');
  const [formPin, setFormPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>('Interviewer');
  const [formDept, setFormDept] = useState<string>('Engineering');
  const [formStatus, setFormStatus] = useState<UserStatus>('Active');

  const filteredUsers = displayUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.empId.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchDept = deptFilter === 'All' || u.department === deptFilter;

    return matchSearch && matchRole && matchStatus && matchDept;
  });

  const handleOpenAdd = () => {
    const nextNum = users.length + 1001;
    setFormFirstName('');
    setFormLastName('');
    setFormEmpId(`EMP-${nextNum}`);
    setFormEmail('');
    setFormTempPassword('TempPass@2026');
    setFormPin('');
    setShowPassword(false);
    setFormRole('Interviewer');
    setFormDept('Engineering');
    setFormStatus('Active');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormFirstName(user.firstName);
    setFormLastName(user.lastName);
    setFormEmpId(user.empId);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDept(user.department);
    setFormStatus(user.status);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) return;

    const fullName = `${formFirstName.trim()} ${formLastName.trim()}`;
    const newUser: UserItem = {
      id: `usr-${Date.now()}`,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      name: fullName,
      empId: formEmpId.trim() || `EMP-${Date.now().toString().slice(-4)}`,
      email: formEmail.trim(),
      role: formRole,
      department: formDept,
      status: formStatus,
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) return;

    const fullName = `${formFirstName.trim()} ${formLastName.trim()}`;
    const updatedUser: UserItem = {
      ...editingUser,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      name: fullName,
      empId: formEmpId.trim(),
      email: formEmail.trim(),
      role: formRole,
      department: formDept,
      status: formStatus,
    };

    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
    setEditingUser(null);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            All Users & Access Control
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Enterprise directory for Directors, HRs, and Interviewers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-9.5 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12.5px] font-bold shadow-2xs hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer"
        >
          <Icon name="plus" size="xs" />
          <span>Add User</span>
        </button>
      </div>

      {/* Unified Filters: Search, Role, Department, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-1)] border border-[var(--border-default)] p-3 rounded-[var(--radius-lg)] shadow-2xs">
        {/* Search */}
        <div className="relative flex items-center h-8.5 px-3 rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] w-full sm:w-64">
          <Icon name="search" size="xs" className="text-[var(--text-tertiary)] shrink-0 mr-1.5" />
          <input
            type="search"
            placeholder="Search by name, email, employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        {/* Tokenized CustomSelect Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Role Filter */}
          <CustomSelect
            label="Role Filter"
            placeholder="All Roles"
            value={roleFilter}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Director', label: 'Director' },
              { value: 'HR', label: 'HR' },
              { value: 'Interviewer', label: 'Interviewer' },
            ]}
            onChange={(val) => setRoleFilter(val || 'All')}
            widthClass="w-full sm:w-[130px]"
          />

          {/* Department Filter */}
          <CustomSelect
            label="Department Filter"
            placeholder="All Departments"
            value={deptFilter}
            options={[
              { value: 'All', label: 'All Departments' },
              ...DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d })),
            ]}
            onChange={(val) => setDeptFilter(val || 'All')}
            widthClass="w-full sm:w-[160px]"
          />

          {/* Status Filter */}
          <CustomSelect
            label="Status Filter"
            placeholder="All Statuses"
            value={statusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' },
            ]}
            onChange={(val) => setStatusFilter(val || 'All')}
            widthClass="w-full sm:w-[130px]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-2xs w-full">
        <div className="overflow-x-auto scrollbar-step w-full">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <colgroup>
              <col style={{ width: '28%', minWidth: '180px' }} />
              <col style={{ width: '15%', minWidth: '100px' }} />
              <col style={{ width: '15%', minWidth: '100px' }} />
              <col style={{ width: '22%', minWidth: '140px' }} />
              <col style={{ width: '12%', minWidth: '90px' }} />
              <col style={{ width: '8%', minWidth: '70px' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-mono whitespace-nowrap">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Employee ID</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)] text-[12.5px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-tertiary)]">
                    No users found matching search & filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="w-8.5 h-8.5 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-extrabold text-[11px] flex items-center justify-center border border-[var(--accent-indigo)]/30 shrink-0">
                          {u.firstName[0]}
                          {u.lastName[0]}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[var(--text-primary)] truncate">{u.name}</span>
                          <span className="text-[11px] text-[var(--text-tertiary)] truncate">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11.5px] font-extrabold text-[var(--text-secondary)]">
                      <span className="bg-[var(--surface-2)] border border-[var(--border-default)] px-2 py-0.5 rounded">
                        {u.empId}
                      </span>
                    </td>

                    {/* Role (Pill Shape) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border font-sans ${
                        u.role === 'Director'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.role === 'HR'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          u.role === 'Director' ? 'bg-purple-500' : u.role === 'HR' ? 'bg-indigo-500' : 'bg-sky-500'
                        }`} />
                        <span>{u.role}</span>
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-[var(--text-secondary)]">
                      {u.department}
                    </td>

                    {/* Status Toggle Badge (Active = Green, Inactive = Red/Danger) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-all active:scale-95 ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                        title="Click to toggle active/inactive status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.status}</span>
                      </button>
                    </td>

                    {/* Row Actions — Single Edit Pencil Icon */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--accent-indigo)] transition-colors cursor-pointer"
                          title="Edit user details & permissions"
                        >
                          <Icon name="pencil" size="xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--surface-2)] flex flex-col sm:flex-row gap-1 items-start sm:items-center justify-between text-[11.5px] text-[var(--text-tertiary)] font-medium">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <span className="font-mono text-[10.5px]">STEP Role-Based Access Control v1.0</span>
        </div>
      </div>

      {/* Add User Modal Dialog */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[var(--text-primary)] font-heading">Add New User</h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Create system credentials and assign role access.</p>
              </div>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="sm" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="flex flex-col gap-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">First Name *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. John"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
              </div>

              {/* Employee ID & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-1006"
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] font-mono text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john.doe@sthapatya.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
              </div>              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Role *</label>
                  <CustomSelect
                    label="Role"
                    value={formRole}
                    options={[
                      { value: 'Director', label: 'Director' },
                      { value: 'HR', label: 'HR' },
                      { value: 'Interviewer', label: 'Interviewer' },
                    ]}
                    onChange={(val) => {
                      const role = (val || 'Interviewer') as UserRole;
                      setFormRole(role);
                      // Auto-set department based on role
                      if (role === 'Director') setFormDept('Administration');
                      else if (role === 'HR') setFormDept('Human Resources');
                      else setFormDept('Engineering');
                    }}
                    widthClass="w-full"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Department *</label>
                  {formRole === 'Director' ? (
                    <div className="h-9.5 px-3 flex items-center rounded-md border border-[var(--border-default)] bg-[var(--surface-2)]/60 text-[12.5px] text-[var(--text-tertiary)] font-medium cursor-not-allowed select-none">
                      Administration
                    </div>
                  ) : (
                    <CustomSelect
                      label="Department"
                      value={formDept}
                      options={(DEPT_BY_ROLE[formRole] as string[]).map((d) => ({ value: d, label: d }))}
                      onChange={(val) => setFormDept(val || (DEPT_BY_ROLE[formRole] as string[])[0])}
                      widthClass="w-full"
                    />
                  )}
                </div>
              </div>

              {/* Password (non-Director) or PIN (Director) */}
              {formRole === 'Director' ? (
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Temporary Director PIN *</label>
                  <div className="relative flex items-center mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      inputMode="numeric"
                      minLength={6}
                      maxLength={6}
                      placeholder="6-digit PIN"
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full h-9.5 pl-3 pr-10 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-indigo)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                      title={showPassword ? 'Hide PIN' : 'Show PIN'}
                    >
                      <Icon name="eye" size="xs" className={showPassword ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Temporary Password *</label>
                  <div className="relative flex items-center mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formTempPassword}
                      onChange={(e) => setFormTempPassword(e.target.value)}
                      className="w-full h-9.5 pl-3 pr-10 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-indigo)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name="eye" size="xs" className={showPassword ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'} />
                    </button>
                  </div>
                </div>
              )}

              {/* Initial Status */}
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Status</label>
                <CustomSelect
                  label="Initial Status"
                  value={formStatus}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  onChange={(val) => setFormStatus((val || 'Active') as UserStatus)}
                  widthClass="w-full"
                />
              </div>

              {/* 50/50 Action Buttons */}
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
                  <span>Save User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[var(--text-primary)] font-heading">Edit User Details</h4>
                <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Update role permissions, department, or employee status.</p>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                <Icon name="x" size="sm" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
              </div>

              {/* Employee ID & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] font-mono text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full mt-1 h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Role *</label>
                  <CustomSelect
                    label="Role"
                    value={formRole}
                    options={[
                      { value: 'Director', label: 'Director' },
                      { value: 'HR', label: 'HR' },
                      { value: 'Interviewer', label: 'Interviewer' },
                    ]}
                    onChange={(val) => setFormRole((val || 'Interviewer') as UserRole)}
                    widthClass="w-full"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Department *</label>
                  <CustomSelect
                    label="Department"
                    value={formDept}
                    options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))}
                    onChange={(val) => setFormDept(val || 'Engineering')}
                    widthClass="w-full"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Status</label>
                <CustomSelect
                  label="Status"
                  value={formStatus}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  onChange={(val) => setFormStatus((val || 'Active') as UserStatus)}
                  widthClass="w-full"
                />
              </div>

              {/* 50/50 Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-default)] mt-1 w-full">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none w-full"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer select-none w-full"
                >
                  <span>Update User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

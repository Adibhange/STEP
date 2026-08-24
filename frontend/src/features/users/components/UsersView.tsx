'use client';

import React, { useState } from 'react';
import { Icon, EnterpriseModal } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { type UserItem, type UserRole, type UserStatus } from '@/features/users/types/user.types';
import { useAppDispatch, useAppSelector, selectCurrentUser, notifySuccess, notifyError } from '@/store';
import {
  useGetUsersQuery,
  useGetMasterDataByCategoryQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '@/store/services/api';

import { UsersTable } from './UsersTable';

// Role & Department ID Mappings matching ASP.NET Core DB Seeds
const ROLE_ID_MAP: Record<string, number> = {
  Administrator: 1,
  Director: 2,
  HR: 3,
  Interviewer: 4,
};

// Department IDs are resolved dynamically from master data API at runtime

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
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isInterviewer = currentUser?.role === 'Interviewer';

  const { data: apiUsersResponse, isLoading } = useGetUsersQuery(undefined, {
    skip: isInterviewer,
  });
  const { data: deptMasterRes } = useGetMasterDataByCategoryQuery('departments', {
    skip: isInterviewer,
  });
  const [createUserApi] = useCreateUserMutation();
  const [updateUserApi] = useUpdateUserMutation();

  const departmentOptions = (deptMasterRes?.data || []).map((d) => d.name);

  // Resolve department name → DB ID dynamically from master data
  const resolveDeptId = (deptName: string): number | undefined => {
    if (!deptName || deptName === '—') return undefined;
    const found = (deptMasterRes?.data || []).find(
      (d: any) => d.name.toLowerCase() === deptName.toLowerCase()
    );
    return found ? Number(found.id) : undefined;
  };

  const displayUsers: UserItem[] = (apiUsersResponse?.data || []).map((u: any) => ({
    id: String(u.id),
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
    empId: u.employeeCode || u.empId || `EMP-${u.id}`,
    email: u.email || '',
    role: (u.role || 'Interviewer') as UserRole,
    department: u.department || '—',
    status: (u.status || 'Active') as UserStatus,
  }));

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
  const [formDept, setFormDept] = useState<string>('IT');
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
    const nextNum = displayUsers.length + 1001;
    setFormFirstName('');
    setFormLastName('');
    setFormEmpId(`EMP-${nextNum}`);
    setFormEmail('');
    setFormTempPassword('TempPass@2026');
    setFormPin('');
    setShowPassword(false);
    setFormRole('Interviewer');
    setFormDept(departmentOptions[0] || 'IT');
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
    setFormDept(user.department === '—' ? (departmentOptions[0] || 'IT') : user.department);
    setFormStatus(user.status);
  };

  const handleSaveAdd = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) return;

    try {
      await createUserApi({
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim(),
        tempPassword: formTempPassword || 'TempPass@2026',
        roleId: ROLE_ID_MAP[formRole] || 4,
        departmentId: resolveDeptId(formDept),
        pin: formPin.trim() || undefined,
      }).unwrap();

      dispatch(
        notifySuccess({
          title: 'User Created',
          description: `Successfully added ${formFirstName} ${formLastName} to the database.`,
        })
      );
      setIsAddOpen(false);
    } catch (err: any) {
      // Backend returns: { success: false, message: string, errors: string[] }
      const errMsg =
        (Array.isArray(err?.data?.errors) && err.data.errors.length > 0
          ? err.data.errors.join(' ')
          : null) ||
        err?.data?.message ||
        (err?.status === 403 ? 'Access denied: You do not have permission to manage users.' : null) ||
        (err?.status === 401 ? 'Session expired. Please log in again.' : null) ||
        `Request failed (HTTP ${err?.status ?? 'unknown'}). Check console for details.`;
      dispatch(
        notifyError({
          title: 'User Creation Failed',
          description: errMsg,
        })
      );
      console.error('[CreateUser] API error:', err);
    }
  };

  // Shared error formatter: backend returns { success: false, message: string, errors: string[] }
  const describeApiError = (err: any): string =>
    (Array.isArray(err?.data?.errors) && err.data.errors.length > 0 ? err.data.errors.join(' ') : null) ||
    err?.data?.message ||
    (err?.status === 403 ? 'Access denied: You do not have permission to manage users.' : null) ||
    (err?.status === 401 ? 'Session expired. Please log in again.' : null) ||
    `Request failed (HTTP ${err?.status ?? 'unknown'}). Check console for details.`;

  const handleSaveEdit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser || !formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) return;

    try {
      await updateUserApi({
        id: Number(editingUser.id),
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim(),
        roleId: ROLE_ID_MAP[formRole] || 4,
        departmentId: resolveDeptId(formDept),
        isActive: formStatus === 'Active',
      }).unwrap();

      dispatch(
        notifySuccess({
          title: 'User Updated',
          description: `Successfully updated ${formFirstName} ${formLastName}'s details.`,
        })
      );
      setEditingUser(null);
    } catch (err: any) {
      dispatch(notifyError({ title: 'User Update Failed', description: describeApiError(err) }));
      console.error('[UpdateUser] API error:', err);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateUserApi({
        id: Number(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: ROLE_ID_MAP[user.role] || 4,
        departmentId: resolveDeptId(user.department),
        isActive: nextStatus === 'Active',
      }).unwrap();

      dispatch(
        notifySuccess({
          title: `User ${nextStatus === 'Active' ? 'Activated' : 'Deactivated'}`,
          description: `${user.name} is now ${nextStatus.toLowerCase()}.`,
        })
      );
    } catch (err: any) {
      dispatch(notifyError({ title: 'Status Update Failed', description: describeApiError(err) }));
      console.error('[ToggleUserStatus] API error:', err);
    }
  };

  if (isInterviewer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[var(--danger-subtle)] border border-[var(--danger-border)] flex items-center justify-center text-[var(--danger)] mb-4 shadow-sm">
          <Icon name="lock" size="md" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Restricted</h2>
        <p className="text-[13px] text-[var(--text-secondary)]">
          The Users & Access Control directory is restricted to Directors and HRs. Interviewers have access to assigned candidate workspaces and technical evaluations only.
        </p>
      </div>
    );
  }

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
              ...departmentOptions.map((d: string) => ({ value: d, label: d })),
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
      <UsersTable users={filteredUsers} isLoading={isLoading} onEditUser={handleOpenEdit} />

      {/* Add User Modal Dialog */}
      <EnterpriseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New User"
        subtitle="Create system credentials and assign role access."
        icon="user-plus"
        maxWidth="lg"
        submitText="Save User"
        cancelText="Cancel"
        onSubmit={handleSaveAdd}
      >
        <div className="flex flex-col gap-3.5">
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
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] font-mono text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                onChange={(val) => {
                  const role = (val || 'Interviewer') as UserRole;
                  setFormRole(role);
                  if (role === 'HR') setFormDept('HR');
                  else if (!formDept || formDept === '—') setFormDept(departmentOptions[0] || 'IT');
                }}
                widthClass="w-full"
              />
            </div>
            <div>
              <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Department *</label>
              <CustomSelect
                label="Department"
                value={formDept}
                options={departmentOptions.map((d: string) => ({ value: d, label: d }))}
                onChange={(val) => setFormDept(val || departmentOptions[0] || 'IT')}
                widthClass="w-full"
              />
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
                  minLength={4}
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-9.5 pl-3 pr-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-indigo)]"
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
                  className="w-full h-9.5 pl-3 pr-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-indigo)]"
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
        </div>
      </EnterpriseModal>

      {/* Edit User Modal Dialog */}
      <EnterpriseModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Details"
        subtitle="Update role permissions, department, or employee status."
        icon="user-check"
        maxWidth="lg"
        submitText="Update User"
        cancelText="Cancel"
        onSubmit={handleSaveEdit}
      >
        <div className="flex flex-col gap-3.5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">First Name *</label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
              />
            </div>
            <div>
              <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Last Name *</label>
              <input
                type="text"
                required
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] font-mono text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
              />
            </div>
            <div>
              <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Email Address *</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full mt-1 h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
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
                options={departmentOptions.map((d: string) => ({ value: d, label: d }))}
                onChange={(val) => setFormDept(val || departmentOptions[0] || 'IT')}
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
        </div>
      </EnterpriseModal>
    </div>
  );
};

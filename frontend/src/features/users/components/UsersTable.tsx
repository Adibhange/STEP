'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import { type UserItem } from '../types/user.types';

interface UsersTableProps {
  users: UserItem[];
  isLoading?: boolean;
  onEditUser: (user: UserItem) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, isLoading, onEditUser }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xs">
        <Icon name="spinner" size="lg" className="animate-spin text-[var(--accent-indigo)] mx-auto mb-2" />
        <p className="text-xs text-[var(--text-tertiary)] font-medium">Loading user directory...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--text-tertiary)] flex items-center justify-center mx-auto mb-3 border border-[var(--border-default)]">
          <Icon name="users" size="lg" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">No users found</h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
          No team members match your current filter parameters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--border-default)] text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-[var(--border-default)] text-[var(--text-primary)] font-medium"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
            }}
          >
            <AnimatePresence mode="popLayout">
              {users.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="hover:bg-[var(--surface-hover)] transition-colors"
                >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{user.name}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5 mt-0.5">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span className="font-mono text-[10.5px] font-semibold text-[var(--text-secondary)]">{user.empId}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    user.role === 'Director'
                      ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]'
                      : user.role === 'HR'
                      ? 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
                      : 'bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30'
                  }`}>
                    <Icon name={user.role === 'Director' ? 'shield' : user.role === 'HR' ? 'user' : 'users'} size="xs" />
                    <span>{user.role}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-[var(--text-secondary)] font-semibold">{user.department}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    user.status === 'Active'
                      ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-tertiary)] border-[var(--border-default)]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-[var(--status-success)]' : 'bg-[var(--text-tertiary)]'}`} />
                    <span>{user.status}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEditUser(user)}
                    className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-indigo)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer"
                    title="Edit User Credentials & Access"
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

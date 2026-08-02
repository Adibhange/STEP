'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { MasterTable } from './MasterTable';
import { MASTER_DATA, type MasterRecord } from '../mock/master.mock';

export interface CategoryDef {
  key: string;
  title: string;
  icon: string;
  description: string;
  group: 'recruitment' | 'locations' | 'assessment' | 'interview' | 'system';
}

export const CONFIG_GROUPS = [
  { key: 'recruitment', label: 'Recruitment' },
  { key: 'locations', label: 'Locations' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'system', label: 'System' },
] as const;

export const CONFIG_CATEGORIES: CategoryDef[] = [
  // Recruitment Group
  { key: 'roles', title: 'Roles', icon: 'briefcase', description: 'Job role definitions & titles', group: 'recruitment' },
  { key: 'experiences', title: 'Experience', icon: 'bar-chart-2', description: 'Years of experience tiers', group: 'recruitment' },
  { key: 'departments', title: 'Departments', icon: 'users', description: 'Organizational business units', group: 'recruitment' },
  { key: 'employmentTypes', title: 'Employment Types', icon: 'file-text', description: 'Full-time, contract, internship contracts', group: 'recruitment' },

  // Locations Group
  { key: 'hiringLocations', title: 'Hiring Locations', icon: 'building', description: 'Enterprise office locations', group: 'locations' },
  { key: 'testLocations', title: 'Test Locations', icon: 'clipboard-check', description: 'Assessment test centers & online proctoring', group: 'locations' },

  // Assessment Group
  { key: 'questionCategories', title: 'Question Categories', icon: 'inbox', description: 'Question bank domains & subjects', group: 'assessment' },
  { key: 'questionDifficulty', title: 'Question Difficulty', icon: 'trending-up', description: 'Easy, Medium, Hard difficulty tiers', group: 'assessment' },
  { key: 'technologyStack', title: 'Technology Stack', icon: 'grid', description: 'Tech stack frameworks & tools', group: 'assessment' },
  { key: 'skills', title: 'Skills', icon: 'code-2', description: 'Technical & functional skills taxonomy', group: 'assessment' },

  // Interview Group
  { key: 'interviewTypes', title: 'Interview Types', icon: 'mic', description: 'Technical, HR, system design types', group: 'interview' },
  { key: 'interviewRounds', title: 'Interview Rounds', icon: 'list', description: 'Sequential round definitions', group: 'interview' },

  // System Group
  { key: 'candidateStatuses', title: 'Candidate Statuses', icon: 'check-circle', description: 'Lifecycle pipeline status labels', group: 'system' },
  { key: 'vacancyTemplates', title: 'Vacancy Templates', icon: 'file-text', description: 'Pre-configured vacancy setup blueprints', group: 'system' },
];

export const ConfigurationPanel: React.FC = () => {
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('roles');
  const [dataStore, setDataStore] = useState<Record<string, MasterRecord[]>>(MASTER_DATA);

  const activeCategory = CONFIG_CATEGORIES.find((c) => c.key === activeCategoryKey) || CONFIG_CATEGORIES[0];
  const activeRecords = dataStore[activeCategoryKey] || [];

  const handleAdd = (newRec: Omit<MasterRecord, 'id' | 'updatedAt'>) => {
    const created: MasterRecord = {
      ...newRec,
      id: `${activeCategoryKey}-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
      count: 0,
    };
    setDataStore((prev) => ({
      ...prev,
      [activeCategoryKey]: [created, ...(prev[activeCategoryKey] || [])],
    }));
  };

  const handleEdit = (updatedRec: MasterRecord) => {
    setDataStore((prev) => ({
      ...prev,
      [activeCategoryKey]: (prev[activeCategoryKey] || []).map((r) => (r.id === updatedRec.id ? updatedRec : r)),
    }));
  };

  const handleToggleStatus = (id: string) => {
    setDataStore((prev) => ({
      ...prev,
      [activeCategoryKey]: (prev[activeCategoryKey] || []).map((r) =>
        r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r
      ),
    }));
  };

  const handleDelete = (id: string) => {
    setDataStore((prev) => ({
      ...prev,
      [activeCategoryKey]: (prev[activeCategoryKey] || []).filter((r) => r.id !== id),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Categorized Configuration Groups */}
      <div className="flex flex-col gap-4">
        {CONFIG_GROUPS.map((grp) => {
          const groupCategories = CONFIG_CATEGORIES.filter((c) => c.group === grp.key);
          return (
            <div key={grp.key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono tracking-wider">
                  {grp.label}
                </span>
                <div className="flex-1 h-px bg-[var(--border-soft)]" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {groupCategories.map((cat) => {
                  const isActive = cat.key === activeCategoryKey;
                  const count = (dataStore[cat.key] || []).length;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategoryKey(cat.key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-indigo)] text-[var(--text-on-accent)] border-[var(--accent-indigo)] shadow-2xs font-bold'
                          : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon name={cat.icon as any} size="xs" />
                      <span>{cat.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Master Table */}
      <MasterTable
        title={activeCategory.title}
        description={activeCategory.description}
        data={activeRecords}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
    </div>
  );
};

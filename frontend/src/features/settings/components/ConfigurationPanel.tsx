'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { MasterTable } from './MasterTable';
import { MASTER_DATA, type MasterRecord } from '@/mock/masters';

export interface CategoryDef {
  key: string;
  title: string;
  icon: string;
  description: string;
  group: 'recruitment' | 'locations';
  exampleName: string;
  exampleCode: string;
}

export const CONFIG_CATEGORIES: CategoryDef[] = [
  // Recruitment Group
  {
    key: 'roles',
    title: 'Roles',
    icon: 'briefcase',
    description: 'Job role definitions & titles',
    group: 'recruitment',
    exampleName: 'Data Analyst',
    exampleCode: 'DA',
  },
  {
    key: 'experiences',
    title: 'Experience',
    icon: 'bar-chart-2',
    description: 'Years of experience tiers',
    group: 'recruitment',
    exampleName: 'Junior (1–3 Years)',
    exampleCode: 'JY',
  },
  {
    key: 'departments',
    title: 'Departments',
    icon: 'users',
    description: 'Organizational business units',
    group: 'recruitment',
    exampleName: 'Human Resources',
    exampleCode: 'HR',
  },
  {
    key: 'employmentTypes',
    title: 'Employment Types',
    icon: 'file-text',
    description: 'Full-time, contract, internship contracts',
    group: 'recruitment',
    exampleName: 'Full-Time Permanent',
    exampleCode: 'FTP',
  },
  {
    key: 'assessmentTitles',
    title: 'Assessment & Round Titles',
    icon: 'clipboard-check',
    description: 'Master data for Assessment & Round titles (Coding, MCQ, SQL, Subjective)',
    group: 'recruitment',
    exampleName: 'SQL & Database Queries',
    exampleCode: 'SQL',
  },

  // Locations Group
  {
    key: 'hiringLocations',
    title: 'Hiring Locations',
    icon: 'building',
    description: 'Enterprise office locations',
    group: 'locations',
    exampleName: 'Mumbai HQ',
    exampleCode: 'MHQ',
  },
  {
    key: 'testLocations',
    title: 'Test Locations',
    icon: 'clipboard-check',
    description: 'Assessment test centers & online proctoring',
    group: 'locations',
    exampleName: 'Pune Test Center',
    exampleCode: 'PTC',
  },
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
    <div className="flex flex-col gap-4 w-full">
      {/* Category Navigation Bar */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] p-2 rounded-[var(--radius-lg)] shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-step w-full">
        {CONFIG_CATEGORIES.map((cat) => {
          const isActive = cat.key === activeCategoryKey;
          const count = (dataStore[cat.key] || []).length;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategoryKey(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-[12.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--accent-indigo)] text-white shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon name={cat.icon as any} size="xs" />
              <span>{cat.title}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Master Data Table */}
      <div className="w-full">
        <MasterTable
          title={activeCategory.title}
          description={activeCategory.description}
          data={activeRecords}
          exampleName={activeCategory.exampleName}
          exampleCode={activeCategory.exampleCode}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

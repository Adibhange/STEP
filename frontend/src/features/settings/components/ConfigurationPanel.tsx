'use client';

import React, { useState, useMemo } from 'react';
import { Icon } from '@/design-system';
import { MasterTable } from './MasterTable';
import type { MasterRecord } from '@/types/master.types';
import { useGetMasterDataByCategoryQuery } from '@/store/services/api';

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
  const { data: masterResponse, isLoading, isError } = useGetMasterDataByCategoryQuery(activeCategoryKey);

  const activeCategory = CONFIG_CATEGORIES.find((c) => c.key === activeCategoryKey) || CONFIG_CATEGORIES[0];

  const activeRecords: MasterRecord[] = useMemo(() => {
    return (masterResponse?.data || []).map((m: any) => ({
      id: m.id,
      category: m.category || activeCategoryKey,
      code: m.code || '',
      name: m.name || '',
      description: m.description || '',
      displayOrder: m.displayOrder || 1,
      status: m.isActive ? 'Active' : 'Inactive',
      isActive: m.isActive ?? true,
      updatedAt: m.updatedAt || '',
    }));
  }, [masterResponse, activeCategoryKey]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Category Navigation Bar */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] p-2 rounded-[var(--radius-lg)] shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-step w-full">
        {CONFIG_CATEGORIES.map((cat) => {
          const isActive = cat.key === activeCategoryKey;
          const count = cat.key === activeCategoryKey ? activeRecords.length : 0;
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
              {isActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="p-8 text-center text-xs text-[var(--text-tertiary)] font-mono animate-pulse">
          Loading master records for {activeCategory.title}...
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] text-xs font-semibold">
          Failed to load master records from backend database.
        </div>
      )}

      {/* Master Data Table */}
      {!isLoading && !isError && (
        <div className="w-full">
          <MasterTable
            title={activeCategory.title}
            description={activeCategory.description}
            data={activeRecords}
            exampleName={activeCategory.exampleName}
            exampleCode={activeCategory.exampleCode}
            onAdd={() => {}}
            onEdit={() => {}}
            onToggleStatus={() => {}}
            onDelete={() => {}}
          />
        </div>
      )}
    </div>
  );
};

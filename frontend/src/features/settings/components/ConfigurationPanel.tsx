'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { MasterTable } from './MasterTable';
import type { MasterRecord } from '@/types/master.types';
import {
  useGetMasterDataByCategoryQuery,
  useToggleMasterDataStatusMutation,
  useCreateMasterDataMutation,
  useUpdateMasterDataMutation,
  useDeleteMasterDataMutation,
} from '@/store/services/api';

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
    exampleName: 'Senior .NET Architect',
    exampleCode: 'SNET',
  },
  {
    key: 'departments',
    title: 'Departments',
    icon: 'users',
    description: 'Organizational business units',
    group: 'recruitment',
    exampleName: 'Engineering',
    exampleCode: 'ENG',
  },
  {
    key: 'employmenttypes',
    title: 'Employment Types',
    icon: 'file-text',
    description: 'Full-time permanent, contract, internship',
    group: 'recruitment',
    exampleName: 'Full-Time Permanent',
    exampleCode: 'FTP',
  },
  {
    key: 'hiringlocations',
    title: 'Hiring Locations',
    icon: 'building',
    description: 'Enterprise office locations',
    group: 'locations',
    exampleName: 'Mumbai HQ',
    exampleCode: 'MHQ',
  },
  {
    key: 'testlocations',
    title: 'Test Locations',
    icon: 'clipboard-check',
    description: 'Assessment test centers & online proctoring',
    group: 'locations',
    exampleName: 'Mumbai Center',
    exampleCode: 'MCTR',
  },
  {
    key: 'experiencelevels',
    title: 'Experience Levels',
    icon: 'trending-up',
    description: 'Job experience level definitions',
    group: 'recruitment',
    exampleName: 'Senior (3-5 Years)',
    exampleCode: 'EXP-5',
  },
];

export const ConfigurationPanel: React.FC = () => {
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('roles');
  const { data: masterResponse, isLoading, isError } = useGetMasterDataByCategoryQuery(activeCategoryKey);
  const [createMasterDataApi] = useCreateMasterDataMutation();
  const [updateMasterDataApi] = useUpdateMasterDataMutation();
  const [toggleStatusApi] = useToggleMasterDataStatusMutation();
  const [deleteMasterDataApi] = useDeleteMasterDataMutation();

  const activeCategory = CONFIG_CATEGORIES.find((c) => c.key === activeCategoryKey) || CONFIG_CATEGORIES[0];

  const fetchedRecords: MasterRecord[] = useMemo(() => {
    return (masterResponse?.data || []).map((m: any) => {
      const recStatus = (m.status || (m.isActive === false ? 'Inactive' : 'Active')) as 'Active' | 'Inactive';
      return {
        id: String(m.id),
        category: m.category || activeCategoryKey,
        code: m.code || '',
        name: m.name || '',
        description: m.description || '',
        displayOrder: m.displayOrder || 1,
        status: recStatus,
        isActive: recStatus === 'Active',
        updatedAt: m.updatedAt || new Date().toISOString().split('T')[0],
      };
    });
  }, [masterResponse, activeCategoryKey]);

  const [records, setRecords] = useState<MasterRecord[]>([]);

  useEffect(() => {
    setRecords(fetchedRecords);
  }, [fetchedRecords]);

  const handleToggleStatus = async (recordId: string | number) => {
    const currentRecord = records.find((r) => String(r.id) === String(recordId));
    if (!currentRecord) return;
    const nextStatus = currentRecord.status === 'Active' ? 'Inactive' : 'Active';
    // Optimistic UI update
    setRecords((prev) =>
      prev.map((r) =>
        String(r.id) === String(recordId)
          ? { ...r, status: nextStatus as any, isActive: nextStatus === 'Active', updatedAt: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    try {
      await toggleStatusApi({ category: activeCategoryKey, id: recordId }).unwrap();
      toast.success(`Status updated for ${currentRecord.name}`, {
        description: `Master record status set to ${nextStatus} in database.`,
      });
    } catch {
      // Rollback optimistic update on failure
      setRecords((prev) =>
        prev.map((r) =>
          String(r.id) === String(recordId)
            ? { ...r, status: currentRecord.status as any, isActive: currentRecord.status === 'Active', updatedAt: currentRecord.updatedAt }
            : r
        )
      );
      toast.error(`Failed to update status for ${currentRecord.name}`, {
        description: 'Could not connect to backend. Please try again.',
      });
    }
  };

  const handleEditRecord = async (updated: MasterRecord) => {
    const prevRecords = [...records];
    setRecords((prev) =>
      prev.map((r) => (String(r.id) === String(updated.id) ? { ...updated, updatedAt: new Date().toISOString().split('T')[0] } : r))
    );

    try {
      await updateMasterDataApi({
        category: activeCategoryKey,
        id: updated.id,
        name: updated.name,
        code: updated.code,
        description: updated.description || '',
        isActive: updated.status === 'Active',
      }).unwrap();

      toast.success(`Updated ${updated.name}`, {
        description: `Master record changes saved successfully.`,
      });
    } catch {
      setRecords(prevRecords);
      toast.error(`Failed to update ${updated.name}`, {
        description: 'Could not save master record changes. Please try again.',
      });
    }
  };

  const handleAddRecord = async (newRec: Omit<MasterRecord, 'id' | 'updatedAt'>) => {
    const createdTemp: MasterRecord = {
      id: String(Date.now()),
      category: activeCategoryKey,
      code: newRec.code,
      name: newRec.name,
      description: newRec.description || '',
      status: newRec.status || 'Active',
      isActive: (newRec.status || 'Active') === 'Active',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setRecords((prev) => [createdTemp, ...prev]);

    try {
      await createMasterDataApi({
        category: activeCategoryKey,
        name: newRec.name,
        code: newRec.code,
        description: newRec.description || '',
        isActive: (newRec.status || 'Active') === 'Active',
      }).unwrap();

      toast.success(`Created ${newRec.name}`, {
        description: `New master taxonomy record added successfully.`,
      });
    } catch {
      setRecords((prev) => prev.filter((r) => r.id !== createdTemp.id));
      toast.error(`Failed to create ${newRec.name}`, {
        description: 'Could not save master record to backend database. Please try again.',
      });
    }
  };

  const handleDeleteRecord = async (recordId: string | number) => {
    const currentRecord = records.find((r) => String(r.id) === String(recordId));
    // Optimistic UI removal
    setRecords((prev) => prev.filter((r) => String(r.id) !== String(recordId)));
    try {
      await deleteMasterDataApi({ category: activeCategoryKey, id: recordId }).unwrap();
      toast.success(`Record removed`, {
        description: `${currentRecord?.name || 'Master record'} deleted successfully from database.`,
      });
    } catch {
      // Rollback on failure
      if (currentRecord) {
        setRecords((prev) => [...prev, currentRecord]);
      }
      toast.error(`Failed to delete record`, {
        description: 'Could not delete record from backend. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Category Navigation Bar */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] p-2 rounded-[var(--radius-lg)] shadow-2xs flex items-center gap-2 overflow-x-auto scrollbar-step w-full">
        {CONFIG_CATEGORIES.map((cat) => {
          const isActive = cat.key === activeCategoryKey;
          const count = cat.key === activeCategoryKey ? records.length : 0;
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
            data={records}
            exampleName={activeCategory.exampleName}
            exampleCode={activeCategory.exampleCode}
            onAdd={handleAddRecord}
            onEdit={handleEditRecord}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteRecord}
          />
        </div>
      )}
    </div>
  );
};

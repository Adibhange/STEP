'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { MasterTable } from './MasterTable';
import { RoleHiringProfilesManager } from './RoleHiringProfilesManager';
import { QuestionBankManager } from './QuestionBankManager';
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
    key: 'hiringprofiles',
    title: 'Assessment Templates',
    icon: 'layout-template',
    description: 'Reusable test templates & section rules — selected when creating a vacancy',
    group: 'recruitment',
    exampleName: 'Software Engineering Technical Track',
    exampleCode: 'RULE-TECH-ENG',
  },
  {
    key: 'questionbank',
    title: 'Question Bank (V2)',
    icon: 'file-stack',
    description: 'Central tagged question repository across roles and formats',
    group: 'recruitment',
    exampleName: 'React Hook MCQs',
    exampleCode: 'QB-RCT',
  },
  {
    key: 'languages',
    title: 'Programming Languages',
    icon: 'code-2',
    description: 'Assessment languages, compiler runtimes & candidate IDE domains',
    group: 'recruitment',
    exampleName: 'C# (.NET)',
    exampleCode: 'LANG-CS',
  },
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
    icon: 'file-check',
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
    key: 'experiencelevels',
    title: 'Experience Levels (Legacy V1)',
    icon: 'trending-up',
    description: 'Legacy fixed experience bands (superseded by dynamic Min/Max Years in V2 Hiring Profiles)',
    group: 'recruitment',
    exampleName: 'Senior (3-5 Years)',
    exampleCode: 'EXP-5',
  },
  {
    key: 'testlocations',
    title: 'Test Locations (Legacy V1)',
    icon: 'map-pin',
    description: 'Legacy physical test lab centers (superseded by dynamic online/offline drives in V2)',
    group: 'locations',
    exampleName: 'Mumbai Center',
    exampleCode: 'MCTR',
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
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] p-1.5 rounded-[var(--radius-lg)] shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-step w-full">
        {CONFIG_CATEGORIES.map((cat) => {
          const isActive = cat.key === activeCategoryKey;
          const count = cat.key === activeCategoryKey ? records.length : 0;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategoryKey(cat.key)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-[12.5px] font-bold transition-colors cursor-pointer whitespace-nowrap z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTabPill"
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--accent-indigo)] shadow-xs -z-1"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon
                name={cat.icon as any}
                size="xs"
                className={`transition-colors ${isActive ? 'text-white' : 'text-[var(--text-tertiary)]'}`}
              />
              <span className={`transition-colors ${isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {cat.title}
              </span>
              {isActive && count > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white">
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

      {/* Hiring Profiles, Question Bank or Master Data Table with Smooth Mount Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategoryKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full"
        >
          {activeCategoryKey === 'hiringprofiles' ? (
            <RoleHiringProfilesManager />
          ) : activeCategoryKey === 'questionbank' ? (
            <QuestionBankManager />
          ) : !isLoading && !isError ? (
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
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

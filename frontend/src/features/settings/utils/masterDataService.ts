import { type MasterRecord } from '@/types/master.types';

/**
 * STEP Enterprise Platform — Master Data Configuration Service
 *
 * Provides CRUD operations and helper methods for managing enterprise master data entities.
 */

export function getMasterDataStore(): Record<string, MasterRecord[]> {
  return {};
}

export function addMasterRecord(
  dataStore: Record<string, MasterRecord[]>,
  categoryKey: string,
  newRec: Omit<MasterRecord, 'id' | 'updatedAt'>
): Record<string, MasterRecord[]> {
  const created: MasterRecord = {
    ...newRec,
    id: `${categoryKey}-${Date.now()}`,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  return {
    ...dataStore,
    [categoryKey]: [created, ...(dataStore[categoryKey] || [])],
  };
}

export function updateMasterRecord(
  dataStore: Record<string, MasterRecord[]>,
  categoryKey: string,
  updatedRec: MasterRecord
): Record<string, MasterRecord[]> {
  return {
    ...dataStore,
    [categoryKey]: (dataStore[categoryKey] || []).map((r) => (r.id === updatedRec.id ? updatedRec : r)),
  };
}

export function deleteMasterRecord(
  dataStore: Record<string, MasterRecord[]>,
  categoryKey: string,
  recordId: string | number
): Record<string, MasterRecord[]> {
  return {
    ...dataStore,
    [categoryKey]: (dataStore[categoryKey] || []).filter((r) => r.id !== recordId),
  };
}

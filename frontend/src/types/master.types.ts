/**
 * STEP Enterprise Platform — Centralized Master Data Type Definitions
 */

export interface MasterRecord {
  id: string | number;
  category?: string;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  status?: 'Active' | 'Inactive';
  isActive?: boolean;
  updatedAt?: string;
}

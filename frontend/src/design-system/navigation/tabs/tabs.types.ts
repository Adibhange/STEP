import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab definitions */
  items: TabItem[];
  /** Active tab ID */
  activeId: string;
  /** Callback fired when active tab changes */
  onChange: (id: string) => void;
  /** Accessible ARIA label for tablist */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

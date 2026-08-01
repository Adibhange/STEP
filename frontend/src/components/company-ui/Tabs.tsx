'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

export const Tabs: React.FC<{ items: TabItem[]; className?: string }> = ({ items, className }) => {
  const [activeKey, setActiveKey] = useState(items[0]?.key || '');

  const activeTab = items.find((i) => i.key === activeKey) || items[0];

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => setActiveKey(item.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer select-none',
                isActive
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
};
